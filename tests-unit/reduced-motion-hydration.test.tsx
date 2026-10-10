/**
 * Guards the reduced-motion hydration fix (8fcd901) under the CSS motion model (owner ruling: reduced motion
 * is handled in CSS, never by branching on useReducedMotion).
 *
 * Original bug: components branched on `useReducedMotion()` (false on the server, true on the first
 * client render under `prefers-reduced-motion: reduce`). The SSR HTML shipped the motion initial state
 * (`style="opacity:0"`), React hydration does not patch mismatched style attributes, so reduce-motion
 * users saw blank sections.
 *
 * Now: ScrollReveal, ContactFAB and ParallaxFrame are all server components with no hidden state in their
 * markup at all (NS-13/14/15). The reveal hidden state is CSS, armed by RevealObserver, only under
 * `prefers-reduced-motion: no-preference`; the FAB entrance is the `.fab-enter` keyframe and the parallax a
 * scroll-driven animation, both off (or static) under reduce. This file guards the markup and the CSS.
 */
import React, { act } from 'react';
import fs from 'fs';
import path from 'path';
import { describe, it, expect, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { renderToStaticMarkup, renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';

import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { ContactFAB } from '@/components/site/ContactFAB';
import { ParallaxFrame } from '@/components/motion/ParallaxFrame';
import { Footer } from '@/components/site/footer/Footer';

const ROOT = path.resolve(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const code = (p: string) => read(p).replace(/\/\*[\s\S]*?\*\/|\/\/.*$/gm, '');
const css = read('src/app/globals.css');

afterEach(() => cleanup());

const reveal = (delay?: number) => (
  <ScrollReveal delay={delay} className="x y">
    <p>hi</p>
  </ScrollReveal>
);

describe('reveal components ship no hidden state in their markup', () => {
  const cases: Array<[string, () => React.ReactElement]> = [
    ['ScrollReveal', () => reveal(0.1)],
    ['Footer (staggered ScrollReveal blocks)', () => <Footer />],
    ['ContactFAB', () => <ContactFAB />],
    // eslint-disable-next-line @next/next/no-img-element -- test fixture markup, not shipped
    ['ParallaxFrame', () => <ParallaxFrame className="h-10"><img alt="" src="/a.jpg" /></ParallaxFrame>],
  ];

  it.each(cases)('%s: server markup has no inline opacity / transform / translate / visibility', (_name, make) => {
    const html = renderToString(make());
    expect(html).not.toMatch(/opacity:\s*0/);
    // inline styles may carry custom properties (--reveal-delay, --parallax-*) and next/image geometry, never a hidden state
    for (const m of html.matchAll(/style="([^"]*)"/g)) expect(m[1]).not.toMatch(/(^|;)\s*(opacity|transform|translate|scale|visibility)\s*:/);
  });

  it('ScrollReveal carries the hooks the CSS and RevealObserver key off, and the delay only as the --reveal-delay custom property', () => {
    expect(renderToStaticMarkup(reveal(0.24))).toBe('<div data-reveal="io" class="x y" style="--reveal-delay:0.24s"><p>hi</p></div>');
    expect(renderToStaticMarkup(reveal())).toBe('<div data-reveal="io" class="x y"><p>hi</p></div>');
  });

  it('renders the same markup on the server and on the client, and hydrates without a mismatch warning', async () => {
    // react-dom/server writes `style="--a:1s"`, the client DOM serialises `style="--a: 1s;"`: same style.
    const norm = (html: string) => html.replace(/style="([^"]*)"/g, (_, v: string) => `style="${v.replace(/\s|;$/g, '')}"`);
    for (const delay of [undefined, 0.36]) {
      const client = norm(render(reveal(delay)).container.innerHTML);
      cleanup();
      expect(client).toBe(norm(renderToString(reveal(delay))));
    }
    const errors: unknown[] = [];
    const container = document.body.appendChild(document.createElement('div'));
    container.innerHTML = renderToString(reveal(0.12));
    await act(async () => {
      hydrateRoot(container, reveal(0.12), { onRecoverableError: (e) => errors.push(e) });
    });
    expect(errors).toEqual([]);
    container.remove();
  });
});

describe('structural guards (source + CSS)', () => {
  it.each([
    'src/components/motion/ScrollReveal.tsx',
    'src/components/site/footer/Footer.tsx',
    'src/components/site/ContactFAB.tsx',
    'src/components/motion/ParallaxFrame.tsx',
  ])('%s does not call useReducedMotion (SSR/client branch)', (f) => {
    expect(code(f)).not.toMatch(/useReducedMotion/);
  });

  it.each([
    'src/components/motion/ScrollReveal.tsx',
    'src/components/site/ContactFAB.tsx',
    'src/components/motion/ParallaxFrame.tsx',
  ])('%s is a server component (no client directive, no framer-motion)', (f) => {
    expect(code(f)).not.toMatch(/use client|framer-motion/);
  });

  it('the parallax drift is CSS-only: a scroll-driven animation only under no-preference AND where animation-timeline is supported, static otherwise', () => {
    const m = css.match(/@media \(prefers-reduced-motion: no-preference\)\s*\{\s*@supports \(animation-timeline: view\(\)\)\s*\{([\s\S]*?)\n  \}\n\}/);
    expect(m).not.toBeNull();
    expect(m![1]).toMatch(/animation-name:\s*parallax-drift/);
    expect(css).toMatch(/\[data-parallax\]\s*\{\s*transform:\s*translateY\(0\) scale\(var\(--parallax-scale, 1\)\)/); // static midpoint outside the gate
  });

  it('the FAB entrance is a CSS keyframe with a visible rest state, switched off under reduce, and the FAB markup has no inline hidden state', () => {
    expect(css).toMatch(/\.fab-enter\s*\{\s*animation:\s*fab-fade[^;]*;/);
    expect(css).toMatch(/@keyframes fab-fade\s*\{\s*from\s*\{\s*opacity:\s*0;\s*\}\s*to\s*\{\s*opacity:\s*1;/);
    expect(css).toMatch(/@media \(prefers-reduced-motion: reduce\)\s*\{\s*\.fab-enter\s*\{\s*animation:\s*none;/);
    expect(css.match(/\.fab-enter\s*\{([^}]*)\}/)![1], 'the rest state never hides it').not.toMatch(/opacity|visibility/);
    const html = renderToString(<ContactFAB />);
    expect(html).not.toMatch(/style=/);
    expect(html).toMatch(/class="fab-enter /);
  });

  it('under reduce [data-parallax] is static and no [data-reveal] override exists (its hidden state is gated on no-preference, nothing to force visible)', () => {
    const idx = css.indexOf('@media (prefers-reduced-motion: reduce)');
    expect(idx).toBeGreaterThan(-1);
    const block = css.slice(idx, css.indexOf('@utility safari-clip'));
    expect(block).toMatch(/\[data-parallax\]\s*\{[^}]*transform:\s*none\s*!important/);
    // the framer-motion-era `[data-reveal] { opacity: 1 !important; transform: none !important }` belt is gone: the
    // reveal hides nothing under reduce (next test), so there is no inline opacity:0 left for it to beat
    expect(block).not.toMatch(/\[data-reveal\]\s*\{/);
  });

  it('the hidden state is gated on JS arming AND no-preference; the transition is on the revealed state only', () => {
    const start = css.indexOf('@media (prefers-reduced-motion: no-preference)');
    expect(start).toBeGreaterThan(-1);
    const block = css.slice(start, css.indexOf('@media (prefers-reduced-motion: reduce)', start));
    // exactly one hiding rule, and it needs html[data-reveal-armed] + :not([data-revealed])
    const hide = block.match(/html\[data-reveal-armed\][^{]*:not\(\[data-revealed\]\)\s*\{([^}]*)\}/);
    expect(hide).not.toBeNull();
    expect(hide![1]).toMatch(/opacity:\s*0/);
    expect(hide![1]).not.toMatch(/transition/);
    const shown = block.match(/html\[data-reveal-armed\][^{]*\[data-revealed\]\s*\{([^}]*)\}/g)!.find((r) => !r.includes(':not('))!;
    expect(shown).toMatch(/transition:/);
    // nothing outside the gated block hides [data-reveal] in the base CSS
    const outside = css.slice(0, start) + css.slice(start + block.length);
    expect(outside).not.toMatch(/\[data-reveal(="io")?\][^{]*\{[^}]*opacity:\s*0/);
  });
});
