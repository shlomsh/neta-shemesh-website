/**
 * SCAN_RULES, colour: stock palette, arbitrary colour vars, white utilities, hex literals.
 * CLAUDE.md "Color": four colours only, `--color-white` is cream, theme utilities not `[var(--color-*)]`.
 */
import type { ScanRule } from './scan-types';

export const COLOUR_RULES: ScanRule[] = [
  { id: 'stock-palette', label: 'stock Tailwind palette colour', re: /(?<![\w-])(?:bg|text|border|ring|outline|fill|stroke|from|via|to|divide|decoration|shadow)-(?:red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose|slate|gray|zinc|neutral|stone)-\d{2,3}/,
    bad: ['bg-red-500', 'text-gray-600'], good: ['bg-plum', 'text-cream', 'bg-black/20'] },
  { id: 'arbitrary-colour-var', label: 'arbitrary colour utility  text-[var(--color-plum)]  (use the theme utility: text-plum, bg-cream, ring-mauve ...)',
    re: /(?<![\w-])(?:text|bg|border|ring-offset|ring|outline|fill|stroke|from|via|to|decoration|divide|caret|accent|shadow)-\[(?:color:)?var\(--color-[a-z-]+\)\]/,
    bad: ['text-[var(--color-plum)]', 'focus-visible:ring-[var(--color-white)]', 'hover:outline-[color:var(--color-mauve)]'],
    good: ['text-plum', 'bg-cream/35', 'bg-[var(--surface-veil)]', 'text-[color:var(--header-color)]', 'hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)]'] },
  { id: 'white-utility', label: 'named white utility  text-white / bg-white / ring-white  (bg-white is pure #fff; use the -cream utility)',
    re: /(?<![\w-])(?:text|bg|border|ring-offset|ring|outline|fill|stroke|from|via|to|decoration|divide|caret|accent)-white(?![\w-])/,
    bad: ['text-white', 'rounded-card bg-white shadow-sm', 'bg-white/35', 'lg:hover:text-white', 'focus-visible:ring-offset-white'],
    good: ['text-cream', 'bg-cream/35', 'bg-whitesmoke', 'on-white'] },
  { id: 'hex', label: 'hex colour literal', re: /#[0-9a-fA-F]{3,8}\b/, bad: ['bg-[#123456]', '#ABC', 'color:#fff5f0'], good: ['var(--color-plum)', 'issue #4', 'url(#grad)'] },
];
