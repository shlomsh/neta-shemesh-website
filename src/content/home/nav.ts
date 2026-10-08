import { ANCHOR } from '../ids';
import type { NavLink } from '../types';

/** Header navigation (desktop pill row and the mobile overlay), in display order. */
export const NAV_LINKS: NavLink[] = [
  { label: 'קצת עליי', anchor: ANCHOR.aboutMe },
  { label: 'התמחות', anchor: ANCHOR.expertise },
  { label: 'מאמרים', route: '/blog' },
  { label: 'יצירת קשר', anchor: ANCHOR.contact },
];
