/**
 * Type-scale guards (2026-10 typography implementation): components use the
 * canonical `.type-*` classes, never ad-hoc sizes, 900 weights or system sans.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { StepNumber } from '@/components/layout/services/StepNumber';
import { StepTitle } from '@/components/layout/services/StepTitle';
import { StepBullets } from '@/components/layout/services/StepBullets';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { ContactDetails } from '@/components/layout/contact/ContactDetails';
import { HeroHeading } from '@/components/layout/hero/HeroHeading';

const ADHOC_SIZE = /text-\[(clamp|\d)/;

describe('type scale usage', () => {
  it('step numeral is Elamy display (no font-black, no system sans)', () => {
    const { container } = render(<StepNumber text="01." />);
    const el = container.firstElementChild!;
    expect(el.className).toContain('type-display');
    expect(el.className).not.toContain('font-black');
    expect(el.className).not.toContain('font-sans');
    expect(el.className).not.toMatch(ADHOC_SIZE);
  });

  it('step title and bullets use scale classes', () => {
    const t = render(<StepTitle text="x" />).container.firstElementChild!;
    expect(t.className).toContain('type-card-title');
    expect(t.className).not.toMatch(ADHOC_SIZE);
    const li = render(<StepBullets items={['a']} />).container.querySelector('li')!;
    expect(li.className).toContain('type-small');
  });

  it('buttons share one style: type-lead bold, no uppercase or tracking', () => {
    for (const size of ['sm', 'md'] as const) {
      const a = render(<ButtonLink href="#x" size={size}>x</ButtonLink>).container.querySelector('a')!;
      expect(a.className).toContain('type-lead');
      expect(a.className).not.toContain('type-body');
      expect(a.className).toContain('font-bold');
      expect(a.className).not.toContain('uppercase');
      expect(a.className).not.toMatch(/tracking-\[/);
      expect(a.className).not.toMatch(ADHOC_SIZE);
    }
  });

  it('contact phone and email use the Latin companion at regular weight', () => {
    const { container } = render(
      <ContactDetails phone="054-571-1060" email="a@b.co" addressStrong="addr" />,
    );
    const tel = container.querySelector('a[href^="tel:"]')!;
    const mail = container.querySelector('a[href^="mailto:"]')!;
    for (const el of [tel, mail]) {
      expect(el.querySelector('span.font-latin')).not.toBeNull();
      expect(el.className).toContain('type-lead');
      expect(el.className).not.toContain('type-body');
      expect(el.className).not.toContain('font-bold');
      expect(el.hasAttribute('data-body-large')).toBe(false);
    }
    expect(mail.textContent).toBe('a@b.co');
    expect(container.querySelector('p')!.className).toContain('type-lead');
  });

  it('.font-latin applies the optical --latin-scale (the one allowed non-scale size rule)', () => {
    const css = readFileSync(join(process.cwd(), 'src/app/globals.css'), 'utf8');
    expect(css).toMatch(/--latin-scale:\s*0\.\d+/);
    const rule = css.match(/\.font-latin\s*\{([^}]*)\}/)![1];
    expect(rule).toMatch(/font-size:\s*calc\(1em \* var\(--latin-scale\)\)/);
  });

  it('hero H1 is type-display at weight 700', () => {
    const h1 = render(<HeroHeading />).container.querySelector('h1')!;
    expect(h1.className).toContain('type-display');
    expect(h1.className).toContain('font-bold');
    expect(h1.className).not.toMatch(ADHOC_SIZE);
  });
});
