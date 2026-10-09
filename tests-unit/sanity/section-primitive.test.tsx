/**
 * SANITY: the Section / Container primitives are the only place that spells the one-screen shell.
 *
 * What it guards: `fit` keeps emitting both `data-fit` and the classes that implement it, the section
 * shell is not hand-written again in a component, and the spacing utilities Section/Container emit
 * (`py-section`, `px-gutter-wide`, ...) have a `@theme` token behind them (an undefined token is
 * silently no CSS at all).
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import {
  classMode,
  classTokens,
  fitOf,
  globalsCss,
  isOneScreen,
  oneScreenMode,
  readSources,
  sourceNamed,
  stripCssComments,
} from './helpers';

function html(node: React.ReactElement): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(node);
  return holder;
}
const sectionOf = (node: React.ReactElement) => html(node).querySelector('section')!;

describe('Section: fit publishes data-fit AND emits the classes that implement it', () => {
  const cases: Array<[string, () => React.ReactElement, 'free' | 'lock' | 'grow', string, boolean]> = [
    ['free', () => <Section fit="free">x</Section>, 'free', 'free', false],
    ['lock', () => <Section fit="lock">x</Section>, 'lock', 'lock-720', true],
    ['lock floor={false}', () => <Section fit="lock" floor={false}>x</Section>, 'lock', 'lock-100', true],
    ['grow', () => <Section fit="grow">x</Section>, 'grow', 'grow-720', true],
  ];
  it.each(cases)('%s', (_name, render, fit, mode, one) => {
    const el = sectionOf(render());
    expect(fitOf(el)).toBe(fit);
    expect(classMode(el)).toBe(mode);
    expect(oneScreenMode(el)).toBe(mode);
    expect(isOneScreen(el)).toBe(one);
    expect(classTokens(el)).toEqual(expect.arrayContaining(['screen-fit', 'flex', 'flex-col', 'justify-center']));
  });

  it('callers cannot override data-fit / data-bg-tone by hand (the props own them)', () => {
    const spread = { 'data-fit': 'lock', 'data-bg-tone': 'dark' } as Record<string, string>;
    const el = sectionOf(<Section fit="free" tone="cream" {...spread}>x</Section>);
    expect(fitOf(el)).toBe('free');
    expect(el.getAttribute('data-bg-tone')).toBe('cream');
    const bare = sectionOf(<Section {...spread}>x</Section>);
    expect(bare.hasAttribute('data-fit')).toBe(false);
    expect(bare.hasAttribute('data-bg-tone')).toBe(false);
  });

  it('types: floor only with fit="lock", center only with a fit', () => {
    // These lines are checked by `tsc --noEmit` (vitest does not type-check); at runtime they just render.
    // @ts-expect-error floor is only accepted with fit="lock"
    sectionOf(<Section fit="grow" floor={false}>x</Section>);
    // @ts-expect-error center needs a fit
    sectionOf(<Section center="middle">x</Section>);
    // @ts-expect-error floor needs a fit
    sectionOf(<Section floor={false}>x</Section>);
  });

  it('no fit = content height: no data-fit, no min-h, no flex', () => {
    const el = sectionOf(<Section tone="cream">x</Section>);
    expect(el.hasAttribute('data-fit')).toBe(false);
    expect(classTokens(el)).not.toContain('screen-fit');
    expect(classTokens(el)).not.toContain('flex');
    expect(el.getAttribute('data-bg-tone')).toBe('cream');
  });

  it('center: middle = a row centring one child on both axes; start = column top-aligned from lg; default = centred column', () => {
    const middle = classTokens(sectionOf(<Section fit="free" center="middle">x</Section>));
    expect(middle).toEqual(expect.arrayContaining(['flex', 'items-center', 'justify-center']));
    expect(middle).not.toContain('flex-col');
    const start = classTokens(sectionOf(<Section fit="lock" center="start">x</Section>));
    expect(start).toEqual(expect.arrayContaining(['flex-col', 'justify-center', 'lg:justify-start']));
    const dflt = classTokens(sectionOf(<Section fit="free">x</Section>));
    expect(dflt).toContain('flex-col');
    expect(dflt).not.toContain('lg:justify-start');
  });
});

describe('Section: tone, pad, overflow, seam, anchor, dir', () => {
  it.each(['dark', 'mid', 'light', 'cream'] as const)('tone=%s sets data-bg-tone', (tone) => {
    expect(sectionOf(<Section tone={tone}>x</Section>).getAttribute('data-bg-tone')).toBe(tone);
  });
  it('no tone = no data-bg-tone (photo sections)', () => {
    expect(sectionOf(<Section>x</Section>).hasAttribute('data-bg-tone')).toBe(false);
  });
  it('pad maps to one token class, none adds nothing', () => {
    expect(classTokens(sectionOf(<Section pad="section">x</Section>))).toContain('py-section');
    expect(classTokens(sectionOf(<Section pad="tight">x</Section>))).toContain('py-section-tight');
    expect(classTokens(sectionOf(<Section>x</Section>)).filter((t) => t.startsWith('py-'))).toEqual([]);
  });
  it('every Section is relative + overflow-hidden (there is no overflow prop)', () => {
    for (const render of [() => <Section>x</Section>, () => <Section fit="lock">x</Section>, () => <Section tone="cream" pad="section" seam>x</Section>]) {
      expect(classTokens(sectionOf(render()))).toEqual(expect.arrayContaining(['relative', 'w-full', 'overflow-hidden']));
    }
  });
  it('seam adds -mt-px, otherwise none', () => {
    expect(classTokens(sectionOf(<Section seam>x</Section>))).toContain('-mt-px');
    expect(classTokens(sectionOf(<Section>x</Section>))).not.toContain('-mt-px');
  });
  it('anchor renders a zero-height ScrollAnchor immediately before the section', () => {
    const root = html(<Section id="s" anchor="a">x</Section>);
    const anchor = root.firstElementChild!;
    expect(anchor.id).toBe('a');
    expect(anchor.getAttribute('aria-hidden')).toBe('true');
    expect(classTokens(anchor)).toEqual(expect.arrayContaining(['invisible', 'h-0']));
    expect(anchor.nextElementSibling!.tagName).toBe('SECTION');
    expect(anchor.nextElementSibling!.id).toBe('s');
  });
  it('id is optional; Section emits no dir of its own (<html dir="rtl"> sets it)', () => {
    expect(sectionOf(<Section>x</Section>).hasAttribute('id')).toBe(false);
    expect(sectionOf(<Section>x</Section>).hasAttribute('dir')).toBe(false);
  });
  it('types: dir is not a Section prop (type-level check only; at runtime the rest props still spread)', () => {
    // @ts-expect-error `dir` is not a Section prop; tsc fails this line if it ever becomes one
    expect(sectionOf(<Section dir="rtl">x</Section>).hasAttribute('dir')).toBe(true);
  });
});

describe('Container: one padding class, never two fighting by CSS source order', () => {
  it.each([
    ['default', 'px-gutter'],
    ['wide', 'px-gutter-wide'],
  ] as const)('gutter=%s -> %s', (gutter, cls) => {
    const el = html(<Container gutter={gutter}>x</Container>).firstElementChild!;
    expect(classTokens(el).filter((t) => t.startsWith('px-'))).toEqual([cls]);
  });
  it('gutter=none has no px class; maxWidth 3xl is 1440', () => {
    const el = html(<Container gutter="none" maxWidth="3xl">x</Container>).firstElementChild!;
    expect(classTokens(el).filter((t) => t.startsWith('px-'))).toEqual([]);
    expect(classTokens(el)).toContain('max-w-[1440px]');
  });
});

describe('the shell is spelled once', () => {
  /** the lock/grow height classes may only be written in Section.tsx */
  const LOCK_GROW = /lg:h-\[(?:max\(100svh,720px\)|100svh)\]|lg:min-h-\[max\(100svh,720px\)\]/;

  it('positive control: the pattern flags a hand-written lock/grow and spares the rest', () => {
    for (const bad of ['lg:h-[max(100svh,720px)]', 'lg:h-[100svh]', 'lg:min-h-[max(100svh,720px)]']) expect(LOCK_GROW.test(bad), bad).toBe(true);
    for (const good of ['min-h-[100svh]', 'lg:h-[calc(100svh-160px)]', 'lg:min-h-[320px]', 'fit="lock"']) expect(LOCK_GROW.test(good), good).toBe(false);
  });

  it('no component other than Section.tsx writes a lock/grow height class', () => {
    const offenders = readSources()
      .filter((f) => /\.tsx?$/.test(f.name) && f.path !== 'src/components/primitives/layout/Section.tsx')
      .filter((f) => f.text.split('\n').some((line) => LOCK_GROW.test(line) && !/^\s*(\/\/|\*|\{\/\*)/.test(line)))
      .map((f) => f.path);
    expect(offenders, 'use <Section fit="lock|grow"> instead of spelling the one-screen classes').toEqual([]);
  });

  it('the repeated paddings are tokens, not pasted arbitrary values', () => {
    const offenders = readSources()
      .filter((f) => /\.tsx$/.test(f.name))
      .filter((f) => /(?:px-\[clamp\(24px,5vw,80px\)\]|py-\[clamp\(56px,8vw,120px\)\]|px-\[clamp\(16px,4vw,48px\)\]|py-\[clamp\(48px,5vw,96px\)\])/.test(f.text))
      .map((f) => f.path);
    expect(offenders, 'use Container gutter / Section pad (px-gutter, px-gutter-wide, py-section, py-section-tight)').toEqual([]);
  });
});

describe('spacing tokens behind the utilities Section/Container emit', () => {
  const theme = stripCssComments(globalsCss());
  const themeBlock = theme.match(/@theme\s*\{([\s\S]*?)\n\}/)![1];

  it.each([
    ['px-gutter', '--spacing-gutter', 'clamp(16px, 4vw, 48px)'],
    ['px-gutter-wide', '--spacing-gutter-wide', 'clamp(24px, 5vw, 80px)'],
    ['py-section', '--spacing-section', 'clamp(56px, 8vw, 120px)'],
    ['py-section-tight', '--spacing-section-tight', 'clamp(48px, 5vw, 96px)'],
  ])('%s is backed by %s: %s in @theme', (utility, token, value) => {
    expect(themeBlock, `${token} missing from @theme`).toContain(`${token}: ${value};`);
    const src = sourceNamed('components/primitives/layout/Section.tsx').text + sourceNamed('components/primitives/layout/Container.tsx').text;
    expect(src, `${utility} no longer emitted by Section/Container`).toContain(`'${utility}'`);
  });
});
