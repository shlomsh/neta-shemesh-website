import type { SocialLink } from '../types';

// TODO(owner): these still point at the networks' home pages. Once Netta supplies
// the real profile URLs, put them here and feed SITE.sameAs (content/site.ts) from this array.
export const SOCIAL_LINKS: SocialLink[] = [
  { href: 'https://facebook.com', label: 'Facebook', iconSrc: '/images/social-icon-facebook.svg' },
  { href: 'https://instagram.com', label: 'Instagram', iconSrc: '/images/social-icon-instagram.svg' },
  { href: 'https://twitter.com', label: 'Twitter', iconSrc: '/images/social-icon-twitter.svg' },
];
