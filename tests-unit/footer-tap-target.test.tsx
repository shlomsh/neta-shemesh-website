/**
 * REGRESSION: Footer CTA tap target size.
 * Verifies FooterCTA <a> element has min-h-[48px] class (48px minimum touch target).
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import { FooterCTA } from '@/components/layout/footer/FooterCTA';

describe('FooterCTA — tap target class', () => {
  it('<a> className contains min-h-[48px]', () => {
    const { container } = render(<FooterCTA />);
    const link = container.querySelector('a');
    expect(link, 'FooterCTA <a> not found').toBeTruthy();
    expect(link!.className).toContain('min-h-[48px]');
  });

  it('<a> is an inline-flex element for correct height enforcement', () => {
    const { container } = render(<FooterCTA />);
    const link = container.querySelector('a');
    expect(link!.className).toContain('inline-flex');
  });
});
