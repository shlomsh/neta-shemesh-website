/**
 * HeroCTA — two call-to-action elements:
 *   1. A contact pill ("ייעוץ עם נטע שמש" → #contact) with brand-primary fill
 *   2. A phone badge ("+01 234 5678 90") with solid brand-primary fill
 *
 * Both match the original Canva badge shapes (solid coloured rectangles
 * with centred bold text). The opacity-75 on the CTA pill matches the
 * original 0.75 opacity on its SVG fill.
 * Server component.
 */
export function HeroCTA() {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-start gap-[clamp(12px,1.5vw,20px)] w-full"
    >
      {/* Primary CTA → contact section */}
      <a
        href="#contact"
        className="
          inline-flex items-center justify-center
          bg-[var(--color-brand-primary)]/75
          hover:bg-[var(--color-brand-primary)]
          rounded-2xl
          px-[clamp(16px,2.5vw,32px)]
          h-[clamp(44px,5.4vw,54px)]
          text-[var(--color-white)]
          font-[family-name:var(--font-stanga)]
          font-bold
          text-[clamp(13px,1.4vw,17px)]
          md:text-[20px]
          tracking-[0.138em]
          leading-[1.375]
          transition-colors
          whitespace-nowrap
        "
      >
        ייעוץ עם נטע שמש
      </a>
    </div>
  );
}
