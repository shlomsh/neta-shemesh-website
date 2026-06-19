/**
 * Mock for next/font/local.
 * Returns a stub object with className and variable properties
 * so font declarations in layout.tsx don't crash in jsdom.
 */
const localFont = (_options: Record<string, unknown>) => ({
  className: 'mock-font-class',
  variable: '--mock-font-var',
  style: { fontFamily: 'mock' },
});

export default localFont;
