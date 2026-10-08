import type { TestimonialData } from '../types';

// PARKED: the "לקוחות ממליצים" block is hidden behind SHOW_TESTIMONIALS in
// components/layout/Testimonials.tsx until real client testimonials exist. Placeholder copy.
export const TESTIMONIALS: TestimonialData[] = [
  {
    id: 'card-1',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אגריפינה ואמרה',
    role: 'לקוחה',
    avatarSrc: '/images/testimonial-avatar-1.webp',
    variant: 'default',
  },
  {
    id: 'card-2',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'סאדב לריסה',
    role: 'יזמית',
    avatarSrc: '/images/testimonial-avatar-2.webp',
    variant: 'highlighted',
  },
  {
    id: 'card-3',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אלה פריץ',
    role: 'אשת עסקים',
    avatarSrc: '/images/testimonial-avatar-3.webp',
    variant: 'default',
  },
];
