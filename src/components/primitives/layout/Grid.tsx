import React from 'react';
import { cx } from '@/lib/cx';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  colsMobile?: 1 | 2;
  colsTablet?: 2 | 3;
  colsDesktop?: 2 | 3 | 4;
  children: React.ReactNode;
}

// Static lookup maps — Tailwind v4 does NOT compile dynamic `grid-cols-${n}` strings.
// All variants must appear as literal class strings in source.
const MOBILE_COLS_MAP: Record<1 | 2, string> = {
  1: 'grid-cols-1',
  2: 'grid-cols-2',
};

const TABLET_COLS_MAP: Record<2 | 3, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

const DESKTOP_COLS_MAP: Record<2 | 3 | 4, string> = {
  2: 'lg:grid-cols-2',
  3: 'lg:grid-cols-3',
  4: 'lg:grid-cols-4',
};

/**
 * Standard CSS Grid tailored for our responsive breakpoints.
 */
export function Grid({
  colsMobile = 1,
  colsTablet = 2,
  colsDesktop = 2,
  className,
  children,
  ...props
}: GridProps) {
  const mobileCols = MOBILE_COLS_MAP[colsMobile];
  const tabletCols = TABLET_COLS_MAP[colsTablet];
  const desktopCols = DESKTOP_COLS_MAP[colsDesktop];

  return (
    <div
      className={cx('grid', mobileCols, tabletCols, desktopCols, 'gap-[clamp(16px,4vw,64px)] w-full', className)}
      {...props}
    >
      {children}
    </div>
  );
}
