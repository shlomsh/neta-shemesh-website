import { describe, it, expect, vi, afterEach } from 'vitest';
import sitemap from '@/app/sitemap';
import { getAllPosts } from '@/content/posts';

afterEach(() => vi.useRealTimers());

describe('sitemap lastModified', () => {
  it('does not depend on the build clock', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2030-01-01T00:00:00Z'));
    const a = sitemap();
    vi.setSystemTime(new Date('2041-07-07T00:00:00Z'));
    const b = sitemap();
    expect(a).toEqual(b);
    for (const entry of a) {
      expect(entry.lastModified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(String(entry.lastModified)).not.toMatch(/^20(30|41)/);
    }
  });

  it('/blog and / follow the newest post date', () => {
    const newest = getAllPosts().map((p) => p.date).sort().at(-1);
    const entries = sitemap();
    const byPath = (suffix: string) => entries.find((e) => e.url.endsWith(suffix));
    expect(byPath('/blog')?.lastModified).toBe(newest);
    expect(entries[0].lastModified).toBe(newest);
  });
});
