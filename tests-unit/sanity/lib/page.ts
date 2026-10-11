/**
 * The real home page and its expected structure: EXPECTED_SECTIONS (rotation order, literal ids), the
 * server-rendered `renderHome()`, section finders, SUBTITLES and the title/subtitle lockup, buttons and nav.
 * CLAUDE.md "Type Scale" rule 8 (subtitle) and "Section primitive" (tone rotation).
 */
import React from 'react';
import { classTokens, hasClass } from './dom';

export type Tone = 'dark' | 'mid' | 'light' | 'cream';

/** Top-level kind: a tone, or 'photo' for sections that carry no data-bg-tone (hero, CTA band, footer). */
export function kindOf(section: Element): Tone | 'photo' {
  return (section.getAttribute('data-bg-tone') as Tone | null) ?? 'photo';
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

function headingTextOf(section: Element): string {
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
  /** max-w-prose (Tailwind's own 65ch) required (Services' 320-400px column never reaches 65ch, so it has none) */
  needsMaxWidth: boolean;
}

export const SUBTITLES: SubtitleSpec[] = [
  { section: 'expertise', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
  { section: 'about-gallery', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
  // Exception: more room under the title for the Elamy "?" descender in "איך זה עובד?".
  { section: 'services', margin: ['mt-5', 'md:mt-9'], needsMaxWidth: false },
  { section: 'cta-band', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
  { section: 'testimonials-gallery', margin: ['mt-3', 'md:mt-4'], needsMaxWidth: true },
];

// ─── Buttons and nav ─────────────────────────────────────────────────────────

/** A ButtonLink = pill anchor with the shared base (rounded-full + whitespace-nowrap). */
export function buttons(root: ParentNode): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>('a')).filter((a) => hasClass(a, 'rounded-full') && hasClass(a, 'whitespace-nowrap'));
}
/** button height comes from min-h alone: sm = min-h-12 (48px at the default root), md = min-h-14 (56px) */
export const buttonHeightToken = (a: Element): 'min-h-12' | 'min-h-14' | null =>
  hasClass(a, 'min-h-12') ? 'min-h-12' : hasClass(a, 'min-h-14') ? 'min-h-14' : null;
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
