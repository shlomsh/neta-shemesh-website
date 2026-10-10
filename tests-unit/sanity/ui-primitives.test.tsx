/**
 * SANITY: the content-agnostic UI primitives (Card, Photo, MaskIcon, IconButton, SectionTitle,
 * SectionHeader) emit what the site relies on, and the markup they replaced is written only there.
 *
 * What it guards: a variant keeps its classes (a lost `safari-clip` is a Safari-only bug nobody
 * sees in Chromium), the title / subtitle lockup stays what CLAUDE.md typography rule 8 says,
 * the type-restricted props stay restricted (`@ts-expect-error`, checked by `tsc --noEmit`), and no
 * component re-types the class lockups these primitives own.
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
import { classTokens, hasClass, readSources, typeClassesOf } from './helpers';

function root(node: React.ReactElement): HTMLElement {
  const holder = document.createElement('div');
  holder.innerHTML = renderToStaticMarkup(node);
  return holder;
}
const first = (node: React.ReactElement) => root(node).firstElementChild as HTMLElement;

describe('Card: surface + radius + padding, tone owned by the primitive', () => {
  it('cream: data-bg-tone=cream, rounded-card, no hand-written bg (the tone rule paints it)', () => {
    const el = first(<Card surface="cream" pad="lg" className="w-full">x</Card>);
    expect(el.getAttribute('data-bg-tone')).toBe('cream');
    expect(classTokens(el)).toEqual(expect.arrayContaining(['rounded-card', 'p-6', 'md:p-8', 'lg:p-10', 'w-full']));
    expect(classTokens(el).filter((t) => t.startsWith('bg-'))).toEqual([]);
  });
  it('veil: the same cream tone, translucent surface var, md padding stops at md:p-8', () => {
    const el = first(<Card surface="veil" pad="md">x</Card>);
    expect(el.getAttribute('data-bg-tone')).toBe('cream');
    expect(hasClass(el, 'bg-[var(--surface-veil)]')).toBe(true);
    expect(hasClass(el, 'md:p-8')).toBe(true);
    expect(hasClass(el, 'lg:p-10')).toBe(false);
  });
  it('data-bg-tone cannot be overridden by hand', () => {
    const spread = { 'data-bg-tone': 'dark' } as Record<string, string>;
    expect(first(<Card surface="cream" pad="md" {...spread}>x</Card>).getAttribute('data-bg-tone')).toBe('cream');
  });
});

describe('Photo: clipped cover-fitted frame', () => {
  const frame = (node: React.ReactElement) => first(node);
  const img = (el: Element) => el.querySelector('img')!;

  it('plain frame: relative overflow-hidden + rounded-card safari-clip, image covers the frame, lazy, alt kept', () => {
    const el = frame(<Photo src="/a.webp" alt="alt" sizes="100vw" radius="card" />);
    expect(classTokens(el)).toEqual(expect.arrayContaining(['relative', 'overflow-hidden', 'rounded-card', 'safari-clip']));
    // next/image `fill` pins the image to the frame with an inline style (absolute, 100% x 100%, inset 0).
    expect(classTokens(img(el))).toContain('object-cover');
    expect(img(el).getAttribute('data-nimg')).toBe('fill');
    expect(img(el).getAttribute('style')).toContain('position:absolute');
    expect(img(el).getAttribute('loading')).toBe('lazy');
    expect(img(el).getAttribute('alt')).toBe('alt');
    expect(img(el).getAttribute('style')).not.toContain('object-position');
  });
  it('safariClip={false} drops only the clip (a nested frame whose ancestor already has it)', () => {
    const t = classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="card" safariClip={false} />));
    expect(t).toContain('rounded-card');
    expect(t).not.toContain('safari-clip');
  });
  it('radius: tile = rounded-tile + safari-clip; none = neither', () => {
    expect(classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="tile" />))).toEqual(expect.arrayContaining(['rounded-tile', 'safari-clip']));
    const none = classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="none" />));
    expect(none).not.toContain('safari-clip');
    expect(none.filter((t) => t.startsWith('rounded-'))).toEqual([]);
  });
  it('ratio + fillCellAtLg: the ratio holds below lg, the grid cell decides from lg', () => {
    const t = classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="card" ratio="square" fillCellAtLg />));
    expect(t).toEqual(expect.arrayContaining(['aspect-square', 'lg:aspect-auto', 'lg:h-full']));
    const noFill = classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="card" ratio="4/3" />));
    expect(noFill).toContain('aspect-[4/3]');
    expect(noFill).not.toContain('lg:aspect-auto');
  });
  it('objectPosition lands on the image as a crop, outlined adds the plum outline, zoom scales on hover', () => {
    const el = frame(<Photo src="/a" alt="" sizes="100vw" radius="card" outlined zoom="self" objectPosition="30% 64%" />);
    expect(img(el).getAttribute('style')).toContain('object-position:30% 64%');
    expect(classTokens(el)).toEqual(expect.arrayContaining(['outline', 'outline-[1.5px]', 'outline-plum']));
    expect(hasClass(img(el), 'motion-safe:hover:scale-105')).toBe(true);
    expect(hasClass(img(frame(<Photo src="/a" alt="" sizes="100vw" radius="none" zoom="group" />)), 'motion-safe:group-hover:scale-[1.04]')).toBe(true);
  });
  it('the blog cover ratios are aspect-ratio on the frame, not a padding-top spacer; loading is lazy unless eager', () => {
    for (const [ratio, cls] of [['100/62', 'aspect-[100/62]'], ['100/58', 'aspect-[100/58]']] as const) {
      // React 19 puts a <link rel="preload"> before a non-lazy image, so look the frame up by tag.
      const el = root(<Photo src="/a" alt="" sizes="100vw" radius="none" ratio={ratio} loading="eager" />).querySelector('div')!;
      expect(classTokens(el)).toContain(cls);
      expect(el.children.length, 'the image is the only child: no spacer div').toBe(1);
      expect(img(el).getAttribute('loading')).toBe('eager');
    }
    expect(img(frame(<Photo src="/a" alt="" sizes="100vw" radius="none" />)).getAttribute('loading')).toBe('lazy');
  });
  it('children are overlays drawn after the photo, inside the frame', () => {
    const el = frame(<Photo src="/a" alt="" sizes="100vw" radius="card"><div id="label" /></Photo>);
    expect(el.children[0].tagName).toBe('IMG');
    expect(el.children[1].id).toBe('label');
  });
  it('parallax: the photo sits in the drifting layer, the frame keeps its radius; no `relative` of its own (ParallaxFrame decides)', () => {
    const el = frame(<Photo src="/a" alt="" sizes="100vw" radius="card" motion={{ parallax: 9 }} className="w-full" />);
    expect(el.querySelector('[data-parallax]')!.querySelector('img')).not.toBeNull();
    expect(classTokens(el)).toEqual(expect.arrayContaining(['overflow-clip', 'rounded-card', 'safari-clip', 'w-full']));
    const band = classTokens(frame(<Photo src="/a" alt="" sizes="100vw" radius="none" motion={{ parallax: 8 }} className="absolute inset-0" />));
    expect(band).toContain('absolute');
    expect(band).not.toContain('relative');
  });
  it('reveal: the ScrollReveal element is the frame (no wrapper), photo directly inside', () => {
    const el = frame(<Photo src="/a" alt="" sizes="100vw" radius="tile" motion={{ reveal: 0.2 }} />);
    expect(el.hasAttribute('data-reveal')).toBe(true);
    expect(classTokens(el)).toEqual(expect.arrayContaining(['relative', 'overflow-hidden', 'rounded-tile', 'safari-clip']));
    expect(el.firstElementChild!.tagName).toBe('IMG');
  });
  it('renders next/image with the given sizes', () => {
    const el = frame(<Photo src="/a.webp" alt="" sizes="100vw" radius="card" />);
    expect(img(el).getAttribute('sizes')).toBe('100vw');
    expect(img(el).getAttribute('src')).toContain('a.webp');
    expect(hasClass(img(el), 'object-cover')).toBe(true);
  });
  it('types: sizes is required, overlays/style only where they make sense', () => {
    // Checked by `tsc --noEmit` (vitest does not type-check); at runtime they just render.
    // @ts-expect-error sizes is required (it decides the srcset)
    frame(<Photo src="/a" alt="" radius="card" />);
    // @ts-expect-error a parallax frame cannot carry overlays (they would drift with the photo)
    frame(<Photo src="/a" alt="" sizes="100vw" radius="card" motion={{ parallax: 9 }}><i /></Photo>);
    // @ts-expect-error a reveal frame is the ScrollReveal element: no inline style
    frame(<Photo src="/a" alt="" sizes="100vw" radius="card" motion={{ reveal: 0.1 }} style={{ gridArea: 'x' }} />);
    // @ts-expect-error radius is required (no silent default)
    frame(<Photo src="/a" alt="" sizes="100vw" />);
  });
});

describe('MaskIcon: a currentColor mask from an SVG file', () => {
  it('span: sized box, decorative, mask style from src', () => {
    const el = first(<MaskIcon src="/i.svg" size="sm" />);
    expect(el.tagName).toBe('SPAN');
    expect(classTokens(el)).toEqual(expect.arrayContaining(['w-[24px]', 'h-[24px]', 'flex-shrink-0']));
    const style = el.getAttribute('style')!;
    expect(style).toContain('background-color:currentColor');
    expect(style).toContain('mask-image:url(/i.svg)');
    expect(style).toContain('mask-size:contain');
  });
  it('as="a": the anchor is the sized box and draws the focus ring, an inner span carries the mask, labelled, external opens a new tab safely', () => {
    const el = first(<MaskIcon as="a" href="https://x.test" label="X" external src="/i.svg" size="lg" className="hover:opacity-80" />);
    expect(el.tagName).toBe('A');
    expect(el.getAttribute('style')).toBeNull(); // the mask is on the child, so the anchor's own outline is not clipped
    expect(el.children.length).toBe(1);
    const mask = el.children[0] as HTMLElement;
    expect(mask.tagName).toBe('SPAN');
    expect(mask.getAttribute('aria-hidden')).toBe('true');
    expect(mask.getAttribute('style')).toContain('mask-image:url(/i.svg)');
    expect(el.getAttribute('aria-label')).toBe('X');
    expect(el.getAttribute('target')).toBe('_blank');
    expect(el.getAttribute('rel')).toBe('noopener noreferrer');
    expect(classTokens(el)).toEqual(expect.arrayContaining(['w-[44px]', 'h-[44px]', 'hover:opacity-80', 'focus-visible:outline-2']));
    const internal = first(<MaskIcon as="a" href="/x" label="X" src="/i.svg" size="lg" />);
    expect(internal.hasAttribute('target')).toBe(false);
  });
});

describe('IconButton: round 44px icon-only button', () => {
  it('is a type=button with an aria-label, the 44px target and the focus ring; extras pass through', () => {
    const el = first(<IconButton label="Open" aria-expanded={false} className="md:hidden"><svg /></IconButton>);
    expect(el.tagName).toBe('BUTTON');
    expect(el.getAttribute('type')).toBe('button');
    expect(el.getAttribute('aria-label')).toBe('Open');
    expect(el.getAttribute('aria-expanded')).toBe('false');
    expect(classTokens(el)).toEqual(expect.arrayContaining(['h-[44px]', 'w-[44px]', 'rounded-full', 'focus-ring', 'md:hidden']));
  });
  it('types: label is required', () => {
    // @ts-expect-error an icon-only button needs its accessible name
    first(<IconButton><svg /></IconButton>);
  });
});

describe('SectionTitle / SectionSubtitle / SectionHeader: the title lockup', () => {
  it('SectionTitle: h2 by default, h1 / p on request; type-title bold, colour from --header-color; no id-only wrapper', () => {
    const h2 = first(<SectionTitle id="t">Hi</SectionTitle>);
    expect(h2.tagName).toBe('H2');
    expect(typeClassesOf(h2)).toEqual(['type-title']);
    expect(classTokens(h2)).toEqual(expect.arrayContaining(['text-[color:var(--header-color)]']));
    expect(classTokens(h2)).not.toEqual(expect.arrayContaining(['font-bold']));
    expect(h2.id).toBe('t');
    expect(first(<SectionTitle as="h1">x</SectionTitle>).tagName).toBe('H1');
    expect(first(<SectionTitle as="p">x</SectionTitle>).tagName).toBe('P');
    expect(hasClass(first(<SectionTitle onDark>x</SectionTitle>), 'on-dark')).toBe(true);
    expect(first(<SectionTitle>x</SectionTitle>).getAttribute('class')).toBe(first(<SectionTitle>x</SectionTitle>).getAttribute('class')!.trim());
  });
  it('SectionHeader center: title centred, subtitle type-quote + 65ch + mt-3 md:mt-4 + mx-auto, siblings with no wrapper', () => {
    const r = root(<SectionHeader id="h" align="center" title="T" subtitle="S" subtitleClassName="mb-[48px]" />);
    expect(r.children.length).toBe(2);
    const [h, p] = Array.from(r.children);
    expect(h.tagName).toBe('H2');
    expect(hasClass(h, 'text-center')).toBe(true);
    expect(p.tagName).toBe('P');
    expect(typeClassesOf(p)).toEqual(['type-quote']);
    expect(classTokens(p)).toEqual(expect.arrayContaining(['max-w-prose', 'mx-auto', 'mt-3', 'md:mt-4', 'text-center', 'mb-[48px]']));
  });
  it('SectionHeader column (the Services exception): mt-5 md:mt-9, no 65ch cap, centred below md and right-aligned from md (title and subtitle agree, NS-24)', () => {
    const [h, p] = Array.from(root(<SectionHeader id="h" align="column" title="T" subtitle="S" />).children);
    expect(classTokens(h)).toEqual(expect.arrayContaining(['text-center', 'md:text-right']));
    expect(classTokens(p)).toEqual(expect.arrayContaining(['type-quote', 'mt-5', 'md:mt-9', 'text-center', 'md:text-right']));
    expect(hasClass(p, 'max-w-prose')).toBe(false);
  });
  it('SectionHeader onPhoto: cream title and subtitle, both with the soft shadow', () => {
    const [h, p] = Array.from(root(<SectionHeader id="h" align="center" onPhoto title="T" subtitle="S" />).children);
    expect(classTokens(h)).toEqual(expect.arrayContaining(['on-dark', 'drop-shadow-md']));
    expect(classTokens(p)).toEqual(expect.arrayContaining(['text-cream', 'drop-shadow-md']));
  });
  it('SectionSubtitle on its own is the same paragraph (About gallery reveals the two lines separately)', () => {
    expect(classTokens(first(<SectionSubtitle align="center">S</SectionSubtitle>))).toEqual(expect.arrayContaining(['type-quote', 'max-w-prose', 'mt-3', 'md:mt-4']));
  });
});

describe('the class lockups these primitives own are written once', () => {
  const code = (s: string) => s.split('\n').filter((l) => !/^\s*(\/\/|\*|\{?\/\*)/.test(l)).join('\n');
  const outside = (owner: string | null, re: RegExp) =>
    readSources()
      .filter((f) => /\.tsx?$/.test(f.name) && (owner === null || !f.path.endsWith(owner)))
      .filter((f) => re.test(code(f.text)))
      .map((f) => f.path);

  it('positive control: each pattern flags its lockup and spares near-misses', () => {
    expect(/type-title font-bold/.test('className="type-title font-bold x"')).toBe(true);
    expect(/WebkitMaskImage/.test('{ WebkitMaskImage: `url(${s})` }')).toBe(true);
    expect(/absolute inset-0 (?:h-full w-full|w-full h-full) object-cover/.test('className="absolute inset-0 h-full w-full object-cover"')).toBe(true);
    expect(/absolute inset-0 (?:h-full w-full|w-full h-full) object-cover/.test('className="absolute inset-0 bg-black/20"')).toBe(false);
    expect(/h-\[44px\] w-\[44px\] items-center justify-center rounded-full/.test('inline-flex h-[44px] w-[44px] items-center justify-center rounded-full')).toBe(true);
  });
  it('no component re-types a bold/tracked type-title (700 and -0.01em are in the class)', () => {
    expect(outside(null, /type-title font-bold|type-title tracking-\[-0\.01em\]/)).toEqual([]);
  });
  it('the mask-image style lives in MaskIcon.tsx only', () => {
    expect(outside('primitives/ui/MaskIcon.tsx', /WebkitMaskImage|maskImage/)).toEqual([]);
  });
  it('the cover-fit photo (absolute inset-0 ... object-cover) lives in Photo.tsx only', () => {
    expect(outside('primitives/ui/Photo.tsx', /absolute inset-0 (?:h-full w-full|w-full h-full) object-cover/)).toEqual([]);
  });
  it('no component fakes an aspect ratio with a padding-top spacer (use Photo ratio / aspect-[w/h])', () => {
    const spacer = /(?<![\w-])pt-\[\d+(?:\.\d+)?%\]/;
    expect(spacer.test('<div className="pt-[62%]" />'), 'positive control').toBe(true);
    expect(spacer.test('pt-[clamp(20px,3vw,36px)] pt-8'), 'negative control').toBe(false);
    expect(outside(null, spacer)).toEqual([]);
  });
  it('the 44px round icon-button class list lives in IconButton.tsx only', () => {
    expect(outside('primitives/ui/IconButton.tsx', /h-\[44px\] w-\[44px\] items-center justify-center rounded-full/)).toEqual([]);
  });
});
