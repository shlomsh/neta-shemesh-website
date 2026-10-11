/**
 * The WCAG contrast matrix: measures every visible text node of a rendered page (`contrastReport`), the pages it covers
 * (`renderContrastPages`) and the ratchet for the owner-approved exceptions. CLAUDE.md "Color": contrast pairs.
 */
import React from 'react';
import { compositeOver, contrastRatio, hex2, type RGBA } from './colour-math';
import { backdropOf, baseTokens, composeGroupOpacity, foregroundOf, splitVariant } from './colour-resolve';
import { parseTypeRules, sizeRange } from './css';
import { classTokens, textNodes, typeClassesOf } from './dom';
import { renderHome } from './page';

const HIDING_DISPLAY = /^(?:flex|block|inline|inline-block|inline-flex|grid|inline-grid|contents|table|list-item)$/;
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];

/** display:none at the mobile (375px) or desktop (1280px) width, from `hidden` plus `md:flex` style overrides. */
function isHiddenAt(el: Element, viewport: 'mobile' | 'desktop'): boolean {
  let hidden = false;
  const toks = classTokens(el);
  if (toks.includes('hidden')) hidden = true;
  if (viewport === 'desktop') {
    for (const bp of BREAKPOINTS) {
      for (const t of toks) {
        const { variant, util } = splitVariant(t);
        if (variant !== bp) continue;
        if (util === 'hidden') hidden = true;
        else if (HIDING_DISPLAY.test(util)) hidden = false;
      }
    }
  } else {
    // max-lg:hidden etc. apply below the breakpoint
    for (const t of toks) {
      const { variant, util } = splitVariant(t);
      if (/^max-(?:sm|md|lg|xl|2xl)$/.test(variant) && util === 'hidden') hidden = true;
    }
  }
  return hidden;
}

/** Visually hidden text (`sr-only`) is not part of the visible contrast matrix. */
const isSrOnly = (el: Element) => baseTokens(el).includes('sr-only');

export interface TextStyle { size: number; bold: boolean; typeClass: string | null }

/** Mobile-minimum size and weight of text in `el`: nearest `.type-*` for size (x0.88 per `.font-latin` span), nearest font-bold / type weight for weight. */
function textStyleOf(el: Element): TextStyle {
  const rules = parseTypeRules();
  let scale = 1;
  let size: number | null = null;
  let typeClass: string | null = null;
  let weight: number | null = null;
  for (let a: Element | null = el; a; a = a.parentElement) {
    const toks = baseTokens(a);
    if (weight === null) {
      if (toks.includes('font-bold')) weight = 700;
      else if (toks.includes('font-normal')) weight = 400;
    }
    const type = typeClassesOf(a)[0]?.slice(5);
    if (type && rules.has(type)) {
      const r = rules.get(type)!;
      if (weight === null && r.weight) weight = Number(r.weight);
      size = sizeRange(r.size)?.min ?? null;
      typeClass = `type-${type}`;
      break;
    }
    if (toks.includes('font-latin')) scale *= 0.88;
  }
  return { size: (size ?? 16) * scale, bold: (weight ?? 400) >= 700, typeClass };
}

/** WCAG 1.4.3: 3:1 for large text (>= 24px, or >= 18.67px bold), 4.5:1 otherwise. */
export function requiredRatio(style: TextStyle): number {
  return style.size >= 24 || (style.bold && style.size >= 18.66) ? 3 : 4.5;
}

export interface ContrastFinding {
  page: string;
  /** `#section-id` of the nearest section, or the landmark tag (`header`, `footer`, `nav`) */
  where: string;
  /** whitespace-normalised text, first 60 chars */
  text: string;
  ratio: number;
  required: number;
  fg: string;
  bg: string;
  size: number;
  bold: boolean;
  typeClass: string | null;
}

export interface ContrastReport {
  /** the failures only */
  findings: ContrastFinding[];
  /** every measured text (pass or fail), deduplicated by section + text + colours + type class */
  all: ContrastFinding[];
  /** text we could not measure, with the reason (photo backdrops, unknown colour syntax) */
  skipped: Array<{ page: string; where: string; text: string; reason: string }>;
  /** number of text nodes measured */
  measured: number;
}

const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEMPLATE', 'TITLE', 'SVG', 'OPTION']);
const HAS_LETTER = /[\p{L}\p{N}]/u;

function whereOf(el: Element): string {
  const s = el.closest('section[id], footer, header, nav');
  if (s) return s.id ? `#${s.id}` : s.tagName.toLowerCase();
  const bare = el.closest('section');
  if (bare) {
    const heading = bare.querySelector('[id]');
    return heading ? `section(${'#' + heading.id})` : 'section';
  }
  const tid = el.closest('[data-testid]')?.getAttribute('data-testid');
  return tid ? `[data-testid=${tid}]` : 'page';
}

