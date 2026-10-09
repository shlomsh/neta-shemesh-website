'use client';

import { motion } from 'framer-motion';
import { telHref, waHref } from '@/content/site';
import { cx } from '@/lib/cx';
import { PhoneIcon } from './icons/PhoneIcon';
import { WhatsAppIcon } from './icons/WhatsAppIcon';

const WA_URL = waHref();
const PHONE_URL = telHref();

const HALF_BASE =
  'type-small font-bold flex min-h-[44px] min-w-[44px] items-center justify-center gap-2 px-4 py-2.5 ' +
  'transition duration-200 motion-safe:active:scale-95 ' +
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset';

// WhatsApp brand green + white: intentional exception to the 4-colour palette (bold CTA, owner decision).
const WA_HALF =
  'bg-[#25D366] text-[#FFFFFF] hover:bg-[#1EBE5B] focus-visible:ring-[#FFFFFF]';
const PHONE_HALF =
  'hover:bg-mauve focus-visible:ring-cream';

/**
 * Single contact pill (replaces the old WhatsApp + Phone FABs).
 * Bottom-left on every breakpoint. Mobile: WhatsApp + call halves.
 * md+: WhatsApp half only.
 * The outer fixed wrapper owns positioning so framer-motion's inline
 * transform on the pill never fights the positioning classes.
 * Same tree on server and client (no useReducedMotion branch: it would
 * cause an SSR/hydration style mismatch); `[data-reveal]` in globals.css
 * shows it immediately under prefers-reduced-motion.
 */
export function ContactFAB() {
  return (
    <div className="fixed bottom-[max(16px,env(safe-area-inset-bottom))] left-4 z-50 md:bottom-6 md:left-6">
      <motion.div
        data-testid="contact-fab"
        data-reveal=""
        initial={{ y: 24, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex items-stretch overflow-hidden rounded-full ring-1 ring-inset ring-cream/35 bg-plum text-cream shadow-[0_12px_30px_-10px_rgba(0,0,0,0.35)] transition-transform duration-200 motion-safe:hover:-translate-y-0.5"
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
      </motion.div>
    </div>
  );
}
