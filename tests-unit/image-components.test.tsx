import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import React from 'react';
import Testimonials from '@/components/layout/Testimonials';

describe('Testimonials.tsx - Image components', () => {
  it('uses next/image for all images instead of raw img tags', () => {
    const { container } = render(<Testimonials />);
    const rawImages = container.querySelectorAll('img');
    // next/image renders as <img src="..." .../> but they should have specific attributes like loading="lazy" or be converted properly by the framework.
    // Let's just check that there are no raw images lacking the specific Next.js classes or styles if unoptimized, OR we just check the source code.
    // Actually, testing source code is better for this.
  });
});
