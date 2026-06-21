import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionTitle } from '../src/components/ui/SectionTitle';

describe('Typography Overhaul', () => {
  it('SectionTitle renders with Elamy font', () => {
    render(<SectionTitle id="test-id" spanId="span-id">Test Title</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('font-[family-name:var(--font-display)]');
  });

  it('SectionTitle applies span inside if spanId is provided', () => {
    render(<SectionTitle id="test-id" spanId="span-id">Test Title</SectionTitle>);
    const span = document.getElementById('span-id');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('Test Title');
  });
});
