/**
 * SANITY: positive controls for the checkers themselves, run IN MEMORY (mutated strings and DOM
 * fragments, never touching src/). Every predicate/parser the suite relies on must flag a known-bad
 * sample and spare a known-good one; otherwise a green suite could simply mean a blind checker.
 * (Regex scan rules carry their own samples and are exercised in source-scan.test.ts.)
 */
import { describe, expect, it } from 'vitest';
import {
  EXPECTED_SECTIONS,
  buttons,
  coversImage,
  cssVar,
  desktopNav,
  displayFontSelectors,
  findTargetSelector,
  globalsCss,
  hamburger,
  hasMinScreen,
  isFlexColumn,
  isFlexContainer,
  isGrowItem,
  isHeightDrivenFrame,
  isOneScreen,
  isSurfaceBg,
  keepsAspectAtDesktop,
  kindOf,
  matchesSpec,
  minHeightKind,
  oneScreenMode,
  overflowOf,
  parseExportedNumber,
  parseToneRules,
  parseTypeRules,
  sizeRange,
  stripCssComments,
  subtitleOf,
  textNodes,
  toneOf,
  typeClassesOf,
} from './helpers';

function frag(html: string): HTMLElement {
  const d = document.createElement('div');
  d.innerHTML = html;
  return d;
}
const first = (html: string) => frag(html).firstElementChild as HTMLElement;

describe('source parsers tolerate formatting', () => {
  it.each([
    ['export const MIN_WIDTH = 1024;', 1024],
    ['export const MIN_WIDTH: number = 1024;', 1024],
    ['export const MIN_WIDTH = 1024', 1024],
    ['export   const   MIN_WIDTH   =   1024  ;', 1024],
    ['export const MIN_WIDTH=1024;', 1024],
    ['export const THRESHOLD = 0.3;', null], // other constant
  ])('parseExportedNumber(%j)', (text, want) => {
    expect(parseExportedNumber(text, 'MIN_WIDTH')).toBe(want);
  });

  it.each([
    ["document.querySelectorAll<HTMLElement>('main > section')", 'main > section'],
    ['document.querySelectorAll("main > section")', 'main > section'],
    ['document.querySelectorAll(`main > section`)', 'main > section'],
    ['const x = document.querySelectorAll("a"); document.querySelectorAll( \'main > section, main > footer\' )', 'main > section, main > footer'],
  ])('findTargetSelector(%j)', (text, want) => {
    expect(findTargetSelector(text)).toBe(want);
  });

  it('findTargetSelector returns undefined when no section selector exists', () => {
    expect(findTargetSelector("document.querySelectorAll('a')")).toBeUndefined();
  });
});

describe('css parsers detect in-memory mutations of globals.css', () => {
  const css = globalsCss();

  it('type-scale: a lowered .type-quote clamp min and a swapped family are visible to parseTypeRules', () => {
    expect(sizeRange(parseTypeRules(css).get('quote')!.size)).toEqual({ min: 24, max: 32 });
    const lowered = css.replace('font-size: clamp(24px, 3vw, 32px);', 'font-size: clamp(20px, 3vw, 32px);');
    expect(lowered).not.toBe(css);
    expect(sizeRange(parseTypeRules(lowered).get('quote')!.size)).toEqual({ min: 20, max: 32 });
    const swapped = css.replace('.type-quote {\n    font-family: var(--font-body);', '.type-quote {\n    font-family: var(--font-display);');
    expect(swapped).not.toBe(css);
    expect(parseTypeRules(swapped).get('quote')!.family).toBe('var(--font-display)');
  });

  it('tones: a changed mid background is visible to parseToneRules', () => {
    expect(parseToneRules(css).mid.bg).toBe('var(--color-mauve)');
    const mutated = css.replace('background-color: var(--color-mauve);', 'background-color: var(--color-blush);');
    expect(mutated).not.toBe(css);
    expect(parseToneRules(mutated).mid.bg).toBe('var(--color-blush)');
  });

  it('displayFontSelectors catches Elamy on a non-display class and ignores comments', () => {
    const bad = css + '\n.type-lead { font-family: var(--font-display); }';
    expect(displayFontSelectors(bad)).toContain('.type-lead');
    const commented = css + '\n/* .type-lead { font-family: var(--font-display); } */';
    expect(displayFontSelectors(commented)).not.toContain('.type-lead');
  });

  it('cssVar returns the last declaration and stripCssComments removes comments', () => {
    expect(cssVar('a{--x: 1;} b{--x: 2;}', '--x')).toBe('2');
    expect(stripCssComments('a /* x { y } */ b')).toBe('a  b');
  });

  it('sizeRange handles clamp, fixed px, and rejects anything else', () => {
    expect(sizeRange('clamp(40px, 9vw, 72px)')).toEqual({ min: 40, max: 72 });
    expect(sizeRange('14px')).toEqual({ min: 14, max: 14 });
    expect(sizeRange('1.2rem')).toBeNull();
    expect(sizeRange(undefined)).toBeNull();
  });
});

