/**
 * SCAN_RULES, code: Google Fonts fetches and `dir="rtl"` below <html>.
 * CLAUDE.md "Code rules" (Fonts: next/font/local only; RTL: only <html> has dir="rtl").
 */
import type { ScanRule } from './scan-types';

export const CODE_RULES: ScanRule[] = [
  { id: 'google-fonts', label: 'Google Fonts fetch (breaks the Vercel prod build)', re: /next\/font\/google|fonts\.googleapis|fonts\.gstatic/,
    bad: ['import { Roboto } from "next/font/google"', 'https://fonts.googleapis.com/css'], good: ['next/font/local'] },
  { id: 'rtl-dir', label: 'dir="rtl" below <html> (the page is already rtl; keep dir="ltr" for phone / email / Latin)',
    re: /\bdir=(?:"rtl"|'rtl'|\{\s*["'`]rtl["'`]\s*\})/,
    bad: ['<header dir="rtl" className="x">', "<div dir='rtl'>", "<Section dir={'rtl'}>"],
    good: ['<span dir="ltr">', '<html lang="he">', 'direction: rtl', 'dir={undefined}', 'cardir="rtlx"'] },
];
