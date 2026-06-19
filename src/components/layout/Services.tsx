import { StepCard } from './services/StepCard';
import { SuccessStories } from './services/SuccessStories';
import type { Step } from './services/types';

const STEPS: Step[] = [
  {
    imageSrc: 'images/458a9d55ce04ee5d6ff51c404cdc915a.jpg',
    numberText: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
  },
  {
    imageSrc: 'images/0cfa79f0cdffa491b0ddde7da08ff582.jpg',
    numberText: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
  },
  {
    imageSrc: 'images/3d824070dc5563aa93f1a328eea2d93c.jpg',
    numberText: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
  },
  {
    imageSrc: 'images/2830fcad4852229bcdffb0a37956e095.jpg',
    numberText: '04.',
    title: 'רכישת כלים ויישום',
    bullets: [
      'למידת כלים פרקטיים לתקשורת מקרבת',
      'פתרון קונפליקטים וחיבור מחדש',
      'תרגול ויישום בחיי היומיום שלכם',
    ],
  },
];

export default function Services() {
  return (
    <>
      <section
        id="cQd2ufFBWvr5c6ki"
        dir="rtl"
        className="relative w-full bg-canva-bg"
      >
        <div className="mx-auto flex w-full max-w-[1440px] flex-col lg:flex-row lg:items-start lg:gap-[64px] px-[20px] lg:px-[64px] py-[64px]">

          {/* Text column — sticky on desktop */}
          <div className="text-right lg:w-[400px] lg:shrink-0 lg:sticky lg:top-[20vh] z-10 mb-[48px] lg:mb-0">
            <h2
              id="pEc3w8pe4QAw5k7o"
              className="font-[family-name:var(--font-canva-accent)] text-[clamp(32px,5vw,56px)] font-normal leading-tight text-canva-dark"
            >
              <span id="lEBZC8bpB2HUMalg">איך זה עובד?</span>
            </h2>

            <p className="mt-[24px] text-canva-dark text-[clamp(15px,1.6vw,18px)] leading-[1.6] tracking-[0.012em]">
              התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי.
            </p>

            <a
              href="#contact"
              className="mt-[32px] inline-flex items-center justify-center bg-canva-mid text-white font-bold py-[14px] px-[32px] text-[15px] tracking-[0.138em] uppercase"
            >
              צרו קשר
            </a>
          </div>

          {/* Cards container: stacked vertically with sticky positioning */}
          <div className="flex-1 flex flex-col relative w-full pb-[10vh]">
            {STEPS.map((step, i) => (
              <div 
                key={step.imageSrc} 
                className="sticky top-0 lg:top-[10vh] h-[100dvh] lg:h-[80vh] w-full flex items-center justify-center shadow-2xl"
              >
                <StepCard
                  imageSrc={step.imageSrc}
                  numberText={step.numberText}
                  title={step.title}
                  bullets={step.bullets}
                  delay={0}
                  staggerClass="w-full h-full lg:max-w-[600px] mx-auto"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      <div id="page-8" />

      <SuccessStories />
    </>
  );
}
