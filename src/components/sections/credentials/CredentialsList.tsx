import type { Credential } from '@/content/types';

export interface CredentialsListProps {
  items: Credential[];
  checkIconSrc: string | string[];
  onDark?: boolean;
}

export function CredentialsList({ items, checkIconSrc, onDark }: CredentialsListProps) {
  const icons = Array.isArray(checkIconSrc) ? checkIconSrc : [checkIconSrc];
  return (
    <ul className="grid grid-cols-2 md:grid-cols-3 gap-[32px] md:gap-[64px]">
      {items.map((item, i) => (
        <li key={i} className="flex flex-col items-center text-center">
          <img // eslint-disable-line @next/next/no-img-element -- small fixed-size static webp icons with a CSS filter, below the fold
            src={icons[i % icons.length]}
            alt=""
            aria-hidden="true"
            width={384}
            height={288}
            className="w-[96px] h-auto shrink-0 mb-[16px]"
            style={onDark ? { filter: 'brightness(0) saturate(100%) invert(96%) sepia(13%) saturate(1034%) hue-rotate(314deg) brightness(105%) contrast(101%)' } : undefined}
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
