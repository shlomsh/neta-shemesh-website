/**
 * SANITY: the content-agnostic UI primitives (Card, Photo, MaskIcon, IconButton, SectionTitle,
 * SectionHeader) keep their contracts. Contracts, not spellings: a rounded frame stays clipped (a lost
 * `safari-clip` is a Safari-only bug nobody sees in Chromium), a title/subtitle lockup stays what CLAUDE.md
 * typography rule 8 says, the type-restricted props stay restricted (`@ts-expect-error`, checked by
 * `tsc --noEmit`). That no component re-types the markup these own is the `lockups` ban in source-scan.test.ts.
 */
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { Card } from '@/components/primitives/layout/Card';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { MaskIcon } from '@/components/primitives/ui/MaskIcon';
import { Photo } from '@/components/primitives/ui/Photo';
import { SectionHeader, SectionSubtitle } from '@/components/primitives/ui/SectionHeader';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { classTokens, hasClass, typeClassesOf } from './helpers';

function root(node: React.ReactElement): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(node);
  return holder;
}
const first = (node: React.ReactElement) => root(node).firstElementChild as HTMLElement;

describe('Card: the tone is owned by the primitive', () => {
  it('cream and veil are both the cream tone (the tone rule paints a cream card; veil adds the translucent surface var); callers cannot override it', () => {
    const cream = first(<Card surface="cream" pad="lg">x</Card>);
    expect(cream.getAttribute('data-bg-tone')).toBe('cream');
    expect(hasClass(cream, 'rounded-card')).toBe(true);
    expect(classTokens(cream).filter((t) => t.startsWith('bg-')), 'no hand-written bg: the tone rule paints it').toEqual([]);
    const veil = first(<Card surface="veil" pad="md">x</Card>);
    expect(veil.getAttribute('data-bg-tone')).toBe('cream');
    expect(hasClass(veil, 'bg-[var(--surface-veil)]')).toBe(true);
    const spread = { 'data-bg-tone': 'dark' } as Record<string, string>;
    expect(first(<Card surface="cream" pad="md" {...spread}>x</Card>).getAttribute('data-bg-tone')).toBe('cream');
  });
});

describe('Photo: clipped cover-fitted frame', () => {
  const img = (el: Element) => el.querySelector('img')!;

  it('a rounded frame is clipped (safari-clip) and its image covers the frame, lazy, with the given alt and sizes', () => {
    const el = first(<Photo src="/a.webp" alt="alt" sizes="100vw" radius="card" />);
    expect(classTokens(el)).toEqual(expect.arrayContaining(['overflow-hidden', 'rounded-card', 'safari-clip']));
    expect(classTokens(img(el))).toContain('object-cover');
    expect(img(el).getAttribute('loading')).toBe('lazy');
    expect(img(el).getAttribute('alt')).toBe('alt');
    expect(img(el).getAttribute('sizes')).toBe('100vw');
    expect(classTokens(first(<Photo src="/a" alt="" sizes="100vw" radius="tile" />))).toEqual(expect.arrayContaining(['rounded-tile', 'safari-clip']));
  });

  it('safariClip={false} and radius="none" drop only the clip', () => {
    const noClip = classTokens(first(<Photo src="/a" alt="" sizes="100vw" radius="card" safariClip={false} />));
    expect(noClip).toContain('rounded-card');
    expect(noClip).not.toContain('safari-clip');
    const none = classTokens(first(<Photo src="/a" alt="" sizes="100vw" radius="none" />));
    expect(none).not.toContain('safari-clip');
    expect(none.filter((t) => t.startsWith('rounded-'))).toEqual([]);
  });

  it('children are overlays drawn after the photo, inside the frame; a ratio is an aspect-ratio on the frame (no padding spacer)', () => {
    const el = first(<Photo src="/a" alt="" sizes="100vw" radius="card"><div id="label" /></Photo>);
    expect([el.children[0].tagName, el.children[1].id]).toEqual(['IMG', 'label']);
    const ratio = root(<Photo src="/a" alt="" sizes="100vw" radius="none" ratio="100/62" loading="eager" />).querySelector('div')!; // React 19 puts a preload <link> before a non-lazy image
    expect(classTokens(ratio)).toContain('aspect-[100/62]');
    expect(ratio.children.length, 'the image is the only child: no spacer div').toBe(1);
  });

  it('types: sizes and radius are required, a parallax frame takes no overlays, a reveal frame takes no inline style', () => {
    // Checked by `tsc --noEmit` (vitest does not type-check); at runtime they just render.
    // @ts-expect-error sizes is required (it decides the srcset)
    first(<Photo src="/a" alt="" radius="card" />);
    // @ts-expect-error radius is required (no silent default)
    first(<Photo src="/a" alt="" sizes="100vw" />);
    // @ts-expect-error a parallax frame cannot carry overlays (they would drift with the photo)
    first(<Photo src="/a" alt="" sizes="100vw" radius="card" motion={{ parallax: 9 }}><i /></Photo>);
    // @ts-expect-error a reveal frame is the ScrollReveal element: no inline style
    first(<Photo src="/a" alt="" sizes="100vw" radius="card" motion={{ reveal: 0.1 }} style={{ gridArea: 'x' }} />);
  });
});

