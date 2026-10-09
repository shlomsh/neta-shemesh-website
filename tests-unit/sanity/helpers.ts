/**
 * Shared helpers for the sanity suite (tests-unit/sanity/*).
 *
 * Design rule: every "how do I recognise X in the DOM" decision lives HERE, so a
 * refactor (moving files under sections/, a change in how Section implements `fit`, ...) is
 * absorbed by editing this one file, not 10 tests.
 *
 *   - fitOf / isOneScreen / oneScreenMode   one-screen predicate (data-fit AND the implementing classes)
 *   - toneOf(el)                            nearest data-bg-tone ('mid' | 'light' | ...)
 *   - topLevelSections(root)                main > section + main > footer, in order
 *   - typeClassesOf(el)                     the .type-* tokens on an element
 *   - readSources()                         cached src/**\/*.{ts,tsx,css} contents
 *   - renderHome()                          the real src/app/page.tsx, rendered once per file
 */
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { basename, join, relative, resolve } from 'node:path';
import React from 'react';
import { expect } from 'vitest';

export const ROOT = resolve(__dirname, '../..');
export const SRC = join(ROOT, 'src');

// ─── Source files ────────────────────────────────────────────────────────────

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
 * Find a source by file name OR path suffix (`SoftSnap.tsx`, `app/layout.tsx`). Throws when nothing
 * matches or when it is ambiguous (e.g. a future src/app/blog/layout.tsx must not be picked silently).
 */
export function sourceNamed(suffix: string): SourceFile {
  return pickSource(readSources(), suffix);
}

