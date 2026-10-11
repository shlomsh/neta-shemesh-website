/**
 * NS-42 source bans for contrast and focus (text-mauve, small text-blush, translucent text, outline-none without a ring)
 * and the ratchet that lets a ban carry a shrink-only allow table. CLAUDE.md "Color" contrast pairs. Each rule has
 * bad/good samples checked by source-scan.test.ts.
 */
import { classStrings, type SourceFile } from './source';

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


const VARIANTS = String.raw`(?:[a-z0-9-]+:)*`;
const TQ = ['type-quote', 'type-title', 'type-display', 'type-card-title', 'type-signature'];
const fakeFile = (text: string): SourceFile => ({ path: 'src/components/x/Sample.tsx', name: 'Sample.tsx', text });

/**
 * Source-level contrast and focus bans. The rendered contrast matrix (contrast.test.tsx) is the main guard
 * (it measures what ships); these catch the spellings it cannot see: code that is not rendered on a measured
 * page, and translucent text or removed focus indicators that still pass a ratio.
 */
export const CONTRAST_BANS: BanRule[] = [
  {
    id: 'text-mauve',
    label: 'text-mauve (mauve on cream is 2.26:1, on plum 2.46:1: it has no compliant text pair; use plum)',
    find: regexBan(new RegExp(`(?<![\\w-])${VARIANTS}text-mauve(?:/\\d+)?(?![\\w-])`), /\.tsx?$/),
    bad: ['<p className="type-small text-mauve">x</p>', 'className="hover:text-mauve"', 'text-mauve/80'],
    good: ['<i className="bg-mauve" />', 'border-mauve pr-4', 'text-mauvelous', 'text-plum'],
  },
  {
    id: 'small-text-blush',
    label: 'text-blush below the type-quote scale (blush on plum is 3.89:1: large text only, >=24px, or >=18.67px bold)',
    find: (f) =>
      classStrings(f)
        .filter(({ text }) => new RegExp(`(?<![\\w-])${VARIANTS}text-blush(?![\\w-])`).test(text) && !TQ.some((t) => new RegExp(`(?<![\\w-])${t}(?![\\w-])`).test(text)))
        .map(({ index, text }) => hit(f, index, text)),
    bad: ['<span className="type-eyebrow text-blush">x</span>', 'className="font-bold text-blush"', '<p className="type-lead text-blush">'],
    good: ['<p className="type-quote text-blush w-full">', '<h1 className="type-title text-blush">', '<i className="bg-blush" />', 'className="type-small text-cream"'],
  },
  {
    id: 'text-colour-mix-transparent',
    label: 'a translucent TEXT colour (color-mix(... transparent), text-plum/92): it has no fixed contrast; use a solid palette colour',
    find: (f) => [
      ...regexBan(new RegExp(`(?<![\\w-])${VARIANTS}text-\\[(?:color:)?color-mix\\([^\\]]*transparent`), /\.tsx?$/)(f),
      // the Tailwind opacity-modifier spelling of the same thing: text-plum/92, md:text-cream/90 (a /N below 100)
      ...regexBan(new RegExp(`(?<![\\w-])${VARIANTS}text-(?:plum|mauve|blush|cream|white|black)/(?:\\d{1,2}|\\[[^\\]]+\\])(?![\\w%-])`), /\.tsx?$/)(f),
      ...regexBan(/(?<![\w\-[])color\s*:\s*['"`]?color-mix\([^;\n]*transparent/, /\.(?:tsx?|css)$/)(f),
    ],
    bad: ['text-[color:color-mix(in_srgb,var(--color-plum)_70%,transparent)]', "style={{ color: 'color-mix(in srgb, red 50%, transparent)' }}", 'text-plum/92', 'md:text-cream/90'],
    good: ['bg-plum/60', 'text-plum', 'text-cream/100', 'outline-[color:color-mix(in_srgb,var(--color-plum)_18%,transparent)]', 'text-[color:var(--header-color)]', '.x { background-color: color-mix(in srgb, red 50%, transparent); }'],
  },
  {
    id: 'focus-outline-none',
    label: 'outline-none without a focus-visible: ring / outline replacement in the same class list (keyboard users lose the focus indicator)',
    find: (f) =>
      classStrings(f)
        .filter(({ text }) => new RegExp(`(?<![\\w-])${VARIANTS}outline-(?:none|hidden)(?![\\w-])`).test(text) && !/(?<![\w-])(?:focus-visible|focus-within|focus):(?:ring-(?!0)[\w[\]/#-]+|outline-(?!none|hidden)[\w[\]/#-]+|outline(?![\w-])|shadow-[\w[\]/#-]+)/.test(text))
        .map(({ index, text }) => hit(f, index, text)),
    bad: ['className="focus:outline-none"', 'className="rounded-full focus-visible:outline-none"', 'className="focus-visible:outline-none focus-visible:ring-0"'],
    good: ['className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cream"', 'className="outline-none focus-visible:outline-2 focus-visible:outline-plum"', 'className="outline outline-[1.5px] outline-plum"'],
  },
];

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
