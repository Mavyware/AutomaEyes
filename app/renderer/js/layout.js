// App shell: automatically installed by every page that loads this file.
// Gate pages (login, connect-github, setup, update) deliberately do NOT
// load it - those pages appear plain, with no navigation.
//
//   <body>
//     <main>...</main>
//     <script src="../js/layout.js"></script>
//   </body>
//
// Options are set before loading this file:
//   window.LAYOUT_OPTS = { title: 'Model xyz', subtitle: '...', showTotalStatus: true };

// App shell: navigation sidebar + one topbar.
//
// There used to be four stacked rows of chrome (menu bar, toolbar, header,
// status bar) eating ~150 px before content appeared, and navigation was
// scattered: "Home" in the File menu, Run mode in the header, Settings in
// two places. Everything was merged into one sidebar so it's clear "where
// am I", and the work area gets a much bigger share of the screen - the
// inspection view is what gets stared at for a long time.
(function () {
    const opts = window.LAYOUT_OPTS || {};
    const title = opts.title || 'AutomaEyes';
    const subtitle = opts.subtitle || '';
    const showTotalStatus = !!opts.showTotalStatus;

    const q = new URLSearchParams(location.search);
    const project = q.get('project') || q.get('name') || '';
    const model = q.get('model') || '';
    const page = (location.pathname.split('/').pop() || '').toLowerCase();

    const esc = (v) => String(v == null ? '' : v).replace(/[&<>"']/g, (c) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
    }[c]));

    const go = (p) => `window.api.goTo('${p}')`;
    const withProject = (p) => project ? `${p}?project=${encodeURIComponent(project)}` : p;

    // The project menu only appears when a project is open - showing
    // "Workflow" or "Run" with no project would just lead to a warning.
    const navItem = (id, ikon, label, target, aktif, nonaktif) => `
        <button class="nav-item ${aktif ? 'active' : ''}" ${nonaktif ? 'disabled' : `onclick="${go(target)}"`}>
            <span class="nav-ic">${ikon}</span><span class="nav-label">${esc(label)}</span>
        </button>`;

    const navProject = project ? `
        <div class="nav-group">
            <div class="nav-group-title">${esc(project)}</div>
            ${navItem('p', '&#9776;', 'Ringkasan', withProject('project.html'), page === 'project.html')}
            ${navItem('m', '&#9635;', 'Model', withProject('project.html'), page === 'model.html' || page === 'new_model.html')}
            ${navItem('w', '&#8644;', 'Workflow', withProject('workflow.html'), page === 'workflow.html')}
            ${navItem('o', '&#9889;', 'Output', withProject('output.html'), page === 'output.html')}
            ${navItem('r', '&#9654;', 'Jalankan', withProject('run.html'), page === 'run.html')}
        </div>
        <div class="nav-group">
            <div class="nav-group-title">Laporan</div>
            <button class="nav-item" onclick="laporanHarian()">
                <span class="nav-ic">&#128202;</span><span class="nav-label">Laporan Harian</span>
            </button>
            <button class="nav-item" onclick="dataDeteksi()">
                <span class="nav-ic">&#128207;</span><span class="nav-label">Data Deteksi</span>
            </button>
        </div>` : '';

    const sidebarHTML = `
        <aside class="sidebar">
            <div class="brand">
                <span class="brand-dot"></span>
                <span class="brand-name">AutomaEyes</span>
            </div>

            <nav class="nav">
                <div class="nav-group">
                    ${navItem('all', '&#9783;', 'Semua Project', 'projects.html', page === 'projects.html')}
                </div>
                ${navProject}
            </nav>

            <div class="sidebar-foot">
                <button class="nav-item ${page === 'settings.html' ? 'active' : ''}" onclick="${go('settings.html')}">
                    <span class="nav-ic">&#9881;</span><span class="nav-label">Pengaturan</span>
                </button>
                <button class="acct" onclick="toggleMenu(event,'acctMenu')">
                    <span class="acct-avatar" id="acctAvatar">&#128100;</span>
                    <span class="acct-text">
                        <span class="acct-name" id="acctLabel">Akun</span>
                        <span class="acct-repo" id="acctRepo">&mdash;</span>
                    </span>
                    <div id="acctMenu" class="util-menu" style="display:none">
                        <div class="util-opt" style="pointer-events:none;opacity:.75;white-space:normal" id="acctInfo">Memuat&hellip;</div>
                        <div class="util-opt" onclick="changeRepo(event)">&#128193; Ganti repo penyimpanan</div>
                        <div class="util-opt" onclick="showAbout(event)">&#8505;&#65039; Tentang aplikasi</div>
                        <div class="util-opt" onclick="location.reload()">&#128260; Muat ulang halaman</div>
                        <div class="util-opt" style="color:#f87171" onclick="doLogout(event)">&#9211; Keluar akun</div>
                        <div class="util-opt" style="color:#f87171" onclick="appExit()">&#10005; Tutup aplikasi</div>
                    </div>
                </button>
            </div>
        </aside>`;

    const totalStatusHTML = showTotalStatus ? `
        <div class="total-status-box idle" id="totalStatusBox">
            <span id="totalStatusValue">&mdash;</span>
        </div>` : '';

    // Breadcrumbs replace a plain title: position is readable without guessing.
    const crumbs = [];
    if (project) crumbs.push(esc(project));
    if (model) crumbs.push(esc(model));

    const topbarHTML = `
        <header class="topbar">
            <div class="crumbs">
                ${crumbs.map((c) => `<span class="crumb">${c}</span>`).join('<span class="crumb-sep">&rsaquo;</span>')}
                ${crumbs.length ? '<span class="crumb-sep">&rsaquo;</span>' : ''}
                <span class="crumb-now">${esc(title)}</span>
                ${subtitle ? `<span class="crumb-sub">${esc(subtitle)}</span>` : ''}
            </div>
            <div class="topbar-actions">
                <button class="icon-btn" title="Simpan &amp; unggah ke GitHub" onclick="syncSaveToCloud(event)">&#9729;&#65039;</button>
                <button class="icon-btn" title="Muat versi terbaru dari GitHub" onclick="syncLoadFromCloud(event)">&#11015;&#65039;</button>
                <button class="icon-btn" title="Status sinkronisasi" onclick="showSyncStatus(event)">&#8505;&#65039;</button>
                ${totalStatusHTML}
            </div>
        </header>`;

    // Page content is wrapped so it can scroll separately from the sidebar.
    document.body.classList.add('has-shell');
    document.body.insertAdjacentHTML('afterbegin', sidebarHTML + '<div class="workarea">' + topbarHTML + '</div>');
    const workarea = document.querySelector('.workarea');
    const main = document.querySelector('body > main');
    if (main && workarea) workarea.appendChild(main);
})();

