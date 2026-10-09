import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { JsonLd, serializeJsonLd } from '@/components/site/JsonLd';

describe('JSON-LD escaping', () => {
  const data = { name: '</script><script>alert(1)</script>', note: 'a < b', he: 'נטע' };

  it('never emits a raw "<"', () => {
    expect(serializeJsonLd(data)).not.toContain('<');
    expect(serializeJsonLd(data)).toContain('\\u003c/script>');
  });

  it('parses back to identical data', () => {
    expect(JSON.parse(serializeJsonLd(data))).toEqual(data);
  });

  it('the rendered script body is escaped and still valid JSON', () => {
    const { container } = render(<JsonLd data={data} />);
    const script = container.querySelector('script[type="application/ld+json"]')!;
    expect(script.innerHTML).not.toContain('<');
    expect(JSON.parse(script.textContent!)).toEqual(data);
  });
});
