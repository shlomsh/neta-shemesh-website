import { describe, it, expect } from 'vitest';
import { pageMeta, DEFAULT_OG_IMAGE } from '@/lib/seo/metadata';

const og = { title: 't', description: 'd' };

describe('pageMeta og:image', () => {
  it('/blog (non-article page with its own openGraph) names the default share image', () => {
    const meta = pageMeta({ title: 'x', description: 'y', path: '/blog', og });
    const images = (meta.openGraph as { images?: unknown[] }).images;
    expect(images).toEqual([DEFAULT_OG_IMAGE]);
    expect(DEFAULT_OG_IMAGE).toMatchObject({ url: '/opengraph-image.png', width: 1200, height: 630 });
    expect(DEFAULT_OG_IMAGE.alt).toBeTruthy();
  });

  it('home page (no path) is explicit too', () => {
    const meta = pageMeta({ title: 'x', description: 'y', og });
    expect((meta.openGraph as { images?: unknown[] }).images).toEqual([DEFAULT_OG_IMAGE]);
  });

  it('articles keep their cover image instead of the default', () => {
    const meta = pageMeta({
      title: 'x', description: 'y', path: '/blog/p', og,
      article: { publishedTime: '2026-06-12', imageUrl: 'https://e.test/c.webp' },
    });
    expect((meta.openGraph as { images?: unknown[] }).images).toEqual([{ url: 'https://e.test/c.webp' }]);
  });
});