// Final verdict for one part. The element is only rendered by the topbar if
// the page requests showTotalStatus, so its absence isn't an error.
window.setTotalStatus = function (verdict) {
    const box = document.getElementById('totalStatusBox');
    const value = document.getElementById('totalStatusValue');
    if (!box || !value) return;
    box.classList.remove('pass', 'fail', 'idle');
    if (verdict === 'OK') { box.classList.add('pass'); value.textContent = 'PASS'; }
    else if (verdict === 'NG') { box.classList.add('fail'); value.textContent = 'FAIL'; }
    else { box.classList.add('idle'); value.textContent = '—'; }
};

window.switchToRunMode = function() {
    // Nav to Run page for current project, if there is one
    const p = new URLSearchParams(location.search).get('name')
        || new URLSearchParams(location.search).get('project');
    if (p) window.api.goTo(`run.html?project=${encodeURIComponent(p)}`);
    else pesan('Pilih project dulu', 'warn');
};

// ===================== GitHub Sync (Save / Load) =====================
(function () {

    // Close all menubar dropdowns when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.closest('.acct') || e.target.closest('.menu-item')) return;
        document.querySelectorAll('.util-menu').forEach(m => { m.style.display = 'none'; });
    });

    // Auto-load the latest version once when the app first opens
    if (window.api && window.api.gitAutoPullOnce) {
        window.api.gitAutoPullOnce().then((r) => {
            if (!r || r.skipped || !r.result) return;
            const res = r.result;
            if (res.ok && !res.upToDate) _syncToast('⬇️ Versi terbaru dimuat dari GitHub. Refresh bila perlu.', 'ok', 6000);
            else if (!res.ok && (res.dirty || res.diverged)) _syncToast('ℹ️ ' + res.log, 'info', 8000);
            else if (!res.ok) _syncToast('⚠️ Auto-load gagal: ' + _syncShort(res.log), 'err', 8000);
        }).catch(() => {});
    }
})();

