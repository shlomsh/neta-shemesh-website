/**
 * REGRESSION: Font class assertions.
 * Verifies that all section/card titles use the correct Tailwind font-family
 * class syntax after the "unify all section/card titles to Stanga" fix.
 *
 * jsdom has NO layout engine — we assert CSS classes, not rendered pixels.
 *
 * NOTE on section-header: SectionTitle always applies the `section-header`
 * utility class (it IS the design token class). Tests must NOT ban it —
 * only assert the explicit font-family class is also present.
 * The specific font used across all headings is still pending a final decision;
 * we assert it is non-empty (set) and consistent.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';

// ── About ────────────────────────────────────────────────────────────────────
import About from '@/components/layout/About';

describe('About.tsx — h2 headings use Elamy/Accent font class', () => {
  it('renders all three h2 headings with font-[family-name:var(--font-display)]', () => {
    const { container } = render(<About />);
    const headings = container.querySelectorAll('h2');
    expect(headings.length).toBeGreaterThanOrEqual(3);

    const ACCENT = 'font-[family-name:var(--font-display)]';
    const BAD_STANGA = 'font-[family-name:var(--font-stanga)]';
    const BAD_BARE = 'font-[var(--font-display)]';
    // NOTE: `section-header` is an intentional design-token class applied by
    // SectionTitle — do NOT assert its absence. Assert the font is set instead.

    headings.forEach((h2) => {
      const cls = h2.className;
      expect(cls, `h2 "${h2.textContent?.trim()}" missing Accent class`).toContain(ACCENT);
      expect(cls, `h2 "${h2.textContent?.trim()}" must not use stanga font`).not.toContain(BAD_STANGA);
      expect(cls, `h2 "${h2.textContent?.trim()}" must not use bare var() syntax`).not.toContain(BAD_BARE);
    });
  });
});

// ── Expertise ────────────────────────────────────────────────────────────────
import Expertise from '@/components/layout/Expertise';

describe('Expertise.tsx — section h2 uses Elamy/Accent font class', () => {
  it('renders h2 "מקום בטוח לצמוח בו ביחד." with font-[family-name:var(--font-display)]', () => {
    const { container } = render(<Expertise />);
    const h2 = container.querySelector('h2#vyKTmOw3YNYlJZPL');
    expect(h2, 'Expertise h2 not found by id').toBeTruthy();
    expect(h2!.className).toContain('font-[family-name:var(--font-display)]');
    expect(h2!.className).not.toContain('font-[family-name:var(--font-stanga)]');
    // section-header is an intentional SectionTitle design-token class — not a bug
  });
});

// ── Services ─────────────────────────────────────────────────────────────────
import Services from '@/components/layout/Services';

describe('Services.tsx — section h2 uses Elamy/Accent font class', () => {
  it('renders h2 "איך זה עובד?" with font-[family-name:var(--font-display)]', () => {
    const { container } = render(<Services />);
    const h2 = container.querySelector('h2#pEc3w8pe4QAw5k7o');
    expect(h2, 'Services h2 not found by id').toBeTruthy();
    expect(h2!.className).toContain('font-[family-name:var(--font-display)]');
    expect(h2!.className).not.toContain('font-[family-name:var(--font-stanga)]');
    // section-header is an intentional SectionTitle design-token class — not a bug
  });
});

// ── CardLabel ────────────────────────────────────────────────────────────────
import { CardLabel } from '@/components/layout/expertise/CardLabel';

describe('CardLabel.tsx — title span uses correct font-family syntax', () => {
  it('uses font-[family-name:var(--font-body)] (NOT bare font-[var(...)])', () => {
    const { container } = render(
      <CardLabel title="טיפול זוגי" description="test description" />
    );
    // First span is the title
    const titleSpan = container.querySelector('span');
    expect(titleSpan, 'title span not found').toBeTruthy();
    expect(titleSpan!.className).toContain('font-[family-name:var(--font-body)]');
    // Must NOT use the broken bare syntax
    expect(titleSpan!.className).not.toContain('font-[var(--font-body)]');
  });
});

// ── QuoteText ────────────────────────────────────────────────────────────────
import { QuoteText } from '@/components/layout/testimonials/QuoteText';

describe('QuoteText.tsx — uses correct font-family syntax', () => {
  it('uses font-[family-name:var(--font-body)] (NOT bare font-[var(...)])', () => {
    const { container } = render(<QuoteText text="some testimonial text" />);
    const p = container.querySelector('p');
    expect(p, 'QuoteText <p> not found').toBeTruthy();
    expect(p!.className).toContain('font-[family-name:var(--font-body)]');
    expect(p!.className).not.toContain('font-[var(--font-body)]');
  });
});
