import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { LineArt, LINE_ART_NAMES } from '@/components/site/LineArt';

describe('LineArt (NS-54)', () => {
  it.each(LINE_ART_NAMES)('%s is a decorative pen-draw SVG with palette-only strokes', (name) => {
    const html = renderToStaticMarkup(<LineArt name={name} />);
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('stroke="currentColor"');
    expect(html).toContain('data-reveal="io"');
    expect(html).not.toMatch(/#[0-9a-fA-F]{3,6}/);
    const paths = html.match(/<path /g) ?? [];
    expect(paths.length).toBeGreaterThanOrEqual(5);
    expect(html.match(/pathLength="1"/g)?.length).toBe(paths.length);
  });
});