function _syncShort(s) { s = String(s || ''); return s.length > 200 ? s.slice(-200) : s; }

function _syncToast(msg, kind, ms) {
    // Piggybacks on pesan() in common.js: one display, one place to fix.
    // The .sync-toast style itself was briefly lost when the stylesheet was
    // rewritten, causing sync messages to show as plain text with no frame.
    return pesan(msg, kind === 'ok' ? 'ok' : (kind === 'err' ? 'err' : 'info'), ms);
}


// Open/close one menubar dropdown; close the others.
function toggleMenu(e, id) {
    if (e) e.stopPropagation();
    const target = document.getElementById(id);
    document.querySelectorAll('.util-menu').forEach(m => { if (m !== target) m.style.display = 'none'; });
    if (target) target.style.display = (target.style.display === 'none' || !target.style.display) ? 'block' : 'none';
}
function _closeUtilMenu() { document.querySelectorAll('.util-menu').forEach(m => { m.style.display = 'none'; }); }

// File → Exit
function appExit() {
    _closeUtilMenu();
    if (window.api && window.api.quitApp) window.api.quitApp();
    else window.close();
}

// Help → About AutomaEyes (name + version from config)
async function showAbout() {
    _closeUtilMenu();
    try {
        const cfg = await window.api.getConfig();
        const name = (cfg && cfg.app && cfg.app.name) || 'AutomaEyes';
        const ver = (cfg && cfg.app && cfg.app.version) || '';
        _syncToast(`${name}${ver ? ' — v' + ver : ''}\nSistem Quality Control berbasis YOLOv11.`, 'info', 7000);
    } catch (_) {
        _syncToast('AutomaEyes — Sistem Quality Control berbasis YOLOv11.', 'info', 6000);
    }
}

// Pop-up modal dialog for error inspection and log copying.
function tampilkanModalError(judul, pesanUtama, detailLog) {
    const bekas = document.getElementById('modalErrorOverlay');
    if (bekas) bekas.remove();

    const overlay = document.createElement('div');
    overlay.id = 'modalErrorOverlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.75);z-index:11000;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(3px)';

    const box = document.createElement('div');
    box.style.cssText = 'background:#18181b;color:#f4f4f5;border:1px solid #ef4444;border-radius:10px;padding:22px;max-width:760px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 25px 50px -12px rgba(0,0,0,0.6)';

    const header = document.createElement('div');
    header.style.cssText = 'display:flex;align-items:flex-start;gap:12px;margin-bottom:12px';
    header.innerHTML = `
        <div style="font-size:26px;line-height:1;margin-top:2px">&#9888;&#65039;</div>
        <div style="flex:1">
            <h3 style="margin:0 0 4px;color:#f87171;font-size:16px;font-weight:600">${_esc(judul || 'Terjadi Kesalahan')}</h3>
            <p style="margin:0;font-size:12px;color:#a1a1aa">${_esc(pesanUtama || 'Operasi tidak berhasil diselesaikan.')}</p>
        </div>
        <button id="modalErrorX" style="background:none;border:none;color:#a1a1aa;font-size:20px;cursor:pointer;padding:0 6px;line-height:1" title="Tutup">&times;</button>
    `;

    const logWrap = document.createElement('div');
    logWrap.style.cssText = 'display:flex;flex-direction:column;gap:6px;flex:1;min-height:140px;margin-bottom:16px;overflow:hidden';

    const logLabel = document.createElement('div');
    logLabel.style.cssText = 'font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:0.5px';
    logLabel.textContent = 'Detail Log & Pesan Error:';

    const pre = document.createElement('pre');
    pre.style.cssText = 'flex:1;min-height:100px;max-height:360px;background:#09090b;border:1px solid #27272a;border-radius:6px;padding:12px;overflow:auto;margin:0;font-family:Consolas,Menlo,monospace;font-size:11px;line-height:1.45;color:#e4e4e7;white-space:pre-wrap;word-break:break-all';
    pre.textContent = detailLog ? String(detailLog).trim() : 'Tidak ada catatan log tambahan.';

    logWrap.appendChild(logLabel);
    logWrap.appendChild(pre);

    const footer = document.createElement('div');
    footer.style.cssText = 'display:flex;gap:10px;justify-content:flex-end;align-items:center';

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn';
    copyBtn.style.cssText = 'background:#27272a;color:#fafafa;border:1px solid #3f3f46;padding:7px 16px;border-radius:6px;cursor:pointer;font-size:12px;display:inline-flex;align-items:center;gap:6px;font-weight:500';
    copyBtn.innerHTML = '&#128203; Salin Log';
    copyBtn.onclick = () => {
        const textToCopy = `=== ${judul} ===\n${pesanUtama}\n\n${detailLog || ''}`;
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(textToCopy).then(() => {
                copyBtn.innerHTML = '&#10003; Tersalin!';
                setTimeout(() => { copyBtn.innerHTML = '&#128203; Salin Log'; }, 2500);
            });
        }
    };

    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn primary';
    closeBtn.style.cssText = 'background:#dc2626;color:#ffffff;border:none;padding:7px 18px;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600';
    closeBtn.textContent = 'Tutup';

    const tutup = () => overlay.remove();
    closeBtn.onclick = tutup;
    header.querySelector('#modalErrorX').onclick = tutup;
    overlay.onclick = (e) => { if (e.target === overlay) tutup(); };

    footer.appendChild(copyBtn);
    footer.appendChild(closeBtn);

    box.appendChild(header);
    box.appendChild(logWrap);
    box.appendChild(footer);
    overlay.appendChild(box);
    document.body.appendChild(overlay);
}

