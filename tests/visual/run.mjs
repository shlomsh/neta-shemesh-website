#!/usr/bin/env node
/**
 * Visual-regression runner:  npm run vr -- <baseline-ref> [flags]   (see README.md)
 *
 * 1. checks <baseline-ref> out into a temp git worktree, builds it and `next start`s it;
 * 2. builds the current working tree and `next start`s it on a second free port;
 * 3. Playwright records the baseline shots (temp snapshot dir), then compares the
 *    candidate against them at 0 px;
 * 4. prints a summary table, exits non-zero on any diff, and always kills both servers
 *    (by process group of the PID it started) and removes the temp worktree.
 */
import { spawn, spawnSync, execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, rmSync } from 'node:fs';
import { createServer } from 'node:net';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const CONFIG = path.join(HERE, 'playwright.config.ts');
const OUT_DIR = path.join(HERE, '.out');

/* ---------------- args ---------------- */
const USAGE = `Usage: npm run vr -- <baseline-ref> [--pages home,blog,post] [--viewports 375,1440]
                          [--sections <ids|indices>] [--no-build] [--keep]`;
const args = process.argv.slice(2);
const opt = { pages: '', viewports: '', sections: '', build: true, keep: false };
let ref = null;
for (let i = 0; i < args.length; i++) {
  const a = args[i];
  const val = () => {
    const v = args[++i];
    if (v === undefined) die(`${a} needs a value\n${USAGE}`);
    return v;
  };
  if (a === '--pages') opt.pages = val();
  else if (a === '--viewports') opt.viewports = val();
  else if (a === '--sections') opt.sections = val();
  else if (a === '--no-build') opt.build = false;
  else if (a === '--keep') opt.keep = true;
  else if (a === '-h' || a === '--help') { console.log(USAGE); process.exit(0); }
  else if (a.startsWith('--')) die(`unknown flag ${a}\n${USAGE}`);
  else if (ref === null) ref = a;
  else die(`unexpected argument ${a}\n${USAGE}`);
}
if (!ref) die(USAGE);
for (const p of opt.pages.split(',').filter(Boolean)) {
  if (!['home', 'blog', 'post'].includes(p)) die(`--pages: unknown page "${p}" (home|blog|post)`);
}
for (const v of opt.viewports.split(',').filter(Boolean)) {
  if (![1280, 1440, 1920, 768, 375].includes(Number(v))) die(`--viewports: "${v}" is not one of 1280,1440,1920,768,375`);
}

function die(msg) { console.error(msg); process.exit(2); }
const git = (...a) => execFileSync('git', a, { cwd: ROOT, encoding: 'utf8' }).trim();

/* ---------------- cleanup bookkeeping ---------------- */
const servers = []; // { pid, port, label }
let tmp = null;
let baselineDir = null;
let cleaned = false;

function cleanup() {
  if (cleaned) return;
  cleaned = true;
  for (const s of servers) {
    try { process.kill(-s.pid, 'SIGTERM'); } catch { /* already gone */ }
    console.log(`[vr] stopped ${s.label} server (pid ${s.pid}, port ${s.port})`);
  }
  if (baselineDir && !opt.keep) {
    const r = spawnSync('git', ['worktree', 'remove', '--force', baselineDir], { cwd: ROOT, encoding: 'utf8' });
    if (r.status !== 0) console.warn(`[vr] could not remove worktree ${baselineDir}: ${r.stderr.trim()}`);
    else console.log(`[vr] removed temp worktree ${baselineDir}`);
    spawnSync('git', ['worktree', 'prune'], { cwd: ROOT });
  }
  if (tmp && !opt.keep) rmSync(tmp, { recursive: true, force: true });
  else if (tmp) console.log(`[vr] kept ${tmp} (baseline worktree + snapshots)`);
}
for (const sig of ['SIGINT', 'SIGTERM', 'SIGHUP']) process.on(sig, () => { cleanup(); process.exit(130); });
process.on('exit', cleanup);

/* ---------------- helpers ---------------- */
const run = (cmd, argv, cwd, env = {}) => {
  const r = spawnSync(cmd, argv, { cwd, stdio: 'inherit', env: { ...process.env, ...env } });
  if (r.status !== 0) throw new Error(`${cmd} ${argv.join(' ')} failed (exit ${r.status})`);
};
const nextBin = (dir) => path.join(dir, 'node_modules', 'next', 'dist', 'bin', 'next');

function freePort() {
  return new Promise((resolve, reject) => {
    const srv = createServer();
    srv.once('error', reject);
    srv.listen(0, '127.0.0.1', () => {
      const { port } = srv.address();
      srv.close(() => resolve(port));
    });
  });
}

