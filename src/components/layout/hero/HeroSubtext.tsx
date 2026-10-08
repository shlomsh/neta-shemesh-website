/**
 * HeroSubtext — supporting body copy beneath the main heading.
 *
 * Two lines of Hebrew supporting copy at `.type-quote` (Stanga 400, 24-32px).
 * Server component.
 */
export function HeroSubtext() {
  return (
    <p
      dir="rtl"
      className="
        type-quote
        text-[var(--color-blush)]
        w-full
      "
    >
      ליווי מקצועי בתהליכי שינוי, משבר וצמיחה זוגית ומשפחתית.
      <br />
      בואו נמצא את הדרך חזרה אחד לשנייה.
    </p>
  );
}
