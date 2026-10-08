import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { AboutIntro } from '../src/components/layout/About';

describe('About Layout', () => {
  it('should have z-0 and pointer-events-none on the organic background, and z-10 on text layers', () => {
    const { container } = render(<AboutIntro />);
    
    // The OrganicBg is an SVG with aria-hidden="true"
    // Let's find it by checking if it contains the ellipses with the specific colors,
    // or we can just query the container
    const organicBgSvg = container.querySelector('svg[aria-hidden="true"]');
    expect(organicBgSvg).not.toBeNull();
    
    // Check if it has the required classes
    expect((organicBgSvg?.getAttribute('class') ?? '')).toContain('z-0');
    expect((organicBgSvg?.getAttribute('class') ?? '')).toContain('pointer-events-none');

    // Find the text layer wrapper for "ליווי מקצועי לזוגות"
    const header = screen.getByText('ליווי מקצועי לזוגות');
    
    // The direct parent or a close ancestor is the ScrollReveal wrapper which should have z-10
    const scrollRevealWrapper = header.closest('div.relative.z-10');
    expect(scrollRevealWrapper).not.toBeNull();
    expect(scrollRevealWrapper?.className).toContain('z-10');
  });
});
