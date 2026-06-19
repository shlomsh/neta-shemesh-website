import React from 'react';

interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  colsMobile?: 1 | 2;
  colsTablet?: 2 | 3;
  colsDesktop?: 2 | 3 | 4;
  children: React.ReactNode;
}

/**
 * Standard CSS Grid tailored for our responsive breakpoints.
 */
export function Grid({
  colsMobile = 1,
  colsTablet = 2,
  colsDesktop = 2,
  className = '',
  children,
  ...props
}: GridProps) {
  const mobileCols = `grid-cols-${colsMobile}`;
  const tabletCols = `md:grid-cols-${colsTablet}`;
  const desktopCols = `lg:grid-cols-${colsDesktop}`;

  return (
    <div
      className={`grid ${mobileCols} ${tabletCols} ${desktopCols} gap-[clamp(16px,4vw,64px)] w-full ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
