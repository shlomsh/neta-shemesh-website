/**
 * Brand name in script/accent font — "נטע שמש"
 * Slightly larger on mobile per token sheet (template scales it up).
 */
export function FooterBrand() {
  return (
    <p
      className="text-[color:var(--color-white)] font-[family-name:var(--font-display)] text-[clamp(34px,2.9vw,38px)] leading-[1.09] tracking-[-0.02em] text-center"
      dir="rtl"
    >
      נטע שמש
    </p>
  );
}
