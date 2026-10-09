/**
 * NS-21: MobileMenu behaviour. Opens and closes, Escape, focus into the menu and back, background
 * inert + scroll lock while open, and link clicks closing it. (The md breakpoint auto-close and the
 * basic inert/Escape cases are also in a11y-quick-wins.test.tsx; this file is the full behaviour spec.)
 * Behaviour and roles only: no colour classes.
 */
import { fireEvent, render, screen, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { MobileMenu } from '@/components/site/MobileMenu';
import { PageShell } from '@/components/site/PageShell';
import { SiteNav } from '@/components/site/SiteNav';
import { NAV_LINKS } from '@/content/home/nav';
import { ID } from '@/content/ids';
import { SITE, telHref } from '@/content/site';

// jsdom cannot navigate; cancel the default of link clicks (React handlers have already run by then).
const blockNavigation = (e: Event) => e.preventDefault();
beforeEach(() => document.addEventListener('click', blockNavigation));
afterEach(() => {
  document.removeEventListener('click', blockNavigation);
  document.body.style.overflow = '';
});

const OPEN_LABEL = 'פתיחת תפריט';
const CLOSE_LABEL = 'סגירת תפריט';

function setup(basePath?: string) {
  const view = render(
    <PageShell overflow="clip">
      <SiteNav basePath={basePath} />
      <button type="button">page control</button>
    </PageShell>,
  );
  const main = view.container.querySelector('main')!;
  const hamburger = screen.getByRole('button', { name: OPEN_LABEL });
  return { ...view, main, hamburger };
}

const menu = () => screen.queryByRole('dialog');

describe('MobileMenu: open and close', () => {
  it('is closed by default: no dialog, hamburger collapsed and pointing at the menu id', () => {
    const { hamburger } = setup();
    expect(menu()).toBeNull();
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
    expect(hamburger.getAttribute('aria-controls')).toBe(ID.mobileMenu);
  });

  it('the hamburger opens a modal dialog with the controlled id and an accessible name', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.id).toBe(ID.mobileMenu);
    expect(dialog.getAttribute('aria-modal')).toBe('true');
    expect(dialog.getAttribute('aria-label')).toBeTruthy();
    expect(hamburger.getAttribute('aria-expanded')).toBe('true');
  });

  it('the close button closes it and collapses the hamburger again', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
    expect(menu()).toBeNull();
    expect(hamburger.getAttribute('aria-expanded')).toBe('false');
  });

  it('can be reopened after closing', () => {
    const { hamburger } = setup();
    for (let i = 0; i < 2; i++) {
      fireEvent.click(hamburger);
      expect(menu()).not.toBeNull();
      fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
      expect(menu()).toBeNull();
    }
  });

  it('is portaled to <body>, outside <main>', () => {
    const { main, hamburger } = setup();
    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.parentElement).toBe(document.body);
    expect(main.contains(dialog)).toBe(false);
  });

  it('lists every nav link plus the phone, in order', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    const nav = within(screen.getByRole('dialog')).getByRole('navigation');
    const links = within(nav).getAllByRole('link');
    expect(links.map((a) => a.textContent)).toEqual([...NAV_LINKS.map((l) => l.label), SITE.phone.display]);
    expect(links.at(-1)!.getAttribute('href')).toBe(telHref());
  });

  it('prefixes hash anchors with basePath on blog pages, leaves routes alone', () => {
    const { hamburger } = setup('/');
    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    const hrefs = within(dialog).getAllByRole('link').map((a) => a.getAttribute('href'));
    expect(hrefs).toContain('/blog');
    const hashHrefs = hrefs.filter((h) => h!.includes('#'));
    expect(hashHrefs.length).toBeGreaterThan(0);
    for (const h of hashHrefs) expect(h!.startsWith('/#')).toBe(true);
  });
});

describe('MobileMenu: keyboard', () => {
  it('Escape closes it', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu()).toBeNull();
  });

  it('Escape does nothing while closed', () => {
    setup();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu()).toBeNull();
  });

  it('a non-Escape key leaves it open', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.keyDown(document, { key: 'a' });
    expect(menu()).not.toBeNull();
  });

  it('Tab from the last control wraps to the first, and Shift+Tab from the first wraps to the last', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    const focusables = [
      ...dialog.querySelectorAll<HTMLElement>('a[href], button:not([disabled])'),
    ];
    const first = focusables[0];
    const last = focusables.at(-1)!;
    expect(first).toBe(screen.getByRole('button', { name: CLOSE_LABEL }));

    last.focus();
    fireEvent.keyDown(document, { key: 'Tab' });
    expect(document.activeElement).toBe(first);

    first.focus();
    fireEvent.keyDown(document, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(last);
  });

  it('after Escape the keydown listener is gone (a later Escape does not throw or reopen)', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.keyDown(document, { key: 'Escape' });
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(menu()).toBeNull();
  });
});

