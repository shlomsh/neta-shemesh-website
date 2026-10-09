import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from '../src/components/site/footer/Footer';

describe('Footer tap targets', () => {
  it('all links have a minimum height of 48px and are inline-flex (so the height is enforced)', () => {
    const { container } = render(<Footer />);
    const links = container.querySelectorAll('a');
    expect(links.length).toBeGreaterThan(0);
    links.forEach(link => {
      expect(link.className).toContain('min-h-[48px]');
      expect(link.className).toContain('inline-flex');
    });
  });
});
