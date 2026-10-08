import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionTitle } from '../src/components/ui/SectionTitle';

// Title class/weight rules live in sanity/type-usage.test.tsx (C16).
describe('SectionTitle', () => {
  it('wraps its text in a span with spanId when one is provided', () => {
    render(<SectionTitle id="test-id" spanId="span-id">Test Title</SectionTitle>);
    const span = document.getElementById('span-id');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('Test Title');
  });
});
