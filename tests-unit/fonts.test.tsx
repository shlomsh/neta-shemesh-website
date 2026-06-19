/**
 * REGRESSION: Font class assertions.
 * Verifies that all section/card titles use the correct Tailwind font-family
 * class syntax after the "unify all section/card titles to Stanga" fix.
 *
 * jsdom has NO layout engine — we assert CSS classes, not rendered pixels.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ── About ────────────────────────────────────────────────────────────────────
import About from '@/components/layout/About';

describe('About.tsx — h2 headings use Elamy/Accent font class', () => {
  it('renders all three h2 headings with font-[family-name:var(--font-canva-accent)]', () => {
    const { container } = render(<About />);
    const headings = container.querySelectorAll('h2');
    expect(headings.length).toBeGreaterThanOrEqual(3);

    const STANGA = 'font-[family-name:var(--font-canva-accent)]';
    const BAD_STANGA = 'font-[family-name:var(--font-stanga)]';
    const BAD_BARE = 'font-[var(--font-canva-accent)]';
    const BAD_SECTION = 'section-header';

    headings.forEach((h2) => {
      const cls = h2.className;
      expect(cls, `h2 "${h2.textContent?.trim()}" missing Accent class`).toContain(STANGA);
      expect(cls, `h2 "${h2.textContent?.trim()}" must not use stanga font`).not.toContain(BAD_STANGA);
      expect(cls, `h2 "${h2.textContent?.trim()}" must not use bare var() syntax`).not.toContain(BAD_BARE);
      expect(cls, `h2 "${h2.textContent?.trim()}" must not use old section-header class`).not.toContain(BAD_SECTION);
    });
  });
});

// ── Expertise ────────────────────────────────────────────────────────────────
import Expertise from '@/components/layout/Expertise';

describe('Expertise.tsx — section h2 uses Elamy/Accent font class', () => {
  it('renders h2 "מרחב בטוח לקשר שלכם" with font-[family-name:var(--font-canva-accent)]', () => {
    const { container } = render(<Expertise />);
    const h2 = container.querySelector('h2#vyKTmOw3YNYlJZPL');
    expect(h2, 'Expertise h2 not found by id').toBeTruthy();
    expect(h2!.className).toContain('font-[family-name:var(--font-canva-accent)]');
    expect(h2!.className).not.toContain('font-[family-name:var(--font-stanga)]');
    expect(h2!.className).not.toContain('section-header');
  });
});

// ── Services ─────────────────────────────────────────────────────────────────
import Services from '@/components/layout/Services';

describe('Services.tsx — section h2 uses Elamy/Accent font class', () => {
  it('renders h2 "איך זה עובד?" with font-[family-name:var(--font-canva-accent)]', () => {
    const { container } = render(<Services />);
    const h2 = container.querySelector('h2#pEc3w8pe4QAw5k7o');
    expect(h2, 'Services h2 not found by id').toBeTruthy();
    expect(h2!.className).toContain('font-[family-name:var(--font-canva-accent)]');
    expect(h2!.className).not.toContain('font-[family-name:var(--font-stanga)]');
    expect(h2!.className).not.toContain('section-header');
  });
});

// ── CardLabel ────────────────────────────────────────────────────────────────
import { CardLabel } from '@/components/layout/expertise/CardLabel';

describe('CardLabel.tsx — title span uses correct font-family syntax', () => {
  it('uses font-[family-name:var(--font-canva-primary)] (NOT bare font-[var(...)])', () => {
    const { container } = render(
      <CardLabel title="טיפול זוגי" description="test description" />
    );
    // First span is the title
    const titleSpan = container.querySelector('span');
    expect(titleSpan, 'title span not found').toBeTruthy();
    expect(titleSpan!.className).toContain('font-[family-name:var(--font-canva-primary)]');
    // Must NOT use the broken bare syntax
    expect(titleSpan!.className).not.toContain('font-[var(--font-canva-primary)]');
  });
});

// ── QuoteText ────────────────────────────────────────────────────────────────
import { QuoteText } from '@/components/layout/testimonials/QuoteText';

describe('QuoteText.tsx — uses correct font-family syntax', () => {
  it('uses font-[family-name:var(--font-canva-primary)] (NOT bare font-[var(...)])', () => {
    const { container } = render(<QuoteText text="some testimonial text" />);
    const p = container.querySelector('p');
    expect(p, 'QuoteText <p> not found').toBeTruthy();
    expect(p!.className).toContain('font-[family-name:var(--font-canva-primary)]');
    expect(p!.className).not.toContain('font-[var(--font-canva-primary)]');
  });
});
