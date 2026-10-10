/**
 * SANITY: the Section / Container primitives are the only place that spells the one-screen shell.
 *
 * What it guards (contracts, not class spellings): `fit` keeps publishing `data-fit` AND the classes that
 * implement it, `tone` sets the tone attribute, callers cannot override what the props own, and every
 * spacing utility Section/Container emit has a `@theme` token behind it (an undefined token is silently no
 * CSS at all). That nobody else writes the shell is the `lockups` ban in source-scan.test.ts.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { classTokens, fitOf, globalsCss, hasLgMinScreen, hasPhoneContentHeight, oneScreenMode, phoneMode, phoneOf, stripCssComments } from './helpers';

function html(node: React.ReactElement): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(node);
  return holder;
}
const sectionOf = (node: React.ReactElement) => html(node).querySelector('section')!;

describe('Section: fit publishes data-fit AND emits the classes that implement it', () => {
  it.each([
    ['free', () => <Section fit="free">x</Section>, 'free', 'free'],
    ['lock', () => <Section fit="lock">x</Section>, 'lock', 'lock-720'],
    ['lock floor={false}', () => <Section fit="lock" floor={false}>x</Section>, 'lock', 'lock-100'],
    ['grow', () => <Section fit="grow">x</Section>, 'grow', 'grow-720'],
  ] as const)('%s', (_name, render, fit, mode) => {
    const el = sectionOf(render());
    expect(fitOf(el)).toBe(fit);
    expect(oneScreenMode(el), 'data-fit and the implementing classes must agree').toBe(mode);
  });

  it('phone defaults to content (no min-height below lg, still a screen from lg); phone="screen" is screen-fit at every width', () => {
    for (const fit of ['free', 'lock', 'grow'] as const) {
      const el = sectionOf(<Section fit={fit}>x</Section>);
      expect(phoneMode(el), fit).toBe('content');
      expect(hasPhoneContentHeight(el), `${fit}: no unprefixed height`).toBe(true);
      expect(hasLgMinScreen(el), `${fit}: still a screen from lg`).toBe(true);
      const screen = sectionOf(<Section fit={fit} phone="screen">x</Section>);
      expect(phoneMode(screen), fit).toBe('screen');
      expect(classTokens(screen), fit).toContain('screen-fit');
    }
  });

  it('callers cannot override data-fit / data-phone / data-bg-tone by hand (the props own them)', () => {
    const spread = { 'data-fit': 'lock', 'data-bg-tone': 'dark', 'data-phone': 'screen' } as Record<string, string>;
    const el = sectionOf(<Section fit="free" tone="cream" {...spread}>x</Section>);
    expect([fitOf(el), phoneOf(el), el.getAttribute('data-bg-tone')]).toEqual(['free', 'content', 'cream']);
    const bare = sectionOf(<Section {...spread}>x</Section>);
    for (const attr of ['data-fit', 'data-phone', 'data-bg-tone']) expect(bare.hasAttribute(attr), `${attr} without its prop`).toBe(false);
  });

  it('types: floor only with fit="lock", center and phone only with a fit', () => {
    // Checked by `tsc --noEmit` (vitest does not type-check); at runtime these just render.
    // @ts-expect-error floor is only accepted with fit="lock"
    sectionOf(<Section fit="grow" floor={false}>x</Section>);
    // @ts-expect-error center needs a fit
    sectionOf(<Section center="middle">x</Section>);
    // @ts-expect-error phone needs a fit
    sectionOf(<Section phone="screen">x</Section>);
  });

  it('no fit = content height (no data-fit, no data-phone, no screen-fit); tone sets data-bg-tone, no tone = none (photo sections)', () => {
    const el = sectionOf(<Section tone="cream">x</Section>);
    expect(el.hasAttribute('data-fit') || el.hasAttribute('data-phone')).toBe(false);
    expect(classTokens(el)).not.toContain('screen-fit');
    for (const tone of ['dark', 'mid', 'light', 'cream'] as const) expect(sectionOf(<Section tone={tone}>x</Section>).getAttribute('data-bg-tone')).toBe(tone);
    expect(sectionOf(<Section>x</Section>).hasAttribute('data-bg-tone')).toBe(false);
  });
});

describe('spacing tokens behind the utilities Section/Container emit', () => {
  it('every px-gutter* / py-section* utility they emit has its --spacing-* token in @theme', () => {
    const themeBlock = stripCssComments(globalsCss()).match(/@theme\s*\{([\s\S]*?)\n\}/)![1];
    const emitted = new Set<string>();
    const collect = (el: Element) => classTokens(el).filter((t) => /^p[xy]-[a-z-]+$/.test(t)).forEach((t) => emitted.add(t.slice(3)));
    for (const pad of ['section', 'tight'] as const) collect(sectionOf(<Section pad={pad}>x</Section>));
    for (const gutter of ['default', 'wide'] as const) collect(html(<Container gutter={gutter}>x</Container>).firstElementChild!);
    expect([...emitted].sort(), 'Section/Container no longer emit the token utilities').toEqual(['gutter', 'gutter-wide', 'section', 'section-tight']);
    for (const name of emitted) expect(themeBlock, `--spacing-${name} missing from @theme: the utility generates no CSS`).toContain(`--spacing-${name}:`);
  });
});
