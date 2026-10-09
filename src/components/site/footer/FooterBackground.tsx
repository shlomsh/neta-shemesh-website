import { Photo } from '@/components/primitives/ui/Photo';

/**
 * Full-bleed background photo + dark gradient scrim so white text stays legible.
 * Uses next/image for optimized loading; scrim is a CSS gradient overlay.
 * The photo drifts gently within the band (parallax); the scrim does not.
 */
export function FooterBackground() {
  return (
    <div className="absolute inset-0 overflow-clip">
      {/* Photo — drifts within the band as it scrolls */}
      <Photo
        engine="next"
        src="/images/footer-background.webp"
        alt=""
        sizes="(max-width: 375px) 315vw, (max-width: 480px) 258vw, (max-width: 768px) 172vw, (max-width: 1024px) 139vw, 100vw"
        radius="none"
        motion={{ parallax: 8 }}
        className="absolute inset-0"
      />
      {/* Dark gradient scrim for legibility */}
      <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/30 to-black/20" />
    </div>
  );
}
