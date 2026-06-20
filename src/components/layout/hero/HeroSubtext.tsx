/**
 * HeroSubtext — supporting body copy beneath the main heading.
 *
 * Two lines of Hebrew body text in Stanga Regular (weight 400),
 * matching the original letter-spacing and line-height from the Canva source.
 * Server component.
 */
export function HeroSubtext() {
  return (
    <p
      dir="rtl"
      className="
        text-[var(--color-white)]
        font-[family-name:var(--font-stanga)]
        font-normal
        text-[clamp(18px,4vw,24px)]
        leading-[1.45]
        tracking-[0.012em]
        w-full
      "
    >
      ליווי מקצועי בתהליכי שינוי, משבר וצמיחה זוגית ומשפחתית.
      <br />
      בואו נמצא את הדרך חזרה אחד לשנייה.
    </p>
  );
}
