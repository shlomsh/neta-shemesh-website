import { QuoteIcon } from './QuoteIcon';
import { QuoteText } from './QuoteText';
import { Attribution } from './Attribution';

export interface TestimonialData {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatarSrc: string;
  variant: 'default' | 'highlighted';
}

interface TestimonialCardProps {
  testimonial: TestimonialData;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const { quote, name, role, avatarSrc, variant } = testimonial;

  if (variant === 'highlighted') {
    return (
      <div className="flex flex-col justify-between p-[32px] relative rounded-card bg-[var(--color-bg-light)] min-h-[350px] overflow-hidden">
        {/* Decorative SVG background — id preserved for test selector */}
        <svg
          id="ZO48UqFw0isLS2Uu"
          viewBox="0 0 108.4981 120.122"
          preserveAspectRatio="none"
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none opacity-[0.16]"
        >
          <path
            d="M4.99999937,0 L103.49811617,0 C104.82419845,0 106.09596785,0.52678413 107.03364963,1.46446591 107.9713314,2.40214768 108.49811554,3.67391709 108.49811554,4.99999937 L108.49811554,115.12200227 C108.49811554,116.44808456 107.97133141,117.71985396 107.03364963,118.65753574 106.09596786,119.59521751 104.82419845,120.12200165 103.49811617,120.12200165 L4.99999937,120.12200165 C3.67391709,120.12200165 2.40214768,119.59521751 1.46446591,118.65753574 0.52678413,117.71985396 0,116.44808455 0,115.12200227 L0,4.99999937 C0,3.67391709 0.52678413,2.40214769 1.46446591,1.46446591 2.40214768,0.52678414 3.67391709,0 4.99999937,0 Z"
            fill="var(--color-brand-primary)"
          />
        </svg>
        <QuoteIcon />
        <QuoteText text={quote} />
        <Attribution name={name} role={role} avatarSrc={avatarSrc} />
      </div>
    );
  }

  return (
    <div className="flex flex-col justify-between p-[32px] relative rounded-card bg-[var(--color-cream)] shadow-sm min-h-[350px]">
      <QuoteIcon />
      <QuoteText text={quote} />
      <Attribution name={name} role={role} avatarSrc={avatarSrc} />
    </div>
  );
}
