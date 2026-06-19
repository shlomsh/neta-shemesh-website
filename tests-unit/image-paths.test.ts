/**
 * REGRESSION: Image path format.
 * Verifies all Services step imageSrc values start with '/images/' (leading slash).
 * A bare 'images/...' path (no leading slash) would be a relative-URL bug.
 */
import { describe, it, expect } from 'vitest';

// Import the data directly — no rendering needed for this assertion.
// We read the STEPS array from Services.tsx by importing it indirectly via
// the data embedded in the module. Since STEPS is not exported, we re-declare
// the expected paths inline and verify them against the actual source values.

// The canonical way: import the raw module and inspect the data.
// Services.tsx has STEPS as a module-level const — not exported — so we
// test by importing the component and checking rendered img src attributes.
import React from 'react';
import { render } from '@testing-library/react';
import Services from '@/components/layout/Services';

describe('Services — step image paths start with /images/', () => {
  it('all step imageSrc values have a leading slash', () => {
    const { container } = render(React.createElement(Services));
    // StepImage renders an <img> with the imageSrc as src
    const imgs = container.querySelectorAll('img');
    const stepImgs = Array.from(imgs).filter((img) =>
      img.getAttribute('src')?.includes('images/')
    );
    expect(stepImgs.length, 'expected at least 4 step images').toBeGreaterThanOrEqual(4);
    stepImgs.forEach((img) => {
      const src = img.getAttribute('src') ?? '';
      expect(
        src,
        `image src "${src}" must start with /images/ (leading slash)`
      ).toMatch(/^\/images\//);
    });
  });
});
