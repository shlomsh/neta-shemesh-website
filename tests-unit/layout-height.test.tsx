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
  it('Contact sections have min-h-[100svh] to fill the viewport', () => {
    const { container } = render(<Contact />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section) => {
      expect(section.className, 'Contact section missing 100svh').toContain('min-h-[100svh]');
    });
  });

  it('Footer has h-full on the tagline container', () => {
    const { container } = render(<Footer />);
    // The p with the tagline
    const pTag = container.querySelector('p');
    expect(pTag?.className).toContain('h-full');
  });

  it('Footer has min-h-[100svh] to fill the viewport', () => {
    const { container } = render(<Footer />);
    const footer = container.querySelector('footer');
    expect(footer?.className).toContain('min-h-[100svh]');
  });
});

import Testimonials from '../src/components/layout/Testimonials';

describe('Testimonials Layout Component', () => {
  it('Testimonials sections have min-h-[100svh] to fill the viewport', () => {
    const { container } = render(<Testimonials />);
    const sections = container.querySelectorAll('section');
    expect(sections.length).toBeGreaterThan(0);
    sections.forEach((section) => {
      expect(section.className, 'Testimonials section missing 100svh').toContain('min-h-[100svh]');
    });
  });
});
