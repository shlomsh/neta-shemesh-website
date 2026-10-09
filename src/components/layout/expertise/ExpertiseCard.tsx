import { ScrollReveal } from '../../ui/ScrollReveal';
import { Photo } from '@/components/primitives/ui/Photo';
import { CardLabel } from './CardLabel';

import type { ExpertiseCardData } from '@/content/types';

interface ExpertiseCardProps extends Omit<ExpertiseCardData, 'slug'> {
  delay: number;
}

export function ExpertiseCard({ title, description, imageSrc, imageAlt, delay }: ExpertiseCardProps) {
  return (
    <ScrollReveal delay={delay} className="w-full h-full shadow-2xl rounded-card">
      {/* safariClip off: the grid cell around this card (Expertise.tsx) already carries safari-clip */}
      <Photo src={imageSrc} alt={imageAlt} radius="card" safariClip={false} className="w-full h-full bg-[var(--color-dark)]">
        <CardLabel title={title} description={description} />
      </Photo>
    </ScrollReveal>
  );
}
