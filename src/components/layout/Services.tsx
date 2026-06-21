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
    imageSrc: '/images/458a9d55ce04ee5d6ff51c404cdc915a.webp',
    numberText: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
  },
  {
    imageSrc: '/images/0cfa79f0cdffa491b0ddde7da08ff582.webp',
    numberText: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
  },
  {
    imageSrc: '/images/3d824070dc5563aa93f1a328eea2d93c.webp',
    numberText: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
  },
  {
    imageSrc: '/images/2830fcad4852229bcdffb0a37956e095.webp',
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
      <Section id="cQd2ufFBWvr5c6ki" bgVariant="mid">
        {/*
          P1 fix: replaced translate-y stagger with margin-top on even cards so the
          container grows naturally (translate-y is out-of-flow and gets clipped by
          Section overflow-hidden). pb-[96px] gives ~90px gap below card-4 at 1280.
          P2 fix: md:flex-row makes tablet side-by-side (text col + 2-col card grid).
        */}
        <Container maxWidth="none" className="max-w-[1440px] flex flex-col md:flex-row md:items-start md:gap-[48px] lg:flex-row lg:items-start lg:gap-[64px] pt-[64px] pb-[96px]">

          {/* Text column — centered on mobile, right-aligned sticky on desktop */}
          <div className="text-center md:text-right md:w-[320px] md:shrink-0 lg:text-right lg:w-[400px] lg:shrink-0 lg:sticky lg:top-[20vh] z-10 mb-[48px] md:mb-0 lg:mb-0">
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

          {/*
            P2 fix: colsMobile={1} → single column at 375px.
            P3 fix: reduced gap to ~30px, stagger reduced to ~53px, max-width reduced to ~360px.
          */}
          <Grid colsMobile={1} colsTablet={2} colsDesktop={2} className="gap-x-[30px] gap-y-[30px]">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.imageSrc}
                imageSrc={step.imageSrc}
                numberText={step.numberText}
                title={step.title}
                bullets={step.bullets}
                delay={0}
                staggerClass={`w-full h-full max-w-[480px] md:max-w-[360px] lg:max-w-[360px] mx-auto shadow-2xl aspect-[4/5] ${i % 2 === 1 ? 'md:mt-[40px] lg:mt-[53px]' : ''}`}
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
