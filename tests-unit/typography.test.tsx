import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionTitle } from '../src/components/primitives/ui/SectionTitle';

// Title class/weight rules live in sanity/type-usage.test.tsx (C16).
describe('SectionTitle', () => {
  it('renders an h2 carrying the given id, with its text as a direct child (no id-only wrapper span)', () => {
    const { container } = render(<SectionTitle id="test-id">Test Title</SectionTitle>);
    const h2 = container.querySelector('h2#test-id');
    expect(h2).not.toBeNull();
    expect(h2?.textContent).toBe('Test Title');
    expect(h2?.querySelector('span'), 'the Canva-era id-only <span> wrapper is gone').toBeNull();
  });
});
