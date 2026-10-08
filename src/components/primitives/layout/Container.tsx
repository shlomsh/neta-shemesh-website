import React from 'react';

type MaxWidth = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none';

/**
 * Side padding.
 *   'default' px-gutter       clamp(16px,4vw,48px)
 *   'wide'    px-gutter-wide  clamp(24px,5vw,80px)  (the About sections)
 *   'none'    no padding (the parent Section already pads the sides)
 * One class per Container, so there is no second `px-*` fighting it by CSS source order.
 */
type Gutter = 'default' | 'wide' | 'none';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidth;
  gutter?: Gutter;
  children: React.ReactNode;
}

const MAX_W_MAP: Record<MaxWidth, string> = {
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1100px]',
  '2xl': 'max-w-[1280px]',
  '3xl': 'max-w-[1440px]',
  none: '',
};

const GUTTER_MAP: Record<Gutter, string> = {
  default: 'px-gutter',
  wide: 'px-gutter-wide',
  none: '',
};

/**
 * Standard content container that auto-centers and applies max-width and fluid horizontal padding.
 */
export function Container({
  maxWidth = '2xl',
  gutter = 'default',
  className = '',
  children,
  ...props
}: ContainerProps) {
  const classes = ['mx-auto w-full', GUTTER_MAP[gutter], MAX_W_MAP[maxWidth], className].filter(Boolean).join(' ');
  return (
    <div className={classes} {...props}>
      {children}
    </div>
  );
}
