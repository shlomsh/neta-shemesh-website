import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Photo } from '@/components/primitives/ui/Photo';

import type { ExpertiseCardData } from '@/content/types';

interface ExpertiseCardProps extends Omit<ExpertiseCardData, 'slug'> {
  delay: number;
}

/**
 * `sizes` = the width the image renders at (NS-30). The landscape sources are cover-fitted into 4:5 cards below
 * lg, so the image is 1.88x the card wide (165vw; the 640px column caps it at about 1200px), then 580px in the
 * two-column tablet grid and 500px in the lg grid.
 */
const CARD_SIZES = '(min-width: 1024px) 500px, (min-width: 768px) 580px, 165vw';

export function ExpertiseCard({ title, description, imageSrc, imageAlt, delay }: ExpertiseCardProps) {
  return (
    <ScrollReveal delay={delay} className="w-full h-full shadow-2xl rounded-card">
      {/* safariClip off: the grid cell around this card (Expertise.tsx) already carries safari-clip */}
      <Photo
        engine="next"
        src={imageSrc}
        alt={imageAlt}
        sizes={CARD_SIZES}
        radius="card"
        safariClip={false}
        className="w-full h-full bg-plum"
      >
        {/* The pill shows only the title; the description is read by screen readers only. */}
        <div
          className="
        absolute top-[50%] left-[50%] -translate-x-1/2 -translate-y-1/2
        bg-mauve opacity-95
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
          text-cream
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
