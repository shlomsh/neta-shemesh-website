/**
 * Join class names, skipping falsy values.
 *
 *   cx('a', cond && 'b', undefined, 'c')  // 'a b c' (or 'a c' when cond is false)
 *
 * Deliberately tiny (no tailwind-merge): avoid conflicting utilities by construction.
 * Not adopted by any component yet; tech-debt batch 3 migrates the primitives to it.
 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');
