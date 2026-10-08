import React from 'react';

export interface AvatarProps {
  src: string;
  alt: string;
}

export function Avatar({ src, alt }: AvatarProps) {
  return (
    <div className="w-[64px] h-[64px] rounded-full overflow-hidden shrink-0 ml-[16px]">
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
