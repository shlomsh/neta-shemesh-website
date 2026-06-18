import React from 'react';

interface AnimatedBlockProps extends React.HTMLAttributes<HTMLDivElement> {
  animation: string;
  children: React.ReactNode;
}

export function AnimatedBlock({ animation, children, ...props }: AnimatedBlockProps) {
  return (
    <div className="animation_container" style={{ width: '100%', height: '100%' }} {...props}>
      <div className="animated" style={{ width: '100%', height: '100%', animation }}>
        {children}
      </div>
    </div>
  );
}
