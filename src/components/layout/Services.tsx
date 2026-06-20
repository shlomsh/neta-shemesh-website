import { SectionTitle } from "../ui/SectionTitle";
import { StepCard } from './services/StepCard';
import { SuccessStories } from './services/SuccessStories';
import { Section } from '../primitives/layout/Section';
import { Container } from '../primitives/layout/Container';
import { Grid } from '../primitives/layout/Grid';
import { BodyText } from '../primitives/ui/BodyText';
import { ButtonLink } from '../primitives/ui/ButtonLink';
import type { Step } from './services/types';

const STEPS: Step[] = [
  {
    imageSrc: '/images/458a9d55ce04ee5d6ff51c404cdc915a.jpg',
    numberText: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
  },
  {
    imageSrc: '/images/0cfa79f0cdffa491b0ddde7da08ff582.jpg',
    numberText: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
  },
  {
    imageSrc: '/images/3d824070dc5563aa93f1a328eea2d93c.jpg',
    numberText: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
  },
  {
    imageSrc: '/images/2830fcad4852229bcdffb0a37956e095.jpg',
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
      <Section id="cQd2ufFBWvr5c6ki" bgVariant="light">
        <Container maxWidth="none" className="max-w-[1440px] flex flex-col lg:flex-row lg:items-start lg:gap-[64px] py-[64px]">

          {/* Text column — centered on mobile, right-aligned sticky on desktop */}
          <div className="text-center lg:text-right lg:w-[400px] lg:shrink-0 lg:sticky lg:top-[20vh] z-10 mb-[48px] lg:mb-0">
            <SectionTitle id="pEc3w8pe4QAw5k7o" spanId="lEBZC8bpB2HUMalg" className="mb-[24px]">איך זה עובד?</SectionTitle>

            <BodyText className="text-[clamp(18px,2vw,22px)] leading-[1.4]">
              התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי.
            </BodyText>

            <div className="mt-[48px]">
              <ButtonLink href="#contact" variant="secondary" className="w-full sm:w-auto text-[18px]">
                צרו קשר
              </ButtonLink>
            </div>
          </div>

          {/* Cards container: 2x2 grid on mobile and desktop! */}
          <Grid colsMobile={2} colsTablet={2} colsDesktop={2}>
            {STEPS.map((step, i) => (
              <StepCard
                key={step.imageSrc}
                imageSrc={step.imageSrc}
                numberText={step.numberText}
                title={step.title}
                bullets={step.bullets}
                delay={0}
                staggerClass={`w-full h-full lg:max-w-[480px] mx-auto shadow-2xl aspect-[4/5] ${i % 2 === 1 ? 'translate-y-[24px] md:translate-y-[48px] lg:translate-y-[64px]' : ''}`}
              />
            ))}
          </Grid>
        </Container>
      </Section>

      <div id="page-8" />

      <SuccessStories />
    </>
  );
}