/** Measure every visible text node under `root` (one page). */
export function contrastReport(root: Element, page: string): ContrastReport {
  const report: ContrastReport = { findings: [], all: [], skipped: [], measured: 0 };
  const seen = new Set<string>();
  for (const node of textNodes(root)) {
    const el = node.parentElement;
    if (!el) continue;
    const text = (node.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!HAS_LETTER.test(text)) continue; // separators like "·" carry no information
    let skip = false;
    let hiddenMobile = false;
    let hiddenDesktop = false;
    for (let a: Element | null = el; a; a = a.parentElement) {
      if (SKIP_TAGS.has(a.tagName.toUpperCase()) || isSrOnly(a)) skip = true;
      if (isHiddenAt(a, 'mobile')) hiddenMobile = true;
      if (isHiddenAt(a, 'desktop')) hiddenDesktop = true;
    }
    if (skip || (hiddenMobile && hiddenDesktop)) continue;
    const where = whereOf(el);
    const snippet = text.slice(0, 60);
    const fg = foregroundOf(el);
    const bd = backdropOf(el);
    if (!fg.ok) { report.skipped.push({ page, where, text: snippet, reason: fg.reason }); continue; }
    if (!bd.ok) { report.skipped.push({ page, where, text: snippet, reason: bd.reason }); continue; }
    const style = textStyleOf(el);
    // ancestor opacity (below the backdrop) fades the text colour toward the backdrop
    const fgRgba: RGBA = { ...fg.value, a: fg.value.a * bd.value.faded };
    const composed = composeGroupOpacity(compositeOver(fgRgba, bd.value.colour), bd.value.colour, bd.value.supplier);
    const fgFinal = composed.fg;
    const bgFinal = composed.bg;
    const raw = contrastRatio(fgFinal, bgFinal);
    report.measured++;
    // the key includes the measured style, so a passing copy of a text cannot hide a failing copy
    const key = `${where}|${snippet}|${hex2(fgFinal)}|${hex2(bgFinal)}|${style.typeClass}|${style.size}|${style.bold}`;
    if (seen.has(key)) continue;
    seen.add(key);
    const required = requiredRatio(style);
    const finding: ContrastFinding = {
      page, where, text: snippet, ratio: Math.round(raw * 100) / 100, required,
      fg: hex2(fgFinal), bg: hex2(bgFinal), size: style.size, bold: style.bold, typeClass: style.typeClass,
    };
    report.all.push(finding);
    if (raw < required) report.findings.push(finding);
  }
  return report;
}

// ─── Ratchet: an allow-table that may only shrink ────────────────────────────

export interface ContrastAllow {
  /** page id (`home`, `blog`, `blog/<slug>`), or `*` for any page */
  page: string;
  /** `#section-id`, landmark tag or `[data-testid=x]` as reported in the failure */
  where: string;
  /** start of the failing text (after whitespace normalisation) */
  text: string;
  /** the ratio measured when the entry was written (+-0.02) */
  ratio: number;
  reason: string;
}

const allowMatches = (a: ContrastAllow, f: ContrastFinding) => (a.page === '*' || a.page === f.page) && a.where === f.where && f.text.startsWith(a.text);

/** New failures (not allow-listed), stale entries (match no failure), and entries whose ratio drifted. Empty arrays = pass. */
export function ratchetContrast(findings: ContrastFinding[], allow: ContrastAllow[]): { fresh: string[]; stale: string[]; drifted: string[] } {
  const label = (f: ContrastFinding) =>
    `[${f.page}] ${f.where} "${f.text}" ${f.ratio}:1 < ${f.required}:1 (${f.fg} on ${f.bg}, ${f.size}px${f.bold ? ' bold' : ''}${f.typeClass ? ' ' + f.typeClass : ''})`;
  const fresh = findings.filter((f) => !allow.some((a) => allowMatches(a, f))).map(label);
  const stale: string[] = [];
  const drifted: string[] = [];
  for (const a of allow) {
    const hits = findings.filter((f) => allowMatches(a, f));
    if (hits.length === 0) stale.push(`stale allow entry, remove it: [${a.page}] ${a.where} "${a.text}" (was ${a.ratio}:1; ${a.reason})`);
    else for (const h of hits) if (Math.abs(h.ratio - a.ratio) > 0.02) drifted.push(`allow entry ratio changed, update it: [${h.page}] ${a.where} "${a.text}" table ${a.ratio}:1, now ${h.ratio}:1`);
  }
  return { fresh, stale, drifted };
}

/** The pages the matrix covers: home, /blog, and every post. Each is rendered once per test file. */
let contrastPagesCache: Promise<Array<{ page: string; root: HTMLElement }>> | undefined;
export function renderContrastPages(): Promise<Array<{ page: string; root: HTMLElement }>> {
  if (!contrastPagesCache) {
    contrastPagesCache = (async () => {
      const { renderToStaticMarkup } = await import('react-dom/server');
      const out: Array<{ page: string; root: HTMLElement }> = [{ page: 'home', root: await renderHome() }];
      const mount = (el: React.ReactElement) => {
        const holder = document.createElement('div');
        holder.innerHTML = renderToStaticMarkup(el);
        return holder;
      };
      const { default: BlogIndex } = await import('@/app/blog/page');
      out.push({ page: 'blog', root: mount(React.createElement(BlogIndex)) });
      const { default: BlogPost } = await import('@/app/blog/[slug]/page');
      const { getAllPosts } = await import('@/content/posts');
      for (const post of getAllPosts()) {
        const el = await BlogPost({ params: Promise.resolve({ slug: post.slug }) });
        out.push({ page: `blog/${post.slug}`, root: mount(el as React.ReactElement) });
      }
      return out;
    })();
  }
  return contrastPagesCache;
}