async function startServer(dir, label) {
  const port = await freePort();
  const child = spawn(process.execPath, [nextBin(dir), 'start', '-H', '127.0.0.1', '-p', String(port)], {
    cwd: dir,
    detached: true, // own process group, so we can stop exactly this server and its children
    stdio: 'ignore',
  });
  servers.push({ pid: child.pid, port, label });
  console.log(`[vr] ${label} server: pid ${child.pid}, http://127.0.0.1:${port}`);
  const url = `http://127.0.0.1:${port}`;
  for (let i = 0; i < 120; i++) {
    try {
      const res = await fetch(url + '/');
      if (res.ok) return url;
    } catch { /* not up yet */ }
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error(`${label} server did not become ready on ${url}`);
}

function playwright(mode, baseUrl, extra) {
  const cli = path.join(ROOT, 'node_modules', '@playwright', 'test', 'cli.js');
  // Baseline recording is chatty ("snapshot doesn't exist, writing actual" per shot): show it only on failure.
  const quiet = mode === 'baseline';
  const r = spawnSync(process.execPath, [cli, 'test', '-c', CONFIG, ...extra], {
    cwd: ROOT,
    stdio: quiet ? 'pipe' : 'inherit',
    encoding: 'utf8',
    env: {
      ...process.env,
      VR_MODE: mode,
      VR_BASE_URL: baseUrl,
      VR_SNAP_DIR: path.join(tmp, 'snapshots'),
      VR_RESULTS: path.join(tmp, `results-${mode}.jsonl`),
      VR_PAGES: opt.pages,
      VR_VIEWPORTS: opt.viewports,
      VR_SECTIONS: opt.sections,
    },
  });
  if (quiet && r.status !== 0) process.stderr.write((r.stdout ?? '') + (r.stderr ?? ''));
  return r.status ?? 1;
}

const readRows = (file) =>
  existsSync(file) ? readFileSync(file, 'utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l)) : [];

/* ---------------- main ---------------- */
async function main() {
  let sha;
  try { sha = git('rev-parse', '--verify', `${ref}^{commit}`); } catch { die(`unknown git ref "${ref}"`); }
  if (!existsSync(path.join(ROOT, 'node_modules'))) die('node_modules missing in the working tree; run npm ci first');

  tmp = mkdtempSync(path.join(tmpdir(), 'ns-vr-'));
  baselineDir = path.join(tmp, 'baseline');
  console.log(`[vr] baseline ${ref} (${sha.slice(0, 7)}) vs working tree ${ROOT}`);

  // Baseline worktree (detached, outside the repo tree); node_modules cloned copy-on-write.
  git('worktree', 'add', '--detach', baselineDir, sha);
  let cp = spawnSync('cp', ['-cR', path.join(ROOT, 'node_modules'), path.join(baselineDir, 'node_modules')]);
  if (cp.status !== 0) spawnSync('cp', ['-R', path.join(ROOT, 'node_modules'), path.join(baselineDir, 'node_modules')], { stdio: 'inherit' });

  console.log('[vr] building baseline...');
  run(process.execPath, [nextBin(baselineDir), 'build'], baselineDir);
  if (opt.build) {
    console.log('[vr] building working tree...');
    run(process.execPath, [nextBin(ROOT), 'build'], ROOT);
  } else {
    if (!existsSync(path.join(ROOT, '.next', 'BUILD_ID'))) die('--no-build but the working tree has no .next build');
    console.log('[vr] --no-build: reusing the existing working-tree .next (may be stale)');
  }

  const baseUrl = await startServer(baselineDir, 'baseline');
  const candUrl = await startServer(ROOT, 'candidate');

  console.log('[vr] recording baseline shots...');
  const rec = playwright('baseline', baseUrl, ['--update-snapshots=all']);
  const baseRows = readRows(path.join(tmp, 'results-baseline.jsonl'));
  if (rec !== 0 || baseRows.some((r) => r.status === 'ERROR')) {
    console.error('[vr] baseline recording failed; no comparison possible');
    for (const r of baseRows.filter((x) => x.status === 'ERROR')) console.error(`  ${r.shot} @${r.viewport}: ${r.note}`);
    return 2;
  }

  console.log('[vr] comparing candidate at 0 px...');
  playwright('candidate', candUrl, ['--update-snapshots=none']);
  const rows = readRows(path.join(tmp, 'results-candidate.jsonl'));
  return summarize(rows, baseRows);
}

function summarize(rows, baseRows) {
  const vpOrder = [1280, 1440, 1920, 768, 375];
  rows.sort((a, b) => a.shot.localeCompare(b.shot, 'en', { numeric: true }) || vpOrder.indexOf(a.viewport) - vpOrder.indexOf(b.viewport));
  const seen = new Set(rows.map((r) => `${r.shot.split(' ')[0]}|${r.viewport}`));
  // A baseline shot the candidate never produced (section removed/renamed index) is a failure.
  const missing = baseRows.filter((b) => !seen.has(`${b.shot.split(' ')[0]}|${b.viewport}`));

  const w = Math.max(4, ...rows.map((r) => r.shot.length), ...missing.map((r) => r.shot.length));
  const line = (s, v, d, st) => `${s.padEnd(w)}  ${String(v).padStart(8)}  ${String(d).padStart(8)}  ${st}`;
  console.log('\n' + line('shot', 'viewport', 'diff px', 'status'));
  console.log('-'.repeat(w + 30));
  let bad = 0;
  for (const r of rows) {
    const ok = r.status === 'ok';
    if (!ok) bad++;
    console.log(line(r.shot, r.viewport, r.diffPx ?? '-', ok ? 'ok' : `${r.status}${r.note ? ' ' + r.note : ''}`));
  }
  for (const m of missing) { bad++; console.log(line(m.shot, m.viewport, '-', 'MISSING in candidate')); }
  const shots = rows.filter((r) => !r.shot.endsWith(' overflow')).length;
  console.log('-'.repeat(w + 30));
  if (rows.length === 0) { console.log('FAIL: no results were produced'); return 1; }
  if (bad) {
    console.log(`FAIL: ${bad} of ${rows.length + missing.length} checks differ. Diff images: ${path.relative(ROOT, OUT_DIR)}/`);
    return 1;
  }
  console.log(`PASS: ${shots} shots + overflow checks, 0 px difference`);
  return 0;
}

let code = 1;
try { code = await main(); }
catch (e) { console.error(`[vr] ${e.message}`); code = 2; }
finally { cleanup(); }
process.exit(code);
