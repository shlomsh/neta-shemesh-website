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
//   from lg         : lg:screen-fit (min-height: var(--card-h), = 100svh at lg)   (free + lock; grow has its own min-h)
//   below lg        : data-phone="content" (default: no min-height, sized by content + padding)
//                     data-phone="screen"  : screen-fit at every width (--card-h = 100lvh below lg); credentials + CTA band
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

/**
 * True when the element is at least one screen tall at EVERY breakpoint: a Section with
 * `phone="screen"` (`screen-fit`), the footer (`screen-visible`, which is `--card-h` upgraded to dvh) or
 * the hero (`hero-fit` = `min-height: var(--hero-h)`).
 */
export function hasMinScreen(el: Element): boolean {
  return hasClass(el, 'screen-fit') || hasClass(el, 'screen-visible') || hasClass(el, 'hero-fit');
}

/**
 * True when the fit section is at least one screen tall FROM LG (every phone mode shares this): `screen-fit`
 * / `lg:screen-fit` (free, lock) or the grow's own `lg:min-h-[max(100svh,720px)]`.
 */
export function hasLgMinScreen(el: Element): boolean {
  return hasClass(el, 'screen-fit') || hasClass(el, 'lg:screen-fit') || hasClass(el, 'lg:min-h-[max(100svh,720px)]');
}

/**
 * Below lg a `phone="screen"` section's one-screen minimum is `screen-fit` (`min-height: var(--card-h)`);
 * the token is `100svh`, and the LARGE viewport (`100lvh`, static) below lg so a collapsed phone toolbar
 * leaves no strip of the next card (the unit decision is asserted on globals.css in one-screen.test.tsx).
 * A hand-written `min-h-lvh` would change desktop or bypass the token, so it must never appear next to it.
 */
export function hasMobileFill(el: Element): boolean {
  return hasClass(el, 'screen-fit') && !hasClass(el, 'min-h-lvh') && !hasClass(el, 'lg:min-h-lvh') && !hasClass(el, 'max-lg:min-h-lvh');
}

/** No unprefixed height/min-height at all: below lg the element is as tall as its content + padding. */
export function hasPhoneContentHeight(el: Element): boolean {
  return !classTokens(el).some((t) => /^(screen-fit|screen-visible|min-h-|h-)/.test(t));
}

export type PhoneMode = 'screen' | 'content';
export type PhoneState = PhoneMode | 'inconsistent';

/** The published phone contract (`data-phone`), or null when absent / not one of screen|content. */
export function phoneOf(el: Element | null | undefined): PhoneMode | null {
  const v = el?.getAttribute('data-phone');
  return v === 'screen' || v === 'content' ? v : null;
}