describe('one-screen / structure predicates', () => {
  it.each([
    ['min-h-[100svh] lg:h-[max(100svh,720px)] lg:py-12', 'lock-720', true],
    ['min-h-[100svh] lg:h-[100svh] lg:py-12', 'lock-100', true],
    ['min-h-[100svh] lg:min-h-[max(100svh,720px)] lg:py-12', 'grow-720', true],
    ['min-h-[100svh] flex', 'free', false],
    ['lg:h-[max(100svh,720px)] lg:py-12', 'lock-720', false], // lost the all-breakpoint min-h
    ['min-h-[100svh] lg:h-[max(100svh,720px)]', 'lock-720', false], // lost lg:py-12
  ])('section class "%s" -> mode %s, isOneScreen %s', (cls, mode, one) => {
    const el = first(`<section class="${cls}"></section>`);
    expect(oneScreenMode(el)).toBe(mode);
    expect(isOneScreen(el)).toBe(one);
  });

  it('hasMinScreen, isGrowItem, isFlexContainer, isFlexColumn, minHeightKind, overflowOf, coversImage', () => {
    expect(hasMinScreen(first('<div class="min-h-[100svh]"></div>'))).toBe(true);
    expect(hasMinScreen(first('<div class="lg:min-h-[100svh]"></div>'))).toBe(false);
    expect(isGrowItem(first('<div class="lg:flex-1"></div>'))).toBe(true);
    expect(isGrowItem(first('<div class="flex-1"></div>'))).toBe(false);
    expect(isFlexContainer(first('<div class="lg:flex"></div>'))).toBe(true);
    expect(isFlexContainer(first('<div class="grid"></div>'))).toBe(false);
    expect(isFlexColumn(first('<div class="flex flex-col"></div>'))).toBe(true);
    expect(isFlexColumn(first('<div class="flex"></div>'))).toBe(false);
    expect(minHeightKind(first('<div class="lg:min-h-0"></div>'))).toBe('zero');
    expect(minHeightKind(first('<div class="lg:min-h-[320px]"></div>'))).toBe('floor-320');
    expect(minHeightKind(first('<div class="min-h-0"></div>'))).toBeNull();
    expect(overflowOf(first('<main class="overflow-clip"></main>'))).toBe('clip');
    expect(overflowOf(first('<main class="overflow-hidden"></main>'))).toBe('hidden');
    expect(overflowOf(first('<main class=""></main>'))).toBeNull();
    expect(coversImage(first('<img class="object-cover">'))).toBe(true);
    expect(coversImage(first('<img class="object-contain">'))).toBe(false);
  });

  it('frames: height-driven vs an aspect ratio left on at lg', () => {
    expect(isHeightDrivenFrame(first('<div class="aspect-[4/5] lg:aspect-auto"></div>'))).toBe(true);
    expect(isHeightDrivenFrame(first('<div class="h-full"></div>'))).toBe(true);
    expect(isHeightDrivenFrame(first('<div class="aspect-[4/5]"></div>'))).toBe(false);
    expect(keepsAspectAtDesktop(first('<div class="aspect-[4/5]"></div>'))).toBe(true);
    expect(keepsAspectAtDesktop(first('<div class="aspect-square"></div>'))).toBe(true);
    expect(keepsAspectAtDesktop(first('<div class="aspect-[4/5] lg:aspect-auto"></div>'))).toBe(false);
    expect(keepsAspectAtDesktop(first('<div class="h-full"></div>'))).toBe(false);
  });

  it.each([
    ['bg-[var(--surface-veil)]', true],
    ['bg-[var(--color-cream)]', true],
    ['bg-[var(--color-dark)]', true],
    ['bg-black/20', true],
    ['bg-gradient-to-t', true],
    ['bg-[#123456]', true],
    ['bg-cover', false],
    ['bg-center', false],
    ['bg-no-repeat', false],
    ['bg-transparent', false],
    ['bg-fixed', false],
  ])('isSurfaceBg(%s) = %s', (token, want) => {
    expect(isSurfaceBg(token)).toBe(want);
  });
});

