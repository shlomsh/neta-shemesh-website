import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { ANCHOR, anchorHref } from '@/content/ids';

/**
 * Footer CTA: a single cream `ButtonLink` pill (secondary variant) sitting on
 * the photo footer. The old stacked badge highlight shapes were removed because
 * the pill is its own fill.
 */
export function FooterCTA() {
  return (
    <div className="relative flex items-center justify-center">
      {/* CTA link */}
      <ButtonLink href={anchorHref(ANCHOR.contact)} variant="secondary" size="sm" className="relative z-10 min-h-[48px]">
        מוזמנים ליצור איתי קשר
      </ButtonLink>
    </div>
  );
}
