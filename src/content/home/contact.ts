import { SITE } from '../site';
import type { ContactPhoto, RichLine } from '../types';

/** Panel 1: "עקבו אחריי". */
export const SOCIAL_PANEL = {
  heading: 'עקבו אחריי',
  body: {
    start: 'בואו נשמור על קשר גם ברשתות החברתיות. שם אני משתפת תובנות, כלים ומחשבות על ',
    bold: 'זוגיות, הורות',
    end: ' וצמיחה אישית.',
  } satisfies RichLine,
};

/** Panel 2: "המשרד שלי". Phone, email and address come from content/site.ts. */
export const OFFICE_PANEL = {
  heading: 'המשרד שלי',
  body: {
    start: 'קליניקה נעימה ובטוחה, מרחב שבו תרגישו ',
    bold: 'עטופים, מובנים',
    end: ' ומקובלים.',
  } satisfies RichLine,
};

/**
 * The three clinic portraits. The same data feeds both DOM trees (mobile vertical stack and
 * desktop 2-column mosaic), which keep their own `sizes` hints because the rendered widths differ.
 * Desktop grid areas: p1 + p2 stacked in column 1, p3 spans both rows of column 2.
 */
export const CONTACT_PHOTOS: ContactPhoto[] = [
  {
    src: '/images/contact-clinic-portrait.webp',
    alt: `${SITE.name} — תמונה מהקליניקה`,
    mobile: { ratio: '4/5' },
    desktop: { area: 'p1', sizes: '(max-width: 1024px) 50vw, 28vw' },
  },
  {
    src: '/images/contact-consultation.webp',
    alt: `${SITE.name} בפגישת ייעוץ`,
    objectPosition: '30% 64%',
    detail: true,
    mobile: { ratio: '4/5' },
    desktop: { area: 'p2', sizes: '(max-width: 1024px) 50vw, 28vw' },
  },
  {
    src: '/images/contact-clinic-atmosphere.webp',
    alt: `אווירת הקליניקה של ${SITE.name}`,
    mobile: { ratio: '2/3' },
    desktop: { area: 'p3', extraStyle: { gridRow: '1 / 3' }, sizes: '(max-width: 768px) 37vw, 21vw' },
  },
];

/** Mask-icon files of the office detail rows. */
export const CONTACT_ICONS = {
  address: '/images/contact-icon-location.svg',
  phone: '/images/contact-icon-phone.svg',
  email: '/images/contact-icon-email.svg',
} as const;
