import Image from 'next/image';
import { ParallaxFrame } from '../../ui/ParallaxFrame';

/**
 * Full-bleed background photo + dark gradient scrim so white text stays legible.
 * Uses next/image for optimized loading; scrim is a CSS gradient overlay.
 * The photo drifts gently within the band (ParallaxFrame); the scrim does not.
 */
export function FooterBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Photo — drifts within the band as it scrolls */}
      <ParallaxFrame className="absolute inset-0" amount={8}>
        <Image
          src="/images/footer-background.webp"
          alt=""
          fill
          sizes="(max-width: 375px) 315vw, (max-width: 480px) 258vw, (max-width: 768px) 172vw, (max-width: 1024px) 139vw, 100vw"
          className="object-cover object-center"
          priority={false}
        />
      </ParallaxFrame>
      {/* Dark gradient scrim for legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-black/20" />
    </div>
  );
}
