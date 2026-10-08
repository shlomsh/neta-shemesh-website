/**
 * Font-class details not covered by the sanity suite. The h2 title class (type-title + font-bold),
 * the removal of ad-hoc font classes and the layout.tsx font declarations (3 local fonts, no Google
 * fetch, shipped woff2 files) are asserted in tests-unit/sanity/ (type-usage C16, source-scan C11/C17).
 *
 * jsdom has NO layout engine: we assert CSS classes, not rendered pixels.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { CardLabel } from '@/components/layout/expertise/CardLabel';
import { QuoteText } from '@/components/layout/testimonials/QuoteText';

describe('CardLabel.tsx — title span', () => {
  it('uses the type-small scale class, bold, with no ad-hoc size', () => {
    const { container } = render(
      <CardLabel title="טיפול זוגי" description="test description" />
    );
    const titleSpan = container.querySelector('span');
    expect(titleSpan, 'title span not found').toBeTruthy();
    expect(titleSpan!.className).toContain('type-small');
    expect(titleSpan!.className).toContain('font-bold');
    expect(titleSpan!.className).not.toMatch(/text-\[(clamp|\d)/);
  });
});

// QuoteText belongs to the parked testimonials block (SHOW_TESTIMONIALS=false); kept guarded for when it returns.
describe('QuoteText.tsx — font-family syntax', () => {
  it('uses font-[family-name:var(--font-body)] (NOT bare font-[var(...)])', () => {
    const { container } = render(<QuoteText text="some testimonial text" />);
    const p = container.querySelector('p');
    expect(p, 'QuoteText <p> not found').toBeTruthy();
    expect(p!.className).toContain('font-[family-name:var(--font-body)]');
    expect(p!.className).not.toContain('font-[var(--font-body)]');
  });
});