describe('MobileMenu: focus', () => {
  it('moves focus into the menu (the close button) when it opens', () => {
    const { hamburger } = setup();
    hamburger.focus();
    fireEvent.click(hamburger);
    const dialog = screen.getByRole('dialog');
    expect(dialog.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).toBe(screen.getByRole('button', { name: CLOSE_LABEL }));
  });

  it('returns focus to the hamburger after closing with the close button', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
    expect(document.activeElement).toBe(hamburger);
  });

  it('returns focus to the hamburger after Escape', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.activeElement).toBe(hamburger);
  });

  it('returns focus to the hamburger after a link click closes it', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    const link = within(screen.getByRole('dialog')).getAllByRole('link')[0];
    fireEvent.click(link);
    expect(document.activeElement).toBe(hamburger);
  });

  it('does not steal focus on first mount (nothing focused until the menu has been opened)', () => {
    const { hamburger } = setup();
    expect(document.activeElement).not.toBe(hamburger);
  });
});

describe('MobileMenu: background', () => {
  it('<main> is inert only while open; the dialog itself is never inert', () => {
    const { main, hamburger } = setup();
    expect(main.hasAttribute('inert')).toBe(false);
    fireEvent.click(hamburger);
    expect(main.hasAttribute('inert')).toBe(true);
    expect(screen.getByRole('dialog').hasAttribute('inert')).toBe(false);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(main.hasAttribute('inert')).toBe(false);
  });

  it('body scroll is locked while open and released on close', () => {
    const { hamburger } = setup();
    expect(document.body.style.overflow).toBe('');
    fireEvent.click(hamburger);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
    expect(document.body.style.overflow).toBe('');
  });

  it('restores a pre-existing body overflow value instead of clearing it', () => {
    document.body.style.overflow = 'scroll';
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    expect(document.body.style.overflow).toBe('hidden');
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(document.body.style.overflow).toBe('scroll');
  });

  it('releases inert and scroll lock when unmounted while open', () => {
    const { main, hamburger, unmount } = setup();
    fireEvent.click(hamburger);
    expect(document.body.style.overflow).toBe('hidden');
    unmount();
    expect(document.body.style.overflow).toBe('');
    expect(main.hasAttribute('inert')).toBe(false);
    expect(screen.queryByRole('dialog')).toBeNull();
  });
});

describe('MobileMenu: link clicks', () => {
  it('every nav link closes the menu and releases the background', () => {
    const { main, hamburger } = setup();
    const count = NAV_LINKS.length;
    for (let i = 0; i < count; i++) {
      fireEvent.click(hamburger);
      const links = within(screen.getByRole('dialog')).getAllByRole('link');
      fireEvent.click(links[i]);
      expect(menu(), `link ${i}`).toBeNull();
      expect(main.hasAttribute('inert')).toBe(false);
      expect(document.body.style.overflow).toBe('');
    }
  });

  it('the phone link closes the menu too', () => {
    const { hamburger } = setup();
    fireEvent.click(hamburger);
    const tel = within(screen.getByRole('dialog')).getByRole('link', { name: SITE.phone.display });
    expect(tel.getAttribute('href')).toBe(telHref());
    fireEvent.click(tel);
    expect(menu()).toBeNull();
  });
});

describe('MobileMenu: controlled component', () => {
  const links = [
    { label: 'one', href: '#one' },
    { label: 'two', href: '/two' },
  ];

  it('renders nothing when open is false', () => {
    render(<MobileMenu open={false} links={links} onClose={() => {}} />);
    expect(menu()).toBeNull();
  });

  it('renders the given links when open, and calls onClose for Escape, close button and each link', () => {
    const onClose = vi.fn();
    render(<MobileMenu open links={links} onClose={onClose} />);
    expect(within(screen.getByRole('dialog')).getByRole('link', { name: 'one' }).getAttribute('href')).toBe('#one');
    expect(within(screen.getByRole('dialog')).getByRole('link', { name: 'two' }).getAttribute('href')).toBe('/two');

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: CLOSE_LABEL }));
    expect(onClose).toHaveBeenCalledTimes(2);

    fireEvent.click(screen.getByRole('link', { name: 'one' }));
    fireEvent.click(screen.getByRole('link', { name: 'two' }));
    expect(onClose).toHaveBeenCalledTimes(4);
  });
});
