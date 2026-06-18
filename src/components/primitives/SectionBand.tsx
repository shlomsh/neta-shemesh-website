import React from 'react';

interface SectionBandProps extends React.HTMLAttributes<HTMLDivElement> {
  background?: string;
  children: React.ReactNode;
}

export function SectionBand({ background, children, style, ...props }: SectionBandProps) {
  return (
    <div 
      style={{ 
        position: 'relative', 
        overflow: 'hidden', 
        display: 'grid', 
        alignItems: 'center', 
        gridTemplateColumns: 'auto 100rem auto', 
        zIndex: '0', 
        background,
        ...style 
      }}
      {...props}
    >
      {children}
    </div>
  );
}
