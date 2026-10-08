'use client';

import { ScrollReveal } from '../../ui/ScrollReveal';
import { StepImage } from './StepImage';
import { StepNumber } from './StepNumber';
import { StepTitle } from './StepTitle';
import { StepBullets } from './StepBullets';

interface StepCardProps {
  imageSrc: string;
  numberText: string;
  title: string;
  bullets: string[];
  delay: number;
  staggerClass?: string;
}

export function StepCard({
  imageSrc,
  numberText,
  title,
  bullets,
  delay,
  staggerClass = '',
}: StepCardProps) {
  return (
    <ScrollReveal delay={delay} className={`w-full h-full ${staggerClass}`}>
      <div className="relative w-full h-full overflow-hidden rounded-card shadow-lg safari-clip">
        <StepImage src={imageSrc} alt={title} />

        {/* Legibility gradient so white text reads on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        {/* Content anchored to bottom, RTL — direction inherited from section dir="rtl"; font from body */}
        <div className="absolute inset-0 flex flex-col justify-end p-[20px] text-right sm:p-[24px]">
          <StepNumber text={numberText} />
          <StepTitle text={title} />
          <StepBullets items={bullets} />
        </div>
      </div>
    </ScrollReveal>
  );
}
