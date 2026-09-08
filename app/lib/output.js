// Output recorder — NG image save + daily summary CSV.
//
// Layout:
//   <project>/outputs/YYYY-MM-DD/NNN-HHMM.jpg + .json
//   <project>/outputs/daily_summary.csv

const fs = require('fs');
const path = require('path');

const dailyCounts = {}; // { 'ProjectName|YYYY-MM-DD': counter }

exports.record = (project, imageBase64, runResult, cfg) => {
    const now = new Date();
    const dayKey = now.toISOString().slice(0, 10); // YYYY-MM-DD
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = hh + mm;

    const dayDir = path.join(project.dir, 'outputs', dayKey);
    if (!fs.existsSync(dayDir)) fs.mkdirSync(dayDir, { recursive: true });

    // Counter based on existing files (resume-safe)
    const key = `${project.name}|${dayKey}`;
    if (dailyCounts[key] === undefined) {
        dailyCounts[key] = fs.readdirSync(dayDir).filter(f => f.endsWith('.jpg')).length;
    }
    dailyCounts[key]++;
    const seq = dailyCounts[key];
    const seqStr = String(seq).padStart(3, '0');

    const stem = `${seqStr}-${timeStr}`;
    // A flag from the Options step (if any) wins over the global setting.
    const isNG = runResult.finalVerdict === 'NG';
    const saveImg = isNG
        ? (runResult.saveNG !== false)                                  // NG: save, unless Options turns it off
        : (runResult.saveOK === true || cfg.output.save_ok_images);     // OK: save only if requested

    let imgPath = null, metaPath = null;
    if (saveImg) {
        imgPath = path.join(dayDir, stem + '.jpg');
        const buf = Buffer.from(imageBase64, 'base64');
        fs.writeFileSync(imgPath, buf);

        // Aggregate defect counts per class across all steps
        const defectBreakdown = {};
        (runResult.steps || []).forEach(s => {
            if (s.defectBreakdown && typeof s.defectBreakdown === 'object') {
                for (const [cls, cnt] of Object.entries(s.defectBreakdown)) {
                    defectBreakdown[cls] = (defectBreakdown[cls] || 0) + cnt;
                }
            } else if (Array.isArray(s.detections)) {
                s.detections.forEach(d => {
                    if (d.class_name && d.class_name !== 'OK' && !d.subThreshold) {
                        defectBreakdown[d.class_name] = (defectBreakdown[d.class_name] || 0) + 1;
                    }
                });
            }
        });

        metaPath = path.join(dayDir, stem + '.json');
        fs.writeFileSync(metaPath, JSON.stringify({
            seq, timestamp: now.toISOString(),
            finalVerdict: runResult.finalVerdict,
            totalMS: runResult.totalMS,
            defectBreakdown,
            steps: runResult.steps,
            image: stem + '.jpg',
        }, null, 2));
    }

    // Append to daily_summary.csv
    const csvPath = path.join(project.dir, 'outputs', 'daily_summary.csv');
    const stepsStr = runResult.steps.map(s =>
        `${s.modelName || s.label || s.category}:${s.verdict}(${(s.confidence || 0).toFixed(2)})`
    ).join(';');
    const row = [
        dayKey, seqStr, now.toISOString(),
        runResult.finalVerdict, (runResult.totalMS || 0).toFixed(1),
        stepsStr,
    ].join(',') + '\n';
    try {
        fs.writeFileSync(csvPath, 'date,seq,timestamp,final_verdict,total_ms,steps\n' + row, { flag: 'wx' });
    } catch (e) {
        if (e.code === 'EEXIST') {
            fs.appendFileSync(csvPath, row);
        } else {
            throw e;
        }
    }

    return { seq, imgPath, metaPath, csvPath };
};

exports.dailySummary = (projectDir, dayKey) => {
    const csvPath = path.join(projectDir, 'outputs', 'daily_summary.csv');
    if (!fs.existsSync(csvPath)) return { total: 0, ok: 0, ng: 0, avgCycleMS: 0, byStep: {}, byClass: {} };
    const rows = fs.readFileSync(csvPath, 'utf8').split('\n').slice(1).filter(Boolean);
    let total = 0, ok = 0, ng = 0, msSum = 0;
    const byStep = {};
    const byClass = {};
    for (const row of rows) {
        const [date, , , verdict, ms, steps] = row.split(',');
        if (date !== dayKey) continue;
        total++;
        if (verdict === 'OK') ok++;
        else {
            ng++;
            (steps || '').split(';').forEach(part => {
                const [step, verd] = part.split(':');
                if (verd && verd.startsWith('NG')) byStep[step] = (byStep[step] || 0) + 1;
            });
        }
        msSum += parseFloat(ms) || 0;
    }

    // Aggregate byClass from the day's output JSON files if available
    const dayDir = path.join(projectDir, 'outputs', dayKey);
    if (fs.existsSync(dayDir)) {
        try {
            const files = fs.readdirSync(dayDir).filter(f => f.endsWith('.json'));
            for (const f of files) {
                try {
                    const j = JSON.parse(fs.readFileSync(path.join(dayDir, f), 'utf8'));
                    if (j.defectBreakdown) {
                        for (const [cls, cnt] of Object.entries(j.defectBreakdown)) {
                            byClass[cls] = (byClass[cls] || 0) + cnt;
                        }
                    } else if (Array.isArray(j.steps)) {
                        j.steps.forEach(s => {
                            (s.detections || []).forEach(d => {
                                if (d.class_name && d.class_name !== 'OK' && !d.subThreshold) {
                                    byClass[d.class_name] = (byClass[d.class_name] || 0) + 1;
                                }
                            });
                        });
                    }
                } catch (_) {}
            }
        } catch (_) {}
    }

    return {
        date: dayKey, total, ok, ng,
        avgCycleMS: total > 0 ? msSum / total : 0,
        byStep,
        byClass,
    };
};
