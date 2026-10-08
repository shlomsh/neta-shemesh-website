import { SectionTitle } from "../ui/SectionTitle";
import { StepCard } from './services/StepCard';
import { Section } from '../primitives/layout/Section';
import { Container } from '../primitives/layout/Container';
import { Grid } from '../primitives/layout/Grid';
import { BodyText } from '../primitives/ui/BodyText';
import { ButtonLink } from '../primitives/ui/ButtonLink';
import type { Step } from './services/types';

const STEPS: Step[] = [
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

export default function Services() {
  return (
    <>
      {/* lg+: exactly one screen (100svh; floor 720px so a short viewport grows rather than clips).
          Flex chain Section -> Container -> Grid hands the remaining height to the 2x2 step
          grid, so the cards size from the available height instead of an aspect ratio. */}
      <Section id="cQd2ufFBWvr5c6ki" bgVariant="light" fullHeight className="lg:h-[max(100svh,720px)] lg:py-12">
        {/*
          P1 fix: replaced translate-y stagger with margin-top on even cards so the
          container grows naturally (translate-y is out-of-flow and gets clipped by
          Section overflow-hidden). pb-[96px] gives ~90px gap below card-4 at 1280.
          P2 fix: md:flex-row makes tablet side-by-side (text col + 2-col card grid).
        */}
        <Container maxWidth="none" className="max-w-[1440px] flex flex-col md:flex-row md:items-start md:gap-[48px] lg:flex-row lg:gap-[64px] pt-[64px] pb-[96px] lg:py-0 lg:flex-1 lg:min-h-0 lg:items-stretch">

          {/* Text column — centered on mobile, right-aligned sticky on desktop */}
          <div className="text-center md:text-right md:w-[320px] md:shrink-0 lg:text-right lg:w-[400px] lg:shrink-0 lg:self-center z-10 mb-[48px] md:mb-0 lg:mb-0">
            <SectionTitle id="pEc3w8pe4QAw5k7o" spanId="lEBZC8bpB2HUMalg">איך זה עובד?</SectionTitle>

            {/* Section is blush (plum text = 3.89:1, AA large only), so the paragraph is
                set at the quote scale (>=24px). */}
            <BodyText className="type-quote mt-5 md:mt-9">
              התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי.
            </BodyText>

            <div className="mt-[48px]">
              <ButtonLink href="#contact" variant="primary" className="w-full sm:w-auto">
                צרו קשר
              </ButtonLink>
            </div>
          </div>

          {/*
            P2 fix: colsMobile={1} → single column at 375px.
            P3 fix: reduced gap to ~30px, stagger reduced to ~53px, max-width reduced to ~360px.
          */}
          <Grid colsMobile={1} colsTablet={2} colsDesktop={2} className="gap-x-[30px] gap-y-[30px] lg:flex-1 lg:min-w-0 lg:min-h-0 lg:grid-rows-2">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.imageSrc}
                imageSrc={step.imageSrc}
                numberText={step.numberText}
                title={step.title}
                bullets={step.bullets}
                delay={0}
                staggerClass={`w-full h-full max-w-[480px] md:max-w-[360px] lg:max-w-none lg:h-auto mx-auto rounded-card shadow-2xl aspect-[4/5] lg:aspect-auto ${i % 2 === 1 ? 'md:mt-[40px] lg:mt-10' : 'lg:mb-10'}`}
              />
            ))}
          </Grid>
        </Container>
      </Section>

    </>
  );
}
