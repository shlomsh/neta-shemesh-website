/**
 * NS-21: SEO plumbing in src/lib/seo beyond the og:image cases in seo-metadata.test.ts:
 * pageMeta (canonical, hreflang, openGraph, twitter) and the JSON-LD builders.
 */
import { describe, expect, it } from 'vitest';
import { pageMeta } from '@/lib/seo/metadata';
import { blogPostingJsonLd, siteJsonLd } from '@/lib/seo/jsonld';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import { getAllPosts } from '@/content/posts';
import { SITE } from '@/content/site';

const og = { title: 'og t', description: 'og d' };
const base = { title: 'the title', description: 'the description', og };

describe('pageMeta', () => {
  it('passes title and description through', () => {
    const m = pageMeta(base);
    expect(m.title).toBe('the title');
    expect(m.description).toBe('the description');
  });

  it('canonical is SITE.url + path; the home page (no path) is the bare site URL', () => {
    expect(pageMeta(base).alternates?.canonical).toBe(SITE.url);
    expect(pageMeta({ ...base, path: '/blog' }).alternates?.canonical).toBe(`${SITE.url}/blog`);
    expect(pageMeta({ ...base, path: '/blog/x' }).alternates?.canonical).toBe(`${SITE.url}/blog/x`);
  });

  it('hreflang adds the he-IL alternate pointing at the same URL; off by default', () => {
    expect(pageMeta(base).alternates?.languages).toBeUndefined();
    expect(pageMeta({ ...base, path: '/blog', hreflang: true }).alternates?.languages).toEqual({
      'he-IL': `${SITE.url}/blog`,
    });
  });

  it('website openGraph uses the og copy, he_IL locale, site name and the page URL', () => {
    const m = pageMeta({ ...base, path: '/blog' });
    expect(m.openGraph).toMatchObject({
      type: 'website',
      url: `${SITE.url}/blog`,
      title: 'og t',
      description: 'og d',
      locale: 'he_IL',
      siteName: SITE.name,
    });
    expect((m.openGraph as { publishedTime?: string }).publishedTime).toBeUndefined();
  });

  it('article openGraph is type article with the published time and keeps the shared fields', () => {
    const m = pageMeta({
      ...base,
      path: '/blog/p',
      article: { publishedTime: '2026-06-12', imageUrl: 'https://e.test/c.webp' },
    });
    expect(m.openGraph).toMatchObject({
      type: 'article',
      url: `${SITE.url}/blog/p`,
      publishedTime: '2026-06-12',
      locale: 'he_IL',
      siteName: SITE.name,
    });
  });

  it('twitter card is only emitted when asked for, as summary_large_image', () => {
    expect(pageMeta(base).twitter).toBeUndefined();
    expect(pageMeta({ ...base, twitter: { title: 'tw t', description: 'tw d' } }).twitter).toEqual({
      card: 'summary_large_image',
      title: 'tw t',
      description: 'tw d',
    });
  });

  it('openGraph url always equals the canonical (they cannot drift)', () => {
    for (const path of ['', '/blog', '/blog/some-post']) {
      const m = pageMeta({ ...base, path });
      expect((m.openGraph as { url: string }).url).toBe(m.alternates?.canonical);
    }
  });
});

describe('siteJsonLd', () => {
  const graph = siteJsonLd()['@graph'] as Record<string, unknown>[];

  it('is a schema.org graph with a business, a person and one Service per expertise card', () => {
    expect(siteJsonLd()['@context']).toBe('https://schema.org');
    const services = graph.filter((n) => n['@type'] === 'Service');
    expect(services).toHaveLength(EXPERTISE_CARDS.length);
    expect(graph.some((n) => n['@type'] === 'Person')).toBe(true);
    expect(graph.some((n) => Array.isArray(n['@type']) && (n['@type'] as string[]).includes('LocalBusiness'))).toBe(true);
  });

  it('the business carries the phone in E.164, the email, the URL and an absolute .png share image', () => {
    const biz = graph.find((n) => Array.isArray(n['@type']))!;
    expect(biz.telephone).toBe(SITE.phone.e164);
    expect(biz.email).toBe(SITE.email);
    expect(biz.url).toBe(SITE.url);
    expect(biz.image).toBe(`${SITE.url}/opengraph-image.png`);
    expect(biz['@id']).toBe(`${SITE.url}/#business`);
  });

  it('every @id is unique and every provider / worksFor reference resolves to a node', () => {
    const ids = graph.map((n) => n['@id'] as string);
    expect(new Set(ids).size).toBe(ids.length);
    for (const n of graph) {
      const ref = (n.provider ?? n.worksFor) as { '@id': string } | undefined;
      if (ref) expect(ids).toContain(ref['@id']);
    }
  });

  it('does not advertise empty sameAs profiles as links', () => {
    const biz = graph.find((n) => Array.isArray(n['@type']))!;
    expect(biz.sameAs).toEqual(SITE.sameAs);
  });
});

describe('blogPostingJsonLd', () => {
  it.each(getAllPosts().map((p) => [p.slug]))('%s is a complete BlogPosting', (slug) => {
    const post = getAllPosts().find((p) => p.slug === slug)!;
    const ld = blogPostingJsonLd(post);
    expect(ld['@type']).toBe('BlogPosting');
    expect(ld.headline).toBe(post.title);
    expect(ld.description).toBe(post.excerpt);
    expect(ld.datePublished).toBe(post.date);
    expect(ld.inLanguage).toBe('he-IL');
    expect(ld.image).toBe(`${SITE.url}${post.coverImage}`);
    expect(ld.image).toMatch(/^https?:\/\//);
    expect(ld.mainEntityOfPage['@id']).toBe(`${SITE.url}/blog/${post.slug}`);
    expect(ld.author.name).toBe(SITE.name);
  });
});
