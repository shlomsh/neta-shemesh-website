/**
 * NS-21: render tests for the blog index page (/blog). Behaviour only: headings, links, text and
 * metadata. No colour classes and no ScrollReveal / framer internals (those are owned by other work).
 */
import { render, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import BlogIndexPage, { metadata } from '@/app/blog/page';
import { getAllPosts } from '@/content/posts';
import { ID } from '@/content/ids';
import { SITE } from '@/content/site';

describe('blog index page', () => {
  it('has exactly one h1 and it is the page title', () => {
    const { container } = render(<BlogIndexPage />);
    const h1s = container.querySelectorAll('h1');
    expect(h1s).toHaveLength(1);
    expect(h1s[0].textContent).toBe('מחשבות מהקליניקה');
  });

  it('renders inside a <main id="main"> with a skip link, a banner header and a contentinfo footer', () => {
    const { container } = render(<BlogIndexPage />);
    expect(container.querySelectorAll('main')).toHaveLength(1);
    expect(container.querySelector('main')!.id).toBe('main');
    expect(container.querySelector('a[href="#main"]')).not.toBeNull();
    expect(container.querySelector('header[role="banner"]')).not.toBeNull();
    expect(container.querySelector('footer[role="contentinfo"]')).not.toBeNull();
  });

  it('has the intro and posts sections under their ids', () => {
    const { container } = render(<BlogIndexPage />);
    expect(container.querySelector(`#${ID.blogIntro}`)).not.toBeNull();
    expect(container.querySelector(`#${ID.blogPosts}`)).not.toBeNull();
  });

  it('lists every post once, as a link to /blog/<slug> with its title as an h2', () => {
    const posts = getAllPosts();
    expect(posts.length).toBeGreaterThan(0);
    const { container } = render(<BlogIndexPage />);
    const grid = container.querySelector<HTMLElement>(`#${ID.blogPosts}`)!;
    const links = Array.from(grid.querySelectorAll<HTMLAnchorElement>('a[href^="/blog/"]'));
    expect(links.map((a) => a.getAttribute('href'))).toEqual(posts.map((p) => `/blog/${p.slug}`));
    posts.forEach((post, i) => {
      const heading = within(links[i]).getByRole('heading', { level: 2 });
      expect(heading.textContent).toBe(post.title);
      expect(links[i].textContent).toContain(post.excerpt);
      expect(links[i].textContent).toContain(post.category);
    });
  });

  it('shows each post cover with its alt text', () => {
    const { container } = render(<BlogIndexPage />);
    for (const post of getAllPosts()) {
      expect(container.querySelector(`img[alt="${post.coverAlt}"]`), post.slug).not.toBeNull();
    }
  });

  it('keeps the heading outline flat: one h1, post titles h2, no h3', () => {
    const { container } = render(<BlogIndexPage />);
    expect(container.querySelectorAll('h3')).toHaveLength(0);
    const h2Text = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    for (const post of getAllPosts()) expect(h2Text).toContain(post.title);
  });

  it('nav links on the blog header cross-navigate to the home page anchors', () => {
    const { container } = render(<BlogIndexPage />);
    const hrefs = Array.from(container.querySelectorAll<HTMLAnchorElement>('header nav a')).map((a) =>
      a.getAttribute('href'),
    );
    expect(hrefs).toContain('/blog');
    expect(hrefs.filter((h) => h?.includes('#')).every((h) => h!.startsWith('/#'))).toBe(true);
  });
});

describe('blog index metadata', () => {
  it('has a Hebrew title and description naming the site', () => {
    expect(String(metadata.title)).toContain(SITE.name);
    expect(String(metadata.title)).toContain('מאמרים');
    expect(String(metadata.description)).toContain(SITE.name);
  });

  it('is canonical to /blog and carries an openGraph block with an image', () => {
    expect(metadata.alternates?.canonical).toBe(`${SITE.url}/blog`);
    const og = metadata.openGraph as { url?: string; type?: string; images?: unknown[] };
    expect(og.url).toBe(`${SITE.url}/blog`);
    expect(og.type).toBe('website');
    expect(og.images?.length).toBeGreaterThan(0);
  });

  it('does not set its own twitter block (inherits the site-wide card)', () => {
    expect(metadata.twitter).toBeUndefined();
  });
});
