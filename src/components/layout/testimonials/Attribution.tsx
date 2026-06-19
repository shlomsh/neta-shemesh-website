import React from 'react';
import { Avatar } from './Avatar';

export interface AttributionProps {
  name: string;
  role: string;
  avatarSrc: string;
}

export function Attribution({ name, role, avatarSrc }: AttributionProps) {
  return (
    <div className="flex items-center justify-between mt-auto">
      <Avatar src={avatarSrc} alt={name} />
      <div className="text-right flex-grow">
        <p className="font-bold text-[var(--color-text-primary)] text-[clamp(14px,1.1vw,16px)] leading-[1.4]">
          {name}
        </p>
        <p className="text-[clamp(12px,0.9vw,14px)] text-[var(--color-text-secondary)] leading-[1.4]">
          {role}
        </p>
      </div>
    </div>
  );
}
