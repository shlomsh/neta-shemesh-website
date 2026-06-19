import { ScrollReveal } from '../ui/ScrollReveal';

interface StepCardProps {
  step: string;        // "01." | "02." | "03." | "04."
  title: string;
  bullets: string[];
  imageSrc: string;
  imageObjectPosition?: string;
  delay?: number;
}

/**
 * StepCard — self-contained step card for the "איך זה עובד?" band.
 * No rem utilities, no AnimatedBlock, no cleanFadeUp.
 * Styled with local px/clamp/%.
 */
export default function StepCard({
  step,
  title,
  bullets,
  imageSrc,
  imageObjectPosition = '50% 50%',
  delay = 0,
}: StepCardProps) {
  return (
    <ScrollReveal delay={delay}>
      <div
        style={{
          background: 'rgba(255,255,255,0.07)',
          borderRadius: '28px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          direction: 'rtl',
        }}
      >
        {/* Image */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            paddingTop: '73%', /* matches ~341/260 card aspect from original */
            overflow: 'hidden',
            borderRadius: '28px 28px 0 0',
          }}
        >
          <img
            src={imageSrc}
            loading="lazy"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: imageObjectPosition,
              display: 'block',
            }}
          />
        </div>

        {/* Text body */}
        <div
          style={{
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '5px',
          }}
        >
          {/* Step number */}
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-canva-primary)',
              fontSize: 'clamp(18px, 2vw, 26px)',
              fontWeight: 700,
              lineHeight: '1.0875em',
              letterSpacing: '-0.02em',
              color: 'var(--color-white)',
              direction: 'rtl',
            }}
          >
            {step}
          </p>

          {/* Title */}
          <p
            style={{
              margin: '6px 0 10px',
              fontFamily: 'var(--font-canva-primary)',
              fontSize: 'clamp(14px, 1.3vw, 16px)',
              fontWeight: 700,
              lineHeight: '1.45312727em',
              letterSpacing: '0.012em',
              color: 'var(--color-white)',
            }}
          >
            {title}
          </p>

          {/* Bullets */}
          {bullets.map((bullet, i) => (
            <p
              key={i}
              style={{
                margin: 0,
                fontFamily: 'var(--font-canva-primary)',
                fontSize: 'clamp(13px, 1.1vw, 15px)',
                lineHeight: '1.45312727em',
                letterSpacing: '0.012em',
                color: 'var(--color-white)',
              }}
            >
              {bullet}
            </p>
          ))}
        </div>
      </div>
    </ScrollReveal>
  );
}
