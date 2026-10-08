import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { SectionTitle } from '../src/components/ui/SectionTitle';

describe('Typography Overhaul', () => {
  it('SectionTitle renders with .type-title (Elamy 700)', () => {
    render(<SectionTitle id="test-id" spanId="span-id">Test Title</SectionTitle>);
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.className).toContain('type-title');
    expect(heading.className).toContain('font-bold');
    expect(heading.className).not.toContain('section-header');
  });

  it('SectionTitle applies span inside if spanId is provided', () => {
    render(<SectionTitle id="test-id" spanId="span-id">Test Title</SectionTitle>);
    const span = document.getElementById('span-id');
    expect(span).not.toBeNull();
    expect(span?.textContent).toBe('Test Title');
  });
});
