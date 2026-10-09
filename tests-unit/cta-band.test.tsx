import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { CtaBand } from '@/components/sections/cta-band/CtaBand';
import { globalsCss, stripCssComments } from './sanity/helpers';

describe('NS-57 CTA band', () => {
  const html = renderToStaticMarkup(<CtaBand />);

  it('the button is route-absolute so it works from /blog too', () => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const a = doc.querySelector<HTMLAnchorElement>('a.btn-halo-target')!;
    expect(a.getAttribute('href')).toBe('/#contact');
    expect(a.textContent).toContain('מוזמנים ליצור קשר');
    expect(doc.querySelector('.btn-halo')?.getAttribute('aria-hidden')).toBe('true');
  });

  it('reduced motion: the halo ring animation exists only inside a no-preference block', () => {
    const css = stripCssComments(globalsCss());
    let rest = css;
    let sawHalo = false;
    const re = /@media \(prefers-reduced-motion: no-preference\)\s*\{/;
    for (let m = re.exec(rest); m; m = re.exec(rest)) {
      let depth = 1;
      let i = m.index + m[0].length;
      while (depth > 0 && i < rest.length) {
        depth += rest[i] === '{' ? 1 : rest[i] === '}' ? -1 : 0;
        i++;
      }
      if (/btn-halo/.test(rest.slice(m.index, i))) {
        expect(rest.slice(m.index, i)).toMatch(/\.btn-halo::before[^}]*animation:\s*btn-halo-breathe/);
        sawHalo = true;
      }
      rest = rest.slice(0, m.index) + rest.slice(i);
    }
    expect(sawHalo).toBe(true);
    expect(rest).not.toMatch(/\.btn-halo[^{}]*\{[^}]*animation\s*:\s*(?!none)/);
  });
});