describe('DOM recognisers', () => {
  it('subtitleOf: sibling <p>, wrapped <p>, <p> inside a card wrapper; null when the next block is running copy with several children', () => {
    expect(subtitleOf(first('<div><h2>t</h2><p id="s">x</p></div>').querySelector('h2')!)?.id).toBe('s');
    expect(subtitleOf(first('<div><div><h2>t</h2></div><div><p id="s">x</p></div></div>').querySelector('h2')!)?.id).toBe('s');
    expect(subtitleOf(first('<div><div><h2>t</h2></div><div><div class="card"><p id="s">x</p></div></div></div>').querySelector('h2')!)?.id).toBe('s');
    expect(subtitleOf(first('<div><h2>t</h2><div><p>a</p><p>b</p></div></div>').querySelector('h2')!)).toBeNull();
    expect(subtitleOf(first('<div><h2>t</h2></div>').querySelector('h2')!)).toBeNull();
  });

  it('typeClassesOf / toneOf / kindOf', () => {
    expect(typeClassesOf(first('<p class="type-lead font-bold text-center"></p>'))).toEqual(['type-lead']);
    expect(typeClassesOf(first('<p class="type-body type-lead"></p>'))).toEqual(['type-body', 'type-lead']);
    expect(typeClassesOf(first('<p class="mytype-lead"></p>'))).toEqual([]);
    const tree = first('<section data-bg-tone="mid"><div data-bg-tone="cream"><p id="p">x</p></div><p id="q">y</p></section>');
    expect(toneOf(tree.querySelector('#p'))).toBe('cream');
    expect(toneOf(tree.querySelector('#q'))).toBe('mid');
    expect(toneOf(first('<p></p>'))).toBeNull();
    expect(kindOf(first('<section></section>'))).toBe('photo');
    expect(kindOf(tree)).toBe('mid');
  });

  it('matchesSpec: id first, heading fallback survives an id rename, footer by tag', () => {
    const spec = EXPECTED_SECTIONS.find((s) => s.name === 'services')!;
    expect(matchesSpec(first(`<section id="${spec.ids[0]}"><h2>x</h2></section>`), spec)).toBe(true);
    expect(matchesSpec(first('<section id="services"><h2>איך זה עובד?</h2></section>'), spec)).toBe(true);
    expect(matchesSpec(first('<section id="other"><h2>אחר</h2></section>'), spec)).toBe(false);
    const footer = EXPECTED_SECTIONS.find((s) => s.name === 'footer')!;
    expect(matchesSpec(first('<footer></footer>'), footer)).toBe(true);
    expect(matchesSpec(first('<section></section>'), footer)).toBe(false);
  });

  it('buttons() recognises ButtonLinks and not plain links or FAB halves', () => {
    const root = frag(
      '<a id="b" class="type-lead inline-flex whitespace-nowrap rounded-full min-h-[48px]" href="#c">x</a>' +
        '<a id="n" class="type-lead font-bold" href="#a">y</a>' +
        '<a id="f" class="rounded-s-full md:rounded-full" href="#w">z</a>',
    );
    expect(buttons(root).map((a) => a.id)).toEqual(['b']);
  });

  it('desktopNav / hamburger: found when correct, null when the hidden md:flex or md:hidden pairing is lost', () => {
    const good = frag('<nav aria-label="x" class="hidden md:flex"><a>1</a></nav><button aria-controls="mobile-menu" class="md:hidden"></button>');
    expect(desktopNav(good)).not.toBeNull();
    expect(hamburger(good)).not.toBeNull();
    const bad = frag('<nav aria-label="x" class="flex"><a>1</a></nav><button aria-controls="mobile-menu" class="inline-flex"></button>');
    expect(desktopNav(bad)).toBeNull();
    expect(hamburger(bad)).toBeNull();
  });

  it('textNodes skips whitespace-only nodes', () => {
    const root = first('<div>  <p>a</p>\n <span> </span><b>b</b></div>');
    expect(textNodes(root).map((n) => n.textContent)).toEqual(['a', 'b']);
  });
});
