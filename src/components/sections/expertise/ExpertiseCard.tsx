import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Photo } from '@/components/primitives/ui/Photo';

import type { ExpertiseCardData } from '@/content/types';

interface ExpertiseCardProps extends Omit<ExpertiseCardData, 'slug'> {
  delay: number;
}

export function ExpertiseCard({ title, description, imageSrc, imageAlt, delay }: ExpertiseCardProps) {
  return (
    <ScrollReveal delay={delay} className="w-full h-full shadow-2xl rounded-card">
      {/* safariClip off: the grid cell around this card (Expertise.tsx) already carries safari-clip */}
      <Photo src={imageSrc} alt={imageAlt} radius="card" safariClip={false} className="w-full h-full bg-plum">
        {/* The pill shows only the title; the description is read by screen readers only. */}
        <div
          className="
        absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2
        bg-cream
        rounded-full
        px-[24px] py-[8px]
        w-max max-w-[90%]
        text-center
        z-[5]
      "
        >
          <span
            className="
          block
          type-small
          text-plum
          font-bold
        "
          >
            {title}
          </span>
          <span className="sr-only">
            {description}
          </span>
        </div>
      </Photo>
    </ScrollReveal>
  );
}
