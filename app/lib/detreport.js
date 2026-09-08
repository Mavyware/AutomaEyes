// Build Excel table rows from saved detection results (outputs/<date>/*.json).
// Columns: ID · image link · verdict · Box 1..N (Length,Width) · Hole 1..M (Ø) · detection time (ms).
// A feature that was NOT detected → its column slot is left empty (mapped by X position left→right).
const fs = require('fs');
const path = require('path');

function centerX(d) { return (Number(d.x1) + Number(d.x2)) / 2; }

// Get the mm value from gdt (kind: 'long'=length, 'short'=width, 'dia'=diameter).
function gval(d, kind) {
    const g = (d.gdt || []).find(x => x.kind === kind);
    if (!g) return null;
    const n = parseFloat(String(g.text).replace(/[^0-9.\-]/g, ''));
    return isFinite(n) ? n : null;
}

// Group detections → the dominant rectangle (rect) & circle (circle) shape classes.
function classify(dets) {
    const byClass = {};
    for (const d of dets) {
        const kinds = (d.gdt || []).map(g => g.kind);
        const shape = kinds.includes('dia') ? 'circle'
            : (kinds.includes('long') || kinds.includes('short')) ? 'rect' : null;
        if (!shape) continue;
        (byClass[d.class_name] = byClass[d.class_name] || { shape, items: [] }).items.push(d);
    }
    let boxCls = null, holeCls = null;
    for (const [c, info] of Object.entries(byClass)) {
        if (info.shape === 'rect' && (!boxCls || info.items.length > byClass[boxCls].items.length)) boxCls = c;
        if (info.shape === 'circle' && (!holeCls || info.items.length > byClass[holeCls].items.length)) holeCls = c;
    }
    return { boxes: boxCls ? byClass[boxCls].items : [], holes: holeCls ? byClass[holeCls].items : [] };
}

// Map features to n slots based on X position (left→right). Empty slot = null.
function assignSlots(items, n) {
    const out = new Array(n).fill(null);
    if (!items.length) return out;
    const xs = items.map(centerX);
    const xmin = Math.min(...xs), xmax = Math.max(...xs);
    const span = (xmax - xmin) || 1;
    for (const it of items.slice().sort((a, b) => centerX(a) - centerX(b))) {
        let slot = Math.round((centerX(it) - xmin) / span * (n - 1));
        slot = Math.max(0, Math.min(n - 1, slot));
        if (out[slot] != null) {              // slot taken → find the nearest empty slot
            let d = 1, placed = false;
            while (d < n && !placed) {
                if (slot - d >= 0 && out[slot - d] == null) { out[slot - d] = it; placed = true; }
                else if (slot + d < n && out[slot + d] == null) { out[slot + d] = it; placed = true; }
                d++;
            }
        } else out[slot] = it;
    }
    return out;
}

