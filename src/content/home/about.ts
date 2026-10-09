import type { CroppedPhoto, Credential } from '../types';

/** Intro collage (three portraits). */
export const INTRO_PHOTOS: readonly CroppedPhoto[] = [
  { src: '/images/about-collage-1.webp', objectPosition: '50% 50%' },
  { src: '/images/about-collage-2.webp', objectPosition: '48.1% 47.7%' },
  { src: '/images/about-collage-3.webp', objectPosition: '55.3% 50%' },
];

/** "להצית מחדש" gallery (three portraits). */
export const REIGNITE_PHOTOS: readonly CroppedPhoto[] = [
  { src: '/images/about-gallery-1.webp', objectPosition: '50% 50%' },
  { src: '/images/gallery-item-3.webp', objectPosition: '50% 50%' },
  { src: '/images/about-gallery-3.webp', objectPosition: '50% 50%' },
];

/** Pull-quote beside the bio; the last line is the attribution. */
export const BIO_QUOTE_LINES = [
  'הטיפול הזוגי מספק לכם מרחב מוגן, בו תוכלו לפרק את השתיקות, ללמוד להקשיב ולהתחיל לבנות מחדש את הקשר.',
  'יחד, נלמד לזהות את הדינמיקה הזוגית ולייצר שפה משותפת שמחזירה את הקרבה הביתה.',
];

export const CREDENTIALS: Credential[] = [
  { text: '14 שנות ניסיון קליני' },
  { text: 'מטפלת זוגית ומשפחתית' },
  { text: 'הדרכת הורים' },
  { text: 'M.S.W. עובדת סוציאלית קלינית' },
  { text: 'מנחת קבוצות' },
  { text: 'דירוג 5 כוכבים עקבי מלקוחות' },
];

/** Check-mark icons of the credentials grid, alternating. */
export const CREDENTIAL_ICONS = ['/images/jigsaw-puzzle-6.webp', '/images/jigsaw-puzzle-7.webp'];

export const QUOTE_ICON = '/images/about-quote-mark.svg';
export const PROFILE_PHOTO = '/images/about-profile-neta.webp';
export const CREDENTIALS_ART = '/images/about-credentials-art.webp';
