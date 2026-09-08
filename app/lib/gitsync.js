// lib/gitsync.js — syncs the user's PROJECTS folder to their own GitHub repo.
//
// Save  = git add -A + commit + push  (upload dataset, annotations, model, project)
// Load  = git pull --ff-only          (fetch the latest version from another device)
//
// IMPORTANT (change from the old version): operations run in the user's
// projects folder (outside the app folder), NOT in the app folder. The old
// version used the app folder as the repo, so all of the user's datasets
// ended up committed to the developer's repo.
//
// Authentication uses the user's OAuth token (device flow, repo scope), sent
// per-command via http.extraHeader — the token is NOT written to .git/config
// so it isn't left behind as plain text on disk.

const { execFile } = require('child_process');

const LFS_PATTERNS = [
    '*.jpg filter=lfs diff=lfs merge=lfs -text',
    '*.jpeg filter=lfs diff=lfs merge=lfs -text',
    '*.png filter=lfs diff=lfs merge=lfs -text',
    '*.onnx filter=lfs diff=lfs merge=lfs -text',
    '*.pt filter=lfs diff=lfs merge=lfs -text',
];

function parseGitProgress(line) {
    if (!line) return null;
    let percent = null;
    let step = line;

    const lfsMatch = line.match(/Uploading LFS objects:\s*(\d+)%\s*\(([^)]+)\)(?:,\s*([^,]+))?/i);
    if (lfsMatch) {
        percent = parseInt(lfsMatch[1], 10);
        const count = lfsMatch[2]; // e.g. "0/49"
        const speed = lfsMatch[3] ? ` · ${lfsMatch[3].trim()}` : '';
        step = `Mengunggah file LFS: ${percent}% (${count})${speed}`;
        return { percent, step, raw: line };
    }

    const writingMatch = line.match(/Writing objects:\s*(\d+)%\s*\(([^)]+)\)(?:,\s*([^,]+))?/i);
    if (writingMatch) {
        percent = parseInt(writingMatch[1], 10);
        const count = writingMatch[2];
        const speed = writingMatch[3] ? ` · ${writingMatch[3].trim()}` : '';
        step = `Mengunggah objek: ${percent}% (${count})${speed}`;
        return { percent, step, raw: line };
    }

    const receivingMatch = line.match(/Receiving objects:\s*(\d+)%\s*\(([^)]+)\)/i);
    if (receivingMatch) {
        percent = parseInt(receivingMatch[1], 10);
        step = `Mengunduh berkas: ${percent}% (${receivingMatch[2]})`;
        return { percent, step, raw: line };
    }

    const compressingMatch = line.match(/Compressing objects:\s*(\d+)%/i);
    if (compressingMatch) {
        percent = parseInt(compressingMatch[1], 10);
        step = `Mengompresi data: ${percent}%`;
        return { percent, step, raw: line };
    }

    const m = line.match(/(\d+)%/);
    if (m) {
        percent = parseInt(m[1], 10);
    }

    return { percent, step, raw: line };
}

