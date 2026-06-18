import React from 'react';

interface TitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  id: string;
  spanId: string;
  tier: 'hero' | 'section' | 'sub';
  onDark?: boolean;
  text: string;
}

export function Title({ id, spanId, tier, onDark, text, className, style, ...props }: TitleProps) {
  const baseClass = tier === 'hero' ? 'hero-title' : tier === 'section' ? 'section-header' : 'sub-header';
  const combinedClassName = `${baseClass}${onDark ? ' on-dark' : ''}${className ? ` ${className}` : ''}`;

  return (
    <p id={id} className={combinedClassName} style={style} {...props}>
      <span id={spanId}>{text}</span>
      <br/>
    </p>
  );
}
