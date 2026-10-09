import { telHref, waHref } from '@/content/site';
import { cx } from '@/lib/cx';
import { PhoneIcon, WhatsAppIcon } from './icons';

const WA_URL = waHref();
const PHONE_URL = telHref();

const HALF_BASE =
  'type-small font-bold flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 px-4 py-2.5 ' +
  'transition duration-200 motion-safe:active:scale-95 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset';

// WhatsApp brand green + white: intentional exception to the 4-colour palette (bold CTA, owner decision;
// re-confirmed 2026-10-09: native WhatsApp colours stay, 1.98:1 label accepted as an owner-approved exception).
// Keyboard focus is a two-tone ring drawn inside the half (the pill's overflow-hidden clips anything outside):
// the shared 2px cream inset ring outside (as on the phone half), a 2px plum outline inside it. The plum band
// meets the green at 3.00:1 and the cream band at 5.55:1, so the ring clears 3:1 over any page colour
// (a white ring on this green is only 1.98:1, NS-41). Rest and hover are untouched.
const WA_HALF =
  'bg-[#25D366] text-[#FFFFFF] hover:bg-[#1EBE5B] focus-visible:ring-cream ' +
  'focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-4 focus-visible:outline-plum';
// Phone half hovers to a darker plum, never mauve (cream on mauve is 2.26:1, NS-33).
const PHONE_HALF =
  'hover:bg-[color:color-mix(in_srgb,var(--color-plum)_88%,black)] focus-visible:ring-cream';

/**
 * Single contact pill (replaces the old WhatsApp + Phone FABs).
 * Bottom-left on every breakpoint. Mobile: WhatsApp + call halves.
 * md+: WhatsApp half only.
 * A server component: the entrance is the CSS `.fab-enter` animation in globals.css (0.8s delay, a 0.5s
 * ease-out fade and a 0.72s rise; see the comment there). The server HTML
 * carries no inline `opacity:0`: the rest state is fully visible, so it shows with JS off, and the animation
 * is switched off under prefers-reduced-motion. The outer fixed wrapper owns positioning, so the pill's
 * entrance transform never fights the positioning classes.
 */
export function ContactFAB() {
  return (
    <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-50 md:bottom-6 md:left-6">
      <div
        data-testid="contact-fab"
        data-reveal=""
        className="fab-enter flex items-stretch overflow-hidden rounded-full ring-1 ring-inset ring-cream/35 bg-plum text-cream shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] transition-transform duration-200 motion-safe:hover:-translate-y-0.5"
      >
        <a
          data-testid="fab-whatsapp"
          href={WA_URL}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="שלחו הודעה בוואטסאפ"
          className={cx(HALF_BASE, WA_HALF, 'rounded-s-full md:rounded-full')}
        >
          <WhatsAppIcon />
          <span>וואטסאפ</span>
        </a>

        <span aria-hidden="true" className="my-2.5 w-px bg-cream/35 md:hidden" />

        <a
          data-testid="fab-phone"
          href={PHONE_URL}
          aria-label="התקשרו אליי"
          className={cx(HALF_BASE, PHONE_HALF, 'rounded-e-full md:hidden')}
        >
          <PhoneIcon />
          <span>חייגו</span>
        </a>
      </div>
    </div>
  );
}
