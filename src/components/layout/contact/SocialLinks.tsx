'use client';

interface SocialLink {
  href: string;
  label: string;
  iconSrc: string;
  iconAlt: string;
}

const SOCIAL_LINKS: SocialLink[] = [
  {
    href: 'https://facebook.com',
    label: 'Facebook',
    iconSrc: '/images/74ec6b8545ed1d2da59d1d1e63e12975.svg',
    iconAlt: 'Simple Facebook Icon',
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    iconSrc: '/images/a5f675633ff811108876d1551a12079e.svg',
    iconAlt: 'Simple Instagram Icon',
  },
  {
    href: 'https://twitter.com',
    label: 'Twitter',
    iconSrc: '/images/2e2df4068df235d087087c1872a7b1de.svg',
    iconAlt: 'Twitter Logo',
  },
];

export function SocialLinks() {
  return (
    <div className="flex flex-row-reverse gap-[24px] mt-[24px]">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="w-[44px] h-[44px] flex-shrink-0 hover:opacity-80 transition-opacity"
        >
          <img
            src={link.iconSrc}
            alt={link.iconAlt}
            loading="lazy"
            className="w-full h-full object-contain"
          />
        </a>
      ))}
    </div>
  );
}
