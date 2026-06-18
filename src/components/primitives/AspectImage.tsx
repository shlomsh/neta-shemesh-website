import React from 'react';

interface AspectImageProps extends React.HTMLAttributes<HTMLDivElement> {
  src: string;
  alt?: string;
  aspectPct: string | number;
  objectPosition?: string;
  fillId?: string;
  imgId?: string;
  fillStyle?: React.CSSProperties;
  imgStyle?: React.CSSProperties;
  children?: React.ReactNode;
}

export function AspectImage({ 
  src, 
  alt = "", 
  aspectPct, 
  objectPosition = "50% 50%", 
  fillId,
  imgId,
  fillStyle,
  imgStyle,
  children,
  style,
  ...props 
}: AspectImageProps) {
  const resolvedSrc = src.startsWith('images/') ? `/${src}` : src;
  
  return (
    <div style={{ paddingTop: typeof aspectPct === 'number' ? `${aspectPct}%` : aspectPct, ...style }} {...props}>
      <div id={fillId} style={{ position: 'absolute', top: '0px', left: '0px', width: '100%', height: '100%', ...fillStyle }}>
        {children ? children : (
          <img 
            id={imgId}
            src={resolvedSrc} 
            alt={alt} 
            loading="lazy" 
            style={{ 
              width: '100%', 
              height: '100%', 
              display: 'block', 
              objectFit: 'cover', 
              objectPosition,
              ...imgStyle
            }} 
          />
        )}
      </div>
    </div>
  );
}