async function syncSaveToCloud(e) {
    if (e) e.stopPropagation();
    _closeUtilMenu();
    const t = _syncToast('☁️ Menyimpan & mengunggah ke GitHub… jangan tutup app.', 'info', 0);
    const span = t ? t.querySelector('span') : null;
    let unsub = null;
    if (window.api && window.api.onGitProgress) {
        unsub = window.api.onGitProgress((p) => {
            if (span) {
                const pct = p.percent != null ? ` [${p.percent}%]` : '';
                const step = p.step || 'Mengunggah…';
                span.textContent = `☁️${pct} ${step}`;
            }
        });
    }
    try {
        const r = await window.api.gitPush();
        if (unsub) unsub();
        if (t) t.remove();
        if (r.ok) {
            _syncToast(r.nothing ? '✓ Sudah terbaru — tidak ada perubahan untuk diunggah.' : '✓ Tersimpan & terunggah ke GitHub.', 'ok', 5000);
        } else if (r.rejected) {
            showConflictDialog();   // GitHub's version is newer: let the user choose
        } else {
            tampilkanModalError('Gagal Menyimpan ke GitHub', 'Terjadi masalah saat mengunggah perubahan ke repositori GitHub.', r.log);
        }
    } catch (err) {
        if (unsub) unsub();
        if (t) t.remove();
        tampilkanModalError('Error Menyimpan ke GitHub', 'Gagal memproses penyimpanan: ' + (err.message || err), err.stack || String(err));
    }
}

async function syncLoadFromCloud(e) {
    if (e) e.stopPropagation();
    _closeUtilMenu();
    const t = _syncToast('⬇️ Mengambil versi terbaru dari GitHub…', 'info', 0);
    const span = t ? t.querySelector('span') : null;
    let unsub = null;
    if (window.api && window.api.onGitProgress) {
        unsub = window.api.onGitProgress((p) => {
            if (span) {
                const pct = p.percent != null ? ` [${p.percent}%]` : '';
                const step = p.step || 'Mengunduh…';
                span.textContent = `⬇️${pct} ${step}`;
            }
        });
    }
    try {
        const r = await window.api.gitPull();
        if (unsub) unsub();
        if (t) t.remove();
        if (r.ok) {
            _syncToast(r.upToDate ? '✓ Sudah versi terbaru.' : '✓ Versi terbaru dimuat. Refresh halaman bila perlu.', 'ok', 6000);
        } else if (r.diverged) {
            showConflictDialog();   // history has diverged: let the user choose
        } else {
            tampilkanModalError('Gagal Memuat dari GitHub', 'Terjadi masalah saat mengunduh versi terbaru dari GitHub.', r.log);
        }
    } catch (err) {
        if (unsub) unsub();
        if (t) t.remove();
        tampilkanModalError('Error Memuat dari GitHub', 'Gagal memproses pengambilan data: ' + (err.message || err), err.stack || String(err));
    }
}

