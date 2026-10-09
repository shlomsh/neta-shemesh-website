/**
 * SoftSnap wiring that the sanity suite (sanity/soft-snap.test.tsx) does not assert:
 * the gate is mounted on the home page, renders nothing, and the engine cancels on user input.
 * Constants, selector, CSS-snap ban and glide behaviour live in the sanity suite.
 */
import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { SoftSnap } from '@/components/motion/SoftSnap';

const read = (rel: string) => readFileSync(resolve(__dirname, '..', rel), 'utf8');
const gate = read('src/components/motion/SoftSnap.tsx');
const engine = read('src/components/motion/SoftSnapEngine.tsx');
const page = read('src/app/page.tsx');

describe('SoftSnap wiring', () => {
  it('the gate and the engine are client components', () => {
    expect(gate.trimStart().startsWith("'use client'")).toBe(true);
    expect(engine.trimStart().startsWith("'use client'")).toBe(true);
  });

  it('the gate loads the engine by dynamic import() only, never a static import', () => {
    expect(gate).toMatch(/import\(\s*['"]\.\/SoftSnapEngine['"]\s*\)/);
    expect(gate).not.toMatch(/^import .* from ['"]\.\/SoftSnapEngine['"]/m);
  });

  it('the engine cancels its glide on user input', () => {
    for (const ev of ['wheel', 'keydown', 'pointerdown']) {
      expect(engine).toContain(`addEventListener('${ev}'`);
    }
  });

  it('there is no touch handling anywhere', () => {
    for (const src of [gate, engine]) {
      expect(src).not.toMatch(/touch(start|end|cancel|move)/i);
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
