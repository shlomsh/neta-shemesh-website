/**
 * Parsers over globals.css: `.type-*` rules, tone rules, custom properties, display-font selectors.
 * CLAUDE.md "Typography" (scale values), "Section primitive" (tone mapping). Grep globals.css, never open it.
 */
import { globalsCss, stripCssComments } from './source';

export interface TypeRule {
  name: string; // e.g. "quote" for .type-quote
  family?: string;
  weight?: string;
  size?: string;
  lineHeight?: string;
}

/** Parse every `.type-<name> { ... }` rule in globals.css (comments stripped). */
export function parseTypeRules(css = globalsCss()): Map<string, TypeRule> {
  const rules = new Map<string, TypeRule>();
  const clean = stripCssComments(css);
  const re = /\.type-([a-z-]+)\s*\{([^}]*)\}/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(clean))) {
    const body = m[2];
    const get = (prop: string) => body.match(new RegExp(`${prop}\\s*:\\s*([^;]+);`))?.[1].trim();
    rules.set(m[1], {
      name: m[1],
      family: get('font-family'),
      weight: get('font-weight'),
      size: get('font-size'),
      lineHeight: get('line-height'),
    });
  }
  return rules;
}

/** px per rem at the DEFAULT root font size: the scale in CLAUDE.md is documented in px at this root, the CSS is in rem. */
export const ROOT_PX = 16;
/** `1.5rem` -> 24, `24px` -> 24 (px at the default 16px root); null when it is neither. */
function lengthPx(len: string): number | null {
  const m = len.trim().match(/^(\d+(?:\.\d+)?|\.\d+)(rem|px)$/);
  return m ? Number(m[1]) * (m[2] === 'rem' ? ROOT_PX : 1) : null;
}
/** `clamp(2.5rem, 9vw, 4.5rem)` -> { min: 40, max: 72 }; `0.875rem` -> { min: 14, max: 14 } (px at the default root; px input still parses). */
export function sizeRange(size: string | undefined): { min: number; max: number } | null {
  if (!size) return null;
  const clamp = size.match(/^clamp\(\s*([^,\s]+)\s*,\s*[^,]+,\s*([^,\s)]+)\s*\)$/);
  if (clamp) {
    const [min, max] = [lengthPx(clamp[1]), lengthPx(clamp[2])];
    return min !== null && max !== null ? { min, max } : null;
  }
  const fixed = lengthPx(size);
  return fixed === null ? null : { min: fixed, max: fixed };
}

export interface ToneRule { bg?: string; color?: string; header?: string }

/** `[data-bg-tone="x"] { background-color; color; --header-color }` rules (grouped/pseudo selectors ignored). */
export function parseToneRules(css = globalsCss()): Record<string, ToneRule> {
  const out: Record<string, ToneRule> = {};
  for (const m of stripCssComments(css).matchAll(/\[data-bg-tone="(\w+)"\]\s*\{([^}]*)\}/g)) {
    const body = m[2];
    if (!/background-color/.test(body)) continue; // only the rules that paint a tone
    const get = (prop: string) => body.match(new RegExp(`(?:^|[;\\s])${prop}\\s*:\\s*([^;]+);`))?.[1].trim();
    out[m[1]] = { bg: get('background-color'), color: get('color'), header: get('--header-color') };
  }
  return out;
}

/** value of a custom property declaration (`--name: value;`), last one wins. */
export function cssVar(css: string, name: string): string | undefined {
  const all = [...stripCssComments(css).matchAll(new RegExp(`${name.replace(/[-]/g, '\\-')}\\s*:\\s*([^;]+);`, 'g'))];
  return all.at(-1)?.[1].trim();
}

/** selectors (as written) of every css rule whose `font-family` uses the display font (Elamy). */
export function displayFontSelectors(css = globalsCss()): string[] {
  const out: string[] = [];
  for (const m of stripCssComments(css).matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/font-family\s*:[^;]*var\(--font-(?:display|elamy)\)/.test(m[2])) out.push(m[1].trim());
  }
  return out;
}
