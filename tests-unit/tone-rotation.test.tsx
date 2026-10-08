import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { AboutIntro, AboutBio, AboutCredentials, AboutGallery } from '@/components/layout/About';
import Expertise from '@/components/layout/Expertise';
import Testimonials from '@/components/layout/Testimonials';

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
vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
})));

const tone = (c: HTMLElement, sel: string) => c.querySelector(sel)?.getAttribute('data-bg-tone');

/**
 * Darkest -> lightest rotation anchored on the (plum) hero:
 *   about-intro mid, expertise light, about-me cream, credentials dark,
 *   about-gallery mid, services light, testimonials gallery cream,
 *   contact-social dark, contact-office mid.
 * (Services + Contact tones are asserted in their own test files.)
 */
describe('4-tone card rotation (About / Expertise / Testimonials)', () => {
  it('About sections follow mid, cream, dark, mid', () => {
    expect(tone(render(<AboutIntro />).container, '#about-intro')).toBe('mid');
    expect(tone(render(<AboutBio />).container, '#about-me-section')).toBe('cream');
    expect(tone(render(<AboutCredentials />).container, '#about-credentials')).toBe('dark');
    expect(tone(render(<AboutGallery />).container, '#about-gallery')).toBe('mid');
  });

  it('about-intro copy sits on a cream-veil card (4.97:1 vs plum) at the lead scale; title stays on the mauve', () => {
    const { container } = render(<AboutIntro />);
    const section = container.querySelector('#about-intro')!;
    const card = section.querySelector('div[data-bg-tone="cream"]');
    expect(card, 'veil card').not.toBeNull();
    expect(card!.className).toContain('rounded-card');
    expect(card!.className).toContain('bg-[var(--surface-veil)]');
    expect(card!.className).not.toContain('bg-[var(--color-blush)]');
    const paras = card!.querySelectorAll('p');
    expect(paras.length).toBe(2);
    paras.forEach(p => {
      expect(p.className).toContain('type-lead');
      expect(p.className).toContain('max-w-[65ch]');
      expect(p.className).not.toContain('type-quote');
      expect(p.className).not.toMatch(/text-\[(clamp|\d)/);
    });
    const h2 = section.querySelector('#GDq1TYUPnp1UCFMP');
    expect(h2).not.toBeNull();
    expect(card!.contains(h2)).toBe(false);
  });

  it('about-intro is one screen at lg+ with a height-driven photo mosaic', () => {
    const { container } = render(<AboutIntro />);
    const section = container.querySelector('#about-intro')!;
    expect(section.className).toContain('lg:h-[max(100svh,720px)]');
    const frames = section.querySelectorAll('.safari-clip');
    expect(frames.length).toBe(3);
    frames.forEach(f => expect(f.className).toMatch(/lg:h-full|(^|\s)h-full/));
  });

  it('about-gallery is mid; caption is a subtitle on the mauve (no blush card) at the quote scale', () => {
    const { container } = render(<AboutGallery />);
    const section = container.querySelector('#about-gallery')!;
    expect(section.getAttribute('data-bg-tone')).toBe('mid');
    const p = Array.from(section.querySelectorAll('p')).find(el => el.textContent?.includes('תמיכה והכוונה'))!;
    expect(p).toBeTruthy();
    expect(p.closest('[data-bg-tone="light"]')).toBeNull();
    expect(p.closest('[data-bg-tone]')).toBe(section);
    expect(p.className).toContain('type-quote');
    expect(p.className).not.toMatch(/text-\[(clamp|\d)/);
  });

  it('about-gallery is one screen at lg+ and its photo grid takes the remaining height', () => {
    const { container } = render(<AboutGallery />);
    const section = container.querySelector('#about-gallery')!;
    expect(section.className).toContain('min-h-[100svh]');
    expect(section.className).toContain('lg:h-[max(100svh,720px)]');
    const grid = section.querySelector('.grid')!;
    expect(grid.className).toContain('lg:flex-1');
    expect(grid.className).toContain('lg:min-h-[320px]');
    const frames = Array.from(grid.querySelectorAll('[class*="rounded-card"]'));
    expect(frames).toHaveLength(3);
    frames.forEach(f => {
      expect(f.className).toContain('lg:h-full');
      expect(f.className).toContain('safari-clip');
    });
  });

  it('Expertise is light (blush); section-level paragraph is quote scale with no hardcoded cream/opacity', () => {
    const { container } = render(<Expertise />);
    const section = container.querySelector('section')!;
    expect(section.getAttribute('data-bg-tone')).toBe('light');
    const p = Array.from(section.querySelectorAll('p')).find(el => el.textContent?.includes('תמיכה והכוונה'));
    expect(p, 'subtitle paragraph').toBeDefined();
    expect(p!.className).toContain('type-quote');
    expect(p!.className).not.toMatch(/text-\[(clamp|\d)/);
    expect(p!.className).not.toContain('--color-white');
    expect(p!.className).not.toContain('opacity-90');
    expect(section.querySelector('h2')!.className).not.toContain('on-dark');
  });

  it('Testimonials gallery section is cream and titles inherit plum (no on-dark)', () => {
    const { container } = render(<Testimonials />);
    const section = container.querySelector('#vln9V07dEMN7DyMa')!;
    expect(section.getAttribute('data-bg-tone')).toBe('cream');
    expect(section.querySelector('h2')!.className).not.toContain('on-dark');
    expect(section.querySelector('p')!.className).not.toContain('text-[var(--color-');
    // CTA band stays a photo card outside the rotation.
    expect(container.querySelector('#afNbX7iGTuOdSbLC')!.hasAttribute('data-bg-tone')).toBe(false);
  });
});
