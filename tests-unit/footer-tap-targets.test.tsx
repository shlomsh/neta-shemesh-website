import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Footer from '../src/components/layout/Footer';

describe('Footer tap targets', () => {
  it('all links should have a minimum height of 48px', () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link.className).toContain('min-h-[48px]');
    });
  });
});
