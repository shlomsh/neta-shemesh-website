/**
 * REGRESSION: Key Hebrew strings render in the DOM.
 * Verifies that text content is not accidentally dropped during refactors.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';

import { HeroHeading } from '@/components/sections/hero/HeroHeading';
import { Services } from '@/components/sections/services/Services';
import { Expertise } from '@/components/sections/expertise/Expertise';

describe('HeroHeading — key Hebrew string present', () => {
  it('renders "מקום בטוח לצמוח בו ביחד."', () => {
    const { container } = render(<HeroHeading />);
    expect(container.textContent).toContain('מקום בטוח לצמוח בו ביחד.');
  });
});

describe('Services — key Hebrew strings present', () => {
  it('renders section heading "איך זה עובד?"', () => {
    const { container } = render(<Services />);
    expect(container.textContent).toContain('איך זה עובד?');
  });
});

describe('Expertise — card titles present', () => {
  it('renders at least one expertise card title from EXPERTISE_CARDS', () => {
    const { container } = render(<Expertise />);
    // 'טיפול זוגי' is the first card title in content/home/expertise.ts
    expect(container.textContent).toContain('טיפול זוגי');
  });

  it('renders section heading "טיפול זוגי ומשפחתי בנתניה"', () => {
    // Heading text was updated to "טיפול זוגי ומשפחתי בנתניה"
    const { container } = render(<Expertise />);
    expect(container.textContent).toContain('טיפול זוגי ומשפחתי בנתניה');
  });
});
