/**
 * AuthorCard — compact bio shown at the foot of each article, echoing the
 * physio-site author card. Profile photo + name + role + one-line bio.
 *
 * Rendered on a cream surface → dark plum text.
 */
export function AuthorCard() {
  return (
    <div
      dir="rtl"
      className="flex flex-col items-center gap-[clamp(16px,2.5vw,24px)] rounded-[20px] bg-[color:color-mix(in_srgb,var(--color-blush)_28%,var(--color-cream))] p-[clamp(24px,3.5vw,40px)] text-center sm:flex-row sm:text-right"
    >
      <div className="relative shrink-0 overflow-hidden rounded-full w-[clamp(84px,11vw,116px)] h-[clamp(84px,11vw,116px)]">
        <img
          src="/images/about-profile-neta.webp"
          alt="נטע שמש"
          loading="lazy"
          className="h-full w-full object-cover object-[50%_38%]"
        />
        <div className="absolute inset-0 rounded-full shadow-[0_0_0_1.5px_var(--color-mauve)]" />
      </div>

      <div className="flex flex-col gap-[6px]">
        <span className="type-eyebrow uppercase tracking-[0.08em] text-[var(--color-mauve)]">
          על הכותבת
        </span>
        <p className="type-card-title text-[var(--color-plum)]">נטע שמש</p>
        <p className="type-small text-[var(--color-mauve)]">מטפלת זוגית ומשפחתית · כפר יעבץ</p>
        <p className="type-body text-[color:color-mix(in_srgb,var(--color-plum)_82%,transparent)]">
          מלווה זוגות, הורים ומשפחות בתהליכי שינוי, משבר וצמיחה — מתוך אמונה שכל
          קשר יכול למצוא מחדש את הדרך אל הקרבה והביטחון.
        </p>
      </div>
    </div>
  );
}
