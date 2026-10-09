/**
 * NS-09 accessibility quick wins: skip link + main target, landmarks, hero labelling,
 * blog index heading order, and the MobileMenu inert / breakpoint behaviour.
 */
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import BlogIndexPage from '../../src/app/blog/page';
import { BlogHeader } from '../../src/components/blog/BlogHeader';
import { PostCard } from '../../src/components/blog/PostCard';
import { Hero } from '../../src/components/sections/hero/Hero';
import { PageShell } from '../../src/components/site/PageShell';
import { SiteNav } from '../../src/components/site/SiteNav';
import { ID } from '../../src/content/ids';
import { getAllPosts } from '../../src/content/posts';

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.style.overflow = '';
});

describe('skip link', () => {
  it('is the first focusable element, targets #main and reads "דלגו לתוכן"', () => {
    const { container } = render(
      <PageShell overflow="clip">
        <button type="button">first thing in the page</button>
      </PageShell>,
    );
    const first = container.querySelector<HTMLElement>(FOCUSABLE);
    expect(first?.tagName).toBe('A');
    expect(first?.getAttribute('href')).toBe('#main');
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
    expect(main?.querySelector('a[href="#main"]')).toBeNull();
  });
});

describe('landmarks and labelling', () => {
  it('the footer is contentinfo and the blog header is banner', () => {
    const { container } = render(
      <PageShell overflow="hidden">
        <BlogHeader />
      </PageShell>,
    );
    expect(container.querySelector('footer')?.getAttribute('role')).toBe('contentinfo');
    expect(container.querySelector('header')?.getAttribute('role')).toBe('banner');
  });

  it('the hero is labelled by its h1 (no ad-hoc "main heading" aria-label) and has a banner top bar', () => {
    const { container } = render(<Hero />);
    const section = container.querySelector('section')!;
    expect(section.hasAttribute('aria-label')).toBe(false);
    expect(section.getAttribute('aria-labelledby')).toBe(ID.heroTitle);
    const h1 = container.querySelector('h1')!;
    expect(h1.id).toBe(ID.heroTitle);
    const banner = container.querySelector('[role="banner"]')!;
    expect(banner.querySelector('nav')).not.toBeNull();
    expect(container.querySelector('[aria-hidden="false"]')).toBeNull();
  });
});

describe('blog heading order', () => {
  it('the blog index renders post-card titles as h2 under the h1', () => {
    const { container } = render(<BlogIndexPage />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelectorAll('h3')).toHaveLength(0);
    const titles = getAllPosts().map((p) => p.title);
    const h2s = Array.from(container.querySelectorAll('h2')).map((h) => h.textContent);
    for (const t of titles) expect(h2s).toContain(t);
  });

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
    media: '(min-width: 768px)',
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

  it('sets inert on <main> while open and removes it on close; the overlay is outside <main>', () => {
    const { main, hamburger } = setup();
    expect(main.hasAttribute('inert')).toBe(false);

    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    expect(main.hasAttribute('inert')).toBe(true);
    expect(main.contains(dialog)).toBe(false);
    expect(dialog.parentElement).toBe(document.body);
    expect(dialog.hasAttribute('inert')).toBe(false);

    fireEvent.click(screen.getByRole('button', { name: 'סגירת תפריט' }));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(main.hasAttribute('inert')).toBe(false);
  });

  it('Escape closes the menu and returns focus to the hamburger', () => {
    const { main, hamburger } = setup();
    fireEvent.click(hamburger);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'סגירת תפריט' }));

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(main.hasAttribute('inert')).toBe(false);
    expect(document.activeElement).toBe(hamburger);
  });

  it('closes (scroll lock and inert released) when (min-width: 768px) starts matching', () => {
    const mm = mockMatchMedia();
    const { main, hamburger } = setup();
    fireEvent.click(hamburger);
    expect(screen.getByRole('dialog')).toBeTruthy();
    expect(document.body.style.overflow).toBe('hidden');
    expect(mm.spy).toHaveBeenCalledWith('(min-width: 768px)');

    act(() => mm.fire(false));
    expect(screen.getByRole('dialog')).toBeTruthy();

    act(() => mm.fire(true));
    expect(screen.queryByRole('dialog')).toBeNull();
    expect(document.body.style.overflow).toBe('');
    expect(main.hasAttribute('inert')).toBe(false);
    expect(mm.listeners.size).toBe(0);
  });
});
