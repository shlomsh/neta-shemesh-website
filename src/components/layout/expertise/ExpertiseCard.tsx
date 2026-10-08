import { ScrollReveal } from '../../ui/ScrollReveal';
import { CardImage } from './CardImage';
import { CardLabel } from './CardLabel';

export interface ExpertiseCardData {
  title: string;
  description: string;
  imageSrc: string;
  imageAlt: string;
}

interface ExpertiseCardProps extends ExpertiseCardData {
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
