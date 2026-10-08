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
    iconSrc: '/images/social-icon-facebook.svg',
    iconAlt: 'Simple Facebook Icon',
  },
  {
    href: 'https://instagram.com',
    label: 'Instagram',
    iconSrc: '/images/social-icon-instagram.svg',
    iconAlt: 'Simple Instagram Icon',
  },
  {
    href: 'https://twitter.com',
    label: 'Twitter',
    iconSrc: '/images/social-icon-twitter.svg',
    iconAlt: 'Twitter Logo',
  },
];

export function SocialLinks() {
  return (
    <div className="flex gap-[24px]">
      {SOCIAL_LINKS.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={link.label}
          className="w-[44px] h-[44px] flex-shrink-0 hover:opacity-80 transition-opacity"
          style={{
            backgroundColor: 'currentColor',
            WebkitMaskImage: `url(${link.iconSrc})`,
            maskImage: `url(${link.iconSrc})`,
            WebkitMaskSize: 'contain',
            maskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            maskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskPosition: 'center',
          }}
        />
      ))}
    </div>
  );
}
