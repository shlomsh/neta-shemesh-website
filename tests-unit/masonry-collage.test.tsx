import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Intro } from '../src/components/sections/intro/Intro';

describe('Masonry Collage (Intro)', () => {
  it('should split into text + wider photo column on desktop (photos on the left via RTL order)', () => {
    const { container } = render(<Intro />);
    const wrapper = container.querySelector('[class*="lg:grid-cols-[1fr_1.25fr]"]');
    expect(wrapper).not.toBeNull();
  });

  it('should render a grid with 2 columns', () => {
    const { container } = render(<Intro />);
    const grid = container.querySelector('.grid-cols-2');
    expect(grid).not.toBeNull();
    expect(grid?.className).toContain('grid');
    expect(grid?.className).toContain('grid-cols-2');
  });

  it('should render exactly 3 photos in the masonry grid', () => {
    const { container } = render(<Intro />);
    const grid = container.querySelector('.grid-cols-2');
    expect(grid).not.toBeNull();
    const images = grid?.querySelectorAll('img');
    expect(images?.length).toBe(3);
  });
});
