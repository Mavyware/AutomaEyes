// lib/userstore.js — user-owned state (login session + GitHub connection).
//
// IMPORTANT: stored in app.getPath('userData'), NOT in the app folder.
// The app folder is the developer's git repo; if user state were written
// there, tokens and sessions would get committed and pushed to someone else's repo.
//
// The GitHub token is encrypted with Electron's safeStorage (DPAPI on Windows),
// so it isn't stored as plain text on disk.

const { app, safeStorage } = require('electron');
const path = require('path');
const fs = require('fs');

function statePath() {
    return path.join(app.getPath('userData'), 'state.json');
}

function readRaw() {
    try {
        const p = statePath();
        if (!fs.existsSync(p)) return {};
        const buf = fs.readFileSync(p);
        if (safeStorage.isEncryptionAvailable()) {
            try {
                return JSON.parse(safeStorage.decryptString(buf)) || {};
            } catch {
                // Fall through if stored in legacy plaintext format
            }
        }
        const text = buf.toString('utf8');
        try {
            return JSON.parse(text) || {};
        } catch {
            const decoded = Buffer.from(text, 'base64').toString('utf8');
            return JSON.parse(decoded) || {};
        }
    } catch {
        // Corrupted state isn't a reason for the app to fail to start — just start empty.
        return {};
    }
}

function writeRaw(state) {
    const p = statePath();
    fs.mkdirSync(path.dirname(p), { recursive: true });
    const payload = JSON.stringify(state, null, 2);
    if (safeStorage.isEncryptionAvailable()) {
        fs.writeFileSync(p, safeStorage.encryptString(payload));
    } else {
        fs.writeFileSync(p, Buffer.from(payload, 'utf8').toString('base64'), 'utf8');
    }
}

// ---- Website login session ----

exports.getSession = () => readRaw().session || null;

exports.setSession = (user) => {
    const state = readRaw();
    let safeUser = null;
    if (user && typeof user === 'object') {
        const id = typeof user.id === 'number' ? user.id : parseInt(user.id, 10) || 0;
        const name = String(user.name || '').replace(/[^\w\s.-]/g, '').slice(0, 100);
        const email = String(user.email || '').replace(/[^\w@._+-]/g, '').slice(0, 100);
        const avatar = user.avatar_url && /^https?:\/\/[\w.-]+\.[a-z]{2,}(\/.*)?$/i.test(user.avatar_url) ? String(user.avatar_url).slice(0, 255) : null;
        safeUser = { id, name, email, avatar_url: avatar };
    }
    state.session = { user: safeUser, loggedInAt: new Date().toISOString() };
    writeRaw(state);
    return state.session;
};

exports.clearSession = () => {
    const state = readRaw();
    delete state.session;
    // The GitHub connection is dropped too: the repo token belongs to the
    // logged-in user, and must not carry over to the next user on the same PC.
    delete state.github;
    writeRaw(state);
};

// ---- GitHub connection ----

/** @returns {{login:string, repo:string, repoUrl:string, token:string}|null} */
exports.getGithub = () => {
    const gh = readRaw().github;
    if (!gh) return null;

    let token = '';
    try {
        if (gh.tokenEncrypted && safeStorage.isEncryptionAvailable()) {
            token = safeStorage.decryptString(Buffer.from(gh.tokenEncrypted, 'base64'));
        } else if (gh.tokenPlain) {
            token = gh.tokenPlain;
        }
    } catch {
        return null; // token can't be decrypted (e.g. Windows profile moved) → treat as not connected
    }
    if (!token) return null;
    return { login: gh.login, repo: gh.repo, repoUrl: gh.repoUrl, token };
};

exports.setGithub = ({ login, repo, repoUrl, token }) => {
    const state = readRaw();
    const safeLogin = String(login || '').replace(/[^\w-]/g, '').slice(0, 100);
    const safeRepo = String(repo || '').replace(/[^\w.-]/g, '').slice(0, 100);
    const safeRepoUrl = typeof repoUrl === 'string' && /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+$/.test(repoUrl) ? repoUrl : '';
    const safeToken = String(token || '').replace(/[^\w.-]/g, '').slice(0, 255);

    const entry = { login: safeLogin, repo: safeRepo, repoUrl: safeRepoUrl, connectedAt: new Date().toISOString() };
    if (safeStorage.isEncryptionAvailable()) {
        entry.tokenEncrypted = safeStorage.encryptString(safeToken).toString('base64');
    } else {
        // Linux without a keyring, etc. Still works, but honest about the risk.
        entry.tokenPlain = safeToken;
        console.warn('[userstore] safeStorage tidak tersedia — token GitHub disimpan tanpa enkripsi.');
    }
    state.github = entry;
    writeRaw(state);
};

exports.clearGithub = () => {
    const state = readRaw();
    delete state.github;
    writeRaw(state);
};
