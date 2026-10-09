/**
 * HeroCTA — call-to-action:
 * A contact pill ("ייעוץ עם נטע שמש" → #contact) rendered through ButtonLink
 * (secondary = cream fill + plum text, 5.55:1 on the plum hero).
 * Server component.
 */
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { ANCHOR, anchorHref } from '@/content/ids';

export function HeroCTA() {
  return (
    <div
      className="flex flex-col items-start gap-[clamp(12px,1.5vw,20px)] w-full"
    >
      {/* Primary CTA → contact section */}
      <ButtonLink href={anchorHref(ANCHOR.contact)} variant="secondary" size="sm">
        ייעוץ עם נטע שמש
      </ButtonLink>
    </div>
  );
}
