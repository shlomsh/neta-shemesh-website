import type { ExpertiseCardData } from '../types';

/**
 * The four service areas. Rendered as the Expertise cards (title on the pill, description for
 * screen readers) and reused verbatim as the JSON-LD `Service` nodes (lib/seo/jsonld.ts), so
 * the visible copy and the structured data cannot drift apart.
 */
export const EXPERTISE_CARDS: ExpertiseCardData[] = [
  {
    slug: 'couples',
    title: 'טיפול זוגי',
    description:
      'עבודה משותפת על הדינאמיקה הזוגית, דפוסי תקשורת, קרבה רגשית ובניית אמון מחדש. שיטות מבוססות מחקר ליצירת שינוי אמיתי.',
    imageSrc: '/images/expertise-couple.webp',
    imageAlt: 'טיפול זוגי',
  },
  {
    slug: 'family',
    title: 'טיפול משפחתי',
    description:
      'חיזוק הקשרים בתוך המשפחה, הבנת הדינמיקה המשפחתית ומציאת דרכים חדשות להתמודד עם אתגרים יחד.',
    imageSrc: '/images/expertise-family.webp',
    imageAlt: 'טיפול משפחתי',
  },
  {
    slug: 'parenting',
    title: 'הדרכת הורים',
    description:
      'כלים מעשיים להורות מיטבית, התמודדות עם אתגרי הגיל, תקשורת עם ילדים ובני נוער וחיזוק הביטחון ההורי.',
    imageSrc: '/images/expertise-parenting.webp',
    imageAlt: 'הדרכת הורים',
  },
  {
    slug: 'personal',
    title: 'ליווי אישי',
    description:
      'מרחב אישי לעיבוד רגשי, לצמיחה ולבחינה של צמתים משמעותיים בחיים — קריירה, זוגיות, הורות.',
    imageSrc: '/images/expertise-personal.webp',
    imageAlt: 'ליווי אישי',
  },
];
