#!/usr/bin/env node
/**
 * Fast local & CI quality inspector for AutomaEyes.
 * Runs across JavaScript, Python, and PHP files + runs security unit tests.
 * Zero external dependencies: uses Node built-in modules only.
 */

const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT_DIR = path.resolve(__dirname, '..', '..');
const APP_DIR = path.join(ROOT_DIR, 'app');
const WEB_DIR = path.join(ROOT_DIR, 'web');

let totalChecks = 0;
let failedChecks = 0;
const errors = [];

function log(msg) {
    process.stdout.write(msg + '\n');
}

function walk(dir, extFilter, ignoreDirs = ['node_modules', '.git', 'dist', 'build', '__pycache__', '.agents']) {
    let files = [];
    if (!fs.existsSync(dir)) return files;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const ent of entries) {
        if (ignoreDirs.includes(ent.name)) continue;
        const full = path.join(dir, ent.name);
        if (ent.isDirectory()) {
            files = files.concat(walk(full, extFilter, ignoreDirs));
        } else if (extFilter.some(ext => ent.name.endsWith(ext))) {
            files.push(full);
        }
    }
    return files;
}

log('=== AutomaEyes Code Quality & Security Inspection ===\n');

// 1. JavaScript Syntax Check (node --check)
log('[1/4] Checking JavaScript syntax...');
const jsFiles = walk(APP_DIR, ['.js']).concat(walk(WEB_DIR, ['.js']));
let jsPassed = 0;
for (const file of jsFiles) {
    totalChecks++;
    const res = spawnSync(process.execPath, ['--check', file], { encoding: 'utf8' });
    if (res.status !== 0) {
        failedChecks++;
        const rel = path.relative(ROOT_DIR, file);
        errors.push(`[JS Syntax] ${rel}:\n${res.stderr || res.stdout}`);
    } else {
        jsPassed++;
    }
}
log(`  ✓ ${jsPassed}/${jsFiles.length} JavaScript files passed syntax check.`);

// 2. Python Syntax Check (python -m py_compile)
log('\n[2/4] Checking Python syntax...');
const pyFiles = walk(path.join(APP_DIR, 'python'), ['.py']).concat(walk(path.join(APP_DIR, 'tests'), ['.py']));
let pyPassed = 0;
let pythonCmd = 'python';
try {
    const pyCheck = spawnSync(pythonCmd, ['--version']);
    if (pyCheck.status !== 0) pythonCmd = 'python3';
} catch {
    pythonCmd = 'python3';
}

for (const file of pyFiles) {
    totalChecks++;
    const res = spawnSync(pythonCmd, ['-m', 'py_compile', file], { encoding: 'utf8' });
    if (res.status !== 0) {
        failedChecks++;
        const rel = path.relative(ROOT_DIR, file);
        errors.push(`[Python Syntax] ${rel}:\n${res.stderr || res.stdout}`);
    } else {
        pyPassed++;
    }
}
log(`  ✓ ${pyPassed}/${pyFiles.length} Python files passed compilation check.`);

// 3. PHP Syntax Check (php -l)
log('\n[3/4] Checking PHP syntax...');
const phpFiles = walk(WEB_DIR, ['.php']);
let phpPassed = 0;
let hasPhp = false;
try {
    const phpVer = spawnSync('php', ['-v'], { encoding: 'utf8' });
    hasPhp = phpVer.status === 0;
} catch {
    hasPhp = false;
}

if (!hasPhp) {
    log(`  ! PHP CLI not found in PATH — skipping ${phpFiles.length} PHP files (will run in CI).`);
} else {
    for (const file of phpFiles) {
        totalChecks++;
        const res = spawnSync('php', ['-l', file], { encoding: 'utf8' });
        if (res.status !== 0) {
            failedChecks++;
            const rel = path.relative(ROOT_DIR, file);
            errors.push(`[PHP Syntax] ${rel}:\n${res.stderr || res.stdout}`);
        } else {
            phpPassed++;
        }
    }
    log(`  ✓ ${phpPassed}/${phpFiles.length} PHP files passed syntax check.`);
}

// 4. Security & IPC Unit Tests
log('\n[4/4] Running Security & IPC boundary tests...');
const secTestPath = path.join(APP_DIR, 'tests', 'keamanan.js');
totalChecks++;
const secRes = spawnSync(process.execPath, [secTestPath], { encoding: 'utf8' });
if (secRes.status !== 0) {
    failedChecks++;
    errors.push(`[Security Test Failed]:\n${secRes.stderr || secRes.stdout}`);
    log('  ✗ Security tests FAILED.');
} else {
    log('  ✓ All IPC and path sanitization tests passed.');
}

// Summary
log('\n-----------------------------------------------------');
if (failedChecks === 0) {
    log(`✓ SUCCESS: All ${totalChecks} quality & security checks passed!`);
    process.exit(0);
} else {
    log(`✗ FAILED: ${failedChecks} of ${totalChecks} checks failed.\n`);
    for (const err of errors) {
        log(err.trim());
        log('');
    }
    process.exit(1);
}
