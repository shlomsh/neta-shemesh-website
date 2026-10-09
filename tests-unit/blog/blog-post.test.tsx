/**
 * NS-21: render tests for the blog post page (/blog/[slug]) and its metadata / static params.
 * Behaviour only: headings, links, text, JSON-LD and metadata. No colour classes, no ScrollReveal internals.
 */
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BlogPostPage, { dynamicParams, generateMetadata, generateStaticParams } from '@/app/blog/[slug]/page';
import { getAllPosts, getOtherPosts, getPostBySlug } from '@/content/posts';
import { ID } from '@/content/ids';
import { SITE } from '@/content/site';

const params = (slug: string) => ({ params: Promise.resolve({ slug }) });
const renderPost = async (slug: string) => render(await BlogPostPage(params(slug)));

describe('blog post page', () => {
  it.each(getAllPosts().map((p) => [p.slug]))('%s renders its article', async (slug) => {
    const post = getPostBySlug(slug)!;
    const { container } = await renderPost(slug);

    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe(post.title);

    expect(container.textContent).toContain(post.category);
    expect(container.textContent).toContain(post.excerpt);
    expect(container.textContent).toContain(post.readTime);

    const time = container.querySelector('time')!;
    expect(time.getAttribute('datetime')).toBe(post.date);
    expect(time.textContent).toBe(post.dateDisplay);

    const cover = container.querySelector(`img[alt="${post.coverAlt}"]`);
    expect(cover).not.toBeNull();

    // the body is one <article> carrying every in-article heading and the lead paragraph
    const article = container.querySelector('article')!;
    expect(article).not.toBeNull();
    for (const block of post.body) {
      if (block.type === 'heading') expect(article.textContent).toContain(block.text);
      if (block.type === 'lead') expect(article.textContent).toContain(block.text);
    }
  });

  it('links back to the blog index', async () => {
    const { container } = await renderPost(getAllPosts()[0].slug);
    const back = Array.from(container.querySelectorAll<HTMLAnchorElement>('a[href="/blog"]')).find((a) =>
      a.textContent?.includes('חזרה לכל המאמרים'),
    );
    expect(back).toBeTruthy();
  });

  it('closing CTA shows the post copy and a button link to the post href', async () => {
    const post = getAllPosts()[0];
    const { container } = await renderPost(post.slug);
    const band = container.querySelector<HTMLElement>(`#${ID.postCta}`)!;
    expect(band.textContent).toContain(post.cta.text);
    const button = Array.from(band.querySelectorAll<HTMLAnchorElement>('a')).find(
      (a) => a.textContent?.trim() === post.cta.buttonLabel,
    );
    expect(button?.getAttribute('href')).toBe(post.cta.href);
  });

  it('"more posts" lists only the other posts, never the current one', async () => {
    const post = getAllPosts()[0];
    const { container } = await renderPost(post.slug);
    const more = container.querySelector<HTMLElement>(`#${ID.postMore}`)!;
    const hrefs = Array.from(more.querySelectorAll('a[href^="/blog/"]')).map((a) => a.getAttribute('href'));
    expect(hrefs).toEqual(getOtherPosts(post.slug).map((p) => `/blog/${p.slug}`));
    expect(hrefs).not.toContain(`/blog/${post.slug}`);
  });

  it('emits one BlogPosting JSON-LD script for the post, with no raw "<"', async () => {
    const post = getAllPosts()[0];
    const { container } = await renderPost(post.slug);
    const scripts = container.querySelectorAll('script[type="application/ld+json"]');
    expect(scripts).toHaveLength(1);
    expect(scripts[0].innerHTML).not.toContain('<');
    const data = JSON.parse(scripts[0].textContent!);
    expect(data['@type']).toBe('BlogPosting');
    expect(data.headline).toBe(post.title);
    expect(data.mainEntityOfPage['@id']).toBe(`${SITE.url}/blog/${post.slug}`);
  });

  it('an unknown slug is a 404 (notFound throws)', async () => {
    await expect(BlogPostPage(params('no-such-post'))).rejects.toMatchObject({
      digest: expect.stringContaining('404'),
    });
  });
});

describe('blog post static params and metadata', () => {
  it('only known slugs are generated; unknown slugs are not rendered on demand', () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual(getAllPosts().map((p) => ({ slug: p.slug })));
  });

  it('every post has a unique, URL-safe slug', () => {
    const slugs = getAllPosts().map((p) => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  });

  it.each(getAllPosts().map((p) => [p.slug]))('%s metadata: canonical, article OG with absolute cover, twitter', async (slug) => {
    const post = getPostBySlug(slug)!;
    const meta = await generateMetadata(params(slug));
    expect(String(meta.title)).toContain(post.title);
    expect(meta.description).toBe(post.excerpt);
    expect(meta.alternates?.canonical).toBe(`${SITE.url}/blog/${slug}`);

    const og = meta.openGraph as { type?: string; publishedTime?: string; images?: { url: string }[] };
    expect(og.type).toBe('article');
    expect(og.publishedTime).toBe(post.date);
    expect(og.images).toEqual([{ url: `${SITE.url}${post.coverImage}` }]);

    expect(meta.twitter).toMatchObject({ title: post.title, description: post.excerpt });
  });

  it('metadata for an unknown slug is empty (no throw)', async () => {
    expect(await generateMetadata(params('no-such-post'))).toEqual({});
  });
});
