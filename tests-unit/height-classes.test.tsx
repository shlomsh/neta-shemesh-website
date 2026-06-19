/**
 * REGRESSION: Height/layout class assertions (class-level only — jsdom has no layout engine).
 * Verifies sticky card wrappers use h-[100dvh] + items-stretch (not the old lg:h-[80vh]).
 * Also checks ExpertiseCard ScrollReveal carries w-full h-full.
 */
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';

import Expertise from '@/components/layout/Expertise';
import Services from '@/components/layout/Services';
import { ExpertiseCard } from '@/components/layout/expertise/ExpertiseCard';

describe('Expertise.tsx — sticky card wrapper classes', () => {
  it('contains h-[100dvh] on each sticky card wrapper', () => {
    const { container } = render(<Expertise />);
    // The sticky wrappers have class "sticky top-0 ... h-[100dvh] w-full flex items-stretch ..."
    const wrappers = container.querySelectorAll('.sticky');
    expect(wrappers.length).toBeGreaterThan(0);
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper missing h-[100dvh]').toContain('h-[100dvh]');
    });
  });

  it('contains items-stretch on each sticky card wrapper', () => {
    const { container } = render(<Expertise />);
    const wrappers = container.querySelectorAll('.sticky');
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper missing items-stretch').toContain('items-stretch');
    });
  });

  it('does NOT contain lg:h-[80vh] on any sticky card wrapper', () => {
    const { container } = render(<Expertise />);
    const wrappers = container.querySelectorAll('.sticky');
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper must not have lg:h-[80vh]').not.toContain('lg:h-[80vh]');
    });
  });
});

describe('Services.tsx — sticky card wrapper classes', () => {
  it('contains h-[100dvh] on each sticky card wrapper', () => {
    const { container } = render(<Services />);
    const wrappers = container.querySelectorAll('.sticky');
    expect(wrappers.length).toBeGreaterThan(0);
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper missing h-[100dvh]').toContain('h-[100dvh]');
    });
  });

  it('contains items-stretch on each sticky card wrapper', () => {
    const { container } = render(<Services />);
    const wrappers = container.querySelectorAll('.sticky');
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper missing items-stretch').toContain('items-stretch');
    });
  });

  it('does NOT contain lg:h-[80vh] on any sticky card wrapper', () => {
    const { container } = render(<Services />);
    const wrappers = container.querySelectorAll('.sticky');
    wrappers.forEach((el) => {
      expect(el.className, 'sticky wrapper must not have lg:h-[80vh]').not.toContain('lg:h-[80vh]');
    });
  });
});

describe('ExpertiseCard — ScrollReveal carries w-full h-full', () => {
  it('outermost rendered div has both w-full and h-full classes', () => {
    const { container } = render(
      <ExpertiseCard
        title="טיפול זוגי"
        description="test"
        imageSrc="/images/test.jpg"
        imageAlt="test"
        delay={0}
      />
    );
    // ScrollReveal (mocked as plain div) is the outermost element — it receives className="w-full h-full"
    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv, 'outermost element not found').toBeTruthy();
    expect(outerDiv.className).toContain('w-full');
    expect(outerDiv.className).toContain('h-full');
  });
});
