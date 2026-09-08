// Tests for Priority Tier 1: Adaptive Baseline & Defect Taxonomy Tuning
// Run with plain Node.js:
//   node tests/tier1_baseline_taxonomy.js

const assert = require('assert');
const path = require('path');
const os = require('os');
const fs = require('fs');

const baseline = require('../lib/baseline');
const workflow = require('../lib/workflow');
const output = require('../lib/output');
const detreport = require('../lib/detreport');

let gagal = 0;
function uji(nama, fn) {
    try {
        fn();
        console.log('  ok   ' + nama);
    } catch (e) {
        gagal++;
        console.log('  GAGAL ' + nama + '\n        ' + (e.stack || e.message));
    }
}

async function ujiAsync(nama, fn) {
    try {
        await fn();
        console.log('  ok   ' + nama);
    } catch (e) {
        gagal++;
        console.log('  GAGAL ' + nama + '\n        ' + (e.stack || e.message));
    }
}

(async function runAll() {
    console.log('\n--- 1. Adaptive Baseline Statistical Adjustment ---');

    uji('calculateAdjustment computes upper envelope (+0.02 conf, *1.05 area, +1.0 contrast)', () => {
        const samples = [
            { confidence: 0.30, areaMM2: 1.0, contrast: 15.0 },
            { confidence: 0.45, areaMM2: 2.0, contrast: 25.0 },
            { confidence: 0.40, areaMM2: 1.5, contrast: 20.0 },
        ];
        const adj = baseline.calculateAdjustment(samples);
        // max conf = 0.45 -> +0.02 = 0.47
        assert.strictEqual(adj.minConfidence, 0.47);
        assert.strictEqual(adj.confidence, 0.47);
        // max area = 2.0 -> *1.05 = 2.1
        assert.strictEqual(adj.minAreaMM2, 2.1);
        // max contrast = 25.0 -> +1.0 = 26.0
        assert.strictEqual(adj.minContrast, 26.0);
    });

    uji('calculateAdjustment respects safety caps (conf: 0.85, area: 100, contrast: 80)', () => {
        const samples = [
            { confidence: 0.94, areaMM2: 150, contrast: 90 },
            { confidence: 0.98, areaMM2: 200, contrast: 95 },
        ];
        const adj = baseline.calculateAdjustment(samples);
        assert.strictEqual(adj.minConfidence, 0.85); // cap 0.85
        assert.strictEqual(adj.minAreaMM2, 100);     // cap 100
        assert.strictEqual(adj.minContrast, 80);     // cap 80
    });

    const tmpRoot = path.join(os.tmpdir(), 'ae-test-baseline-' + Date.now());
    fs.mkdirSync(tmpRoot, { recursive: true });

    await ujiAsync('addMarkedGoodSample buffers until batchSize, then saves to file', async () => {
        const proj = 'TestProj';
        const model = 'DefectModel';
        
        // Sample 1: buffered
        const r1 = await baseline.addMarkedGoodSample(tmpRoot, proj, model, {
            className: 'scratch',
            confidence: 0.35,
            areaMM2: 1.2,
            contrast: 18.0
        }, 3);
        assert.strictEqual(r1.buffered, 1);
        assert.strictEqual(r1.updated, false);

        // Sample 2: buffered
        const r2 = await baseline.addMarkedGoodSample(tmpRoot, proj, model, {
            className: 'scratch',
            confidence: 0.40,
            areaMM2: 1.5,
            contrast: 20.0
        }, 3);
        assert.strictEqual(r2.buffered, 2);
        assert.strictEqual(r2.updated, false);

        // Sample 3: reaches batchSize 3 -> triggers update!
        const r3 = await baseline.addMarkedGoodSample(tmpRoot, proj, model, {
            className: 'scratch',
            confidence: 0.42,
            areaMM2: 1.6,
            contrast: 22.0
        }, 3);
        assert.strictEqual(r3.buffered, 0); // buffer cleared
        assert.strictEqual(r3.updated, true);
        assert.strictEqual(r3.thresholds.scratch.confidence, 0.44); // 0.42 + 0.02
        assert.strictEqual(r3.thresholds.scratch.minAreaMM2, 1.68); // 1.6 * 1.05

        // Check persisted file
        const disk = baseline.getModelBaseline(tmpRoot, proj, model);
        assert.ok(disk && disk.scratch);
        assert.strictEqual(disk.scratch.confidence, 0.44);
    });

    await ujiAsync('resetBaseline clears thresholds and persists', async () => {
        const proj = 'TestProj';
        const model = 'DefectModel';
        const resetRes = await baseline.resetBaseline(tmpRoot, proj, model, 'scratch');
        assert.strictEqual(resetRes.ok, true);
        assert.strictEqual(resetRes.thresholds.scratch, undefined);
    });

    console.log('\n--- 2. Workflow Addon Evaluation & Defect Filtering ---');

    uji('evaluateAddons marks subThreshold when area, contrast, or conf below thresholds', () => {
        const model = {
            name: 'DefectYOLO',
            classes: ['pinhole', 'stain'],
            addons: ['Color Inspection']
        };
        const perClassThresholds = {
            pinhole: { minConfidence: 0.3, minAreaMM2: 0.5, minContrast: 15.0 },
            stain: { minConfidence: 0.4, minAreaMM2: 2.0, minContrast: 10.0 }
        };
        const detections = [
            // Noise: area too small (0.2 < 0.5)
            { class_name: 'pinhole', confidence: 0.5, areaMM2: 0.2, contrast: 25.0 },
            // Noise: contrast too low (8.0 < 15.0)
            { class_name: 'pinhole', confidence: 0.5, areaMM2: 0.8, contrast: 8.0 },
            // Real defect: exceeds all thresholds
            { class_name: 'pinhole', confidence: 0.5, areaMM2: 1.0, contrast: 30.0 },
            // Sub-threshold conf (0.25 < 0.4)
            { class_name: 'stain', confidence: 0.25, areaMM2: 5.0, contrast: 20.0 },
        ];

        const evalRes = workflow.evaluateAddons(model, detections, false, {
            perClassThresholds,
            baseConf: 0.25
        });

        assert.strictEqual(evalRes.verdict, 'NG'); // Real defect caused NG
        assert.strictEqual(detections[0].subThreshold, true);
        assert.strictEqual(detections[1].subThreshold, true); // filtered by minContrast because Color Inspection is active
        assert.strictEqual(detections[2].subThreshold, false);
        assert.strictEqual(detections[3].subThreshold, true);

        // Check active defect counts in breakdown
        assert.strictEqual(evalRes.defectBreakdown.pinhole, 1); // Only detection[2] is active NG
        assert.strictEqual(evalRes.defectBreakdown.stain, undefined); // stain was subThreshold
    });

    uji('evaluateAddons ignores contrast threshold if model lacks Color Inspection addon', () => {
        const modelNoColor = {
            name: 'DefectGeometryOnly',
            classes: ['pinhole'],
            addons: [] // No Color Inspection
        };
        const perClassThresholds = {
            pinhole: { minConfidence: 0.3, minAreaMM2: 0.5, minContrast: 15.0 }
        };
        const detections = [
            // Even though contrast is 8.0 (< 15.0), Color Inspection is NOT active, so contrast is ignored!
            { class_name: 'pinhole', confidence: 0.5, areaMM2: 0.8, contrast: 8.0 }
        ];
        const evalRes = workflow.evaluateAddons(modelNoColor, detections, false, {
            perClassThresholds,
            baseConf: 0.25
        });
        assert.strictEqual(detections[0].subThreshold, false); // Not filtered out by contrast!
        assert.strictEqual(evalRes.verdict, 'NG');
    });

    uji('evaluateAddons respects markedGood detections as benign', () => {
        const model = {
            name: 'DefectYOLO',
            classes: ['scratch'],
            addons: []
        };
        const perClassThresholds = {
            scratch: { minConfidence: 0.2, minAreaMM2: 0.1, minContrast: 5.0 }
        };
        const detections = [
            // Operator marked this detection as good!
            { class_name: 'scratch', confidence: 0.8, areaMM2: 5.0, contrast: 40.0, markedGood: true }
        ];

        const evalRes = workflow.evaluateAddons(model, detections, false, {
            perClassThresholds,
            baseConf: 0.25
        });

        assert.strictEqual(evalRes.verdict, 'OK'); // Suppressed from NG!
        assert.strictEqual(evalRes.defectBreakdown.scratch, undefined);
    });

    console.log('\n--- 3. Learning Mode (Suppress Reject Signal) ---');

    await ujiAsync('execute with learningMode=true suppresses signal and marks result', async () => {
        const projName = 'ProjLearn';
        const projDir = path.join(tmpRoot, projName);
        fs.mkdirSync(projDir, { recursive: true });

        let signalSent = null;
        let arduinoCalled = false;

        const fakeArduino = {
            send: (sig) => { arduinoCalled = true; signalSent = sig; return true; }
        };

        const fakeOutput = {
            record: async () => ({})
        };

        const steps = [
            {
                stepIndex: 1,
                category: 'Inspection',
                modelName: 'M1',
                continueOn: 'always'
            },
            {
                stepIndex: 2,
                category: 'Communication',
                tool: 'arduino',
                config: { signalOK: '0', signalNG: '1', onlyOnNG: true }
            }
        ];

        const modelM1 = {
            name: 'M1',
            type: 'AI Detection',
            classes: ['defect'],
            dir: path.join(projDir, 'models', 'M1'),
            perClassThresholds: { defect: { minConfidence: 0.2, minAreaMM2: 0, minContrast: 0 } }
        };

        const project = {
            name: projName,
            models: [modelM1],
            workflow: { steps, onFirstNG: 'continue' }
        };

        const fakeCfg = {
            model: { confidence: 0.25, imgsz: 640 }
        };

        // Create dummy weights file
        fs.mkdirSync(path.join(modelM1.dir, 'weights'), { recursive: true });
        fs.writeFileSync(path.join(modelM1.dir, 'weights', 'best.pt'), 'dummy');

        // Mock inference.inferOnce for this test
        const inference = require('../lib/inference');
        const origInferOnce = inference.inferOnce;
        inference.inferOnce = async () => ({
            detections: [
                { class_name: 'defect', confidence: 0.9, x1: 10, y1: 10, x2: 50, y2: 50, areaPx: 1600, contrast: 45.0 }
            ]
        });

        try {
            const dummyDataUrl = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEASABIAAD/2wBDAP//////////////////////////////////////////////////////////////////////////////////////wgALCAABAAEBAREA/8QAFBABAAAAAAAAAAAAAAAAAAAAAP/aAAgBAQABPxA=';
            const result = await workflow.execute(fakeCfg, project, dummyDataUrl, fakeArduino, fakeOutput, {
                learningMode: true
            });

            assert.strictEqual(result.learningMode, true);
            assert.strictEqual(result.finalVerdict, 'NG'); // Inspection still accurately detects defect
            // But hardware reject signal was suppressed!
            assert.strictEqual(arduinoCalled, false);
            assert.strictEqual(signalSent, null);
        } finally {
            inference.inferOnce = origInferOnce;
        }
    });

    console.log('\n--- 4. Excel & Output Report Breakdown ---');

    uji('detreport.buildRows formats defect columns and summary table', () => {
        const reportProjDir = path.join(tmpRoot, 'ReportProj');
        const reportDateDir = path.join(reportProjDir, 'outputs', '2026-09-08');
        fs.mkdirSync(reportDateDir, { recursive: true });

        // Dummy output 1: OK
        fs.writeFileSync(path.join(reportDateDir, '001-1000.json'), JSON.stringify({
            name: '001-1000.json',
            timestamp: '2026-09-08T10:00:00Z',
            finalVerdict: 'OK',
            totalMS: 15,
            steps: [],
            defectBreakdown: {}
        }));

        // Dummy output 2: NG with defects
        fs.writeFileSync(path.join(reportDateDir, '002-1001.json'), JSON.stringify({
            name: '002-1001.json',
            timestamp: '2026-09-08T10:01:00Z',
            finalVerdict: 'NG',
            totalMS: 20,
            steps: [{ reason: 'Ditemukan 2 scratch, 1 stain' }],
            defectBreakdown: { scratch: 2, stain: 1 }
        }));

        const { rows, count, defectSummary } = detreport.buildRows(reportProjDir, '2026-09-08');
        assert.strictEqual(count, 2);

        const header = rows[0];
        assert.ok(header.includes('Total Cacat'));
        assert.ok(header.includes('Cacat Utama'));
        assert.ok(header.includes('Cacat: scratch'));
        assert.ok(header.includes('Cacat: stain'));

        const totalCacatIdx = header.indexOf('Total Cacat');
        const cacatUtamaIdx = header.indexOf('Cacat Utama');
        const scratchIdx = header.indexOf('Cacat: scratch');
        const stainIdx = header.indexOf('Cacat: stain');

        // Row 1 (OK): Total Cacat = 0
        assert.strictEqual(rows[1][totalCacatIdx], 0);
        assert.strictEqual(rows[1][cacatUtamaIdx], '—');

        // Row 2 (NG): Total Cacat = 3 (2 scratch + 1 stain)
        assert.strictEqual(rows[2][totalCacatIdx], 3);
        assert.strictEqual(rows[2][cacatUtamaIdx], 'scratch');
        assert.strictEqual(rows[2][scratchIdx], 2);
        assert.strictEqual(rows[2][stainIdx], 1);

        // Summary table aggregation
        assert.strictEqual(defectSummary.scratch, 2);
        assert.strictEqual(defectSummary.stain, 1);
    });

    // Cleanup
    try { fs.rmSync(tmpRoot, { recursive: true, force: true }); } catch (_) {}

    console.log(`\nResults: ${gagal === 0 ? 'ALL TESTS PASSED' : gagal + ' TESTS FAILED'}\n`);
    process.exit(gagal === 0 ? 0 : 1);
})();