function git(cwd, args, token = null, timeout = 600000, onProgress = null) {
    // Credentials are sent as a per-invocation header, not embedded in the
    // remote URL, so the token isn't stored in .git/config.
    //
    // IMPORTANT: git-over-HTTPS to GitHub needs HTTP Basic Auth (username:token),
    // NOT an "Authorization: Bearer" header — that only applies to the REST API
    // (used by lib/github.js). Using Bearer here makes git reject it with
    // "invalid credentials" even though the token itself is valid.
    // The username can be anything non-empty; GitHub validates based on
    // the token, not the username.
    //
    // CRITICAL FOR GIT LFS:
    // http.extraHeader MUST be scoped to the Git host (e.g. http.https://github.com/.extraHeader)
    // instead of an un-scoped global http.extraHeader.
    // When Git LFS uploads binary objects (images, models), GitHub provides pre-signed
    // AWS S3 URLs (e.g. https://github-cloud.s3.amazonaws.com/alambic/media/...).
    // If http.extraHeader is global, Git forwards the Authorization header to AWS S3.
    // Amazon S3 rejects Basic Auth on pre-signed URLs with:
    // HTTP 501 "LFS: Not Implemented: https://github-cloud.s3.amazonaws.com/...".
    // Scoping to https://github.com/ ensures Git LFS uses Basic Auth only for GitHub API/endpoints
    // and sends clean pre-signed PUT requests to Amazon S3.
    let full = args;
    if (token) {
        const basic = `Authorization: Basic ${Buffer.from(`x-access-token:${token}`).toString('base64')}`;
        const extraConfigs = [
            '-c', `http.https://github.com/.extraHeader=${basic}`,
            '-c', 'lfs.locksverify=false',
        ];
        for (const a of args) {
            if (typeof a === 'string' && /^https?:\/\//i.test(a)) {
                try {
                    const u = new URL(a);
                    const prefix = `${u.protocol}//${u.host}/`;
                    if (prefix !== 'https://github.com/') {
                        extraConfigs.push('-c', `http.${prefix}.extraHeader=${basic}`);
                    }
                } catch (_) {}
            }
        }
        full = [...extraConfigs, ...args];
    }

    return new Promise((resolve) => {
        const child = execFile('git', full, {
            cwd,
            timeout,
            windowsHide: true,
            maxBuffer: 1024 * 1024 * 32,
            env: {
                ...process.env,
                GIT_TERMINAL_PROMPT: '0',
            },
        }, (err, stdout, stderr) => {
            let out = ((stdout || '') + (stderr || '')).trim();
            if (token) out = out.split(token).join('***'); // don't leak the token into the log/UI
            resolve({
                code: err ? (typeof err.code === 'number' ? err.code : 1) : 0,
                out,
            });
        });

        if (typeof onProgress === 'function') {
            const handleChunk = (chunk) => {
                if (!chunk) return;
                const text = chunk.toString();
                const lines = text.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
                for (const line of lines) {
                    const safeLine = token ? line.split(token).join('***') : line;
                    const parsed = parseGitProgress(safeLine);
                    if (parsed) onProgress(parsed);
                }
            };
            if (child.stdout) child.stdout.on('data', handleChunk);
            if (child.stderr) child.stderr.on('data', handleChunk);
        }
    });
}

// Basic repo info: whether it's git, has a remote, its branch, and the number of local changes.
exports.status = async (cwd) => {
    const inside = await git(cwd, ['rev-parse', '--is-inside-work-tree']);
    if (inside.code !== 0) return { repo: false };
    const remote = await git(cwd, ['remote', 'get-url', 'origin']);
    const branch = await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD']);
    const dirty = await git(cwd, ['status', '--porcelain']);
    const changes = dirty.out ? dirty.out.split(/\r?\n/).filter(Boolean).length : 0;
    return {
        repo: true,
        hasRemote: remote.code === 0,
        remote: remote.out,
        branch: branch.code === 0 ? branch.out : 'main',
        dirty: changes > 0,
        changes,
    };
};

async function ensureLfs(cwd, fs, path) {
    await git(cwd, ['lfs', 'install', '--local']);
    await git(cwd, ['config', '--local', 'lfs.locksverify', 'false']);
    const file = path.join(cwd, '.gitattributes');
    let existing = '';
    try { existing = fs.readFileSync(file, 'utf8'); } catch { /* doesn't exist yet */ }
    const missing = LFS_PATTERNS.filter((p) => !existing.includes(p.split(' ')[0]));
    if (missing.length) {
        const body = (existing ? existing.replace(/\s*$/, '\n') : '') + missing.join('\n') + '\n';
        fs.writeFileSync(file, body, 'utf8');
    }
}

/**
 * Connect the projects folder to the user's GitHub repo.
 * If the remote repo already has a project in it (e.g. from another PC), its
 * contents are checked out immediately so the app shows what's in the repo —
 * consistent with the "app only displays repo contents" design.
 */
