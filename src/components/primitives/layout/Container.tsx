import React from 'react';

type MaxWidth = 'md' | 'lg' | 'xl' | '2xl' | 'none';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  maxWidth?: MaxWidth;
  children: React.ReactNode;
}

const MAX_W_MAP: Record<MaxWidth, string> = {
  md: 'max-w-[768px]',
  lg: 'max-w-[1024px]',
  xl: 'max-w-[1100px]',
  '2xl': 'max-w-[1280px]',
  none: '',
};

/**
 * Standard content container that auto-centers and applies max-width and fluid horizontal padding.
 */
export function Container({
  maxWidth = '2xl',
  className = '',
  children,
  ...props
}: ContainerProps) {
  return (
    <div
      className={`mx-auto w-full px-[clamp(16px,4vw,48px)] ${MAX_W_MAP[maxWidth]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
