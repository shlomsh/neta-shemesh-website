/**
 * public/llms.txt is a static file, so its facts are guarded here against the single sources
 * (content/site.ts, the posts registry, the expertise cards): editing one without the other fails.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import { getAllPosts } from '@/content/posts';
import { PRODUCTION_URL, SITE } from '@/content/site';

const txt = readFileSync(join(process.cwd(), 'public/llms.txt'), 'utf8');

describe('public/llms.txt', () => {
  it('opens with the llms.txt H1 and blockquote summary', () => {
    expect(txt).toMatch(/^# .+\n\n> .+/);
  });

  it('carries the site facts from SITE', () => {
    for (const fact of [
      SITE.name,
      SITE.phone.display,
      SITE.phone.e164,
      SITE.email,
      SITE.address.street,
      SITE.address.city,
      SITE.address.postalCode,
    ]) {
      expect(txt).toContain(fact);
    }
  });

  it('links every blog post and the sitemap on the production domain', () => {
    for (const post of getAllPosts()) {
      expect(txt).toContain(`${PRODUCTION_URL}/blog/${post.slug}`);
    }
    expect(txt).toContain(`${PRODUCTION_URL}/sitemap.xml`);
  });

  it('lists every service area', () => {
    for (const card of EXPERTISE_CARDS) expect(txt).toContain(card.title);
  });

  it('only links to the production domain', () => {
    const urls = txt.match(/https?:\/\/[^\s)]+/g) ?? [];
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) expect(url.startsWith(PRODUCTION_URL)).toBe(true);
  });
});
