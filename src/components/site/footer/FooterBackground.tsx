import { Photo } from '@/components/primitives/ui/Photo';

/**
 * Full-bleed background photo + a local scrim so the cream text stays legible.
 * Uses next/image for optimized loading; the photo stays at full opacity and the scrim is a CSS
 * gradient overlay: darkest behind the text column, clear toward the edges (no whole-photo tint).
 * The photo drifts gently within the band (parallax); the scrim does not.
 */
export function FooterBackground() {
  return (
    <div className="absolute inset-0 overflow-clip">
      {/* Photo — drifts within the band as it scrolls */}
      <Photo
        src="/images/footer-background.webp"
        alt=""
        sizes="(max-width: 375px) 315vw, (max-width: 480px) 258vw, (max-width: 768px) 172vw, (max-width: 1024px) 139vw, 100vw"
        radius="none"
        motion={{ parallax: 8 }}
        className="absolute inset-0"
      />
      {/* Local scrim for legibility: strongest behind the text column, fading to the clear photo at the edges */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-radial-[ellipse_70%_60%_at_50%_50%] from-black/50 via-black/30 to-black/0" />
    </div>
  );
}