describe('MaskIcon / IconButton', () => {
  it('MaskIcon is a decorative currentColor mask from an SVG file; as="a" is a labelled link that draws its own focus ring and opens external links safely', () => {
    const span = first(<MaskIcon src="/i.svg" size="sm" />);
    expect(span.tagName).toBe('SPAN');
    expect(span.getAttribute('style')).toContain('mask-image:url(/i.svg)');
    const a = first(<MaskIcon as="a" href="https://x.test" label="X" external src="/i.svg" size="lg" />);
    expect(a.tagName).toBe('A');
    expect(a.getAttribute('aria-label')).toBe('X');
    expect(a.getAttribute('rel')).toBe('noopener noreferrer');
    expect(a.getAttribute('target')).toBe('_blank');
    expect(classTokens(a).some((t) => t.startsWith('focus-visible:')), 'an empty mask-painted anchor has no default focus indicator').toBe(true);
    expect(first(<MaskIcon as="a" href="/x" label="X" src="/i.svg" size="lg" />).hasAttribute('target')).toBe(false);
  });

  it('IconButton is a type=button with an aria-label, a 44px target and the shared focus ring; extras pass through', () => {
    const el = first(<IconButton label="Open" aria-expanded={false} className="md:hidden"><svg /></IconButton>);
    expect([el.tagName, el.getAttribute('type'), el.getAttribute('aria-label'), el.getAttribute('aria-expanded')]).toEqual(['BUTTON', 'button', 'Open', 'false']);
    expect(classTokens(el)).toEqual(expect.arrayContaining(['h-[44px]', 'w-[44px]', 'focus-ring', 'md:hidden']));
    // @ts-expect-error an icon-only button needs its accessible name
    first(<IconButton><svg /></IconButton>);
  });
});

describe('SectionTitle / SectionSubtitle / SectionHeader: the title lockup (CLAUDE.md typography rule 8)', () => {
  it('SectionTitle: h2 by default (h1 / p on request), bare type-title (700 is baked in), colour from --header-color', () => {
    const h2 = first(<SectionTitle id="t">Hi</SectionTitle>);
    expect([h2.tagName, h2.id]).toEqual(['H2', 't']);
    expect(typeClassesOf(h2)).toEqual(['type-title']);
    expect(hasClass(h2, 'font-bold'), 'type-title bakes the weight in').toBe(false);
    expect(hasClass(h2, 'text-[color:var(--header-color)]')).toBe(true);
    expect([first(<SectionTitle as="h1">x</SectionTitle>).tagName, first(<SectionTitle as="p">x</SectionTitle>).tagName]).toEqual(['H1', 'P']);
  });

  it('SectionHeader center: subtitle is a type-quote paragraph, max-w-prose, mt-3 md:mt-4, a sibling of the title (no wrapper)', () => {
    const r = root(<SectionHeader id="h" align="center" title="T" subtitle="S" />);
    expect(r.children.length).toBe(2);
    const [h, p] = Array.from(r.children);
    expect([h.tagName, p.tagName]).toEqual(['H2', 'P']);
    expect(typeClassesOf(p)).toEqual(['type-quote']);
    expect(classTokens(p)).toEqual(expect.arrayContaining(['max-w-prose', 'mt-3', 'md:mt-4']));
    expect(classTokens(first(<SectionSubtitle align="center">S</SectionSubtitle>))).toEqual(expect.arrayContaining(['type-quote', 'max-w-prose', 'mt-3', 'md:mt-4']));
  });

  it('SectionHeader column (the one Services exception): mt-5 md:mt-9, no 65ch cap, title and subtitle aligned the same way', () => {
    const [h, p] = Array.from(root(<SectionHeader id="h" align="column" title="T" subtitle="S" />).children);
    expect(classTokens(p)).toEqual(expect.arrayContaining(['type-quote', 'mt-5', 'md:mt-9']));
    expect(hasClass(p, 'max-w-prose')).toBe(false);
    for (const el of [h, p]) expect(classTokens(el), 'column alignment').toEqual(expect.arrayContaining(['text-center', 'md:text-start']));
  });

  it('SectionHeader onPhoto: cream title (on-dark) and cream subtitle', () => {
    const [h, p] = Array.from(root(<SectionHeader id="h" align="center" onPhoto title="T" subtitle="S" />).children);
    expect(hasClass(h, 'on-dark')).toBe(true);
    expect(hasClass(p, 'text-cream')).toBe(true);
  });
});