async function showSyncStatus(e) {
    if (e) e.stopPropagation();
    _closeUtilMenu();
    try {
        const s = await window.api.gitStatus();
        if (!s.repo) return _syncToast('Folder projects belum tersambung ke GitHub. Buka Connect GitHub dulu.', 'err', 7000);
        if (!s.hasRemote) return _syncToast('Belum tersambung ke GitHub (belum ada remote origin).', 'err', 7000);
        _syncToast(`Branch: ${s.branch} · ${s.dirty ? s.changes + ' perubahan belum disimpan' : 'bersih (sudah tersimpan)'}\n${s.remote}`, 'info', 8000);
    } catch (err) { _syncToast('⚠️ ' + err.message, 'err', 7000); }
}


// ==== Account Menu ====
// The user's identity + destination repo are deliberately placed in the menu
// bar, not just in Settings: the user needs to know "whose repo am I saving
// to" without navigating to another page.
async function _loadAccount() {
    if (!window.api || !window.api.authStatus) return;
    try {
        const st = await window.api.authStatus();
        const lbl = document.getElementById('acctLabel');
        const repo = document.getElementById('acctRepo');
        const info = document.getElementById('acctInfo');
        if (!lbl || !info) return;

        if (st.session) {
            const nama = st.session.user.name || st.session.user.email || 'Akun';
            lbl.textContent = nama.split(' ')[0];
            if (repo) {
                repo.textContent = st.github ? st.github.repo.split('/').pop() : 'GitHub belum tersambung';
                repo.classList.toggle('warn', !st.github);
            }
            info.innerHTML = `<strong>${_esc(nama)}</strong><br>` +
                `<span style="font-size:11px">${_esc(st.session.user.email || '')}</span><br>` +
                (st.github
                    ? `<span style="font-size:11px">Repo: ${_esc(st.github.repo)}</span>`
                    : `<span style="font-size:11px;color:#f59e0b">GitHub belum tersambung</span>`);
        } else {
            lbl.textContent = 'Belum login';
            if (repo) repo.textContent = '\u2014';
            info.textContent = 'Belum login';
        }
    } catch (_) { /* gate pages have no sidebar */ }
}

