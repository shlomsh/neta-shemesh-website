import { describe, it, expect } from 'vitest';
import { cx } from '@/lib/cx';

describe('cx', () => {
  it('joins truthy parts with single spaces and drops falsy ones', () => {
    expect(cx('a', false, null, undefined, '', 'b')).toBe('a b');
    expect(cx()).toBe('');
  });
});
