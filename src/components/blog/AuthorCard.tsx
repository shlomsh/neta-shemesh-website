import { Photo } from '@/components/primitives/ui/Photo';
import { SITE } from '@/content/site';
import { PROFILE_PHOTO } from '@/content/home/about';

/**
 * AuthorCard — compact bio shown at the foot of each article, echoing the
 * physio-site author card. Profile photo + name + role + one-line bio.
 *
 * Rendered on a cream surface → dark plum text.
 */
export function AuthorCard() {
  return (
    <div
      className="flex flex-col items-center gap-stack rounded-card bg-[color:color-mix(in_srgb,var(--color-blush)_28%,var(--color-cream))] p-panel text-center sm:flex-row sm:text-start"
    >
      <Photo
        src={PROFILE_PHOTO}
        alt={SITE.name}
        radius="none"
        sizes="116px"
        objectPosition="50% 38%"
        className="shrink-0 rounded-full w-[clamp(5.25rem,11vw,7.25rem)] h-[clamp(5.25rem,11vw,7.25rem)]"
      >
        <div className="absolute inset-0 rounded-full ring-[1.5px] ring-mauve" />
      </Photo>

      <div className="flex flex-col gap-1.5">
        <span className="type-eyebrow text-plum">
          על הכותבת
        </span>
        <p className="type-card-title text-plum">{SITE.name}</p>
        <p className="type-small text-plum">{SITE.jobTitle} &middot; {SITE.city}</p>
        <p className="type-body text-plum">
          מלווה זוגות, הורים ומשפחות בתהליכי שינוי, משבר וצמיחה — מתוך אמונה שכל
          קשר יכול למצוא מחדש את הדרך אל הקרבה והביטחון.
        </p>
      </div>
    </div>
  );
}
