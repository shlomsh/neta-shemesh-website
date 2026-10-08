import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Contact from '../src/components/layout/Contact';
import Footer from '../src/components/layout/Footer';

// Mock matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

describe('Layout Components', () => {
  it('Contact renders sections with appropriate background tones', () => {
    const { container } = render(<Contact />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(2);
    expect(sections[0].getAttribute('data-bg-tone')).toBe('dark');
    expect(sections[1].getAttribute('data-bg-tone')).toBe('mid');
  });

  it('Contact social section is plum (dark): lead copy and icons sit directly on it, no inner card', () => {
    const { container } = render(<Contact />);
    const section = container.querySelector('#contact-social');
    expect(section?.getAttribute('data-bg-tone')).toBe('dark');
    expect(section!.querySelector('div[data-bg-tone]'), 'no nested tone card').toBeNull();
    const para = Array.from(section!.querySelectorAll('p')).find(p =>
      p.textContent?.includes('בואו נשמור על קשר')
    );
    expect(para, 'social paragraph').toBeDefined();
    expect(para!.className).toContain('type-lead');
    expect(para!.className).not.toContain('type-quote');
    // Text colour inherits cream from the dark tone: no hardcoded colour classes.
    expect(para!.className).not.toContain('text-[var(--color-');
    expect(section!.querySelectorAll('a[aria-label]').length).toBe(3);
  });

  it('Contact office: one cream card frames details and map; title sits above the card', () => {
    const { container } = render(<Contact />);
    const section = container.querySelector('#contact-office')!;
    expect(section.getAttribute('data-bg-tone')).toBe('mid');
    expect(section.className).toContain('min-h-[100svh]');
    expect(section.className).toContain('lg:h-[max(100svh,720px)]');
    expect(section.className).toContain('justify-center');
    // Exactly one cream card.
    const cards = section.querySelectorAll('[data-bg-tone="cream"]');
    expect(cards.length).toBe(1);
    const card = cards[0];
    expect(card.className).toContain('rounded-card');
    expect(card.className).not.toContain('h-full');
    // The map iframe is inside the card; its wrapper uses the smaller tile radius.
    const iframe = section.querySelector('iframe')!;
    expect(iframe, 'map iframe').not.toBeNull();
    expect(card.contains(iframe)).toBe(true);
    const mapWrapper = iframe.parentElement!;
    expect(mapWrapper.className).toContain('rounded-tile');
    expect(mapWrapper.className).not.toContain('rounded-card');
    expect(mapWrapper.className).toContain('lg:h-full');
    expect(mapWrapper.className).toContain('lg:min-h-[360px]');
    // Inner grid stretches both cells.
    const grid = mapWrapper.parentElement!;
    expect(grid.className).toContain('lg:grid-cols-[1fr_1.2fr]');
    expect(grid.className).toContain('items-stretch');
    // Title is outside the card.
    const h2 = section.querySelector('#zNSWHTotP3XOaXao')!;
    expect(h2).not.toBeNull();
    expect(card.contains(h2)).toBe(false);
    // Details present in the card.
    expect(card.querySelector('a[href^="tel:"]')).not.toBeNull();
    expect(card.querySelector('a[href^="mailto:"]')).not.toBeNull();
    expect(card.textContent).toContain('054-571-1060');
    expect(card.textContent).toContain('אמנון ותמר');
  });

  it('Footer has h-full on the tagline container', () => {
    const { container } = render(<Footer />);
    // The p with the tagline
    const pTag = container.querySelector('p');
    expect(pTag?.className).toContain('h-full');
  });

  it('Footer has min-h-[100svh] to fill the viewport', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer?.className).toContain('min-h-[100svh]');
  });
});

import Testimonials from '../src/components/layout/Testimonials';

describe('Testimonials Layout Component', () => {
  it('Testimonials sections have min-h-[100svh] to fill the viewport', () => {
    const { container } = render(<Testimonials />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section) => {
      expect(section.className, 'Testimonials section missing 100svh').toContain('min-h-[100svh]');
    });
  });
});
