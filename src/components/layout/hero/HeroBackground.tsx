/**
 * HeroBackground — "05B Dark Ground" treatment.
 *
 * Replaces the original full-bleed photo with a solid deep-plum field
 * (--color-plum / #574964). All hero text and the line-art
 * illustration sit on top of this in lighter palette tones.
 *
 * Server component; no interactivity needed.
 */
export function HeroBackground() {
  return (
    <div
      className="absolute inset-0 bg-[var(--color-plum)]"
      aria-hidden="true"
    />
  );
}
