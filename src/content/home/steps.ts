import type { Step } from '../types';

/** The four steps of "איך זה עובד?". */
export const STEPS: Step[] = [
  {
    imageSrc: '/images/service-step-1.webp',
    numberText: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
  },
  {
    imageSrc: '/images/service-step-2.webp',
    numberText: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
  },
  {
    imageSrc: '/images/service-step-3.webp',
    numberText: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
  },
  {
    imageSrc: '/images/service-step-4.webp',
    numberText: '04.',
    title: 'רכישת כלים ויישום',
    bullets: [
      'למידת כלים פרקטיים לתקשורת מקרבת',
      'פתרון קונפליקטים וחיבור מחדש',
      'תרגול ויישום בחיי היומיום שלכם',
    ],
  },
];
