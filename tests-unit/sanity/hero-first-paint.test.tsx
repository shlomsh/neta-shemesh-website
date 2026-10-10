/**
 * SANITY: hero first paint (NS-26).
 *
 * History: the hero text (H1, subtext, CTA) sat behind a CSS entrance that animated `opacity` from 0, so on a
 * slow phone the page looked blank until the animation caught up. The text must be visible in the very first
 * paint of the server HTML: no opacity:0 / visibility:hidden / hidden-until-animated class on the text or any
 * ancestor, and the `.hero-enter` settle is transform-only. Only decorative strokes, blob and line art may
 * start hidden (and they are aria-hidden / svg).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { ROOT, buttons, expectNone, renderHome } from './helpers';

let hero: HTMLElement;
const cta = () => buttons(hero).find((a) => a.getAttribute('href') === '#contact')!;
beforeAll(async () => {
  const home = await renderHome();
  hero = home.querySelector<HTMLElement>('section#hero')!;
});

const HIDING_CLASS = /(^|:)(opacity-0|invisible|hidden|collapse|sr-only|scale-0)$/;

function hidingReasons(el: Element, stopAt: Element): string[] {
  const out: string[] = [];
  for (let n: Element | null = el; n && n !== stopAt.parentElement; n = n.parentElement) {
    const style = (n.getAttribute('style') ?? '').replace(/\s/g, '');
    if (/opacity:0(?![.\d])/.test(style)) out.push(`<${n.tagName.toLowerCase()}> inline opacity:0`);
    if (/visibility:hidden/.test(style)) out.push(`<${n.tagName.toLowerCase()}> inline visibility:hidden`);
    if (/display:none/.test(style)) out.push(`<${n.tagName.toLowerCase()}> inline display:none`);
    if (n.hasAttribute('hidden')) out.push(`<${n.tagName.toLowerCase()}> hidden attribute`);
    if (n.hasAttribute('data-reveal')) out.push(`<${n.tagName.toLowerCase()}> data-reveal wrapper (reveal gating)`);
    for (const c of (n.getAttribute('class') ?? '').split(/\s+/)) {
      if (HIDING_CLASS.test(c)) out.push(`<${n.tagName.toLowerCase()}> class ${c}`);
    }
  }
  return out;
}

describe('hero server HTML shows its text from the first paint (owner ruling: hero text never starts at opacity 0)', () => {
  it('no opacity:0, visibility:hidden, display:none or reveal gate on the H1, subtext, CTA or logo/nav row', () => {
    const targets: Array<[string, Element | null]> = [
      ['h1', hero.querySelector('h1')],
      ['subtext', hero.querySelector('p')],
      ['cta', cta()],
      ['banner', hero.querySelector('[role="banner"]')],
    ];
    for (const [label, el] of targets) {
      expect(el, `hero ${label} is missing from the server markup`).not.toBeNull();
      expectNone(hidingReasons(el!, hero), `hero ${label} is hidden in the server HTML`);
    }
  });
});

describe('hero entrance CSS never hides text', () => {
  const css = readFileSync(join(ROOT, 'src/app/globals.css'), 'utf8');
  const stripMedia = (s: string) => s.replace(/@media[^{]*\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, '');
  const outsideMedia = stripMedia(css);

  it('@keyframes hero-enter animates transform only (no opacity, no visibility)', () => {
    const m = outsideMedia.match(/@keyframes\s+hero-enter\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/);
    expect(m, '@keyframes hero-enter').not.toBeNull();
    expect(m![1]).toMatch(/transform/);
    expect(m![1]).not.toMatch(/opacity|visibility|display/);
  });

  it('no .hero-enter* rule sets opacity, visibility or display', () => {
    const rules = [...outsideMedia.matchAll(/\.hero-enter[\w-]*\s*\{([^{}]*)\}/g)].map((m) => m[1]);
    expect(rules.length).toBeGreaterThan(0);
    for (const body of rules) expect(body).not.toMatch(/opacity|visibility|display/);
  });
});