exports.connect = async (cwd, repoUrl, token) => {
    const fs = require('fs');
    const path = require('path');
    fs.mkdirSync(cwd, { recursive: true });

    let log = '';
    const st = await exports.status(cwd);
    if (!st.repo) {
        const init = await git(cwd, ['init']);
        log += init.out + '\n';
    }

    // The remote is kept clean, with no token in it.
    const hasRemote = (await git(cwd, ['remote', 'get-url', 'origin'])).code === 0;
    const setRemote = hasRemote
        ? await git(cwd, ['remote', 'set-url', 'origin', repoUrl])
        : await git(cwd, ['remote', 'add', 'origin', repoUrl]);
    log += setRemote.out + '\n';

    await ensureLfs(cwd, fs, path);

    const fetch = await git(cwd, ['fetch', 'origin'], token);
    log += fetch.out + '\n';
    if (fetch.code !== 0) {
        return { ok: false, log: (log + '\nGagal fetch. Cek koneksi internet dan akses ke repo.').trim() };
    }

    // Determine the remote's default branch (main/master), then follow it.
    const remoteHead = await git(cwd, ['rev-parse', '--verify', '--quiet', 'origin/main'], token);
    const branch = remoteHead.code === 0 ? 'main' : 'master';
    const remoteBranchExists = remoteHead.code === 0
        || (await git(cwd, ['rev-parse', '--verify', '--quiet', 'origin/master'], token)).code === 0;

    const hasCommits = (await git(cwd, ['rev-parse', '--verify', '--quiet', 'HEAD'])).code === 0;

    if (remoteBranchExists && !hasCommits) {
        // The local repo is still empty: follow the remote branch, repo contents appear immediately.
        const co = await git(cwd, ['checkout', '-B', branch, '--track', `origin/${branch}`], token);
        log += co.out + '\n';
    } else if (!remoteBranchExists && !hasCommits) {
        // The GitHub repo is completely empty (no auto-init): start a local main branch.
        const co = await git(cwd, ['checkout', '-b', 'main']);
        log += co.out + '\n';
    }

    return { ok: true, branch, log: log.trim() };
};

// Save & upload all changes to GitHub.
exports.push = async (cwd, message, token, onProgress = null) => {
    if (onProgress) onProgress({ step: 'Mengecek status repositori…', percent: 2 });
    const st = await exports.status(cwd);
    if (!st.repo) return { ok: false, log: 'Folder projects belum tersambung ke GitHub.' };
    if (!st.hasRemote) {
        return { ok: false, log: 'Belum tersambung ke GitHub. Buka menu Connect GitHub dulu.' };
    }

    if (onProgress) onProgress({ step: 'Mempersiapkan berkas lokal…', percent: 10 });
    let log = '';
    const add = await git(cwd, ['add', '-A']);
    log += add.out;

    const msg = (message && message.trim())
        ? message.trim()
        : 'AutomaEyes sync ' + new Date().toISOString();
    const commit = await git(cwd, ['commit', '-m', msg]);
    log += '\n' + commit.out;
    const nothing = /nothing to commit|nothing added to commit/i.test(commit.out);

    // The branch is resolved AGAIN after the commit: in a newly created repo,
    // HEAD is still "unborn" before the first commit, so the branch name
    // before this point could be wrong.
    const branch = (await git(cwd, ['rev-parse', '--abbrev-ref', 'HEAD'])).out || 'main';
    if (onProgress) onProgress({ step: 'Mengunggah perubahan ke GitHub…', percent: 30 });
    const push = await git(cwd, ['push', '--progress', '-u', 'origin', `HEAD:${branch}`], token, 600000, (p) => {
        if (onProgress) onProgress({ step: p.step, percent: p.percent != null ? Math.round(30 + p.percent * 0.65) : null, raw: p.raw });
    });
    log += '\n' + push.out;

    if (push.code !== 0 && /rejected|fetch first|non-fast-forward|behind/i.test(push.out)) {
        if (onProgress) onProgress({ step: 'Konflik terdeteksi.', percent: null });
        return {
            ok: false, rejected: true, nothing,
            log: 'Versi di GitHub lebih baru dari lokal. Klik "Load" dulu untuk ambil versi terbaru, baru Save lagi.',
        };
    }
    if (onProgress) onProgress({ step: push.code === 0 ? '✓ Berhasil tersimpan!' : 'Gagal mengunggah.', percent: push.code === 0 ? 100 : null });
    return { ok: push.code === 0, nothing, log: log.trim() };
};

