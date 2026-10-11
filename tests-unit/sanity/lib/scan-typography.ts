/**
 * SCAN_RULES, typography: ad-hoc sizes, off-scale weights, removed classes, display font set in a component.
 * CLAUDE.md "Typography" rules 1, 2, 7 (no ad-hoc sizes, closed scale, Elamy only via .type-*).
 */
import { BP, type ScanRule } from './scan-types';

export const TYPOGRAPHY_RULES: ScanRule[] = [
  { id: 'px-size', label: 'arbitrary px/number text size  text-[18px]', re: /(?<![\w-])text-\[(?:\d|\.\d|length:|calc\()/,
    bad: ['className="text-[18px]"', 'md:text-[15px]', 'text-[.9rem]'], good: ['text-plum', 'text-[color:var(--header-color)]', 'context-[1]'] },
  { id: 'clamp-size', label: 'clamp() text size  text-[clamp(', re: /(?<![\w-])text-\[clamp\(/,
    bad: ['text-[clamp(1rem,2vw,2rem)]'], good: ['py-[clamp(32px,5vw,64px)]'] },
  { id: 'tw-named-size', label: 'Tailwind named text size (xs/sm/base/lg/xl/2xl..)', re: new RegExp(`(?<![\\w:-])${BP}text-(?:xs|sm|base|lg|xl|[2-9]xl)(?![\\w-])`),
    bad: ['text-sm', 'md:text-xl', 'class="text-xs"'], good: ['text-white/90', 'type-small', 'text-center'] },
  { id: 'font-off-scale', label: 'font-black / font-sans / a weight other than 400 + 700 / numeric font-[600]', re: /(?<![\w-])font-(?:black|sans|thin|extralight|light|medium|semibold|extrabold)(?![\w-])|(?<![\w-])font-\[\d/,
    bad: ['type-display font-black', 'md:font-sans', 'font-medium', 'font-[600]'], good: ['font-bold', 'font-normal', 'font-sans-serif', 'font-[family-name:var(--font-body)]'] },
  { id: 'removed-classes', label: 'template-export classes that were removed (data-body-large, section-header, hero-title, sub-header, contact-email-link)', re: /data-body-large|section-header|hero-title|sub-header|contact-email-link/,
    bad: ['<p data-body-large>', 'className="section-header"', 'contact-email-link'], good: ['data-bg-tone', 'SectionTitle', 'header-color', 'hero-enter', 'subtitle'] },
  { id: 'fontSize-style', label: 'inline fontSize in a style object', re: /\bfontSize\s*:/,
    bad: ["style={{ fontSize: 18 }}", "style={{fontSize:'1rem'}}"], good: ['fontSizeAdjust', "const x = 'font size'"] },
  { id: 'display-font-in-component', label: 'Elamy / display font set directly on a component', re: /(?<![\w-])font-(?:display|elamy)(?![\w-])|family-name:var\(--font-(?:display|elamy)\)|font-\[var\(--font-(?:display|elamy)\)\]|\bfontFamily\b/,
    bad: ['font-display', 'font-[family-name:var(--font-display)]', "style={{ fontFamily: 'x' }}"], good: ['font-[family-name:var(--font-body)]', 'type-title', 'font-displayed'] },
];
