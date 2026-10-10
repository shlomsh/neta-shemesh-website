/**
 * NS-09 accessibility quick wins: skip link + main target, landmarks, hero labelling,
 * PostCard heading level, and the MobileMenu breakpoint auto-close (the rest of the menu behaviour is
 * site/mobile-menu.test.tsx).
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BlogIndexPage from '../../src/app/blog/page';
import BlogPostPage from '../../src/app/blog/[slug]/page';
import NotFoundPage from '../../src/app/not-found';
import { BlogHeader } from '../../src/components/blog/BlogHeader';
import { PostCard } from '../../src/components/blog/PostCard';
import { Hero } from '../../src/components/sections/hero/Hero';
import { PageShell } from '../../src/components/site/PageShell';
import { SiteNav } from '../../src/components/site/SiteNav';
import { ID } from '../../src/content/ids';
import { getAllPosts } from '../../src/content/posts';
import { renderHome } from '../sanity/helpers';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
});

describe('skip link', () => {
  it('is the first focusable element, targets #main-content and reads "דלגו לתוכן"', () => {
    const { container } = render(
      <PageShell overflow="clip">
        <button type="button">first thing in the page</button>
      </PageShell>,
    );
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    expect(first?.tagName).toBe('A');
    expect(first?.getAttribute('href')).toBe('#main-content');
    expect(first?.textContent).toBe('דלגו לתוכן');
    // visually hidden until focused
    expect(first?.className).toContain('sr-only');
    expect(first?.className).toContain('focus-visible:not-sr-only');
  });

  it('<main> is the programmatic focus target: id="main", tabindex -1, no id collision', () => {
    const { container } = render(<PageShell overflow="hidden">x</PageShell>);
    const main = container.querySelector('main');
    expect(main?.id).toBe('main');
    expect(main?.getAttribute('tabindex')).toBe('-1');
    expect(container.querySelectorAll('#main')).toHaveLength(1);
    expect(ID.main).toBe('main');
    // the skip link is a sibling of main, so `main > section` selectors never see it
    expect(main?.querySelector('a[href="#main-content"]')).toBeNull();
  });

  // The nav lives inside <main>, so the skip link has to land past it: every page marks the first content
  // after its header / nav with ID.mainContent.
  describe('lands on the first content after the nav, on every page', () => {
    const pages: Array<[string, () => Promise<HTMLElement>]> = [
      ['home', () => renderHome()],
      ['blog index', async () => render(<BlogIndexPage />).container],
      [
        'blog post',
        async () => {
          const slug = getAllPosts()[0].slug;
          return render(await BlogPostPage({ params: Promise.resolve({ slug }) })).container;
        },
      ],
      ['404', async () => render(<NotFoundPage />).container],
    ];

    it.each(pages)('%s', async (_name, renderPage) => {
      const root = await renderPage();
      const link = root.querySelector<HTMLAnchorElement>('a.sr-only');
      expect(link?.getAttribute('href')).toBe(`#${ID.mainContent}`);
      const targets = root.querySelectorAll(`#${ID.mainContent}`);
      expect(targets).toHaveLength(1);
      const nav = root.querySelector('nav')!;
      expect(nav.compareDocumentPosition(targets[0]) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
      expect(nav.contains(targets[0])).toBe(false);
    });
  });
});

describe('landmarks and labelling', () => {
  it('the header and footer sit inside <main>, so they carry no explicit banner / contentinfo role (invalid when nested)', () => {
    const { container } = render(
      <PageShell overflow="hidden">
        <BlogHeader />
      </PageShell>,
    );
    expect(container.querySelector('main > footer')).not.toBeNull();
    expect(container.querySelector('main > header')).not.toBeNull();
    expect(container.querySelector('[role="banner"], [role="contentinfo"]')).toBeNull();
  });

  it('the hero is labelled by its h1 (no ad-hoc "main heading" aria-label) and has a logo + nav top bar', () => {
    const { container } = render(<Hero />);
    const section = container.querySelector('section')!;
    expect(section.hasAttribute('aria-label')).toBe(false);
    expect(section.getAttribute('aria-labelledby')).toBe(ID.heroTitle);
    const h1 = container.querySelector('h1')!;
    expect(h1.id).toBe(ID.heroTitle);
    expect(container.querySelector('[role="banner"]')).toBeNull();
    const topBar = container.querySelector('.hero-enter-0')!;
    expect(topBar.querySelector('nav')).not.toBeNull();
    expect(container.querySelector('[aria-hidden="false"]')).toBeNull();
  });
});

describe('blog heading order (the index outline itself: blog/blog-index.test.tsx)', () => {
  it('PostCard defaults to h3 (the "more posts" row under an h2) with identical classes', () => {
    const post = getAllPosts()[0];
    const a = render(<PostCard post={post} />).container;
    const b = render(<PostCard post={post} headingLevel={2} />).container;
    const h3 = a.querySelector('h3')!;
    const h2 = b.querySelector('h2')!;
    expect(h3).not.toBeNull();
    expect(h2.className).toBe(h3.className);
  });
});

function mockMatchMedia() {
  const listeners = new Set<(e: { matches: boolean }) => void>();
  const mql = {
    matches: false,
    media: '(min-width: 48rem)',
    addEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.add(cb),
    removeEventListener: (_: string, cb: (e: { matches: boolean }) => void) => listeners.delete(cb),
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
    onchange: null,
  };
  const spy = vi.fn(() => mql);
  vi.stubGlobal('matchMedia', spy);
  window.matchMedia = spy as unknown as typeof window.matchMedia;
  return {
    spy,
    listeners,
    fire(matches: boolean) {
      mql.matches = matches;
      listeners.forEach((cb) => cb({ matches }));
    },
  };
}

describe('MobileMenu', () => {
  function setup() {
    const view = render(
      <PageShell overflow="clip">
        <SiteNav />
      </PageShell>,
    );
    const main = view.container.querySelector('main')!;
    const hamburger = screen.getByRole('button', { name: 'פתיחת תפריט' });
    return { ...view, main, hamburger };
  }

  it('closes (scroll lock and inert released) when (min-width: 48rem) starts matching', () => {
    const mm = mockMatchMedia();
    const { main, hamburger } = setup();
    fireEvent.click(hamburger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    expect(mm.spy).toHaveBeenCalledWith('(min-width: 48rem)');

    act(() => mm.fire(false));
    expect(screen.getByRole('dialog')).toBeTruthy();

    act(() => mm.fire(true));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(main.hasAttribute('inert')).toBe(false);
    expect(mm.listeners.size).toBe(0);
  });
});
