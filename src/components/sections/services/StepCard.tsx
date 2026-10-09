import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Photo } from '@/components/primitives/ui/Photo';
import { cx } from '@/lib/cx';

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
  staggerClass,
}: StepCardProps) {
  return (
    <ScrollReveal delay={delay} className={cx('w-full h-full', staggerClass)}>
      <Photo src={imageSrc} alt={title} radius="card" className="w-full h-full shadow-lg">

        {/* Legibility gradient so white text reads on any photo */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/10" />

        {/* Content anchored to bottom, RTL — direction inherited from <html>; font from body */}
        <div className="absolute inset-0 flex flex-col justify-end p-[20px] text-right sm:p-[24px]">
          <span
            dir="ltr"
            className="type-display self-end text-cream drop-shadow-md"
          >
            {numberText}
          </span>
          <h3 className="type-card-title mt-2 mb-3 text-cream drop-shadow">
            {title}
          </h3>
          <ul className="flex flex-col gap-[6px]">
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
