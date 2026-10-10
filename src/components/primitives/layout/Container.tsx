import type React from 'react';
import { cx } from '@/lib/cx';

type MaxWidth = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'none';

/**
 * Side padding.
 *   'default' px-gutter       clamp(1rem,4vw,3rem)
 *   'wide'    px-gutter-wide  clamp(1.5rem,5vw,5rem)  (the About sections)
 *   'none'    no padding (the parent Section already pads the sides)
 * One class per Container, so there is no second `px-*` fighting it by CSS source order.
 */
type Gutter = 'default' | 'wide' | 'none';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidth;
  gutter?: Gutter;
  children: React.ReactNode;
}

// Widths in rem so the measure grows with the visitor's font size; the comments are px at the default 16px root.
const MAX_W_MAP: Record<MaxWidth, string> = {
  md: 'max-w-3xl', // 768
  lg: 'max-w-5xl', // 1024
  xl: 'max-w-[68.75rem]', // 1100
  '2xl': 'max-w-7xl', // 1280
  '3xl': 'max-w-[90rem]', // 1440
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
  className,
  children,
  ...props
}: ContainerProps) {
  return (
    <div className={cx('mx-auto w-full', GUTTER_MAP[gutter], MAX_W_MAP[maxWidth], className)} {...props}>
      {children}
    </div>
  );
}
