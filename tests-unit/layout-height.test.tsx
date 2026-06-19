import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import Contact from '../src/components/layout/Contact';
import Footer from '../src/components/layout/Footer';

// Mock matchMedia if needed
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
const IntersectionObserverMock = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  takeRecords: vi.fn(),
  unobserve: vi.fn(),
}));
vi.stubGlobal('IntersectionObserver', IntersectionObserverMock);

describe('Layout Components', () => {
  it('Contact has h-full and lg:flex-1 on the right column container', () => {
    const { container } = render(<Contact />);
    const div = container.querySelector('.flex.flex-col.gap-\\[24px\\].text-right.h-full');
    expect(div).not.toBeNull();
    expect(div?.className).toContain('h-full');
    expect(div?.className).toContain('lg:flex-1');
  });

  it('Footer has h-full on the tagline container', () => {
    const { container } = render(<Footer />);
    // The p with the tagline
    const pTag = container.querySelector('p');
    expect(pTag?.className).toContain('h-full');
  });
});
