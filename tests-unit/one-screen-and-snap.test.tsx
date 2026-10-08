import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import React from 'react';
import { AboutBio } from '@/components/layout/About';
import Services from '@/components/layout/Services';
import Testimonials from '@/components/layout/Testimonials';
import SoftSnap from '@/components/ui/SoftSnap';

vi.stubGlobal('IntersectionObserver', vi.fn(() => ({
  disconnect: vi.fn(), observe: vi.fn(), takeRecords: vi.fn(), unobserve: vi.fn(),
})));

describe('lg+ one-screen cards (Services, about-me, Testimonials gallery)', () => {
  it('Services is exactly one screen at lg+ and the step grid takes the remaining height', () => {
    const { container } = render(<Services />);
    const section = container.querySelector('#cQd2ufFBWvr5c6ki')!;
    expect(section.className).toContain('min-h-[100svh]');
    expect(section.className).toContain('lg:h-[max(100svh,720px)]');
    expect(section.className).toContain('lg:py-12');
    const grid = section.querySelector('.grid')!;
    expect(grid.className).toContain('lg:flex-1');
    expect(grid.className).toContain('lg:min-h-0');
    expect(grid.className).toContain('lg:grid-rows-2');
    // cards are height-driven at lg (aspect ratio only below lg)
    const card = section.querySelector('.aspect-\\[4\\/5\\]')!;
    expect(card.className).toContain('lg:aspect-auto');
    expect(card.className).toContain('lg:h-auto');
  });

  it('about-me grows to at least one screen at lg+ with its content centred', () => {
    const { container } = render(<AboutBio />);
    const section = container.querySelector('#about-me-section')!;
    expect(section.className).toContain('min-h-[100svh]');
    expect(section.className).toContain('lg:min-h-[max(100svh,720px)]');
    expect(section.className).toContain('justify-center');
    expect(section.className).toContain('lg:py-12');
    // bio: all five paragraphs are type-lead (owner request 2026-10-09; no ad-hoc sizes)
    expect(section.querySelectorAll('p.type-lead').length).toBe(5);
    expect(section.querySelectorAll('p.type-body').length).toBe(0);
  });

  it('Testimonials gallery is exactly one screen at lg+ with a height-driven photo grid', () => {
    const { container } = render(<Testimonials />);
    const section = container.querySelector('#vln9V07dEMN7DyMa')!;
    expect(section.className).toContain('lg:h-[max(100svh,720px)]');
    expect(section.className).toContain('lg:py-12');
    const grid = section.querySelector('.grid')!;
    expect(grid.className).toContain('lg:flex-1');
    expect(grid.className).toContain('lg:grid-rows-2');
    expect(grid.className).not.toContain('calc(100svh');
  });

  it('Testimonials gallery + CTA band subtitles follow the section-subtitle rule (type-quote, 65ch, centred)', () => {
    const { container } = render(<Testimonials />);
    for (const [sectionId, titleId] of [['vln9V07dEMN7DyMa', 'T749khVkMfNluBNv'], ['afNbX7iGTuOdSbLC', 'iVtldd7PMtN1BthG']]) {
      const section = container.querySelector(`#${sectionId}`)!;
      const p = section.querySelector(`#${titleId}`)!.closest('div')!.querySelector('p')!;
      expect(p.className, sectionId).toContain('type-quote');
      expect(p.className, sectionId).not.toContain('type-lead');
      expect(p.className, sectionId).toContain('max-w-[65ch]');
      expect(p.className, sectionId).toContain('mx-auto');
      expect(p.className, sectionId).toContain('mt-3 md:mt-4');
    }
  });
});

describe('desktop soft snap (JS, no CSS scroll-snap)', () => {
  const css = readFileSync(resolve(__dirname, '../src/app/globals.css'), 'utf8');
  const src = readFileSync(resolve(__dirname, '../src/components/ui/SoftSnap.tsx'), 'utf8');
  const page = readFileSync(resolve(__dirname, '../src/app/page.tsx'), 'utf8');

  it('globals.css has no CSS scroll-snap-type', () => {
    expect(css).not.toContain('scroll-snap-type');
  });

  it('SoftSnap is a client component', () => {
    expect(src.trimStart().startsWith("'use client'")).toBe(true);
  });

  it('exports tunable constants within the agreed ranges', async () => {
    const mod = await import('@/components/ui/SoftSnap');
    expect(mod.MIN_WIDTH).toBe(1024);
    expect(mod.THRESHOLD).toBeGreaterThanOrEqual(0.2);
    expect(mod.THRESHOLD).toBeLessThanOrEqual(0.5);
    expect(mod.DURATION_MS).toBeGreaterThanOrEqual(300);
    expect(mod.DURATION_MS).toBeLessThanOrEqual(800);
    expect(mod.SETTLE_MS).toBeGreaterThan(0);
  });

  it('cancels on user input and respects reduced motion + min width', () => {
    for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
      expect(src).toContain(`addEventListener('${ev}'`);
    }
    expect(src).toContain('prefers-reduced-motion: reduce');
    expect(src).toContain('MIN_WIDTH');
  });

  it('targets only direct <main> sections', () => {
    expect(src).toContain("'main > section'");
  });

  it('renders null', () => {
    vi.stubGlobal('matchMedia', vi.fn(() => ({
      matches: false, addEventListener: vi.fn(), removeEventListener: vi.fn(),
    })));
    const { container } = render(<SoftSnap />);
    expect(container.innerHTML).toBe('');
  });

  it('page.tsx mounts <SoftSnap />', () => {
    expect(page).toContain('<SoftSnap />');
  });

  it('<main> clips with overflow-clip, not overflow-hidden', () => {
    expect(page).toMatch(/<main className="[^"]*overflow-clip/);
    expect(page).not.toMatch(/<main className="[^"]*overflow-hidden/);
  });
});
