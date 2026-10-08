import { ScrollReveal } from '../../ui/ScrollReveal';
import { CardImage } from './CardImage';
import { CardLabel } from './CardLabel';

import type { ExpertiseCardData } from '@/content/types';

interface ExpertiseCardProps extends Omit<ExpertiseCardData, 'slug'> {
  delay: number;
}

export function ExpertiseCard({ title, description, imageSrc, imageAlt, delay }: ExpertiseCardProps) {
  return (
    <ScrollReveal delay={delay} className="w-full h-full shadow-2xl rounded-card">
      <div className="relative w-full h-full overflow-hidden rounded-card bg-[var(--color-dark)]">
        <CardImage src={imageSrc} alt={imageAlt} />
        <CardLabel title={title} description={description} />
      </div>
    </ScrollReveal>
  );
}