// Fetch the latest version from GitHub (fast-forward only, to be safe).
exports.pull = async (cwd, token, onProgress = null) => {
    if (onProgress) onProgress({ step: 'Mengecek status repositori…', percent: 2 });
    const st = await exports.status(cwd);
    if (!st.repo) return { ok: false, log: 'Folder projects belum tersambung ke GitHub.' };
    if (!st.hasRemote) return { ok: false, log: 'Belum tersambung ke GitHub (origin).' };

    if (st.dirty) {
        return {
            ok: false, dirty: true,
            log: `Ada ${st.changes} perubahan lokal yang belum disimpan. Klik "Save" dulu sebelum Load, supaya tidak tertimpa.`,
        };
    }
    if (onProgress) onProgress({ step: 'Mengunduh versi terbaru dari GitHub…', percent: 30 });
    const pull = await git(cwd, ['pull', '--progress', '--ff-only', 'origin', st.branch], token, 600000, (p) => {
        if (onProgress) onProgress({ step: p.step, percent: p.percent != null ? Math.round(30 + p.percent * 0.65) : null, raw: p.raw });
    });
    const upToDate = /up to date|sudah|already up/i.test(pull.out);
    if (pull.code !== 0 && /not possible to fast-forward|diverg/i.test(pull.out)) {
        if (onProgress) onProgress({ step: 'Riwayat menyimpang.', percent: null });
        return {
            ok: false, diverged: true,
            log: 'Ada perubahan lokal yang menyimpang dari GitHub. Perlu diselesaikan manual (git status).',
        };
    }
    if (onProgress) onProgress({ step: pull.code === 0 ? '✓ Selesai!' : 'Gagal memuat.', percent: pull.code === 0 ? 100 : null });
    return { ok: pull.code === 0, upToDate, log: pull.out };
};

// ---- Conflict resolution ----
//
// A conflict happens when local and GitHub history have diverged: two devices
// both saved from the same starting point. For data like images and model
// weights, "merging" file contents makes no sense - what makes sense is
// choosing which side to keep.
//
// The principle: the user gets to choose, but the discarded side is ALWAYS
// backed up first to its own branch. A wrong choice can be undone, not lost forever.

/** Summarize the difference between local and GitHub, to show before choosing. */
exports.conflictInfo = async (cwd, token) => {
    const st = await exports.status(cwd);
    if (!st.repo || !st.hasRemote) return { ok: false, log: 'Belum tersambung ke GitHub.' };

    const fetch = await git(cwd, ['fetch', 'origin'], token);
    if (fetch.code !== 0) return { ok: false, log: 'Gagal menghubungi GitHub.\n' + fetch.out };

    const branch = st.branch || 'main';
    const remoteRef = `origin/${branch}`;

    // How many commits exist only on each side.
    const counts = await git(cwd, ['rev-list', '--left-right', '--count', `${remoteRef}...HEAD`]);
    let behind = 0, ahead = 0;
    if (counts.code === 0) {
        const m = counts.out.trim().split(/\s+/);
        behind = parseInt(m[0], 10) || 0;   // only exists on GitHub
        ahead = parseInt(m[1], 10) || 0;    // only exists locally
    }

    const fileList = async (range) => {
        const r = await git(cwd, ['diff', '--name-only', range]);
        return r.code === 0 && r.out ? r.out.split(/\r?\n/).filter(Boolean) : [];
    };
    const localFiles = await fileList(`${remoteRef}...HEAD`);
    const remoteFiles = await fileList(`HEAD...${remoteRef}`);

    // Changes that haven't been committed at all are also important for the user to know about.
    const uncommitted = st.changes;

    return {
        ok: true,
        branch,
        ahead, behind,
        diverged: ahead > 0 && behind > 0,
        uncommitted,
        localFiles: localFiles.slice(0, 200),
        remoteFiles: remoteFiles.slice(0, 200),
        localMore: Math.max(0, localFiles.length - 200),
        remoteMore: Math.max(0, remoteFiles.length - 200),
    };
};

