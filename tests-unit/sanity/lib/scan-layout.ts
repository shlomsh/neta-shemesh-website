/**
 * SCAN_RULES, layout: hand-written card height units and CSS scroll-snap (plus the one allowed snap rule).
 * CLAUDE.md "Layout": `--card-h` owns the unit; soft snap only at >=1024px with a fine pointer, no touch snap.
 */
import { BP, type ScanRule } from './scan-types';

/**
 * The ONE scroll-snap rule the site ships (globals.css): home cards, desktop, fine pointer, no reduced motion, scoped by
 * `main[data-snap-cards]` (home only). The `css-scroll-snap` ban removes exactly this block before it scans, so touch snap,
 * an unscoped rule, or snap in any other file still fails.
 */
export const SNAP_RULE =
  /@media \(min-width: 1024px\) and \(pointer: fine\) and \(prefers-reduced-motion: no-preference\) \{\s*html:has\(main\[data-snap-cards\]\) \{ scroll-snap-type: y mandatory; \}\s*main\[data-snap-cards\] > section,\s*main\[data-snap-cards\] > footer \{ scroll-snap-align: start; scroll-snap-stop: always; \}\s*\}/;

export const LAYOUT_RULES: ScanRule[] = [
  { id: 'card-height', label: 'a hand-written card height unit: h-screen, ungated h-[100svh], min-h-[100svh], *-lvh / *-dvh (use <Section fit> / screen-fit / screen-visible; --card-h owns the unit)',
    re: new RegExp([`(?<!\\w)${BP}(?:min-|max-)?h-screen(?![\\w-])`, String.raw`(?<![\w:-])h-\[100svh\]`, String.raw`(?<![\w-])(?:[a-z0-9-]+:)*min-h-\[100svh\]`, String.raw`(?<![\w-])(?:[a-z0-9-]+:)*(?:min-|max-)?h-(?:lvh|dvh|\[100[ld]vh\])`].join('|')),
    bad: ['h-screen', 'min-h-screen', 'flex h-[100svh] w-full', 'lg:min-h-[100svh]', 'max-lg:min-h-lvh', 'supports-[height:100dvh]:min-h-dvh', 'h-[100dvh]'],
    good: ['lg:h-[100svh]', 'lg:h-[max(100svh,720px)]', 'lg:min-h-[max(100svh,720px)]', 'min-h-12', 'h-screenful', 'screen-fit'] },
  { id: 'css-scroll-snap', label: 'CSS scroll-snap outside the one desktop fine-pointer home rule in globals.css (SNAP_RULE); no touch snap', re: /scroll-snap-type|scrollSnapType|\bsnap-(?:x|y|both|mandatory|proximity)\b/,
    bad: ['scroll-snap-type: y mandatory', 'snap-y snap-mandatory', "scrollSnapType: 'y'"], good: ['scroll-snap-align: start', 'data-snap-cards', 'scroll-behavior: smooth'] },
];
