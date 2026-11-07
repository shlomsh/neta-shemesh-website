import { ANCHOR } from '../ids';
import type { NavLink } from '../types';

/** Header navigation (desktop row and mobile hero layout), in display order. */
export const NAV_LINKS: NavLink[] = [
  { label: 'קצת עלי', anchor: ANCHOR.aboutMe },
  { label: 'התמחות', anchor: ANCHOR.expertise },
  { label: 'מאמרים', route: '/blog' },
  { label: 'שאלות נפוצות', anchor: ANCHOR.faq },
];
