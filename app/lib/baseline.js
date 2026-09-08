// Adaptive baseline manager — operator relearn without retraining.
//
// Buffers false-alarm detections marked as "good" by operators, and upon reaching
// a configurable batch size (default: 10), computes a statistical boundary adjustment:
//   - confidence: max(conf_FP) + epsilon
//   - minAreaMM2: max(area_FP) * 1.05
//   - minContrast: max(contrast_FP) + 1.0
//
// Stored in: <projectDir>/adaptive_baseline.json

const fs = require('fs');
const path = require('path');
const { _safeJoin } = require('./projects');

// In-memory buffer for active session samples: key = `${projectName}|${modelName}|${className}`
const sampleBuffers = new Map();

function baselinePath(projectsRoot, projectName) {
    return _safeJoin(projectsRoot, projectName, 'adaptive_baseline.json');
}

/**
 * Load saved adaptive baseline for a project.
 */
function loadBaseline(projectsRoot, projectName) {
    try {
        const file = baselinePath(projectsRoot, projectName);
        if (fs.existsSync(file)) {
            return JSON.parse(fs.readFileSync(file, 'utf8'));
        }
    } catch (_) {}
    return { models: {} };
}

/**
 * Save adaptive baseline to disk.
 */
function saveBaseline(projectsRoot, projectName, data) {
    try {
        const file = baselinePath(projectsRoot, projectName);
        fs.mkdirSync(path.dirname(file), { recursive: true });
        fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
        return true;
    } catch (e) {
        console.warn('saveBaseline failed:', e.message);
        return false;
    }
}

/**
 * Calculate statistical threshold envelope from a batch of marked-good samples.
 * Tradeoff: Fast (<1ms), deterministic, fully auditable and reversible.
 */
function calculateAdjustment(samples, baseThresholds = {}) {
    if (!samples || !samples.length) return null;

    const confs = samples.map(s => Number(s.confidence) || 0);
    const areas = samples.map(s => Number(s.areaMM2) || 0);
    const contrasts = samples.map(s => Number(s.contrast) || 0);

    const maxConf = Math.max(...confs);
    const maxArea = Math.max(...areas);
    const maxContrast = Math.max(...contrasts);

    // Bounded envelope:
    // 1. Confidence: shift slightly above the highest false alarm (+0.02), capped at 0.85
    const baseConf = baseThresholds.confidence != null ? baseThresholds.confidence : 0.35;
    const adaptedConf = Math.min(0.85, Math.max(baseConf, Math.round((maxConf + 0.02) * 100) / 100));

    // 2. Area: minimum defect size in mm2 (5% margin above largest marked non-defect), capped at 100 mm2
    const baseArea = baseThresholds.minAreaMM2 != null ? baseThresholds.minAreaMM2 : 0;
    const adaptedArea = Math.min(100.0, Math.max(baseArea, Math.round((maxArea * 1.05) * 100) / 100));

    // 3. Contrast: minimum grayscale delta (margin of 1.0), capped at 80
    const baseContrast = baseThresholds.minContrast != null ? baseThresholds.minContrast : 0;
    const adaptedContrast = Math.min(80.0, Math.max(baseContrast, Math.round((maxContrast + 1.0) * 10) / 10));

    return {
        confidence: adaptedConf,
        minConfidence: adaptedConf,
        minAreaMM2: adaptedArea,
        minContrast: adaptedContrast,
        sampleCount: samples.length,
        updatedAt: new Date().toISOString(),
    };
}

/**
 * Add a marked-good sample from live review.
 * Returns { batchComplete: boolean, count: number, batchSize: number, updatedThresholds?: object }
 */
function addMarkedGoodSample(projectsRoot, projectName, modelName, sample, batchSize = 10) {
    const cls = sample.class_name || sample.className || 'defect';
    const key = `${projectName}|${modelName}|${cls}`;

    if (!sampleBuffers.has(key)) {
        sampleBuffers.set(key, []);
    }
    const buf = sampleBuffers.get(key);
    buf.push({
        confidence: Number(sample.confidence) || 0,
        areaPx: Number(sample.areaPx) || 0,
        areaMM2: Number(sample.areaMM2) || 0,
        contrast: Number(sample.contrast) || 0,
        timestamp: new Date().toISOString(),
    });

    const currentCount = buf.length;
    const targetSize = Math.max(3, parseInt(batchSize, 10) || 10);

    if (currentCount >= targetSize) {
        // Calculate adjustment using the batch
        const baselineData = loadBaseline(projectsRoot, projectName);
        baselineData.models = baselineData.models || {};
        baselineData.models[modelName] = baselineData.models[modelName] || { perClass: {} };
        const existingClassThresh = (baselineData.models[modelName].perClass && baselineData.models[modelName].perClass[cls]) || {};

        const adapted = calculateAdjustment(buf, existingClassThresh);
        baselineData.models[modelName].perClass[cls] = adapted;
        saveBaseline(projectsRoot, projectName, baselineData);

        // Reset the memory buffer for this class
        sampleBuffers.set(key, []);

        return {
            batchComplete: true,
            count: currentCount,
            batchSize: targetSize,
            buffered: 0,
            updated: true,
            className: cls,
            adaptedThresholds: adapted,
            thresholds: baselineData.models[modelName].perClass,
            message: `Baseline adaptif untuk kelas '${cls}' diperbarui (conf: ${adapted.confidence}, minArea: ${adapted.minAreaMM2} mm², minContrast: ${adapted.minContrast})`,
        };
    }

    return {
        batchComplete: false,
        count: currentCount,
        batchSize: targetSize,
        buffered: currentCount,
        updated: false,
        className: cls,
    };
}

/**
 * Get current adaptive thresholds for a model.
 */
function getModelBaseline(projectsRoot, projectName, modelName) {
    const data = loadBaseline(projectsRoot, projectName);
    const m = (data.models && data.models[modelName]) || {};
    return m.perClass || {};
}

/**
 * Reset adaptive baseline for a class or entire model.
 */
function resetBaseline(projectsRoot, projectName, modelName, className = null) {
    const data = loadBaseline(projectsRoot, projectName);
    if (data.models && data.models[modelName]) {
        if (className) {
            if (data.models[modelName].perClass) {
                delete data.models[modelName].perClass[className];
            }
            sampleBuffers.delete(`${projectName}|${modelName}|${className}`);
        } else {
            delete data.models[modelName];
            for (const k of sampleBuffers.keys()) {
                if (k.startsWith(`${projectName}|${modelName}|`)) sampleBuffers.delete(k);
            }
        }
        saveBaseline(projectsRoot, projectName, data);
    }
    return { ok: true, thresholds: getModelBaseline(projectsRoot, projectName, modelName) };
}

module.exports = {
    loadBaseline,
    saveBaseline,
    calculateAdjustment,
    addMarkedGoodSample,
    getModelBaseline,
    resetBaseline,
};
