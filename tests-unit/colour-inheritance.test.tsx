/**
 * Colour comes from the section tone, never from hardcoded classes on the copy.
 * (Tone order, tone contrast rules, veil card, one-screen heights and subtitle sizes are
 * asserted by the sanity suite; this file keeps only the "no hardcoded colour / no on-dark"
 * guards that it does not cover.)
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ID } from '@/content/ids';
import { Expertise } from '@/components/sections/expertise/Expertise';
import { Services } from '@/components/sections/services/Services';
import { ContactSocial } from '@/components/sections/contact/ContactSocial';
import { CtaBand } from '@/components/sections/cta-band/CtaBand';
import { Gallery } from '@/components/sections/gallery/Gallery';

describe('copy inherits its colour from the tone', () => {
  it('Expertise: subtitle has no hardcoded cream or opacity; the h2 is not on-dark', () => {
    const { container } = render(<Expertise />);
    const section = container.querySelector('section')!;
    const p = Array.from(section.querySelectorAll('p')).find(el => el.textContent?.includes('תמיכה והכוונה'));
    expect(p, 'subtitle paragraph').toBeDefined();
    expect(p!.className).not.toContain('--color-white');
    expect(p!.className).not.toContain('opacity-90');
    expect(section.querySelector('h2')!.className).not.toContain('on-dark');
  });

  it('Photo gallery (cream): titles are not on-dark and the subtitle has no hardcoded colour; the CTA band stays a photo card', () => {
    const { container } = render(<><CtaBand /><Gallery /></>);
    const section = container.querySelector(`#${ID.photoGallery}`)!;
    expect(section.querySelector('h2')!.className).not.toContain('on-dark');
    expect(section.querySelector('p')!.className).not.toMatch(/(?:^|\s)text-(?:plum|mauve|blush|cream)(?:\s|$)|text-\[var\(--color-/);
    expect(container.querySelector(`#${ID.ctaBand}`)!.hasAttribute('data-bg-tone')).toBe(false);
  });

  it('Services (blush): the intro paragraph has no cream background class and the CTA is a plum button', () => {
    const { container } = render(<Services />);
    const section = container.querySelector(`#${ID.services}`)!;
    expect(section.className).not.toMatch(/(?:^|\s)bg-cream(?:\s|$)|bg-\[var\(--color-cream\)\]/);
    expect(section.querySelector('div[data-bg-tone]'), 'no nested tone card').toBeNull();
    const para = Array.from(section.querySelectorAll('p')).find(p => p.textContent?.includes('התהליך בקליניקה'));
    expect(para, 'intro paragraph').toBeDefined();
    expect(para!.className).not.toMatch(/(?:^|\s)bg-cream(?:\s|$)|bg-\[var\(--color-cream\)\]/);
    const cta = section.querySelector('a[href="#contact"]');
    expect(cta?.textContent).toContain('צרו קשר');
    expect(cta!.className).toContain('bg-plum');
  });

  it('Contact social (plum): lead copy sits directly on it with no hardcoded colour and no nested tone card', () => {
    const { container } = render(<ContactSocial />);
    const section = container.querySelector(`#${ID.contactSocial}`)!;
    expect(section.querySelector('div[data-bg-tone]'), 'no nested tone card').toBeNull();
    const para = Array.from(section.querySelectorAll('p')).find(p => p.textContent?.includes('בואו נשמור על קשר'));
    expect(para, 'social paragraph').toBeDefined();
    expect(para!.className).not.toContain('type-quote');
    expect(para!.className).not.toMatch(/(?:^|\s)text-(?:plum|mauve|blush|cream)(?:\s|$)|text-\[var\(--color-/);
    expect(section.querySelectorAll('a[aria-label]').length, 'social links').toBe(3);
  });
});
