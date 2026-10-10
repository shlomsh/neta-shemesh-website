import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { LineArt } from '@/components/site/LineArt';
import { STEPS } from '@/content/home/steps';
import { ANCHOR, ID, anchorHref } from '@/content/ids';
import { cx } from '@/lib/cx';
import { StepCard } from './StepCard';

export function Services() {
  // lg+: exactly one screen (100svh; floor 720px so a short viewport grows rather than clips).
  // Flex chain Section -> Container -> grid hands the remaining height to the 2x2 step
  // grid, so the cards size from the available height instead of an aspect ratio.
  return (
    <Section id={ID.services} tone="light" fit="lock">
      {/*
        The stagger is a margin-top on the even cards, not a translate-y, so the container grows with it
        (a translate is out-of-flow and would be clipped by the Section's overflow). pb-[96px] leaves ~90px
        below card 4 at 1280. md:flex-row puts the text column and the 2-column card grid side by side on tablets.
      */}
      <Container maxWidth="3xl" className="flex flex-col md:flex-row md:items-start md:gap-[48px] lg:flex-row lg:gap-[64px] pt-[64px] pb-[96px] lg:py-0 lg:flex-1 lg:min-h-0 lg:items-stretch">

        {/* Text column — centered on mobile, right-aligned sticky on desktop */}
        <div className="text-center md:text-start md:w-[320px] md:shrink-0 lg:text-start lg:w-[400px] lg:shrink-0 lg:self-center z-10 mb-[48px] md:mb-0 lg:mb-0">
          {/* Section is blush (plum text = 3.89:1, AA large only), so the subtitle is
              set at the quote scale (>=24px). */}
          <SectionHeader
            marker={<LineArt name="parent-child" marker />}
            id={ID.servicesTitle}
            align="column"
            title="איך זה עובד?"
            subtitle="התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי."
          />

          <div className="mt-[48px]">
            <ButtonLink href={anchorHref(ANCHOR.contact)} variant="primary" className="w-full sm:w-auto">
              צרו קשר
            </ButtonLink>
          </div>
        </div>

        {/* One column at 375px, two from md; ~30px gaps, cards capped at ~360px on tablets. */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-[clamp(16px,4vw,64px)] w-full gap-x-[30px] gap-y-[30px] lg:flex-1 lg:min-w-0 lg:min-h-0 lg:grid-rows-2">
          {STEPS.map((step, i) => (
            <StepCard
              key={step.imageSrc}
              imageSrc={step.imageSrc}
              numberText={step.numberText}
              title={step.title}
              bullets={step.bullets}
              className={cx(
                'w-full h-full max-w-[480px] md:max-w-[360px] lg:max-w-none lg:h-auto mx-auto rounded-card shadow-2xl aspect-[4/5] lg:aspect-auto',
                i % 2 === 1 ? 'md:mt-[40px] lg:mt-10' : 'lg:mb-10',
              )}
            />
          ))}
        </div>
      </Container>
    </Section>

  );
}
