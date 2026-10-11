/**
 * Class-list string literals in code that carry a `.type-*` class, and the per-literal offences (stacked type classes,
 * font-latin or leading/tracking overrides next to one). CLAUDE.md "Type Scale" rules 5 and 7.
 */
import { classStrings, type SourceFile } from './source';

/** class-list-ish string literals in code that carry a type-* class (backticks, quotes; Hebrew prose excluded) */
export function classLiterals(files: SourceFile[]): Array<{ file: string; text: string }> {
  return files.flatMap((f) => classStrings(f, 600).filter(({ text }) => /\btype-[a-z]/.test(text)).map(({ text }) => ({ file: f.path, text })));
}

const TYPE_TOKEN = /(?<![\w-])type-(?:display|title|card-title|quote|lead|body|small|read-lead|read|eyebrow|signature)(?![\w-])/g;

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