function _esc(s) {
    return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

async function doLogout(e) {
    if (e) e.stopPropagation();
    _closeUtilMenu();
    if (!await tanya('Koneksi GitHub ikut dilepas. Project yang sudah ter-push tetap aman di repo Anda.',
        { judul: 'Keluar dari akun', ya: 'Keluar' })) return;
    await window.api.authLogout();
}

// Change repos without re-Authorizing: the stored token is reused.
async function changeRepo(e) {
    if (e) e.stopPropagation();
    _closeUtilMenu();

    const res = await window.api.githubRepos();
    if (!res.ok) { _syncToast('&#9888;&#65039; ' + res.error, 'err', 7000); return; }

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.55);z-index:4000;display:flex;align-items:center;justify-content:center;padding:16px';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;color:#222;border-radius:8px;padding:20px;max-width:460px;width:100%';
    box.innerHTML = `
        <h3 style="margin:0 0 4px">Ganti repo penyimpanan</h3>
        <p style="font-size:12px;color:#666;margin:0 0 14px">
            Project berikutnya akan disimpan &amp; di-push ke repo yang dipilih.
            Project yang sudah ada di repo lama tidak ikut berpindah.
        </p>
        <label style="font-size:12px;display:block;margin-bottom:6px">
            <input type="radio" name="rmode" value="existing" checked> Pakai repo yang sudah ada
        </label>
        <select id="crSel" style="width:100%;margin-bottom:12px">
            ${res.repos.map((r) => `<option value="${_esc(r.name)}">${_esc(r.fullName)}${r.private ? ' (privat)' : ''}</option>`).join('')}
        </select>
        <label style="font-size:12px;display:block;margin-bottom:6px">
            <input type="radio" name="rmode" value="new"> Buat repo baru (privat)
        </label>
        <input type="text" id="crNew" value="automaeyes-projects" style="width:100%;margin-bottom:14px">
        <div style="display:flex;gap:8px;justify-content:flex-end">
            <button class="btn" id="crCancel">Batal</button>
            <button class="btn primary" id="crOk">Sambungkan</button>
        </div>
        <p id="crMsg" style="font-size:12px;margin:10px 0 0"></p>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
    box.querySelector('#crCancel').onclick = () => overlay.remove();

    box.querySelector('#crOk').onclick = async () => {
        const isNew = box.querySelector('input[name=rmode]:checked').value === 'new';
        const name = isNew ? box.querySelector('#crNew').value.trim() : box.querySelector('#crSel').value;
        if (!name) return;
        const msg = box.querySelector('#crMsg');
        box.querySelector('#crOk').disabled = true;
        msg.textContent = 'Menyiapkan repo...';
        const r = await window.api.githubConnect(name, isNew, true);
        if (!r.ok) { msg.textContent = r.error; msg.style.color = '#dc2626'; box.querySelector('#crOk').disabled = false; return; }
        msg.textContent = `Tersambung ke ${r.repo}.`; msg.style.color = '#22a34c';
        setTimeout(() => { overlay.remove(); window.api.goTo('projects.html'); }, 900);
    };
}

_loadAccount();


// ==== GitHub conflict resolution ====
//
// Appears when local and GitHub history have diverged - two devices both
// saved from the same starting point. For images and model weights, merging
// file contents makes no sense, so the user picks one side. The discarded
// side is always backed up first.
async function showConflictDialog() {
    const info = await window.api.gitConflictInfo();
    if (!info.ok) {
        tampilkanModalError('Gagal Memeriksa Konflik', 'Tidak dapat memeriksa perbedaan riwayat dengan GitHub.', info.log);
        return;
    }

    const daftar = (arr, sisa) => {
        if (!arr.length) return '<span style="color:#888">tidak ada perubahan berkas</span>';
        const tampil = arr.slice(0, 12).map((f) => `<div>${_esc(f)}</div>`).join('');
        const lebih = (arr.length > 12 || sisa) ? `<div style="color:#888">…dan ${arr.length - 12 + sisa} berkas lain</div>` : '';
        return tampil + lebih;
    };

    const overlay = document.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:5000;display:flex;align-items:center;justify-content:center;padding:18px';
    const box = document.createElement('div');
    box.style.cssText = 'background:#fff;color:#222;border-radius:8px;padding:22px;max-width:720px;width:100%;max-height:88vh;overflow:auto';
    box.innerHTML = `
        <h3 style="margin:0 0 4px">Versi di GitHub dan di komputer ini berbeda</h3>
        <p style="font-size:12px;color:#555;margin:0 0 14px">
            Keduanya sama-sama berubah sejak terakhir disamakan, jadi tidak bisa
            digabung otomatis. Pilih versi mana yang dipakai.
            <strong>Versi yang tidak dipilih tetap disimpan</strong> sebagai cadangan,
            jadi pilihan ini masih bisa dibatalkan.
        </p>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:14px">
            <div style="border:1px solid #d0d7de;border-radius:6px;padding:12px">
                <div style="font-weight:600;margin-bottom:2px">Komputer ini</div>
                <div style="font-size:11px;color:#666;margin-bottom:8px">
                    ${info.ahead} perubahan belum ada di GitHub${info.uncommitted ? ` · ${info.uncommitted} belum disimpan` : ''}
                </div>
                <div style="font-family:Consolas,monospace;font-size:10px;max-height:130px;overflow:auto">${daftar(info.localFiles, info.localMore)}</div>
            </div>
            <div style="border:1px solid #d0d7de;border-radius:6px;padding:12px">
                <div style="font-weight:600;margin-bottom:2px">GitHub</div>
                <div style="font-size:11px;color:#666;margin-bottom:8px">${info.behind} perubahan belum ada di komputer ini</div>
                <div style="font-family:Consolas,monospace;font-size:10px;max-height:130px;overflow:auto">${daftar(info.remoteFiles, info.remoteMore)}</div>
            </div>
        </div>
        <div style="border:1px solid #cfe0f7;background:#f2f8ff;border-radius:6px;padding:10px 12px;margin-bottom:12px">
            <label style="font-size:12px;display:block;margin:0">
                Nama cabang baru
                <input type="text" id="ckBranch" value="cabang-saya" style="width:100%;margin-top:4px">
            </label>
            <p style="font-size:11px;color:#555;margin:6px 0 0">
                Pilihan teraman: tidak ada yang ditimpa. Pekerjaan Anda didorong ke cabang
                ini, komputer mengikuti versi GitHub, dan keduanya bisa digabung nanti
                lewat Pull Request.
            </p>
        </div>
        <div style="display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap">
            <button class="btn" id="ckCancel">Batal</button>
            <button class="btn" id="ckRemote">Pakai versi GitHub</button>
            <button class="btn" id="ckLocal">Pakai versi komputer ini</button>
            <button class="btn primary" id="ckBranchBtn">Simpan sebagai cabang baru</button>
        </div>
        <div id="ckProgressWrap" style="display:none;margin-top:14px;padding:12px 14px;background:#f8fafc;border:1px solid #cbd5e1;border-radius:6px">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
                <span id="ckProgressTitle" style="font-size:12px;font-weight:600;color:#1e293b">Menyiapkan...</span>
                <span id="ckProgressPct" style="font-size:12px;font-weight:700;color:#2563eb;font-family:Consolas,monospace">0%</span>
            </div>
            <div style="width:100%;height:8px;background:#e2e8f0;border-radius:4px;overflow:hidden;margin-bottom:6px">
                <div id="ckProgressBar" style="width:0%;height:100%;background:#2563eb;border-radius:4px;transition:width 0.2s ease, background-color 0.3s"></div>
            </div>
            <div id="ckProgressDetail" style="font-size:11px;color:#64748b;font-family:Consolas,monospace;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">Menghubungi Git...</div>
        </div>`;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
    box.querySelector('#ckCancel').onclick = () => overlay.remove();

    const jalankan = async (choice) => {
        const nama = (box.querySelector('#ckBranch').value || '').trim();
        if (choice === 'branch' && !nama) {
            _syncToast('Nama cabang tidak boleh kosong.', 'err', 5000);
            return;
        }
        const actionButtons = [
            box.querySelector('#ckLocal'),
            box.querySelector('#ckRemote'),
            box.querySelector('#ckBranchBtn')
        ];
        actionButtons.forEach((b) => { if (b) b.disabled = true; });

        const pWrap = box.querySelector('#ckProgressWrap');
        const pTitle = box.querySelector('#ckProgressTitle');
        const pPct = box.querySelector('#ckProgressPct');
        const pBar = box.querySelector('#ckProgressBar');
        const pDetail = box.querySelector('#ckProgressDetail');

        pWrap.style.display = 'block';
        pBar.style.width = '0%';
        pBar.style.backgroundColor = '#2563eb';
        pPct.textContent = '0%';
        pTitle.textContent = 'Menyiapkan proses penyelesaian konflik...';
        pDetail.textContent = 'Menghubungi Git...';

        let unsub = null;
        if (window.api && window.api.onGitProgress) {
            unsub = window.api.onGitProgress((p) => {
                if (p.percent != null) {
                    const clamped = Math.min(100, Math.max(0, p.percent));
                    pPct.textContent = clamped + '%';
                    pBar.style.width = clamped + '%';
                }
                if (p.step) pTitle.textContent = p.step;
                if (p.raw) pDetail.textContent = p.raw;
            });
        }

        try {
            const r = await window.api.gitResolveConflict(choice, nama);
            if (unsub) unsub();
            if (r.ok) {
                pBar.style.width = '100%';
                pPct.textContent = '100%';
                pBar.style.backgroundColor = '#16a34a';
                pTitle.textContent = '✓ ' + (r.backupBranch ? `Berhasil diselesaikan! Cadangan tersimpan di "${r.backupBranch}".` : 'Berhasil diselesaikan!');
                pDetail.textContent = 'Memuat ulang halaman...';
                setTimeout(() => { overlay.remove(); location.reload(); }, 1800);
            } else {
                pBar.style.backgroundColor = '#dc2626';
                pTitle.textContent = '❌ Gagal menyelesaikan konflik';
                pDetail.textContent = 'Terjadi kesalahan saat memproses.';
                actionButtons.forEach((b) => { if (b) b.disabled = false; });
                tampilkanModalError('Gagal Menyelesaikan Konflik', 'Operasi Git tidak berhasil diselesaikan. Silakan salin detail log di bawah untuk dilaporkan:', r.log);
            }
        } catch (err) {
            if (unsub) unsub();
            pBar.style.backgroundColor = '#dc2626';
            pTitle.textContent = '❌ Terjadi Kesalahan';
            pDetail.textContent = err.message || String(err);
            actionButtons.forEach((b) => { if (b) b.disabled = false; });
            tampilkanModalError('Gagal Menyelesaikan Konflik', 'Terjadi kesalahan saat memproses konflik: ' + (err.message || err), err.stack || String(err));
        }
    };
    box.querySelector('#ckLocal').onclick = () => jalankan('local');
    box.querySelector('#ckRemote').onclick = () => jalankan('remote');
    box.querySelector('#ckBranchBtn').onclick = () => jalankan('branch');
}

// ===================== Reports (XLSX) =====================
// The button used to be on the Summary page and used window.prompt to ask
// for a date. Electron doesn't support prompt() - it throws
// "prompt() is not supported", so neither export ever ran even once.
// Replaced with an in-app date dialog.
//
// Reports are computed from the project's outputs/ (daily CSV + per-frame JSON).
// Pure statistics, no language model anywhere in this path.
function _tanggalHariIni() {
    const d = new Date();
    const p = (n) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

function _tanyaTanggal(judul) {
    return new Promise((selesai) => {
        const bekas = document.getElementById('dlgTanggal');
        if (bekas) bekas.remove();

        // Inline styles, following the other dialogs in this app - the
        // stylesheet has no modal class yet, so a class alone wouldn't render correctly.
        const bungkus = document.createElement('div');
        bungkus.id = 'dlgTanggal';
        bungkus.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:3100;'
            + 'display:flex;align-items:center;justify-content:center;padding:14px';
        bungkus.innerHTML = `
            <div role="dialog" aria-modal="true" style="background:var(--panel,#fff);color:var(--text,inherit);border:1px solid var(--border,#ccc);border-radius:8px;padding:20px;width:340px;max-width:100%">
                <h3 style="margin:0 0 10px">${_esc(judul)}</h3>
                <label style="font-size:12px;display:block">
                    Tanggal
                    <input type="date" id="dlgTglInput" value="${_tanggalHariIni()}" style="width:100%;margin-top:4px">
                </label>
                <p class="muted" style="font-size:11px;margin:8px 0 0">
                    Diambil dari hasil inspeksi yang tersimpan pada tanggal tersebut.
                </p>
                <div style="display:flex;gap:8px;justify-content:flex-end;margin-top:14px">
                    <button class="btn" id="dlgTglBatal">Batal</button>
                    <button class="btn primary" id="dlgTglOk">Buat laporan</button>
                </div>
            </div>`;
        document.body.appendChild(bungkus);

        const input = bungkus.querySelector('#dlgTglInput');
        const tutup = (hasil) => { bungkus.remove(); document.removeEventListener('keydown', kunci); selesai(hasil); };
        const kunci = (e) => {
            if (e.key === 'Escape') tutup(null);
            if (e.key === 'Enter') tutup(input.value || null);
        };
        document.addEventListener('keydown', kunci);
        bungkus.querySelector('#dlgTglBatal').onclick = () => tutup(null);
        bungkus.querySelector('#dlgTglOk').onclick = () => tutup(input.value || null);
        bungkus.onclick = (e) => { if (e.target === bungkus) tutup(null); };
        setTimeout(() => input.focus(), 0);
    });
}

function _projectAktif() {
    const q = new URLSearchParams(location.search);
    return q.get('project') || q.get('name') || '';
}

async function _buatLaporan(judul, panggil, ringkas) {
    const project = _projectAktif();
    if (!project) { pesan('Buka salah satu project dulu.', 'warn'); return; }
    const tanggal = await _tanyaTanggal(judul);
    if (!tanggal) return;
    try {
        const r = await panggil(project, tanggal);
        if (!r || !r.ok) { pesan('Gagal membuat laporan: ' + ((r && r.error) || 'tidak diketahui'), 'err'); return; }
        if (await tanya(`${ringkas(r)}\n${r.xlsxPath}`,
            { judul: 'Laporan siap', ya: 'Buka berkas', tidak: 'Nanti saja' })) {
        // openPath can now refuse (see lib/keamanan.js). A refusal that
        // isn't shown feels like a broken button.
        const b = await window.api.openPath(r.xlsxPath);
        if (b && b.ok === false) pesan(b.error || 'Berkas tidak bisa dibuka.', 'err');
    }
    } catch (e) {
        pesan('Gagal membuat laporan: ' + e.message, 'err');
    }
}

window.laporanHarian = () => _buatLaporan(
    'Laporan Harian',
    (p, t) => window.api.reportDailyXlsx(p, t),
    () => 'Laporan tersimpan:');

window.dataDeteksi = () => _buatLaporan(
    'Data Deteksi',
    (p, t) => window.api.reportDetectionXlsx(p, t),
    (r) => `${r.count} baris tersimpan:`);
