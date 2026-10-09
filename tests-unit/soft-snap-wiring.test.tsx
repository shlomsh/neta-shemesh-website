/**
 * SoftSnap wiring that the sanity suite (sanity/soft-snap.test.tsx) does not assert:
 * it is mounted on the home page, renders nothing, and cancels on user input.
 * Constants, selector, CSS-snap ban and glide behaviour live in the sanity suite.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SoftSnap } from '@/components/motion/SoftSnap';

const src = readFileSync(resolve(__dirname, '../src/components/motion/SoftSnap.tsx'), 'utf8');
const page = readFileSync(resolve(__dirname, '../src/app/page.tsx'), 'utf8');

describe('SoftSnap wiring', () => {
  it('is a client component', () => {
    expect(src.trimStart().startsWith("'use client'")).toBe(true);
  });

  it('cancels its glide on user input', () => {
    for (const ev of ['wheel', 'touchstart', 'keydown', 'pointerdown']) {
      expect(src).toContain(`addEventListener('${ev}'`);
    }
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
});