/**
 * Resolve a conflict by choosing one side.
 * @param {'local'|'remote'|'branch'} pilihan
 *   'local'  : this computer's content is used, GitHub is overwritten
 *   'remote' : GitHub's content is used, local changes are discarded
 *   'branch' : both are kept - this side's own copy is pushed to a new branch
 */
exports.resolveConflict = async (cwd, token, pilihan, namaCabang, onProgress = null) => {
    if (onProgress) onProgress({ step: 'Mengecek status repositori…', percent: 2 });
    const st = await exports.status(cwd);
    if (!st.repo || !st.hasRemote) return { ok: false, log: 'Belum tersambung ke GitHub.' };

    const branch = st.branch || 'main';
    const stamp = new Date().toISOString().replace(/[-:T]/g, '').slice(0, 14);
    let log = '';

    if (pilihan === 'local') {
        if (onProgress) onProgress({ step: 'Mempersiapkan penimpaan ke GitHub…', percent: 5 });

        // Commit any local changes first, so they get carried along.
        if (st.dirty) {
            if (onProgress) onProgress({ step: 'Menyimpan perubahan lokal…', percent: 12 });
            await git(cwd, ['add', '-A']);
            const c = await git(cwd, ['commit', '-m', `AutomaEyes: simpan sebelum selesaikan konflik ${stamp}`]);
            log += c.out + '\n';
        }

        // Back up the GitHub version to another branch BEFORE overwriting it,
        // so this choice can still be undone.
        const backup = `cadangan-github-${stamp}`;
        if (onProgress) onProgress({ step: `Mencadangkan versi GitHub (${backup})…`, percent: 25 });
        const bk = await git(cwd, ['push', '--progress', 'origin', `origin/${branch}:refs/heads/${backup}`], token, 600000, (p) => {
            if (onProgress) onProgress({ step: `Mencadangkan GitHub: ${p.step}`, percent: p.percent != null ? Math.round(25 + p.percent * 0.2) : 35, raw: p.raw });
        });
        log += bk.out + '\n';
        if (bk.code !== 0) {
            return { ok: false, log: 'Gagal mencadangkan versi GitHub, jadi penimpaan dibatalkan.\n' + bk.out };
        }

        if (onProgress) onProgress({ step: 'Mengunggah file & menimpa versi GitHub…', percent: 50 });
        const push = await git(cwd, ['push', '--progress', '--force-with-lease', 'origin', `HEAD:${branch}`], token, 600000, (p) => {
            if (onProgress) onProgress({ step: p.step, percent: p.percent != null ? Math.round(50 + p.percent * 0.48) : null, raw: p.raw });
        });
        log += push.out;
        if (onProgress) onProgress({ step: push.code === 0 ? '✓ Berhasil diselesaikan!' : 'Gagal menimpa GitHub.', percent: push.code === 0 ? 100 : null });

        return {
            ok: push.code === 0,
            backupBranch: backup,
            log: (push.code === 0
                ? `Versi komputer ini sekarang dipakai di GitHub.\nVersi GitHub sebelumnya disimpan di branch "${backup}".`
                : 'Gagal menimpa GitHub.\n') + '\n' + log.trim(),
        };
    }

    if (pilihan === 'branch') {
        if (onProgress) onProgress({ step: 'Mempersiapkan cabang baru…', percent: 5 });

        // The safest choice: nothing gets overwritten or discarded.
        // Local work is pushed to a new branch on GitHub, then this
        // computer follows the shared version. Both remain, and merging
        // can be done later via a Pull Request.
        if (st.dirty) {
            if (onProgress) onProgress({ step: 'Menyimpan perubahan lokal…', percent: 12 });
            await git(cwd, ['add', '-A']);
            const c = await git(cwd, ['commit', '-m', `AutomaEyes: simpan sebelum pisah cabang ${stamp}`]);
            log += c.out + '\n';
        }

        const nama = (namaCabang && namaCabang.trim())
            ? namaCabang.trim().replace(/[^\w.\-\/]/g, '-')
            : `cabang-${stamp}`;

        if (onProgress) onProgress({ step: `Mendorong pekerjaan ke cabang "${nama}"…`, percent: 25 });
        const push = await git(cwd, ['push', '--progress', 'origin', `HEAD:refs/heads/${nama}`], token, 600000, (p) => {
            if (onProgress) onProgress({ step: p.step, percent: p.percent != null ? Math.round(25 + p.percent * 0.55) : null, raw: p.raw });
        });
        log += push.out + '\n';
        if (push.code !== 0) {
            return { ok: false, log: 'Gagal membuat cabang baru di GitHub.\n' + log.trim() };
        }

        if (onProgress) onProgress({ step: `Mengikuti cabang "${branch}" dari GitHub…`, percent: 85 });
        const fetch = await git(cwd, ['fetch', '--progress', 'origin'], token, 600000, (p) => {
            if (onProgress) onProgress({ step: `Mengambil dari GitHub: ${p.step}`, percent: 90, raw: p.raw });
        });
        log += fetch.out + '\n';
        const reset = await git(cwd, ['reset', '--hard', `origin/${branch}`]);
        log += reset.out;
        if (onProgress) onProgress({ step: reset.code === 0 ? '✓ Berhasil diselesaikan!' : 'Gagal mengikuti cabang.', percent: reset.code === 0 ? 100 : null });

        return {
            ok: reset.code === 0,
            backupBranch: nama,
            log: (reset.code === 0
                ? `Pekerjaan Anda tersimpan di cabang "${nama}" di GitHub, dan komputer ini sekarang mengikuti "${branch}".\nTidak ada yang hilang - keduanya bisa digabung lewat Pull Request.`
                : `Cabang "${nama}" berhasil dibuat, tapi gagal mengikuti "${branch}".\n`) + '\n' + log.trim(),
        };
    }

    if (pilihan === 'remote') {
        if (onProgress) onProgress({ step: 'Mempersiapkan pengambilan versi GitHub…', percent: 5 });

        // Back up the local state (including uncommitted changes) to a local branch.
        const backup = `cadangan-lokal-${stamp}`;
        if (st.dirty) {
            if (onProgress) onProgress({ step: 'Menyimpan perubahan lokal…', percent: 15 });
            await git(cwd, ['add', '-A']);
            const c = await git(cwd, ['commit', '-m', `AutomaEyes: cadangan sebelum ambil versi GitHub ${stamp}`]);
            log += c.out + '\n';
        }
        const br = await git(cwd, ['branch', backup]);
        log += br.out + '\n';

        if (onProgress) onProgress({ step: 'Mengunduh versi dari GitHub…', percent: 40 });
        const fetch = await git(cwd, ['fetch', '--progress', 'origin'], token, 600000, (p) => {
            if (onProgress) onProgress({ step: `Mengunduh: ${p.step}`, percent: p.percent != null ? Math.round(40 + p.percent * 0.5) : 70, raw: p.raw });
        });
        log += fetch.out + '\n';
        const reset = await git(cwd, ['reset', '--hard', `origin/${branch}`]);
        log += reset.out;
        if (onProgress) onProgress({ step: reset.code === 0 ? '✓ Berhasil diselesaikan!' : 'Gagal mengambil versi GitHub.', percent: reset.code === 0 ? 100 : null });

        return {
            ok: reset.code === 0,
            backupBranch: backup,
            log: (reset.code === 0
                ? `Versi GitHub sekarang dipakai.\nKeadaan lokal sebelumnya disimpan di branch "${backup}" (masih di komputer ini).`
                : 'Gagal mengambil versi GitHub.\n') + '\n' + log.trim(),
        };
    }

    return { ok: false, log: 'Pilihan tidak dikenal.' };
};
