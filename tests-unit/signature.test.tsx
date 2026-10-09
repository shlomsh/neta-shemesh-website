import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { Signature } from '@/components/sections/bio/Signature';
import { SITE } from '@/content/site';

describe('NS-55 Signature', () => {
  const html = renderToStaticMarkup(<Signature />);
  it('renders the site name in Elamy signature type, visible without JS', () => {
    expect(html).toContain(SITE.name);
    expect(html).toContain('type-signature');
    expect(html).not.toMatch(/opacity|visibility|display:\s*none|style=/);
  });
  it('hides only under armed + no-preference', () => {
    const css = readFileSync('src/app/globals.css', 'utf8');
    const m = css.match(/@media \(prefers-reduced-motion: no-preference\) \{\s*html\[data-reveal-armed\][^}]*\.sig-name/);
    expect(m).not.toBeNull();
    expect(css).not.toMatch(/^\.sig-name\s*\{[^}]*clip-path/m);
  });
});
