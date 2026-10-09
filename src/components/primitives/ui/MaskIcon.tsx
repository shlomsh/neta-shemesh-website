import React from 'react';
import { cx } from '@/lib/cx';

/**
 * Edge length of the icon box. Whole class strings in the map on purpose (Tailwind only emits
 * utilities it can read verbatim from source).
 *   'sm' 24px  (the contact detail rows)
 *   'lg' 44px  (the social links, which are also the 44px touch target)
 */
export type MaskIconSize = 'sm' | 'lg';

const SIZE_CLASS: Record<MaskIconSize, string> = {
  sm: 'w-[24px] h-[24px] flex-shrink-0',
  lg: 'w-[44px] h-[44px] flex-shrink-0',
};

/** Paints an SVG file as a mask filled with `currentColor`, so a single-colour icon follows the text colour. */
function maskStyle(src: string): React.CSSProperties {
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

type MaskIconBase = { src: string; size: MaskIconSize; className?: string };

type MaskIconProps =
  | (MaskIconBase & { as?: 'span' })
  // The link IS the painted box (an empty anchor), so it needs an accessible name.
  | (MaskIconBase & {
      as: 'a';
      href: string;
      label: string;
      /** Opens in a new tab (`target="_blank" rel="noopener noreferrer"`). */
      external?: boolean;
    });

/**
 * A single-colour icon from an SVG file, painted with `currentColor`. Renders an empty, decorative
 * `<span>`, or with `as="a"` a labelled link (the social icons). The link is the sized box and
 * keeps no mask of its own: the mask lives on an inner span that fills it, because a mask clips
 * everything painted on the same element, including that element's own focus outline.
 */
export function MaskIcon(props: MaskIconProps) {
  const className = cx(SIZE_CLASS[props.size], props.className);
  const style = maskStyle(props.src);
  if (props.as === 'a') {
    return (
      <a
        href={props.href}
        aria-label={props.label}
        {...(props.external ? { target: '_blank', rel: 'noopener noreferrer' } : null)}
        className={cx(className, 'rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-current')}
      >
        <span aria-hidden="true" className="block h-full w-full" style={style} />
      </a>
    );
  }
  return <span className={className} style={style} />;
}