/** Pure form of sourceNamed (unit-testable with fake files). */
export function pickSource(files: SourceFile[], suffix: string): SourceFile {
  const hits = files.filter((s) => s.path === `src/${suffix}` || s.path.endsWith(`/${suffix}`));
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

// ─── Class helpers ───────────────────────────────────────────────────────────

export function classTokens(el: Element | null | undefined): string[] {
  return (el?.getAttribute('class') ?? '').split(/\s+/).filter(Boolean);
}

export function hasClass(el: Element | null | undefined, token: string): boolean {
  return classTokens(el).includes(token);
}

/** The `.type-*` scale tokens on this element (and only this element). */
export function typeClassesOf(el: Element | null | undefined): string[] {
  return classTokens(el).filter((t) => /^type-[a-z-]+$/.test(t));
}

/** Largest-first ranking used by "paragraphs on blush must be quote scale or larger". */
export const QUOTE_OR_LARGER = ['type-quote', 'type-title', 'type-display', 'type-card-title', 'type-signature'];

// ─── Structure predicates (class based today; the ONE place to change for data-fit etc.) ───

export const isFlexContainer = (el: Element | null | undefined) => hasClass(el, 'flex') || hasClass(el, 'lg:flex');
export const isFlexColumn = (el: Element | null | undefined) => isFlexContainer(el) && (hasClass(el, 'flex-col') || hasClass(el, 'lg:flex-col'));
/** a desktop flex item that takes the remaining height */
export const isGrowItem = (el: Element | null | undefined) => hasClass(el, 'lg:flex-1');
/** how a flex item is allowed to shrink/floor at desktop */
export type MinHeightKind = 'zero' | 'floor-320';
export function minHeightKind(el: Element | null | undefined): MinHeightKind | null {
  if (hasClass(el, 'lg:min-h-0')) return 'zero';
  if (hasClass(el, 'lg:min-h-[320px]')) return 'floor-320';
  return null;
}
/** fills the height of its grid cell / parent */
export const hasFullHeight = (el: Element | null | undefined) => hasClass(el, 'h-full') || hasClass(el, 'lg:h-full');
/** a frame whose height comes from the grid, not from an aspect ratio, at desktop */
export const isHeightDrivenFrame = (el: Element | null | undefined) => hasFullHeight(el) || hasClass(el, 'lg:aspect-auto');
/** an aspect-ratio utility that is still on at desktop (it would fight the flex height) */
export function keepsAspectAtDesktop(el: Element | null | undefined): boolean {
  const t = classTokens(el);
  return t.some((x) => x.startsWith('aspect-[') || x === 'aspect-square') && !t.includes('lg:aspect-auto');
}
export const coversImage = (img: Element | null | undefined) => hasClass(img, 'object-cover');
export const isVerticallyCentered = (el: Element | null | undefined) => hasClass(el, 'justify-center');
export const stretchesItems = (el: Element | null | undefined) => hasClass(el, 'items-stretch');
/** the map wrapper: fills the details column height at lg with a 360px floor */
export const isStretchedMapFrame = (el: Element | null | undefined) => hasClass(el, 'lg:h-full') && hasClass(el, 'lg:min-h-[360px]');
/** <main> overflow behaviour: clip keeps soft snap working, hidden breaks it */
export function overflowOf(el: Element | null | undefined): 'clip' | 'hidden' | null {
  if (hasClass(el, 'overflow-hidden')) return 'hidden';
  if (hasClass(el, 'overflow-clip')) return 'clip';
  return null;
}
/**
 * a card/photo surface class (not bg-cover/bg-center/bg-no-repeat): veil, brand colour (the named
 * theme utility `bg-cream`, or the legacy arbitrary `bg-[var(--color-*)]` form), black scrim, gradient
 */
export function isSurfaceBg(token: string): boolean {
  return (
    /^bg-\[var\(--(?:surface-veil|color-[a-z-]+)\)\]$/.test(token) ||
    /^bg-(?:plum|mauve|blush|cream)(?:\/\d+)?$/.test(token) ||
    /^bg-(?:black|white)(?:\/\d+)?$/.test(token) ||
    /^bg-gradient-/.test(token) ||
    /^bg-linear-/.test(token) ||
    /^bg-\[#/i.test(token)
  );
}

// ─── Tone / kind ─────────────────────────────────────────────────────────────

export type Tone = 'dark' | 'mid' | 'light' | 'cream';

/** Tone of the nearest [data-bg-tone] ancestor-or-self, or null when on a photo / nothing. */
export function toneOf(el: Element | null | undefined): Tone | null {
  const surface = el?.closest('[data-bg-tone]');
  return (surface?.getAttribute('data-bg-tone') as Tone | null) ?? null;
}

/** Top-level kind: a tone, or 'photo' for sections that carry no data-bg-tone (hero, CTA band, footer). */
export function kindOf(section: Element): Tone | 'photo' {
  return (section.getAttribute('data-bg-tone') as Tone | null) ?? 'photo';
}

// ─── One-screen contract (desktop) ───────────────────────────────────────────
//
// Section publishes its height contract as `data-fit="lock|grow|free"` and implements it with classes:
//   all breakpoints : min-h-[100svh]                      (every fit)
//   lock-720        : lg:h-[max(100svh,720px)]            (exactly a screen, floor 720, content must fit)
//   lock-100        : lg:h-[100svh]                       (Section floor={false}; Expertise only)
//   grow-720        : lg:min-h-[max(100svh,720px)]        (a screen at least; grows on short viewports)
//   free            : min-h only, no desktop lock/grow    (content-driven past one screen)
// plus lg:py-12 for the desktop vertical rhythm of lock/grow.
//
// `data-fit` alone never counts: every predicate below also reads the classes that implement it, and
// `oneScreenMode` reports 'inconsistent' when the two disagree (a data-fit that lies, or classes that
// lost their data-fit). If the implementation moves (an @utility, a new class), change ONLY this block.

export type Fit = 'lock' | 'grow' | 'free';
export type OneScreenMode = 'lock-720' | 'lock-100' | 'grow-720' | 'free' | 'inconsistent';

/** The published height contract (`data-fit`), or null when absent / not one of lock|grow|free. */
export function fitOf(el: Element | null | undefined): Fit | null {
  const v = el?.getAttribute('data-fit');
  return v === 'lock' || v === 'grow' || v === 'free' ? v : null;
}

export function hasMinScreen(el: Element): boolean {
  return hasClass(el, 'min-h-[100svh]');
}

/**
 * Below lg a fit section's one-screen minimum is the LARGE viewport (`max-lg:min-h-lvh`, static) so a
 * collapsed phone toolbar leaves no strip of the next card; `min-h-[100svh]` stays as the fallback
 * (see hasMinScreen). The lg rules are untouched, and `lvh` must never appear unprefixed (that would
 * change desktop).
 */
export function hasMobileFill(el: Element): boolean {
  return hasMinScreen(el) && hasClass(el, 'max-lg:min-h-lvh') && !hasClass(el, 'min-h-lvh') && !hasClass(el, 'lg:min-h-lvh');
}

/** What the CLASSES alone implement at lg (ignores data-fit). */
export function classMode(el: Element): Exclude<OneScreenMode, 'inconsistent'> {
  if (hasClass(el, 'lg:h-[max(100svh,720px)]')) return 'lock-720';
  if (hasClass(el, 'lg:h-[100svh]')) return 'lock-100';
  if (hasClass(el, 'lg:min-h-[max(100svh,720px)]')) return 'grow-720';
  return 'free';
}

/** data-fit and the implementing classes must tell the same story; otherwise 'inconsistent'. */
export function oneScreenMode(el: Element): OneScreenMode {
  const fit = fitOf(el);
  const byClass = classMode(el);
  const agrees =
    (fit === 'lock' && (byClass === 'lock-720' || byClass === 'lock-100')) ||
    (fit === 'grow' && byClass === 'grow-720') ||
    (fit === 'free' && byClass === 'free');
  return agrees ? byClass : 'inconsistent';
}

/** the desktop vertical rhythm of a one-screen card */
export const hasDesktopRhythm = (el: Element) => hasClass(el, 'lg:py-12');

/**
 * True when the section is a full one-screen card on desktop: data-fit lock|grow that the classes
 * back up (consistent mode) + min screen at every breakpoint + lg:py-12.
 */
export function isOneScreen(el: Element): boolean {
  const mode = oneScreenMode(el);
  return hasMinScreen(el) && (mode === 'lock-720' || mode === 'lock-100' || mode === 'grow-720') && hasDesktopRhythm(el);
}

// ─── Expected page structure (single source of truth for the suite) ──────────

export interface SectionSpec {
  name: string;
  /**
   * DOM ids, current one FIRST (literal strings on purpose, NOT imported from content/ids.ts: a wrong
   * rename in ids.ts must fail here instead of being echoed back). When a rename leaves no id matching,
   * the section is still found by `heading` (its first h1/h2 text), which is the stable content identity.
   */
  ids: string[];
  heading?: string;
  /** Expected kind in rotation order. */
  kind: Tone | 'photo';
}

export const EXPECTED_SECTIONS: SectionSpec[] = [
  { name: 'hero', ids: ['hero'], heading: 'מקום בטוח לצמוח בו ביחד.', kind: 'photo' },
  { name: 'about-intro', ids: ['about-intro'], heading: 'ליווי מקצועי לזוגות', kind: 'mid' },
  { name: 'expertise', ids: [], heading: 'טיפול זוגי ומשפחתי בנתניה', kind: 'light' },
  { name: 'about-me', ids: ['about-me-section'], heading: 'קצת עלי', kind: 'cream' },
  { name: 'about-credentials', ids: ['about-credentials'], heading: 'ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג', kind: 'dark' },
  { name: 'about-gallery', ids: ['about-gallery'], heading: 'להצית מחדש את הקשר הזוגי', kind: 'mid' },
  { name: 'services', ids: ['services'], heading: 'איך זה עובד?', kind: 'light' },
  { name: 'cta-band', ids: ['cta-band'], heading: 'קביעת פגישת ייעוץ', kind: 'photo' },
  { name: 'testimonials-gallery', ids: ['photo-gallery'], heading: 'טיפול זוגי לקשר בריא ותומך', kind: 'cream' },
  { name: 'contact-social', ids: ['contact-social'], heading: 'עקבו אחריי', kind: 'dark' },
  { name: 'contact-office', ids: ['contact-office'], heading: 'המשרד שלי', kind: 'mid' },
  { name: 'footer', ids: [], kind: 'photo' },
];

export const SOLID_SECTIONS = EXPECTED_SECTIONS.filter((s) => s.kind !== 'photo');

// ─── Rendering the real page ─────────────────────────────────────────────────

let homeRoot: HTMLElement | undefined;

/**
 * Server-render the real home page (src/app/page.tsx default export) once and parse it
 * into a detached DOM element. Server rendering is what ships; it needs no effects, no
 * act() and survives RTL's afterEach cleanup (nothing is mounted).
 */
export async function renderHome(): Promise<HTMLElement> {
  if (!homeRoot) {
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { default: Home } = await import('@/app/page');
    const holder = document.createElement('div');
    holder.innerHTML = renderToStaticMarkup(React.createElement(Home));
    homeRoot = holder;
  }
  return homeRoot;
}

export function topLevelSections(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('main > section, main > footer'));
}

export function headingOf(section: Element): HTMLElement | null {
  return section.querySelector<HTMLElement>('h1, h2');
}

export function headingTextOf(section: Element): string {
  return (headingOf(section)?.textContent ?? '').replace(/\s+/g, ' ').trim();
}

/** Human label used in every assertion message: `about-gallery (#about-gallery "להצית...")`. */
export function labelOf(section: Element, name?: string): string {
  const id = section.id ? `#${section.id}` : section.tagName.toLowerCase();
  const text = headingTextOf(section);
  return `${name ? name + ' ' : ''}(${id}${text ? ` "${text}"` : ''})`;
}

export function matchesSpec(el: Element, spec: SectionSpec): boolean {
  if (spec.ids.length && spec.ids.includes(el.id)) return true;
  if (spec.heading) return headingTextOf(el) === spec.heading;
  return spec.ids.length === 0 && el.tagName === 'FOOTER';
}

export function findSection(root: ParentNode, name: string): HTMLElement {
  const spec = EXPECTED_SECTIONS.find((s) => s.name === name);
  if (!spec) throw new Error(`sanity: unknown section name ${name}`);
  const el = topLevelSections(root).find((s) => matchesSpec(s, spec));
  if (!el) throw new Error(`sanity: section ${name} not found in the rendered page (ids=${spec.ids.join('|') || '-'}, heading=${spec.heading ?? '-'})`);
  return el;
}

/** All text nodes with visible text under root (skips whitespace-only nodes). */
export function textNodes(root: Element): Text[] {
  const out: Text[] = [];
  const walker = root.ownerDocument.createTreeWalker(root, 4 /* NodeFilter.SHOW_TEXT */);
  let node = walker.nextNode();
  while (node) {
    if ((node.textContent ?? '').trim()) out.push(node as Text);
    node = walker.nextNode();
  }
  return out;
}

/**
 * The one-line "subtitle" paragraph under a section h2 (the title lockup). It is either the
 * h2's next sibling, or the only child of the wrapper that follows the h2 (ScrollReveal div).
 * Only used for sections listed in SUBTITLES; running copy after a title is not a subtitle.
 */
export function subtitleOf(h2: Element): HTMLElement | null {
  let node: Element | null = h2;
  for (let depth = 0; depth < 3 && node; depth++) {
    const sib: Element | null = node.nextElementSibling;
    if (sib) {
      if (sib.tagName === 'P') return sib as HTMLElement;
      // drill through single-child wrappers (ScrollReveal div, a card div, ...) to a lone paragraph
      let inner: Element = sib;
      for (let i = 0; i < 3 && inner.children.length === 1; i++) {
        inner = inner.firstElementChild!;
        if (inner.tagName === 'P') return inner as HTMLElement;
      }
    }
    node = node.parentElement;
  }
  return null;
}

/** Sections that carry a title + subtitle lockup, and what that subtitle must look like. */
export interface SubtitleSpec {
  section: string;
  /** margin classes under the title; Services differs on purpose (Elamy "?" descender) */
  margin: string[];
  /** max-w-[65ch] required (Services' 320-400px column never reaches 65ch, so it has none) */
  needsMaxWidth: boolean;
  /** Sits directly on a mauve surface by owner decision (decorative title lockup). */
  onMid?: boolean;
}

export const SUBTITLES: SubtitleSpec[] = [
  { section: 'expertise', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
  { section: 'about-gallery', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true, onMid: true },
  // Exception: more room under the title for the Elamy "?" descender in "איך זה עובד?".
  { section: 'services', margin: ['mt-5', 'md:mt-9'], needsMaxWidth: false },
  { section: 'cta-band', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
  { section: 'testimonials-gallery', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
];

// ─── CSS parsing ─────────────────────────────────────────────────────────────

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

/** `clamp(40px, 9vw, 72px)` -> { min: 40, max: 72 }; `14px` -> { min: 14, max: 14 }. */
export function sizeRange(size: string | undefined): { min: number; max: number } | null {
  if (!size) return null;
  const clamp = size.match(/^clamp\(\s*(\d+(?:\.\d+)?)px\s*,\s*[^,]+,\s*(\d+(?:\.\d+)?)px\s*\)$/);
  if (clamp) return { min: Number(clamp[1]), max: Number(clamp[2]) };
  const fixed = size.match(/^(\d+(?:\.\d+)?)px$/);
  if (fixed) return { min: Number(fixed[1]), max: Number(fixed[1]) };
  return null;
}

// ─── Buttons and nav ─────────────────────────────────────────────────────────

/** A ButtonLink = pill anchor with the shared base (rounded-full + whitespace-nowrap). */
export function buttons(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('a')).filter((a) => hasClass(a, 'rounded-full') && hasClass(a, 'whitespace-nowrap'));
}
/** button height comes from min-h alone: sm = 48px, md = 56px */
export const buttonHeightToken = (a: Element): 'min-h-[48px]' | 'min-h-[56px]' | null =>
  hasClass(a, 'min-h-[48px]') ? 'min-h-[48px]' : hasClass(a, 'min-h-[56px]') ? 'min-h-[56px]' : null;
/** the size-defining tokens of a button (height + horizontal padding), for same-variant comparisons */
export const buttonSizeTokens = (a: Element) => classTokens(a).filter((t) => /^(min-h-|px-)/.test(t)).sort();

/** the inline desktop link row: a labelled <nav> that is hidden below md */
export function desktopNav(root: ParentNode): HTMLElement | null {
  return Array.from(root.querySelectorAll<HTMLElement>('nav[aria-label]')).find((n) => hasClass(n, 'hidden') && hasClass(n, 'md:flex')) ?? null;
}
/** the below-md menu toggle */
export function hamburger(root: ParentNode): HTMLElement | null {
  return Array.from(root.querySelectorAll<HTMLElement>('button')).find((b) => b.getAttribute('aria-controls') === 'mobile-menu' && hasClass(b, 'md:hidden')) ?? null;
}

// ─── Source-scan rules (each carries known-bad / known-good samples; see source-scan.test.ts) ───

export interface ScanRule {
  id: string;
  label: string;
  re: RegExp;
  /** strings the rule MUST flag (positive control) */
  bad: string[];
  /** strings the rule must NOT flag */
  good: string[];
}

const BP = '(?:[a-z0-9]+:)*'; // optional responsive/state prefix chain: md:, lg:hover:

export const SCAN_RULES: ScanRule[] = [
  { id: 'px-size', label: 'arbitrary px/number text size  text-[18px]', re: /(?<![\w-])text-\[(?:\d|\.\d|length:|calc\()/,
    bad: ['className="text-[18px]"', 'md:text-[15px]', 'text-[.9rem]', 'text-[0]'], good: ['text-plum', 'text-[color:var(--header-color)]', 'context-[1]'] },
  { id: 'clamp-size', label: 'clamp() text size  text-[clamp(', re: /(?<![\w-])text-\[clamp\(/,
    bad: ['text-[clamp(1rem,2vw,2rem)]'], good: ['py-[clamp(32px,5vw,64px)]', 'gap-[clamp(1px,2px,3px)]'] },
  { id: 'tw-named-size', label: 'Tailwind named text size (xs/sm/base/lg/xl/2xl..)', re: new RegExp(`(?<![\\w:-])${BP}text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\\w-])`),
    bad: ['text-sm', 'md:text-xl', 'text-2xl', 'class="text-xs"'], good: ['text-white/90', 'type-small', 'text-center', 'text-right'] },
  { id: 'font-black', label: 'font-black', re: /(?<![\w-])font-black(?![\w-])/, bad: ['font-black', 'type-display font-black'], good: ['font-bold', 'font-blacksmith'] },
  { id: 'font-sans', label: 'font-sans', re: /(?<![\w-])font-sans(?![\w-])/, bad: ['font-sans', 'md:font-sans'], good: ['font-bold', 'font-sans-serif', 'sans-serif'] },
  { id: 'extra-weights', label: 'extra weights (only 400 + 700 exist)', re: /(?<![\w-])font-(?:thin|extralight|light|medium|semibold|extrabold)(?![\w-])/,
    bad: ['font-medium', 'font-light', 'font-semibold'], good: ['font-bold', 'font-normal', 'font-mediumish'] },
  { id: 'numeric-weight', label: 'numeric font weight utility font-[600]', re: /(?<![\w-])font-\[\d/,
    bad: ['font-[600]'], good: ['font-[family-name:var(--font-body)]'] },
  { id: 'data-body-large', label: 'removed attribute data-body-large', re: /data-body-large/, bad: ['<p data-body-large>'], good: ['data-bg-tone'] },
  { id: 'section-header', label: 'removed class section-header', re: /section-header/, bad: ['className="section-header"'], good: ['SectionTitle', 'header-color'] },
  { id: 'hero-title', label: 'removed class hero-title', re: /hero-title/, bad: ['hero-title'], good: ['hero-enter'] },
  { id: 'sub-header', label: 'removed class sub-header', re: /sub-header/, bad: ['sub-header'], good: ['subtitle'] },
  { id: 'contact-email-link', label: 'removed class contact-email-link', re: /contact-email-link/, bad: ['contact-email-link'], good: ['mailto:'] },
  { id: 'fontSize-style', label: 'inline fontSize in a style object', re: /\bfontSize\s*:/,
    bad: ["style={{ fontSize: 18 }}", "style={{fontSize:'1rem'}}"], good: ['fontSizeAdjust', "const x = 'font size'"] },
  { id: 'h-screen', label: 'h-screen / min-h-screen (use svh)', re: new RegExp(`(?<!\\w)${BP}(?:min-|max-)?h-screen(?![\\w-])`),
    bad: ['h-screen', 'min-h-screen', 'lg:h-screen'], good: ['min-h-[100svh]', 'h-screenful'] },
  { id: 'ungated-h-100svh', label: 'ungated h-[100svh] (only lg:-gated or min-h is allowed)', re: /(?<![\w:-])h-\[100svh\]/,
    bad: ['h-[100svh]', 'flex h-[100svh] w-full'], good: ['lg:h-[100svh]', 'min-h-[100svh]', 'lg:min-h-[100svh]', 'lg:h-[max(100svh,720px)]'] },
  { id: 'main-overflow-hidden', label: '<main> with overflow-hidden', re: /<main\b[^>]*\boverflow-hidden/,
    bad: ['<main className="relative w-full overflow-hidden" style={{}}>'], good: ['<main className="relative w-full overflow-clip">', '<section className="overflow-hidden">'] },
  { id: 'pageshell-overflow-hidden', label: '<PageShell overflow="hidden"> (the PageShell form of <main overflow-hidden>)', re: /<PageShell\b[^>]*\boverflow=\{?["']hidden/,
    bad: ['<PageShell overflow="hidden">', "<PageShell behaviors={x} overflow={'hidden'}>"], good: ['<PageShell overflow="clip">', '<PageShell overflow="clip" behaviors={<SoftSnap />}>'] },
  { id: 'google-fonts', label: 'Google Fonts fetch (breaks the Vercel prod build)', re: /next\/font\/google|fonts\.googleapis|fonts\.gstatic/,
    bad: ['import { Roboto } from "next/font/google"', 'https://fonts.googleapis.com/css'], good: ['next/font/local'] },
  { id: 'display-font-in-component', label: 'Elamy / display font set directly on a component', re: /(?<![\w-])font-(?:display|elamy)(?![\w-])|family-name:var\(--font-(?:display|elamy)\)|font-\[var\(--font-(?:display|elamy)\)\]|\bfontFamily\b/,
    bad: ['font-display', 'font-[family-name:var(--font-display)]', 'font-[var(--font-elamy)]', "style={{ fontFamily: 'x' }}"], good: ['font-[family-name:var(--font-body)]', 'type-title', 'font-displayed'] },
  { id: 'stock-palette', label: 'stock Tailwind palette colour', re: /(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|shadow)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}/,
    bad: ['bg-red-500', 'text-gray-600', 'border-blue-300'], good: ['bg-plum', 'text-cream', 'bg-black/20'] },
  { id: 'arbitrary-colour-var', label: 'arbitrary colour utility  text-[var(--color-plum)]  (use the theme utility: text-plum, bg-cream, ring-mauve ...)',
    re: /(?<![\w-])(?:text|bg|border|ring-offset|ring|outline|fill|stroke|from|via|to|decoration|divide|caret|accent|shadow)-\[(?:color:)?var\(--color-[a-z-]+\)\]/,
    bad: ['text-[var(--color-plum)]', 'focus-visible:ring-[var(--color-white)]', 'text-[color:var(--color-white)]', 'bg-[var(--color-dark)]', 'hover:outline-[color:var(--color-mauve)]', 'focus-visible:ring-offset-[var(--color-cream)]'],
    good: ['text-plum', 'bg-cream/35', 'bg-[var(--surface-veil)]', 'text-[color:var(--header-color)]', 'hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)]', 'outline-[color:color-mix(in_srgb,var(--color-plum)_18%,transparent)]'] },
  { id: 'white-utility', label: 'named white utility  text-white / bg-white / bg-white/35 / ring-white  (bg-white is pure #fff; the others resolve through the :root --color-white override; use the -cream utility)',
    re: /(?<![\w-])(?:text|bg|border|ring-offset|ring|outline|fill|stroke|from|via|to|decoration|divide|caret|accent)-white(?![\w-])/,
    bad: ['text-white', 'text-white/90', 'ring-white/35', 'bg-white', 'rounded-card bg-white shadow-sm', 'bg-white/35', 'lg:hover:text-white', 'focus-visible:ring-offset-white'],
    good: ['text-cream', 'bg-cream/35', 'bg-whitesmoke', 'text-whitespace', 'on-white'] },
  { id: 'rtl-dir', label: 'dir="rtl" below <html> (the page is already rtl; keep dir="ltr" for phone / email / Latin)',
    re: /\bdir=(?:"rtl"|'rtl'|\{\s*["'`]rtl["'`]\s*\})/,
    bad: ['<header dir="rtl" className="x">', "<div dir='rtl'>", "<Section dir={'rtl'}>", '<p dir={"rtl"}>', 'dir="rtl"'],
    good: ['<span dir="ltr">', '<html lang="he">', 'direction: rtl', 'dir={undefined}', 'cardir="rtlx"', 'rtl'] },
  { id: 'hex', label: 'hex colour literal', re: /#[0-9a-fA-F]{3,8}\b/, bad: ['bg-[#123456]', '#ABC', 'color:#fff5f0'], good: ['var(--color-plum)', 'issue #4', 'url(#grad)'] },
];

/** class-list-ish string literals in code that carry a type-* class (backticks, quotes; Hebrew prose excluded) */
export function classLiterals(files: SourceFile[]): Array<{ file: string; text: string }> {
  const out: Array<{ file: string; text: string }> = [];
  for (const f of files.filter((x) => /\.tsx?$/.test(x.name))) {
    for (const m of f.text.matchAll(/"([^"]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
      const text = m[1] ?? m[2] ?? m[3] ?? '';
      if (!/\btype-[a-z]/.test(text) || text.length > 600) continue;
      if (!text.split(/\s+/).filter(Boolean).every((t) => /^[\w:\-[\]/().,%#!&>=*+$@{}~|'\\^"]+$/.test(t))) continue;
      out.push({ file: f.path, text });
    }
  }
  return out;
}

export const TYPE_TOKEN = /(?<![\w-])type-(?:display|title|card-title|quote|lead|body|small|read-lead|read|eyebrow|signature)(?![\w-])/g;

/** Problems in ONE class list that carries a type-* class (empty array = fine). */
export function typeLiteralOffenses(text: string): string[] {
  const types = [...new Set(text.match(TYPE_TOKEN) ?? [])];
  if (types.length === 0) return [];
  const out: string[] = [];
  if (types.length > 1) out.push(`two type-* classes: ${types.join(' + ')}`);
  if (/(?<![\w-])font-latin(?![\w-])/.test(text)) out.push('font-latin on the same element as a type-* class');
  for (const m of text.matchAll(/(?<![\w-])(leading|tracking)-\[[^\]]*\]/g)) {
    const allowed = m[0] === 'tracking-[-0.01em]' && types.every((t) => t === 'type-title' || t === 'type-display');
    if (!allowed) out.push(`${m[0]} next to ${types.join(', ')}`);
  }
  for (const m of text.matchAll(/(?<![\w-])(?:tracking-(?:tighter|tight|normal|wide|wider|widest)|leading-(?:none|tight|snug|normal|relaxed|loose|\d+))(?![\w-])/g)) {
    out.push(`${m[0]} next to ${types.join(', ')} (line-height and tracking come from the type class)`);
  }
  return out;
}

// ─── Tolerant source parsing (SoftSnap) ──────────────────────────────────────

/** `export const X = 1024;`  `export const X: number = 1024`  without semicolon, any spacing. */
export function parseExportedNumber(text: string, name: string): number | null {
  const m = text.match(new RegExp(`export\\s+const\\s+${name}\\s*(?::\\s*number\\s*)?=\\s*(\\d+(?:\\.\\d+)?)\\s*;?`));
  return m ? Number(m[1]) : null;
}

/** The section-selecting string literal passed to any querySelectorAll call (any quote style, optional generic). */
export function findTargetSelector(text: string): string | undefined {
  for (const m of text.matchAll(/querySelectorAll(?:<[^>]*>)?\(\s*(['"`])((?:(?!\1).)*)\1/g)) {
    if (m[2].includes('section')) return m[2];
  }
  return undefined;
}

// ─── globals.css: tone mapping and font-family usage ─────────────────────────

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
