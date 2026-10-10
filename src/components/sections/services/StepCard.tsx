import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Photo } from '@/components/primitives/ui/Photo';
import { cx } from '@/lib/cx';

interface StepCardProps {
  imageSrc: string;
  numberText: string;
  title: string;
  bullets: string[];
  /** Classes for the reveal wrapper: the card's size, radius, shadow, max width and vertical offset. */
  className?: string;
}

/**
 * `sizes` = the width the image renders at (NS-30). The landscape sources are cover-fitted into tall cards, so
 * the image is wider than the card: 175vw in the one-column phone layout, about 50vw in the two-column tablet
 * grid, 560px at lg (height-driven).
 */
const CARD_SIZES = '(min-width: 1024px) 560px, (min-width: 768px) 50vw, 175vw';

export function StepCard({
  imageSrc,
  numberText,
  title,
  bullets,
  className,
}: StepCardProps) {
  return (
    <ScrollReveal className={cx('w-full h-full', className)}>
      <Photo src={imageSrc} alt={title} sizes={CARD_SIZES} radius="card" className="w-full h-full shadow-lg">

        {/* Legibility gradient so white text reads on any photo */}
        <div className="absolute inset-0 bg-linear-to-t from-black/85 via-black/45 to-black/10" />

        {/* Content anchored to bottom, RTL — direction inherited from <html>; font from body */}
        <div className="absolute inset-0 flex flex-col justify-end p-5 text-start sm:p-6">
          <span
            dir="ltr"
            className="type-display self-end text-cream drop-shadow-md"
          >
            {numberText}
          </span>
          <h3 className="type-card-title mt-2 mb-3 text-cream drop-shadow">
            {title}
          </h3>
          <ul className="flex flex-col gap-1.5">
            {bullets.map((item, i) => (
              <li
                key={i}
                className="type-small text-cream/90"
              >
                {item}
              </li>
            ))}
          </ul>
        </div>
      </Photo>
    </ScrollReveal>
  );
}
