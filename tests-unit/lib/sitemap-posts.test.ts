/**
 * NS-21: the sitemap lists the home page, the blog index and EVERY post, with no unknown slugs,
 * no duplicates, and only absolute URLs on the site origin. (lastModified behaviour: sitemap.test.ts.)
 */
import { describe, expect, it } from 'vitest';
import sitemap from '@/app/sitemap';
import { getAllPosts } from '@/content/posts';
import { SITE } from '@/content/site';

describe('sitemap contents', () => {
  const entries = sitemap();
  const urls = entries.map((e) => e.url);

  it('lists the home page first, then the blog index', () => {
    expect(urls[0]).toBe(`${SITE.url}/`);
    expect(urls[1]).toBe(`${SITE.url}/blog`);
  });

  it('lists every post exactly once', () => {
    for (const post of getAllPosts()) {
      expect(urls.filter((u) => u === `${SITE.url}/blog/${post.slug}`), post.slug).toHaveLength(1);
    }
  });

  it('has no unknown slugs: every /blog/<slug> entry is a real post', () => {
    const known = new Set(getAllPosts().map((p) => p.slug));
    const postUrls = urls.filter((u) => u.startsWith(`${SITE.url}/blog/`));
    expect(postUrls).toHaveLength(known.size);
    for (const u of postUrls) expect(known.has(u.slice(`${SITE.url}/blog/`.length)), u).toBe(true);
  });

  it('has exactly home + index + posts, with no duplicate URLs', () => {
    expect(entries).toHaveLength(2 + getAllPosts().length);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('every URL is absolute on the site origin', () => {
    for (const u of urls) expect(new URL(u).origin, u).toBe(new URL(SITE.url).origin);
  });

  it('each post entry is dated from the post and has a valid priority', () => {
    for (const post of getAllPosts()) {
      const entry = entries.find((e) => e.url === `${SITE.url}/blog/${post.slug}`)!;
      expect(entry.lastModified).toBe(post.date.slice(0, 10));
    }
    for (const e of entries) {
      expect(e.priority).toBeGreaterThan(0);
      expect(e.priority).toBeLessThanOrEqual(1);
    }
  });
});
