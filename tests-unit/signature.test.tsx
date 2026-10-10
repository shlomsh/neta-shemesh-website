import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Signature } from '@/components/sections/bio/Signature';
import { SIG_STROKES } from '@/components/sections/bio/signature-strokes';
import { SITE } from '@/content/site';

describe('NS-56 Signature (Elamy text revealed through a pen-stroke mask)', () => {
  const html = renderToStaticMarkup(<Signature />);
  const css = readFileSync('src/app/globals.css', 'utf8');
  it('exposes the name to AT and hides the drawing; no hidden state in the markup', () => {
    expect(html).toContain(`<span class="sr-only">${SITE.name}</span>`);
    expect(html).toMatch(/<svg[^>]*class="sig-mark[^"]*"[^>]*aria-hidden="true"/);
    expect(html).not.toMatch(/opacity|visibility|display:\s*none|stroke-dashoffset/);
  });
  it('shows the real Elamy text through the mask, with an opaque finale rect', () => {
    // The mask sits on a <g> with a sizing rect, not on the <text>: Safari clips an SVG text mask to the font-metric box (tail cut).
    expect(html).toMatch(/<g mask="url\(#sig-mask\)"><rect[^>]*><\/rect><text[^>]*class="sig-text"[^>]*>/);
    expect(html).toContain('class="sig-full"');
    expect(css).toMatch(/\.sig-full \{ opacity: 1; \}/);
  });
  it('draws every stroke as a pathLength=1 pen path in writing order with growing delays', () => {
    expect(html.match(/class="sig-pen"/g)?.length).toBe(SIG_STROKES.length);
    expect(SIG_STROKES.length).toBeGreaterThanOrEqual(6);
    const delays = SIG_STROKES.map((s) => s.delay);
    expect(delays).toEqual([...delays].sort((a, b) => a - b));
    const end = Math.max(...SIG_STROKES.map((s) => s.delay + s.dur));
    expect(end).toBeGreaterThan(2.5);
    expect(end).toBeLessThan(3.6);
  });
  it('hides only under armed + no-preference', () => {
    expect(css).toMatch(/@media \(prefers-reduced-motion: no-preference\) \{\s*html\[data-reveal-armed\][^}]*\.sig-pen/);
    expect(css).not.toMatch(/^\.sig-pen[^{]*\{[^}]*stroke-dashoffset:\s*1/m);
    expect(css).not.toMatch(/clip-path:[^;]*100%/);
  });
});
