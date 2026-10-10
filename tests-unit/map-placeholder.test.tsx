import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderToString } from 'react-dom/server';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MapEmbed } from '../src/components/sections/contact/MapEmbed';
import { mapEmbedSrc } from '../src/content/site';

const BOX = 'h-[16.25rem] lg:h-full lg:min-h-[22.5rem]';
const source = (f: string) => readFileSync(join(process.cwd(), 'src/components/sections/contact', f), 'utf8');

describe('MapEmbed: lazy iframe over a designed placeholder (NS-28)', () => {
  it('server HTML has the plain lazy iframe with the same src, title and sandbox', () => {
    const html = renderToString(<MapEmbed className={BOX} />);
    const frame = html.match(/<iframe[^>]*>/)![0];
    expect(frame.replace(/&amp;/g, '&')).toContain(`src="${mapEmbedSrc()}"`);
    expect(frame).toContain('title="מיקום הקליניקה"');
    expect(frame).toContain('loading="lazy"');
    expect(frame).toContain('sandbox="allow-same-origin allow-scripts allow-popups allow-forms"');
    expect(frame).toMatch(/allowfullscreen/i);
    expect(html).not.toContain('<noscript');
  });

  it('the illustration sits behind the iframe (earlier in the DOM, both absolutely filling the box)', () => {
    const { container } = render(<MapEmbed className={BOX} />);
    const wrap = container.firstElementChild as HTMLElement;
    const svg = wrap.querySelector('svg')!;
    const frame = wrap.querySelector('iframe')!;
    expect(svg.getAttribute('aria-hidden')).toBe('true');
    expect(svg.className.baseVal).toContain('absolute inset-0');
    expect(svg.className.baseVal).toContain('pointer-events-none');
    expect(frame.className).toContain('absolute inset-0 w-full h-full');
    expect(svg.compareDocumentPosition(frame) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('keeps the box: the wrapper owns the size classes', () => {
    const { container } = render(<MapEmbed className={BOX} />);
    const wrap = container.firstElementChild as HTMLElement;
    expect(wrap.hasAttribute('data-map-embed')).toBe(true);
    for (const c of ['h-[16.25rem]', 'lg:h-full', 'lg:min-h-[22.5rem]', 'relative', 'rounded-tile', 'overflow-hidden', 'bg-plum']) {
      expect(wrap.className).toContain(c);
    }
  });

  it('has no client code and no mauve text or text surface', () => {
    expect(source('MapEmbed.tsx')).not.toContain("'use client'");
    for (const f of ['MapEmbed.tsx', 'MapIllustration.tsx']) {
      expect(source(f), f).not.toMatch(/text-mauve|bg-mauve|text-blush/);
    }
  });
});
