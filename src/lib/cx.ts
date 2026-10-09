/**
 * Join class names, skipping falsy values.
 *
 *   cx('a', cond && 'b', undefined, 'c')  // 'a b c' (or 'a c' when cond is false)
 *
 * Deliberately tiny (no tailwind-merge): avoid conflicting utilities by construction.
 * Use it for every conditional or composed class list instead of template literals or `.join(' ')`.
 */
export const cx = (...parts: Array<string | false | null | undefined>): string =>
  parts.filter(Boolean).join(' ');
