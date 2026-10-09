/**
 * Contact + Footer structure details not covered by the sanity suite
 * (tones, one-screen heights and the map/card chain are asserted in tests-unit/sanity/).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ID } from '../src/content/ids';
import { ContactSocial } from '../src/components/sections/contact/ContactSocial';
import { ContactOffice } from '../src/components/sections/contact/ContactOffice';
import { Footer } from '../src/components/site/footer/Footer';

/** The two contact panels, as the home page mounts them. */
const Contact = () => (
  <>
    <ContactSocial />
    <ContactOffice />
  </>
);

describe('Contact', () => {
  it('renders exactly two sections: social (dark) then office (mid)', () => {
    const { container } = render(<Contact />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBe(2);
    expect(sections[0].getAttribute('data-bg-tone')).toBe('dark');
    expect(sections[1].getAttribute('data-bg-tone')).toBe('mid');
  });

  it('office: the cream card is a large radius that hugs its content; the map frame uses the smaller tile radius in a 1fr/1.2fr grid', () => {
    const { container } = render(<Contact />);
    const section = container.querySelector(`#${ID.contactOffice}`)!;
    const card = section.querySelector('[data-bg-tone="cream"]')!;
    expect(card.className).toContain('rounded-card');
    expect(card.className).not.toContain('h-full');
    const mapWrapper = section.querySelector('iframe')!.parentElement!;
    expect(mapWrapper.className).toContain('rounded-tile');
    expect(mapWrapper.className).not.toContain('rounded-card');
    expect(mapWrapper.parentElement!.className).toContain('lg:grid-cols-[1fr_1.2fr]');
    expect(card.textContent).toContain('054-571-1060');
    expect(card.textContent).toContain('אמנון ותמר');
  });
});

describe('Footer', () => {
  it('the tagline fills its reveal wrapper (h-full)', () => {
    const { container } = render(<Footer />);
    expect(container.querySelector('p')?.className).toContain('h-full');
  });
});
