import type { Credential } from '@/content/types';

interface CredentialsListProps {
  items: Credential[];
  /** Icons used in rotation, one per item. */
  iconSrcs: string[];
}

/** Turns the credential artwork plum to match the paper surface. */
const PLUM_ICON_FILTER = 'brightness(0) saturate(100%) invert(35%) sepia(12%) saturate(1100%) hue-rotate(248deg) brightness(88%) contrast(90%)';

export function CredentialsList({ items, iconSrcs }: CredentialsListProps) {
  // Wrapped flex, not a grid: a short last row (5 items = 2+2+1, or 3+2) stays centred instead of hanging off one
  // edge. Item width = (100% - gaps) / columns: 2 columns with gap-8, 3 columns from md with gap-16.
  return (
    <ul className="flex flex-wrap justify-center gap-8 md:gap-16">
      {items.map((item, i) => (
        <li key={i} className="flex w-[calc((100%-2rem)/2)] flex-col items-center text-center md:w-[calc((100%-8rem)/3)]">
          <img // eslint-disable-line @next/next/no-img-element -- small fixed-size static webp icons with a CSS filter, below the fold
            src={iconSrcs[i % iconSrcs.length]}
            alt=""
            aria-hidden="true"
            width={384}
            height={288}
            className="w-24 h-auto shrink-0 mb-4"
            style={{ filter: PLUM_ICON_FILTER }}
            loading="lazy"
          />
          <span
            className="type-card-title text-center"
          >
            {item.text}
          </span>
        </li>
      ))}
    </ul>
  );
}
