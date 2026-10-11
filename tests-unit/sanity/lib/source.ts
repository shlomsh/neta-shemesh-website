/**
 * Source loading and shared assertion utils. Guards nothing itself; every file-scanning rule in
 * source-scan.test.ts reads `src/**` through here. CLAUDE.md: "Tests" (fix helpers/SCAN_RULES, never relax).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import { expect } from 'vitest';

export const ROOT = resolve(__dirname, '../../..');
const SRC = join(ROOT, 'src');

export interface SourceFile {
  /** posix path relative to the repo root, e.g. src/components/sections/intro/Intro.tsx */
  path: string;
  /** file name only; allow-lists key on this so moving a file does not break them */
  name: string;
  text: string;
}

let sourceCache: SourceFile[] | undefined;

function walk(dir: string, out: string[]) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else out.push(full);
  }
}

/** Every src/**\/*.{ts,tsx,css} file, read once and cached for the test file. */
export function readSources(): SourceFile[] {
  if (!sourceCache) {
    const files: string[] = [];
    walk(SRC, files);
    sourceCache = files
      .filter((f) => /\.(ts|tsx|css)$/.test(f))
      .sort()
      .map((f) => ({
        path: relative(ROOT, f).split('\\').join('/'),
        name: basename(f),
        text: readFileSync(f, 'utf8'),
      }));
  }
  return sourceCache;
}

/**
 * Find a source by file name OR path suffix (`PageShell.tsx`, `app/layout.tsx`). Throws when nothing
 * matches or when it is ambiguous (e.g. a future src/app/blog/layout.tsx must not be picked silently).
 */
export function sourceNamed(suffix: string): SourceFile {
  const hits = readSources().filter((s) => s.path === `src/${suffix}` || s.path.endsWith(`/${suffix}`));
  if (hits.length === 0) throw new Error(`sanity: no source file matching ${suffix} under src/`);
  if (hits.length > 1) throw new Error(`sanity: ${suffix} is ambiguous, use a longer path suffix: ${hits.map((h) => h.path).join(', ')}`);
  return hits[0];
}

export function globalsCss(): string {
  return sourceNamed('app/globals.css').text;
}

/** CSS with /* comments *\/ removed (comments mention class names and braces). */
export function stripCssComments(css: string): string {
  return css.replace(/\/\*[\s\S]*?\*\//g, '');
}

/** expect(list).toEqual([]) but with the offenders spelled out in the failure message. */
export function expectNone(list: string[], message: string): void {
  expect(list, `${message}${list.length ? `:\n  - ${list.join('\n  - ')}` : ''}`).toEqual([]);
}

/** Class-list-looking string literals in a code file (quotes / backticks; Hebrew prose and sentences are excluded). */
export function classStrings(f: SourceFile, maxLen = 800): Array<{ index: number; text: string }> {
  const out: Array<{ index: number; text: string }> = [];
  if (!/\.tsx?$/.test(f.name)) return out;
  for (const m of f.text.matchAll(/"([^"]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
    const text = m[1] ?? m[2] ?? m[3] ?? '';
    if (!text.trim() || text.length > maxLen) continue;
    if (!text.split(/\s+/).filter(Boolean).every((t) => /^[\w:\-[\]/().,%#!&>=*+$@{}~|'\\^"]+$/.test(t))) continue;
    out.push({ index: m.index!, text });
  }
  return out;
}