// projectDir = project folder; date = 'YYYY-MM-DD'. opts.nBox / opts.nHole.
exports.buildRows = (projectDir, date, opts) => {
    const NBOX = (opts && opts.nBox) || 8;
    const NHOLE = (opts && opts.nHole) || 6;
    const dir = path.join(projectDir, 'outputs', date);

    if (!fs.existsSync(dir)) {
        const header = ['ID', 'Gambar (link)', 'Verdict', 'Waktu Deteksi (ms)'];
        return { rows: [header], count: 0, dir };
    }

    const files = fs.readdirSync(dir).filter(f => f.toLowerCase().endsWith('.json')).sort();

    // First pass: scan for all distinct defect classes
    const defectClassesSet = new Set();
    const parsedList = [];
    for (const f of files) {
        let j;
        try { j = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch (_) { continue; }
        parsedList.push({ f, j });
        if (j.defectBreakdown) {
            for (const c of Object.keys(j.defectBreakdown)) defectClassesSet.add(c);
        }
        for (const s of (j.steps || [])) {
            for (const d of (s.detections || [])) {
                if (d.class_name && d.class_name !== 'OK' && !d.subThreshold) {
                    defectClassesSet.add(d.class_name);
                }
            }
        }
    }
    const defectClasses = Array.from(defectClassesSet).sort();

    // Build header row
    const header = ['ID', 'Gambar (link)', 'Verdict'];
    if (defectClasses.length > 0) {
        header.push('Total Cacat', 'Cacat Utama');
        for (const c of defectClasses) header.push(`Cacat: ${c}`);
    }
    for (let i = 1; i <= NBOX; i++) header.push(`Kotak ${i} Panjang (mm)`, `Kotak ${i} Lebar (mm)`);
    for (let i = 1; i <= NHOLE; i++) header.push(`Lubang ${i} Ø (mm)`);
    header.push('Waktu Deteksi (ms)');

    const rows = [header];
    let count = 0;
    const classDefectTotal = {};
    const classPartCounts = {};

    for (const { f, j } of parsedList) {
        const stem = f.replace(/\.json$/i, '');
        const imgPath = path.join(dir, stem + '.jpg');
        const imgCell = fs.existsSync(imgPath)
            ? { f: `HYPERLINK("${imgPath.replace(/"/g, '')}","${stem}.jpg")` }
            : '';

        const row = [stem, imgCell, j.finalVerdict || ''];

        // Defect breakdown per row
        if (defectClasses.length > 0) {
            const counts = {};
            let totalCacat = 0;
            let maxCount = 0;
            let primaryDefect = '—';

            if (j.defectBreakdown && typeof j.defectBreakdown === 'object') {
                for (const [c, cnt] of Object.entries(j.defectBreakdown)) {
                    counts[c] = (counts[c] || 0) + cnt;
                    totalCacat += cnt;
                    if (cnt > maxCount) { maxCount = cnt; primaryDefect = c; }
                }
            } else {
                for (const s of (j.steps || [])) {
                    for (const d of (s.detections || [])) {
                        if (d.class_name && d.class_name !== 'OK' && !d.subThreshold) {
                            counts[d.class_name] = (counts[d.class_name] || 0) + 1;
                            totalCacat++;
                            if (counts[d.class_name] > maxCount) {
                                maxCount = counts[d.class_name];
                                primaryDefect = d.class_name;
                            }
                        }
                    }
                }
            }

            row.push(totalCacat, primaryDefect);
            for (const c of defectClasses) {
                const cCount = counts[c] || 0;
                row.push(cCount);
                if (cCount > 0) {
                    classDefectTotal[c] = (classDefectTotal[c] || 0) + cCount;
                    classPartCounts[c] = (classPartCounts[c] || 0) + 1;
                }
            }
        }

        const insp = (j.steps || []).find(s => s.category === 'Inspection' && !s.skipped);
        const dets = (insp && Array.isArray(insp.detections)) ? insp.detections : [];
        const { boxes, holes } = classify(dets);

        for (const b of assignSlots(boxes, NBOX)) {
            if (b) row.push(gval(b, 'long'), gval(b, 'short'));
            else row.push('', '');
        }
        for (const h of assignSlots(holes, NHOLE)) {
            row.push(h ? gval(h, 'dia') : '');
        }
        row.push(typeof j.totalMS === 'number' ? Math.round(j.totalMS) : '');
        rows.push(row);
        count++;
    }

    // Append Defect Breakdown Summary block
    if (count > 0 && defectClasses.length > 0) {
        rows.push([]);
        rows.push(['--- Ringkasan Cacat ---']);
        rows.push(['Kelas Cacat', 'Total Ditemukan', 'Part Terdampak', 'Persentase Part (%)']);
        for (const c of defectClasses) {
            const affectedParts = classPartCounts[c] || 0;
            const pct = count ? Number((affectedParts / count * 100).toFixed(1)) : 0;
            rows.push([c, classDefectTotal[c] || 0, affectedParts, pct]);
        }
    }

    return { rows, count, dir, defectClasses, defectSummary: classDefectTotal };
};
