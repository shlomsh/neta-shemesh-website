/**
 * Colour maths: hex -> RGB, WCAG contrast ratio, compositing, the `@theme` palette and CSS colour-expression evaluation
 * (`evalColour`). Guards the palette and contrast pairs of CLAUDE.md "Color"; consumed by contrast.test.tsx.
 */
import { stripCssComments, globalsCss } from './source';
import { cssVar } from './css';

export interface RGB { r: number; g: number; b: number }
export interface RGBA extends RGB { a: number }

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

/** WCAG 2.x relative luminance. */
function relativeLuminance(c: RGB): number {
  const lin = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
}

/** WCAG 2.x contrast ratio, always >= 1 (order of the two colours does not matter). */
export function contrastRatio(a: RGB, b: RGB): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/** Source-over compositing of a (possibly translucent) colour on an opaque one, in sRGB like browsers do. */
export function compositeOver(fg: RGBA, bg: RGB): RGB {
  return { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
}

/** `@theme` colours (`--color-plum: #7A5978;` ...), straight from globals.css so the palette has one source. */
export function themeColours(css = globalsCss()): Record<string, RGB> {
  const theme = stripCssComments(css).match(/@theme\s*\{([\s\S]*?)\n\}/)?.[1] ?? '';
  const out: Record<string, RGB> = {};
  for (const m of theme.matchAll(/--color-([a-z]+)\s*:\s*(#[0-9a-fA-F]{3,8})\s*;/g)) out[m[1]] = hexToRgb(m[2]);
  return out;
}

export interface ColourEnv {
  palette: Record<string, RGB>;
  /** custom properties: '--surface-veil' (raw css), '--header-color' (resolved by the caller per element) */
  vars: Record<string, string>;
}

let envCache: ColourEnv | undefined;
export function colourEnv(): ColourEnv {
  if (!envCache) {
    const css = globalsCss();
    envCache = { palette: themeColours(css), vars: { '--surface-veil': cssVar(css, '--surface-veil') ?? '' } };
  }
  return envCache;
}

function splitTopLevel(s: string, sep = ','): string[] {
  const out: string[] = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (ch === sep && depth === 0) {
      out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Evaluate a CSS colour expression: `#hex`, `transparent`, `black`/`white`, `var(--color-x)`,
 * `var(--surface-veil)`, `var(--header-color)` (from `env.vars`), `color-mix(in srgb, A p%, B [q%])`.
 * Returns null for anything it does not understand (the caller reports it, never guesses).
 */
export function evalColour(expr: string, env: ColourEnv = colourEnv(), depth = 0): RGBA | null {
  const e = expr.trim().replace(/_/g, ' ');
  if (depth > 6) return null;
  if (/^#[0-9a-fA-F]{3,8}$/.test(e)) return { ...hexToRgb(e), a: 1 };
  if (e === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (e === 'black') return { r: 0, g: 0, b: 0, a: 1 };
  if (e === 'white') return { r: 255, g: 255, b: 255, a: 1 };
  const v = e.match(/^var\(\s*(--[\w-]+)\s*\)$/);
  if (v) {
    const name = v[1];
    if (name.startsWith('--color-')) {
      const c = env.palette[name.slice(8)];
      return c ? { ...c, a: 1 } : null;
    }
    const raw = env.vars[name];
    return raw ? evalColour(raw, env, depth + 1) : null;
  }
  const mix = e.match(/^color-mix\(\s*in srgb\s*,(.*)\)$/);
  if (mix) {
    const parts = splitTopLevel(mix[1]);
    if (parts.length !== 2) return null;
    const parse = (p: string) => {
      const m = p.match(/^(.*?)(?:\s+(\d+(?:\.\d+)?)%)?$/)!;
      const c = evalColour(m[1], env, depth + 1);
      return c ? { c, pct: m[2] === undefined ? undefined : Number(m[2]) } : null;
    };
    const A = parse(parts[0]);
    const B = parse(parts[1]);
    if (!A || !B) return null;
    let pa = A.pct;
    let pb = B.pct;
    if (pa === undefined && pb === undefined) pa = pb = 50;
    else if (pa === undefined) pa = 100 - pb!;
    else if (pb === undefined) pb = 100 - pa;
    const sum = pa + pb!;
    const wa = pa / sum;
    const wb = pb! / sum;
    const alpha = (A.c.a * wa + B.c.a * wb) * Math.min(1, sum / 100);
    if (alpha === 0) return { r: 0, g: 0, b: 0, a: 0 };
    const ch = (k: 'r' | 'g' | 'b') => (A.c[k] * A.c.a * wa + B.c[k] * B.c.a * wb) / (A.c.a * wa + B.c.a * wb);
    return { r: ch('r'), g: ch('g'), b: ch('b'), a: alpha };
  }
  return null;
}

export const hex2 = (c: RGB) => '#' + [c.r, c.g, c.b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
