import '@testing-library/jest-dom';

/**
 * Browser APIs jsdom does not implement, stubbed ONCE here so no test file needs its own copy.
 * Defaults are inert (`matches: false`, observers never fire). A test that needs behaviour
 * (e.g. a reduced-motion or narrow-viewport case) overrides `window.matchMedia` itself and restores it.
 * Only defined when missing, so a real implementation is never shadowed.
 */
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    })) as unknown as typeof window.matchMedia;
  }

  class InertObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
  }
  if (!('IntersectionObserver' in window)) {
    (window as unknown as { IntersectionObserver: unknown }).IntersectionObserver = InertObserver;
  }
  if (!('ResizeObserver' in window)) {
    (window as unknown as { ResizeObserver: unknown }).ResizeObserver = InertObserver;
  }
}
