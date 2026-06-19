'use client';

import React from 'react';
import { ScrollReveal } from '../ui/ScrollReveal';

interface StepCardProps {
  id: string;
  imageSrc: string;
  numberText: string;
  title: string;
  bullets: string[];
  index: number;
  className?: string;
}

/**
 * Fully fluid step card. No fixed px dimensions — the card fills its grid column
 * and keeps a 3:4 portrait ratio, so it scales from full-width on mobile down to a
 * staggered 2-up on desktop without any breakpoint-specific size juggling.
 */
export function StepCard({
  id,
  imageSrc,
  numberText,
  title,
  bullets,
  index,
  className = '',
}: StepCardProps) {
  return (
    <ScrollReveal delay={index * 0.12} className={className}>
      <div
        id={id}
        className="relative w-full aspect-[3/4] overflow-hidden rounded-[28px]"
      >
        {/* Background image */}
        <img
          src={imageSrc}
          alt={title}
          loading="lazy"
          className="absolute inset-0 h-full w-full object-cover"
          style={{ objectPosition: '50% 50%' }}
        />

        {/* Legibility gradient so white text reads on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        {/* Content, bottom-anchored */}
        <div
          className="absolute inset-0 flex flex-col justify-end p-5 text-right sm:p-6"
          style={{ direction: 'rtl', fontFamily: 'var(--font-canva-primary)' }}
        >
          <span
            dir="ltr"
            className="self-end font-sans text-[clamp(56px,9vw,84px)] font-black leading-none tracking-tight text-white drop-shadow-md"
            style={{ fontFamily: 'ui-sans-serif, system-ui, sans-serif' }}
          >
            {numberText}
          </span>

          <h3 className="mt-2 mb-3 text-[clamp(18px,2.4vw,24px)] font-bold leading-tight text-white drop-shadow">
            {title}
          </h3>

          <ul className="flex flex-col gap-1.5">
            {bullets.map((bullet, i) => (
              <li
                key={i}
                className="text-[clamp(13px,1.4vw,16px)] leading-snug text-white/90"
              >
                {bullet}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </ScrollReveal>
  );
}