/** data-phone and the classes below lg must tell the same story; otherwise 'inconsistent' (null without data-phone). */
export function phoneMode(el: Element): PhoneState | null {
  const declared = phoneOf(el);
  if (!declared) return null;
  const byClass: PhoneMode | null = hasMobileFill(el) ? 'screen' : hasPhoneContentHeight(el) ? 'content' : null;
  return byClass === declared ? declared : 'inconsistent';
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
 * back up (consistent mode) + min screen from lg + lg:py-12.
 */
export function isOneScreen(el: Element): boolean {
  const mode = oneScreenMode(el);
  return hasLgMinScreen(el) && (mode === 'lock-720' || mode === 'lock-100' || mode === 'grow-720') && hasDesktopRhythm(el);
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

// Elamy ink box: `.type-display/.type-title/.type-signature` carry padding-block + an equal NEGATIVE
// margin-block (globals.css). A margin utility on the same element replaces that negative margin and
// shifts the layout by the padding (~0.6em), so spacing goes on a wrapper or the neighbour instead.
const INK_TYPE = String.raw`(?<![\w-])type-(?:display|title|signature)(?![\w-])`;
const INK_MARGIN = String.raw`(?<![\w-])(?:-?m[tblrxyse]?-(?:\[[^\]\s]*\]|[\w./]+)|\[margin[\w-]*:[^\]]*\])`;
const INK_GAP = String.raw`[^"'<;*{}\x60]*?`; // stays inside one quoted class list
const INK_EXPR = String.raw`[^}]*?`; // stays inside one className={...} expression
const INK_MARGIN_RE = new RegExp(
  [
    `${INK_TYPE}${INK_GAP}${INK_MARGIN}`,
    `${INK_MARGIN}${INK_GAP}${INK_TYPE}`,
    `className=\\{${INK_EXPR}${INK_TYPE}${INK_EXPR}${INK_MARGIN}`,
    `className=\\{${INK_EXPR}${INK_MARGIN}${INK_EXPR}${INK_TYPE}`,
    `<SectionTitle\\b[^>]*?className=(?:"[^"]*?|\\{${INK_EXPR})${INK_MARGIN}`,
  ].join('|'),
);

// NS-45: the same hazard on the inline axis. The ink box also pads inline (--ink-inline) and cancels it with an
// equal negative margin-inline; a width (w-*, min-w-*, max-w-*, size-*) or inline-padding (p-*, px-*, ps-*, pe-*,
// pl-*, pr-*) utility on the heading changes the box the margin was balanced against and shifts the title.
const INK_INLINE = String.raw`(?<![\w-])(?:(?:min-|max-)?w-(?:\[[^\]\s]*\]|[\w./]+)|size-(?:\[[^\]\s]*\]|[\w./]+)|p[xselr]?-(?:\[[^\]\s]*\]|[\w./]+)|\[(?:width|min-width|max-width|padding[\w-]*):[^\]]*\])`;
const INK_INLINE_RE = new RegExp(
  [
    `${INK_TYPE}${INK_GAP}${INK_INLINE}`,
    `${INK_INLINE}${INK_GAP}${INK_TYPE}`,
    `className=\\{${INK_EXPR}${INK_TYPE}${INK_EXPR}${INK_INLINE}`,
    `className=\\{${INK_EXPR}${INK_INLINE}${INK_EXPR}${INK_TYPE}`,
    `<SectionTitle\\b[^>]*?className=(?:"[^"]*?|\\{${INK_EXPR})${INK_INLINE}`,
  ].join('|'),
);

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
  { id: 'ink-box-margin', label: 'margin utility on an Elamy heading (.type-display/.type-title/.type-signature, or SectionTitle className): it replaces the ink-box negative margin and shifts the layout; put the spacing on a wrapper or the neighbouring element',
    re: INK_MARGIN_RE,
    bad: ['<h2 className="type-title mb-6">', '<p className="mt-3 type-signature text-cream">', '<span className="type-display md:-mt-2 self-end">', '<SectionTitle className="mb-[clamp(28px,4vw,48px)] text-center">',
      '<SectionTitle\n  id={ID.x}\n  className="text-center my-4"\n>', '<h1 className={cx("type-title", wide && "mx-auto")}>', '<h2 className="type-title [margin-top:8px]">', '<SectionTitle className={cx("a", x && "mt-2")}>'],
    good: ['<h2 className="type-title font-bold tracking-[-0.01em] text-center">', '<SectionTitle className="text-center">', '<div className="mb-[clamp(28px,4vw,48px)]"><SectionTitle className="text-center">',
      '<p className="type-quote max-w-[65ch] mx-auto mt-3 md:mt-4">', '<h3 className="type-card-title mt-2 mb-3 text-cream">', '<span className="type-display self-end text-cream drop-shadow-md">', '<h2 className="type-title bg-mauve max-w-[65ch] min-h-[2em]">',
      '<SectionTitle as="p" onDark className="text-center w-full h-full flex items-center justify-center">', '.type-title { margin-block: 0 }'] },
  { id: 'ink-box-inline', label: 'width or inline-padding utility on an Elamy heading (.type-display/.type-title/.type-signature, or SectionTitle className): the ink box pads inline with an equal negative margin (NS-45), so it shifts the title; put widths and padding on a wrapper',
    re: INK_INLINE_RE,
    bad: ['<h1 className="type-display text-cream font-bold w-full">', '<h2 className="type-title max-w-[65ch]">', '<p className="min-w-0 type-signature">', '<h2 className="type-title px-4">', '<SectionTitle as="p" onDark className="text-center w-full h-full">',
      '<span className="type-display ps-2 self-end">', '<h1 className={cx("type-title", wide && "max-w-prose")}>', '<h2 className="type-title [width:80%]">'],
    good: ['<h2 className="type-title font-bold tracking-[-0.01em] text-center">', '<SectionTitle className="text-center h-full flex items-center justify-center">', '<div className="w-full"><SectionTitle>', '<h3 className="type-card-title w-full px-4">',
      '<p className="type-quote max-w-[65ch] mx-auto mt-3 md:mt-4">', '<span className="type-display self-end text-cream drop-shadow-md">', '<h2 className="type-title bg-mauve min-h-[2em] opacity-90">', 'type-title { padding-inline: 0 }'] },
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

// ─── Contrast: colour maths and a class-to-colour resolver (NS-42) ───────────
//
// jsdom has no Tailwind CSS, so `getComputedStyle` knows nothing about `text-plum` or `bg-mauve/50`.
// Instead of computed values this resolver reads the CLASS LIST of every ancestor and maps it to a
// colour through the palette declared in `@theme` (globals.css), the same way the browser would for
// the base (mobile) state. What it understands:
//   text-plum|mauve|blush|cream|white|black(/NN)   bg-<same>(/NN)   text-inherit|current
//   text-[color:...] / bg-[...] holding #hex, var(--color-*), var(--surface-veil),
//     var(--header-color), color-mix(in srgb, A p%, B|transparent)
//   [data-bg-tone] -> background/colour/--header-color from the tone rules in globals.css
//   .on-dark -> --header-color cream;   opacity-NN / opacity-[0.NN] on ancestors; inline style colour/opacity
// Not resolved (see LIMITS in README): variant states (hover:, focus-visible:), breakpoint colour
// overrides, gradients, photos behind text, mix-blend-mode grain, group-opacity against a bg that
// sits above the faded element.

export interface RGB { r: number; g: number; b: number }
export interface RGBA extends RGB { a: number }

export function hexToRgb(hex: string): RGB {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  if (h.length === 8) h = h.slice(0, 6);
  return { r: parseInt(h.slice(0, 2), 16), g: parseInt(h.slice(2, 4), 16), b: parseInt(h.slice(4, 6), 16) };
}

/** WCAG 2.x relative luminance. */
export function relativeLuminance(c: RGB): number {
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

/** [variant, utility] of a class token; the variant chain is whatever precedes the last top-level ':' (outside [...] and (...)). */
export function splitVariant(token: string): { variant: string; util: string } {
  let depth = 0;
  let cut = -1;
  for (let i = 0; i < token.length; i++) {
    const ch = token[i];
    if (ch === '[' || ch === '(') depth++;
    else if (ch === ']' || ch === ')') depth--;
    else if (ch === ':' && depth === 0) cut = i;
  }
  return cut < 0 ? { variant: '', util: token } : { variant: token.slice(0, cut), util: token.slice(cut + 1) };
}

/** Class tokens that apply in the base state (no hover:/md:/focus-visible: ... prefix). */
export function baseTokens(el: Element): string[] {
  return classTokens(el).filter((t) => splitVariant(t).variant === '');
}

const NAMED_COLOUR = '(plum|mauve|blush|cream|white|black)';

export type ColourToken = { kind: 'inherit' } | { kind: 'colour'; value: RGBA } | { kind: 'unresolved'; token: string };

/**
 * Non-colour uses of `text-[...]` / `bg-[...]` / `text-(...)`: sizes, lengths, urls, images, gradients ...
 * Everything else that starts `text-[` / `bg-[` / `text-(` / `bg-(` or is `<named>/[...]` is a colour syntax:
 * if the resolver cannot evaluate it, it is reported as unresolved (a skipped text fails the matrix), never ignored.
 */
const NON_COLOUR_ARBITRARY = /^(?:\((?:length|percentage|position|size|url|image|angle|number):|\[(?:length|percentage|position|size|url|image|angle|number):|\[url\(|\[(?:\d|\.\d|calc\(|clamp\(|min\(|max\()|\[[^\]]*gradient\()/;

/** Interpret one base `text-*` / `bg-*` utility as a colour; null when it is not a colour utility at all (text-right, bg-cover, text-[14px] ...). */
export function colourFromToken(prefix: 'text' | 'bg', token: string, env: ColourEnv): ColourToken | null {
  if (prefix === 'text' && (token === 'text-inherit' || token === 'text-current')) return { kind: 'inherit' };
  const named = token.match(new RegExp(`^${prefix}-${NAMED_COLOUR}(?:/(\\d+))?$`));
  if (named) {
    const c = env.palette[named[1] === 'white' ? 'white' : named[1]] ?? env.palette.cream;
    return { kind: 'colour', value: { ...c, a: named[2] === undefined ? 1 : Number(named[2]) / 100 } };
  }
  if (prefix === 'text' && token === 'text-transparent') return { kind: 'colour', value: { r: 0, g: 0, b: 0, a: 0 } };
  if (prefix === 'bg' && token === 'bg-transparent') return { kind: 'colour', value: { r: 0, g: 0, b: 0, a: 0 } };
  const unresolved: ColourToken = { kind: 'unresolved', token };
  // plum/[0.3], cream/[30%]: an arbitrary opacity modifier on a named colour
  if (new RegExp(`^${prefix}-${NAMED_COLOUR}/\\[`).test(token)) return unresolved;
  const rest = token.slice(prefix.length + 1);
  // Tailwind v4 shorthand: text-(--color-cream), bg-(--surface-veil), text-(color:--x)
  const short = rest.match(/^\((?:color:)?(--[\w-]+)\)$/);
  if (short) {
    const v = evalColour(`var(${short[1]})`, env);
    return v ? { kind: 'colour', value: v } : unresolved;
  }
  if (rest.startsWith('(')) return NON_COLOUR_ARBITRARY.test(rest) ? null : unresolved;
  if (rest.startsWith('[')) {
    if (NON_COLOUR_ARBITRARY.test(rest)) return null;
    const arb = rest.match(/^\[(?:color:)?(.+)\]$/);
    if (!arb) return unresolved; // e.g. text-[color:var(--c)]/50: modifier after the bracket
    const v = evalColour(arb[1], env);
    return v ? { kind: 'colour', value: v } : unresolved;
  }
  return null;
}

/** `--header-color` as seen by this element: its own/ancestor `.on-dark` (cream) or the nearest `[data-bg-tone]` rule. */
export function headerColourAt(el: Element, env: ColourEnv = colourEnv()): RGBA {
  const tones = parseToneRules();
  for (let a: Element | null = el; a; a = a.parentElement) {
    if (hasClass(a, 'on-dark')) return { ...env.palette.cream, a: 1 };
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.header) return evalColour(tones[tone].header!, env) ?? { ...env.palette.plum, a: 1 };
  }
  return { ...env.palette.plum, a: 1 }; // :root { --header-color: var(--color-plum) }
}

function envAt(el: Element, base: ColourEnv): ColourEnv {
  const h = headerColourAt(el, base);
  const hex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
  return { palette: base.palette, vars: { ...base.vars, '--header-color': `#${hex(h.r)}${hex(h.g)}${hex(h.b)}` } };
}

function inlineStyleColour(el: Element, prop: 'color' | 'background-color', env: ColourEnv): RGBA | null {
  const style = el.getAttribute('style') ?? '';
  const m = style.match(new RegExp(`(?:^|;)\\s*${prop}\\s*:\\s*([^;]+)`));
  if (!m || m[1].trim() === 'currentColor' || m[1].trim() === 'transparent') return null;
  return evalColour(m[1], env);
}

export type Resolved<T> = { ok: true; value: T } | { ok: false; reason: string };

/** The text colour that applies to text directly inside `el` (before opacity). Translucent colours keep their alpha. */
export function foregroundOf(el: Element, base: ColourEnv = colourEnv()): Resolved<RGBA> {
  const tones = parseToneRules();
  for (let a: Element | null = el; a; a = a.parentElement) {
    const env = envAt(a, base);
    const inline = inlineStyleColour(a, 'color', env);
    if (inline) return { ok: true, value: inline };
    let inherit = false;
    for (const t of baseTokens(a)) {
      const c = colourFromToken('text', t, env);
      if (!c) continue;
      if (c.kind === 'unresolved') return { ok: false, reason: `unresolved text colour ${c.token}` };
      if (c.kind === 'inherit') inherit = true;
      else return { ok: true, value: c.value };
    }
    if (inherit) continue;
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.color) {
      const v = evalColour(tones[tone].color!, env);
      if (v) return { ok: true, value: v };
    }
  }
  return { ok: true, value: { ...base.palette.plum, a: 1 } }; // html { color: var(--color-plum) }
}

/** opacity contributed by `el` itself: opacity-60, opacity-[0.18], inline opacity:.5 (base state only). */
export function ownOpacity(el: Element): number {
  let o = 1;
  for (const t of baseTokens(el)) {
    const m = t.match(/^opacity-(\d+)$/) ?? t.match(/^opacity-\[(0?\.\d+|1)\]$/);
    if (m) o *= m[0].includes('[') ? Number(m[1]) : Number(m[1]) / 100;
  }
  const inline = (el.getAttribute('style') ?? '').match(/(?:^|;)\s*opacity\s*:\s*([\d.]+)/);
  if (inline) o *= Number(inline[1]);
  return o;
}

/** An absolutely positioned element that covers its parent (`absolute inset-0`, or a next/image `fill`). */
function isCoverLayer(c: Element): boolean {
  const toks = baseTokens(c);
  const style = c.getAttribute('style') ?? '';
  const absolute = toks.includes('absolute') || /position:\s*absolute/.test(style);
  const cover = toks.includes('inset-0') || (/width:\s*100%/.test(style) && /height:\s*100%/.test(style));
  return absolute && cover;
}

/**
 * Group opacity on the backdrop supplier or above it fades text AND backdrop together against whatever is
 * behind that group (the backdrop of its parent). Folded into both colours, innermost group first. A group
 * whose parent backdrop is unknowable (a photo) is ignored, so the Expertise pill (`bg-mauve opacity-95`
 * over a photo) keeps its plain 2.26:1.
 */
export function composeGroupOpacity(fg: RGB, bg: RGB, supplier: Element | null, base: ColourEnv = colourEnv()): { fg: RGB; bg: RGB } {
  const mix = (behind: RGB, c: RGB, o: number): RGB => compositeOver({ ...c, a: o }, behind);
  for (let g: Element | null = supplier; g; g = g.parentElement) {
    const o = ownOpacity(g);
    if (o >= 0.999) continue;
    const behind = g.parentElement ? backdropOf(g.parentElement, base) : null;
    if (behind && !behind.ok) continue;
    const behindColour = behind && behind.ok ? behind.value.colour : base.palette.cream;
    fg = mix(behindColour, fg, o);
    bg = mix(behindColour, bg, o);
  }
  return { fg, bg };
}

/**
 * The effective backdrop behind text in `el`: walks up, stacking translucent backgrounds until an
 * opaque one. `faded` is the product of ancestor opacities strictly BELOW the element that supplied
 * the opaque backdrop (they fade the text but not that backdrop); `supplier` is that element, whose own
 * opacity and its ancestors' fade BOTH colours (see `composeGroupOpacity`). `photo` marks a top-level
 * section/footer with no tone and no background of its own: the backdrop is an image we cannot see.
 */
export function backdropOf(el: Element, base: ColourEnv = colourEnv()): Resolved<{ colour: RGB; faded: number; via: string; supplier: Element | null }> | { ok: false; photo: true; reason: string } {
  const tones = parseToneRules();
  const layers: RGBA[] = [];
  let faded = 1;
  for (let a: Element | null = el; a; a = a.parentElement) {
    const env = envAt(a, base);
    let opaque: RGB | null = null;
    let via = '';
    const inline = inlineStyleColour(a, 'background-color', env);
    const layersHere: RGBA[] = [];
    if (inline) layersHere.push(inline);
    for (const t of baseTokens(a)) {
      if (/^(?:bg-gradient|bg-linear|from-|via-|to-)/.test(t) && !t.startsWith('bg-[')) continue;
      const c = colourFromToken('bg', t, env);
      if (!c) continue;
      if (c.kind === 'unresolved') return { ok: false, reason: `unresolved background ${c.token}` };
      if (c.kind === 'colour') layersHere.push(c.value);
    }
    const tone = a.getAttribute('data-bg-tone');
    if (tone && tones[tone]?.bg) {
      const v = evalColour(tones[tone].bg!, env);
      if (v) layersHere.unshift(v);
    }
    // a tone paints before the element's own utilities; within one element the later layer sits on top.
    // `layers` is ordered nearest-to-the-text first, so this element's layers go in reverse.
    const local: RGBA[] = [];
    for (const l of layersHere) {
      if (l.a >= 0.999) {
        opaque = { r: l.r, g: l.g, b: l.b };
        via = tone ? `[data-bg-tone=${tone}]` : 'bg';
        local.length = 0;
      } else if (l.a > 0) local.push(l);
    }
    layers.push(...local.reverse());
    if (a.parentElement) {
      // a full-cover sibling painted behind the content: the hero's `absolute inset-0 bg-plum` field, or a photo.
      // A cover IMAGE wins even over this element's own bg (that bg is only the photo's fallback colour).
      for (const c of Array.from(a.children)) {
        if (c.contains(el) || !isCoverLayer(c)) continue;
        if (c.tagName === 'IMG' || c.querySelector('img')) {
          return { ok: false, photo: true, reason: `photo backdrop (full-cover image beside the text, in ${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''})` };
        }
        if (opaque) continue;
        const own = baseTokens(c).map((t) => colourFromToken('bg', t, envAt(c, base))).find((t) => t?.kind === 'colour' && t.value.a >= 0.999);
        if (own?.kind === 'colour') {
          opaque = { r: own.value.r, g: own.value.g, b: own.value.b };
          via = 'cover sibling bg';
        }
      }
    }
    if (opaque) {
      let colour = opaque;
      for (const l of layers.reverse()) colour = compositeOver(l, colour);
      return { ok: true, value: { colour, faded, via, supplier: a } };
    }
    // a top-level solid card without tone or bg paints nothing: a photo section (hero, CTA band, footer)
    if (a.parentElement?.tagName === 'MAIN' && /^(SECTION|FOOTER)$/.test(a.tagName)) {
      return { ok: false, photo: true, reason: `photo backdrop under ${a.tagName.toLowerCase()}${a.id ? '#' + a.id : ''}` };
    }
    faded *= ownOpacity(a);
  }
  // reached <html>: the page background (html, body { background-color: cream })
  let colour: RGB = base.palette.cream;
  for (const l of layers.reverse()) colour = compositeOver(l, colour);
  return { ok: true, value: { colour, faded, via: 'page', supplier: null } };
}

const HIDING_DISPLAY = /^(?:flex|block|inline|inline-block|inline-flex|grid|inline-grid|contents|table|list-item)$/;
const BREAKPOINTS = ['sm', 'md', 'lg', 'xl', '2xl'];

/** display:none at the mobile (375px) or desktop (1280px) width, from `hidden` plus `md:flex` style overrides. */
export function isHiddenAt(el: Element, viewport: 'mobile' | 'desktop'): boolean {
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
export const isSrOnly = (el: Element) => baseTokens(el).includes('sr-only');

export interface TextStyle { size: number; bold: boolean; typeClass: string | null }

/** Mobile-minimum size and weight of text in `el`: nearest `.type-*` for size (x0.88 per `.font-latin` span), nearest font-bold / type weight for weight. */
export function textStyleOf(el: Element): TextStyle {
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
const hex2 = (c: RGB) => '#' + [c.r, c.g, c.b].map((n) => Math.round(n).toString(16).padStart(2, '0')).join('');
const HAS_LETTER = /[\p{L}\p{N}]/u;

export function whereOf(el: Element): string {
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
  /** page id, `*` wildcards allowed: `home`, `blog`, `blog/*`, `*` */
  page: string;
  /** `#section-id` or landmark tag as reported in the failure; `a|b` lists alternatives */
  where: string;
  /** start of the failing text (after whitespace normalisation); `*` = any text (use it for CMS-driven blog copy, with `type`) */
  text: string;
  /** narrow a `*` entry to one type class, e.g. `type-eyebrow` */
  type?: string;
  /** the ratio measured when the entry was written (+-0.02) */
  ratio: number;
  reason: string;
}

const globToRe = (g: string) => new RegExp('^' + g.split('*').map((p) => p.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');

export const allowMatches = (a: ContrastAllow, f: ContrastFinding) =>
  globToRe(a.page).test(f.page) &&
  a.where.split('|').includes(f.where) &&
  (a.text === '*' || f.text.startsWith(a.text)) &&
  (a.type === undefined || a.type === f.typeClass);

/** New failures (not allow-listed), stale entries (match no failure), and entries whose ratio drifted. Empty arrays = pass. */
export function ratchetContrast(findings: ContrastFinding[], allow: ContrastAllow[]): { fresh: string[]; stale: string[]; drifted: string[] } {
  const label = (f: ContrastFinding) =>
    `[${f.page}] ${f.where} "${f.text}" ${f.ratio}:1 < ${f.required}:1 (${f.fg} on ${f.bg}, ${f.size}px${f.bold ? ' bold' : ''}${f.typeClass ? ' ' + f.typeClass : ''})`;
  const fresh = findings.filter((f) => !allow.some((a) => allowMatches(a, f))).map(label);
  const stale: string[] = [];
  const drifted: string[] = [];
  for (const a of allow) {
    const hits = findings.filter((f) => allowMatches(a, f));
    if (hits.length === 0) stale.push(`stale allow entry, remove it: [${a.page}] ${a.where} "${a.text}"${a.type ? ' ' + a.type : ''} (was ${a.ratio}:1; ${a.reason})`);
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

// ─── Contrast / focus source bans (NS-42) ────────────────────────────────────

export interface BanHit { file: string; path: string; line: number; match: string }

export interface BanRule {
  id: string;
  label: string;
  /** every offence in one source file (the file name decides nothing: allow-tables key on `file`) */
  find(file: SourceFile): BanHit[];
  /** snippets as a .tsx file body: find() MUST flag each of these (positive control) */
  bad: string[];
  /** snippets find() must NOT flag */
  good: string[];
}

const lineOf = (text: string, index: number) => text.slice(0, index).split('\n').length;
const hit = (f: SourceFile, index: number, match: string): BanHit => ({ file: f.name, path: f.path, line: lineOf(f.text, index), match: match.replace(/\s+/g, ' ').trim().slice(0, 80) });

/** Plain regex ban over the whole text of the given file kinds. */
function regexBan(re: RegExp, kinds: RegExp): (f: SourceFile) => BanHit[] {
  return (f) => (kinds.test(f.name) ? [...f.text.matchAll(new RegExp(re.source, re.flags.includes('g') ? re.flags : re.flags + 'g'))].map((m) => hit(f, m.index!, m[0])) : []);
}

/** Class-list-looking string literals in a code file (quotes / backticks; Hebrew prose and sentences are excluded). */
export function classStrings(f: SourceFile): Array<{ index: number; text: string }> {
  const out: Array<{ index: number; text: string }> = [];
  if (!/\.tsx?$/.test(f.name)) return out;
  for (const m of f.text.matchAll(/"([^"]*)"|'([^'\n]*)'|`([^`]*)`/g)) {
    const text = m[1] ?? m[2] ?? m[3] ?? '';
    if (!text.trim() || text.length > 800) continue;
    if (!text.split(/\s+/).filter(Boolean).every((t) => /^[\w:\-[\]/().,%#!&>=*+$@{}~|'\\^"]+$/.test(t))) continue;
    out.push({ index: m.index!, text });
  }
  return out;
}

export interface JsxElement {
  name: string;
  /** index of `<` */
  start: number;
  /** text of the opening tag between the name and `>` (attributes, className expressions, style) */
  attrs: string;
  selfClosing: boolean;
  /** any descendant text: JSX text with a letter/digit, or a `{expression}` child other than a comment / blank string */
  hasText: boolean;
}

/**
 * A small JSX scanner (no dependency on a TS parser): every opening tag with its attribute text and
 * whether it carries text below it. Tolerant by design: `<` counts as a tag only after `( , = ? : & | { > ;`
 * or `return`, which spares generics (`Record<string,...>`) and comparisons.
 */
/** self-closing components whose `label` prop is rendered as visible text */
const LABEL_AS_TEXT = new Set(['NavLink']);

export function scanJsx(text: string): JsxElement[] {
  const out: JsxElement[] = [];
  const stack: Array<{ el: JsxElement }> = [];
  const n = text.length;
  let i = 0;
  const skipString = (j: number): number => {
    const q = text[j];
    j++;
    while (j < n && text[j] !== q) j += text[j] === '\\' ? 2 : 1;
    return j + 1;
  };
  const skipBraces = (j: number): number => {
    // text[j] === '{' ; returns index after the matching '}'
    let depth = 0;
    while (j < n) {
      const ch = text[j];
      if (ch === '"' || ch === "'" || ch === '`') j = skipString(j);
      else if (ch === '/' && text[j + 1] === '/') j = text.indexOf('\n', j) < 0 ? n : text.indexOf('\n', j);
      else if (ch === '/' && text[j + 1] === '*') j = text.indexOf('*/', j) < 0 ? n : text.indexOf('*/', j) + 2;
      else {
        if (ch === '{') depth++;
        if (ch === '}') {
          depth--;
          if (depth === 0) return j + 1;
        }
        j++;
      }
    }
    return n;
  };
  const markText = () => {
    for (const f of stack) f.el.hasText = true;
  };
  while (i < n) {
    const ch = text[i];
    if (ch === '<' && text[i + 1] === '/') {
      const end = text.indexOf('>', i);
      if (stack.length) stack.pop();
      i = end < 0 ? n : end + 1;
      continue;
    }
    if (ch === '<' && /[A-Za-z]/.test(text[i + 1] ?? '')) {
      const before = text.slice(Math.max(0, i - 12), i).trimEnd();
      const last = before.slice(-1);
      const tagLike = stack.length > 0 || before === '' || /[(,=?:&|{>;]/.test(last) || /return$/.test(before);
      if (tagLike) {
        const nameM = text.slice(i + 1).match(/^[A-Za-z][\w.:-]*/)!;
        let j = i + 1 + nameM[0].length;
        const attrStart = j;
        let selfClosing = false;
        while (j < n) {
          const c = text[j];
          if (c === '"' || c === "'" || c === '`') j = skipString(j);
          else if (c === '{') j = skipBraces(j);
          else if (c === '/' && text[j + 1] === '>') { selfClosing = true; break; }
          else if (c === '>') break;
          else j++;
        }
        const attrs = text.slice(attrStart, j);
        // components that render their `label` prop as visible text without children
        const hasText = selfClosing && LABEL_AS_TEXT.has(nameM[0]) && /\blabel=/.test(attrs);
        const el: JsxElement = { name: nameM[0], start: i, attrs, selfClosing, hasText };
        out.push(el);
        i = j + (selfClosing ? 2 : 1);
        if (!selfClosing) stack.push({ el });
        continue;
      }
    }
    if (stack.length) {
      if (ch === '{') {
        const end = skipBraces(i);
        const inner = text.slice(i + 1, end - 1).replace(/\/\*[\s\S]*?\*\//g, '').trim();
        if (inner && !/^(['"`])\s*\1$/.test(inner)) markText();
        i++; // descend: elements inside a .map(...) callback are scanned too
        continue;
      }
      if (/[\p{L}\p{N}]/u.test(ch)) markText();
    }
    i++;
  }
  return out;
}

/**
 * Elements whose class list carries `tokenRe`. A token that lives in a module-level string const
 * (`const PHONE = 'hover:bg-mauve ...'`) is attributed to every element that mentions that const.
 */
export function elementsWithClass(f: SourceFile, tokenRe: RegExp): Array<{ el: JsxElement; token: string }> {
  if (!/\.tsx$/.test(f.name)) return [];
  const els = scanJsx(f.text);
  const re = new RegExp(tokenRe.source, tokenRe.flags.replace('g', ''));
  const out: Array<{ el: JsxElement; token: string }> = [];
  const seen = new Set<JsxElement>();
  const add = (el: JsxElement, token: string) => {
    if (!seen.has(el)) {
      seen.add(el);
      out.push({ el, token });
    }
  };
  for (const el of els) {
    const m = el.attrs.match(new RegExp(tokenRe.source, tokenRe.flags.replace('g', '')));
    if (m) add(el, m[0]);
  }
  for (const m of f.text.matchAll(/\b(?:const|let)\s+([A-Za-z_]\w*)\s*(?::[^=\n]+)?=\s*((?:(?:'[^'\n]*'|"[^"\n]*"|`[^`]*`)\s*\+?\s*)+);/g)) {
    const tok = m[2].match(re);
    if (!tok) continue;
    const name = m[1];
    for (const el of els) if (new RegExp(`(?<![\\w.])${name}(?![\\w])`).test(el.attrs)) add(el, tok[0]);
  }
  return out;
}

const VARIANTS = String.raw`(?:[a-z0-9-]+:)*`;
const TQ = ['type-quote', 'type-title', 'type-display', 'type-card-title', 'type-signature'];

const frag = (body: string) => `export const X = () => (\n${body}\n);\n`;
const fakeFile = (text: string): SourceFile => ({ path: 'src/components/x/Sample.tsx', name: 'Sample.tsx', text });

export const CONTRAST_BANS: BanRule[] = [
  {
    id: 'text-mauve',
    label: 'text-mauve (mauve on cream is 2.26:1, on blush 1.7:1: it has no compliant text pair; use plum)',
    find: regexBan(new RegExp(`(?<![\\w-])${VARIANTS}text-mauve(?:/\\d+)?(?![\\w-])`), /\.tsx?$/),
    bad: ['<p className="type-small text-mauve">x</p>', 'className="hover:text-mauve"', 'text-mauve/80'],
    good: ['<i className="bg-mauve" />', 'border-mauve pr-4', 'ring-mauve', 'text-mauvelous', 'text-plum'],
  },
  {
    id: 'small-text-blush',
    label: 'text-blush below the type-quote scale (blush on plum is 3.89:1: large text only, >=24px, or >=18.67px bold)',
    find: (f) =>
      classStrings(f)
        .filter(({ text }) => new RegExp(`(?<![\\w-])${VARIANTS}text-blush(?![\\w-])`).test(text) && !TQ.some((t) => new RegExp(`(?<![\\w-])${t}(?![\\w-])`).test(text)))
        .map(({ index, text }) => hit(f, index, text)),
    bad: ['<span className="type-eyebrow text-blush">x</span>', '<p className="type-small text-blush">', 'className="font-bold text-blush"', '<p className="type-lead text-blush">', 'className="\n type-body\n text-blush\n"'],
    good: ['<p className="type-quote text-blush w-full">', '<h1 className="type-title text-blush">', '<p className="type-card-title text-blush">', '<i className="bg-blush" />', 'className="type-small text-cream"'],
  },
  {
    id: 'text-colour-mix-transparent',
    label: 'color-mix(... transparent) used as a TEXT colour (a translucent text colour has no fixed contrast: use a solid palette colour)',
    find: (f) => [
      ...regexBan(new RegExp(`(?<![\\w-])${VARIANTS}text-\\[(?:color:)?color-mix\\([^\\]]*transparent`), /\.tsx?$/)(f),
      ...regexBan(/(?<![\w\-[])color\s*:\s*['"`]?color-mix\([^;\n]*transparent/, /\.(?:tsx?|css)$/)(f),
    ],
    bad: ['text-[color:color-mix(in_srgb,var(--color-plum)_70%,transparent)]', 'md:text-[color:color-mix(in_srgb,var(--color-cream)_88%,transparent)]', "style={{ color: 'color-mix(in srgb, red 50%, transparent)' }}", '.x { color: color-mix(in srgb, var(--color-plum) 50%, transparent); }'],
    good: ['outline-[color:color-mix(in_srgb,var(--color-plum)_18%,transparent)]', 'bg-[color:color-mix(in_srgb,var(--color-blush)_28%,var(--color-cream))]', 'hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)]', 'text-[color:var(--header-color)]', '.x { background-color: color-mix(in srgb, red 50%, transparent); }', '--surface-veil: color-mix(in srgb, var(--color-cream) 85%, var(--color-mauve));'],
  },
  {
    id: 'bg-mauve-with-text',
    label: 'bg-mauve on an element that has text inside it (mauve has no compliant text pair: 2.26:1 with cream, 2.46:1 with plum; use plum, cream or blush for the surface)',
    find: (f) => elementsWithClass(f, new RegExp(`(?<![\\w-])${VARIANTS}bg-mauve(?![\\w-])`)).filter(({ el }) => el.hasText).map(({ el }) => hit(f, el.start, `<${el.name}> ${el.attrs}`)),
    bad: [
      frag('<div className="rounded-full bg-mauve px-4"><span className="type-small">{title}</span></div>'),
      frag('<div className="bg-mauve"><p>שלום עולם</p></div>'),
      "const PHONE = 'hover:bg-mauve focus-visible:ring-cream';\n" + frag('<a href="/x" className={cx(BASE, PHONE)}><span>טלפון</span></a>'),
    ],
    good: [
      frag('<span aria-hidden="true" className="h-[3px] w-[44px] rounded-full bg-mauve" />'),
      frag('<div className="absolute bg-mauve"><svg viewBox="0 0 1 1" /></div>'),
      frag('<div className="bg-plum"><p>שלום</p></div>'),
      "const BLOB = 'bg-mauve';\n" + frag('<div className={cx(styles.blob, BLOB)} />'),
    ],
  },
  {
    id: 'opacity-on-text',
    label: 'opacity-* on an element that has text inside it (opacity fades text below its audited contrast; pick a solid palette colour instead)',
    find: (f) => elementsWithClass(f, new RegExp(`(?<![\\w-])${VARIANTS}opacity-(?:\\d+|\\[[\\d.]+\\])(?![\\w-])`)).filter(({ el }) => el.hasText).map(({ el }) => hit(f, el.start, `<${el.name}> ${el.attrs}`)),
    bad: [
      frag('<a href="/x" className="type-lead hover:opacity-80 transition-opacity">שלום</a>'),
      frag('<span className="opacity-60"><b>{name}</b></span>'),
      frag('<Link className="font-bold opacity-[0.6]">{label}</Link>'),
      // NavLink renders its `label` prop as the link text (LABEL_AS_TEXT)
      frag('<NavLink href="/x" label="שלום" className="hover:opacity-75" />'),
    ],
    good: [
      frag('<img src="/a.webp" alt="" className="opacity-60" />'),
      frag('<div className="opacity-[0.18]"><svg viewBox="0 0 1 1" /></div>'),
      frag('<OrganicBg className="opacity-60 z-0" />'),
      frag('<p className="type-body text-plum">שלום</p>'),
      // `label` is only visible text on the components in LABEL_AS_TEXT: a MaskIcon label is an aria-label
      frag('<MaskIcon as="a" href="/x" label="x" src="/i.svg" size="lg" className="hover:opacity-80" />'),
      frag('<NavLink href="/x" className="opacity-60" />'),
    ],
  },
  {
    id: 'focus-outline-none',
    label: 'outline-none without a focus-visible: ring / outline replacement in the same class list (keyboard users lose the focus indicator)',
    find: (f) =>
      classStrings(f)
        .filter(({ text }) => new RegExp(`(?<![\\w-])${VARIANTS}outline-(?:none|hidden)(?![\\w-])`).test(text) && !/(?<![\w-])(?:focus-visible|focus-within|focus):(?:ring-(?!0)[\w[\]/#-]+|outline-(?!none|hidden)[\w[\]/#-]+|outline(?![\w-])|shadow-[\w[\]/#-]+)/.test(text))
        .map(({ index, text }) => hit(f, index, text)),
    bad: ['className="focus:outline-none"', 'className="outline-none"', 'className="rounded-full focus-visible:outline-none"', 'className="focus-visible:outline-none focus-visible:ring-0"', 'className="outline-hidden hover:underline"'],
    good: ['className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"', 'className="focus:outline-none focus:ring-2"', 'className="outline-none focus-visible:outline-2 focus-visible:outline-plum"', 'className="outline outline-[1.5px] outline-plum"', 'className="rounded-full"'],
  },
  {
    id: 'focus-mask-link',
    label: 'a mask-painted link / button (MaskIcon as="a", or an <a>/<button> with mask-image) with no focus-visible: ring or outline (an empty box with a mask has no default focus indicator a keyboard user can see)',
    find: (f) => {
      if (!/\.tsx$/.test(f.name)) return [];
      const hits: BanHit[] = [];
      for (const el of scanJsx(f.text)) {
        const focusOk = /focus-visible:/.test(el.attrs);
        if (el.name === 'MaskIcon' && /\bas=["{']*a["'}]*/.test(el.attrs) && !focusOk) hits.push(hit(f, el.start, `<MaskIcon ${el.attrs}`));
        else if (/^(?:a|button)$/.test(el.name) && /mask-?image|\bmask-\[/i.test(el.attrs) && !focusOk) hits.push(hit(f, el.start, `<${el.name} ${el.attrs}`));
      }
      return hits;
    },
    bad: [
      frag('<MaskIcon as="a" href="/x" label="x" src="/i.svg" size="lg" className="hover:opacity-80" />'),
      frag('<a href="/x" style={{ maskImage: "url(/i.svg)" }} className="w-4 h-4" />'),
    ],
    good: [
      frag('<MaskIcon as="a" href="/x" label="x" src="/i.svg" size="lg" className="focus-visible:ring-2 focus-visible:ring-cream" />'),
      frag('<MaskIcon src="/i.svg" size="sm" />'),
      frag('<a href="/x" className="focus-visible:ring-2">שלום</a>'),
    ],
  },
];

/** MaskIcon's own anchor branch ships a focus-visible: ring/outline: then a bare `<MaskIcon as="a">` usage is fine. */
export function maskIconHasDefaultFocus(): boolean {
  return /focus-visible:/.test(sourceNamed('MaskIcon.tsx').text);
}

export const containsBanSample = (rule: BanRule, sample: string) => rule.find(fakeFile(sample)).length > 0;

export interface BanAllow {
  /** path suffix under src/ (`blog/[slug]/page.tsx`, `AuthorCard.tsx`): a bare name is enough when it is unique, but `page.tsx` is not */
  file: string;
  /** how many offences the file has today */
  count: number;
  reason: string;
}

const allowFor = (allow: BanAllow[], path: string) =>
  allow.filter((a) => path === `src/${a.file}` || path.endsWith(`/${a.file}`)).sort((x, y) => y.file.length - x.file.length)[0];

/** Ratchet for a source ban: more hits than allowed = new offender; fewer (or none) = stale entry. Empty list = pass. */
export function ratchetBan(hits: BanHit[], allow: BanAllow[]): string[] {
  const problems: string[] = [];
  const groups = new Map<string, BanHit[]>();
  for (const h of hits) {
    const key = allowFor(allow, h.path)?.file ?? h.path;
    groups.set(key, [...(groups.get(key) ?? []), h]);
  }
  for (const [key, list] of groups) {
    const allowed = allow.find((a) => a.file === key)?.count ?? 0;
    if (list.length > allowed) {
      problems.push(`new offence in ${key} (${list.length} found, ${allowed} allowed):\n      ${list.map((h) => `${h.path}:${h.line}  ${h.match}`).join('\n      ')}`);
    }
  }
  for (const a of allow) {
    const found = groups.get(a.file)?.length ?? 0;
    if (found === 0) problems.push(`stale allow entry, remove it: ${a.file} (${a.reason})`);
    else if (found < a.count) problems.push(`stale allow entry, lower its count ${a.count} -> ${found}: ${a.file} (${a.reason})`);
  }
  return problems;
}
