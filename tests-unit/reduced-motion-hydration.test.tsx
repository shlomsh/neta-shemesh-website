/**
 * Guards the reduced-motion hydration fix (8fcd901) under the NS-13 reveal model.
 *
 * Original bug: components branched on `useReducedMotion()` (false on the server, true on the first
 * client render under `prefers-reduced-motion: reduce`). The SSR HTML shipped the motion initial state
 * (`style="opacity:0"`), React hydration does not patch mismatched style attributes, so reduce-motion
 * users saw blank sections.
 *
 * Now: ScrollReveal is a server component with no hidden state in its markup at all (the hidden state is
 * CSS, armed by RevealObserver, and only under `prefers-reduced-motion: no-preference`). ContactFAB is a
 * server component too (NS-14): its entrance is the `.fab-enter` CSS keyframe, off under reduce, with no
 * inline `opacity:0` in the HTML. ParallaxFrame still uses framer until NS-15, so it keeps the "same tree
 * whatever useReducedMotion() says" guard, plus the CSS belt that forces it static under reduce.
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

import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ContactFAB } from '@/components/site/ContactFAB';
import { ParallaxFrame } from '@/components/motion/ParallaxFrame';
import { Footer } from '@/components/site/footer/Footer';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const cases: Array<[string, () => React.ReactElement]> = [
  ['ScrollReveal', () => <ScrollReveal delay={0.1} className="x"><p>hi</p></ScrollReveal>],
  ['Footer (staggered ScrollReveal blocks)', () => <Footer />],
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

  it('ScrollReveal carries the hooks the CSS and RevealObserver key off', () => {
    reduced.value = true;
    const { container } = render(<ScrollReveal><p>hi</p></ScrollReveal>);
    const el = container.firstElementChild!;
    expect(el.hasAttribute('data-reveal')).toBe(true);
    expect(el.getAttribute('data-reveal')).toBe('io');
    expect(el.className).toBe('');
    expect(el.hasAttribute('style')).toBe(false);
  });
});

describe('structural guards (source + CSS)', () => {
  for (const f of [
    'src/components/motion/ScrollReveal.tsx',
    'src/components/site/footer/Footer.tsx',
    'src/components/site/ContactFAB.tsx',
    'src/components/motion/ParallaxFrame.tsx',
  ]) {
    it(`${f} does not call useReducedMotion (SSR/client branch)`, () => {
      expect(read(f).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '')).not.toMatch(/useReducedMotion/);
    });
  }

  it('ScrollReveal is a server component: no client directive, no framer-motion', () => {
    const src = read('src/components/motion/ScrollReveal.tsx').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect(src).not.toMatch(/use client/);
    expect(src).not.toMatch(/framer-motion/);
  });

  it('ContactFAB is a server component (NS-14): no client directive, no framer-motion, no inline hidden state', () => {
    const src = read('src/components/site/ContactFAB.tsx').replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
    expect(src).not.toMatch(/use client/);
    expect(src).not.toMatch(/framer-motion/);
    const html = renderToString(<ContactFAB />);
    expect(html).not.toMatch(/opacity:\s*0/);
    expect(html).not.toMatch(/style=/);
    expect(html).toMatch(/class="fab-enter /);
  });

  it('the FAB entrance is a CSS keyframe with a visible rest state, switched off under reduce', () => {
    const css = read('src/app/globals.css');
    expect(css).toMatch(/\.fab-enter\s*\{\s*animation:\s*fab-fade 0\.5s cubic-bezier\(0, 0, 0\.58, 1\) 0\.8s backwards,\s*fab-rise 0\.72s linear 0\.8s backwards;/);
    expect(css).toMatch(/@keyframes fab-fade\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*to\s*\{\s*opacity:\s*1;/);
    expect(css).toMatch(/@keyframes fab-rise\s*\{\s*0%\s*\{\s*transform:\s*translateY\(24px\);/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.fab-enter\s*\{\s*animation:\s*none;/);
    // the rest state (the .fab-enter rule's own declarations) never hides it
    expect(css.match(/\.fab-enter\s*\{([^}]*)\}/)![1]).not.toMatch(/opacity|visibility/);
  });

  it('globals.css forces [data-reveal] visible and [data-parallax] static under reduce', () => {
    const css = read('src/app/globals.css');
    const idx = css.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    const block = css.slice(idx, css.indexOf('@utility safari-clip'));
    expect(block).toMatch(/\[data-reveal\]\s*\{[^}]*opacity:\s*1\s*!important[^}]*transform:\s*none\s*!important/);
    // the minifier turns `transform:none; translate:none` into `transform:translate(0)` (a real transform)
    expect(block).not.toMatch(/\[data-reveal\]\s*\{[^}]*translate\s*:/);
    expect(block).toMatch(/\[data-parallax\]\s*\{[^}]*transform:\s*none\s*!important/);
  });

  it('the hidden state is gated on JS arming AND no-preference; the transition is on the revealed state only', () => {
    const css = read('src/app/globals.css');
    const start = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf('@media (prefers-reduced-motion: reduce)', start));
    // exactly one hiding rule, and it needs html[data-reveal-armed] + :not([data-revealed])
    const hide = block.match(/html\[data-reveal-armed\][^{]*:not\(\[data-revealed\]\)\s*\{([^}]*)\}/);
    expect(hide).not.toBeNull();
    expect(hide![1]).toMatch(/opacity:\s*0/);
    expect(hide![1]).toMatch(/translate:\s*0 24px/);
    expect(hide![1]).not.toMatch(/transition/);
    const shown = block.match(/html\[data-reveal-armed\][^{]*\[data-revealed\]\s*\{([^}]*)\}/g)!.find((r) => !r.includes(':not('))!;
    expect(shown).toMatch(/transition:[\s\S]*0\.7s cubic-bezier\(0\.22, 1, 0\.36, 1\) var\(--reveal-delay, 0s\)/);
    // nothing outside the gated block hides [data-reveal] in the base CSS
    const outside = css.slice(0, start) + css.slice(start + block.length);
    expect(outside).not.toMatch(/\[data-reveal(="io")?\][^{]*\{[^}]*opacity:\s*0/);
  });
});
