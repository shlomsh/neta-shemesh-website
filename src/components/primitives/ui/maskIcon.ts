import type { CSSProperties } from 'react';

/**
 * Inline style that paints an SVG file as a mask filled with `currentColor`, so a single-colour
 * icon follows the surrounding text colour (contact rows, social links).
 * Apply it to an empty sized element: `<span className="w-[24px] h-[24px]" style={maskIconStyle(src)} />`.
 */
export function maskIconStyle(src: string): CSSProperties {
  return {
    backgroundColor: 'currentColor',
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskSize: 'contain',
    maskSize: 'contain',
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
  };
}
