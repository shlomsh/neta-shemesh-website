/**
 * Guards the reduced-motion hydration fix.
 *
 * Bug: components branched on `useReducedMotion()` (false on the server, true on the
 * first client render under `prefers-reduced-motion: reduce`). The SSR HTML shipped the
 * motion initial state (`style="opacity:0"`), React hydration does not patch mismatched
 * style attributes, so reduce-motion users saw blank sections.
 *
 * Fix: every reveal component renders the identical element + attributes regardless of
 * `useReducedMotion()`, and a CSS rule keyed off `data-reveal` / `data-parallax` forces
 * the content visible under `@media (prefers-reduced-motion: reduce)`.
 */
import React from 'react';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { renderToString } from 'react-dom/server';

const reduced = vi.hoisted(() => ({ value: false }));

vi.mock('framer-motion', async (importOriginal) => {
  const actual = await importOriginal<Record<string, unknown>>();
  return { ...actual, useReducedMotion: () => reduced.value };
});

import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ContactFAB } from '@/components/ui/ContactFAB';
import { ParallaxFrame } from '@/components/ui/ParallaxFrame';
import { FooterReveal } from '@/components/layout/FooterReveal';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const cases: Array<[string, () => React.ReactElement]> = [
  ['ScrollReveal', () => <ScrollReveal delay={0.1} className="x"><p>hi</p></ScrollReveal>],
  ['FooterReveal', () => <FooterReveal delay={0.1}><p>hi</p></FooterReveal>],
  ['ContactFAB', () => <ContactFAB />],
  ['ParallaxFrame', () => <ParallaxFrame className="h-10"><img alt="" src="/a.jpg" /></ParallaxFrame>],
];

describe('reveal components render the same tree regardless of useReducedMotion()', () => {
  beforeEach(() => cleanup());

  for (const [name, make] of cases) {
    it(`${name}: identical client markup for reduce=true and reduce=false`, () => {
      reduced.value = false;
      const a = render(make()).container.innerHTML;
      cleanup();
      reduced.value = true;
      const b = render(make()).container.innerHTML;
      expect(b).toBe(a);
    });

    it(`${name}: identical server markup for reduce=true and reduce=false`, () => {
      reduced.value = false;
      const a = renderToString(make());
      reduced.value = true;
      const b = renderToString(make());
      expect(b).toBe(a);
    });
  }

  it('ScrollReveal carries the data-reveal hook the CSS keys off', () => {
    reduced.value = true;
    const { container } = render(<ScrollReveal><p>hi</p></ScrollReveal>);
    expect(container.firstElementChild?.hasAttribute('data-reveal')).toBe(true);
    expect(container.firstElementChild?.className).toBe('');
  });
});

describe('structural guards (source + CSS)', () => {
  for (const f of [
    'src/components/ui/ScrollReveal.tsx',
    'src/components/layout/FooterReveal.tsx',
    'src/components/ui/ContactFAB.tsx',
    'src/components/ui/ParallaxFrame.tsx',
  ]) {
    it(`${f} does not call useReducedMotion (SSR/client branch)`, () => {
      expect(read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')).not.toMatch(/useReducedMotion/);
    });
  }

  it('globals.css forces [data-reveal] visible and [data-parallax] static under reduce', () => {
    const css = read('src/app/globals.css');
    const idx = css.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    const block = css.slice(idx, css.indexOf('@utility safari-clip'));
    expect(block).toMatch(/\[data-reveal\]\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/);
    expect(block).toMatch(/\[data-parallax\]\s*\{[^}]*transform:\s*none\s*!important/);
  });
});
