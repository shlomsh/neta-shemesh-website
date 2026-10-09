import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { ExpertiseStage } from './ExpertiseStage';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import { ANCHOR, ID } from '@/content/ids';

export function Expertise() {
  // lg+: one screen at least (grow: the stage's descriptions are running text and must never clip on a short
  // viewport); center="start" lets the stage take the remaining height (Container is the flex column that passes it down).
  return (
    <Section anchor={ANCHOR.expertise} tone="light" fit="grow" center="start" pad="section">
      <Container maxWidth="none" gutter="wide" className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        {/* Section header */}
        <ScrollReveal>
          <div className="text-center mb-[clamp(24px,4vw,48px)] lg:mb-9">
            {/* Blush section (plum = 3.89:1, AA large only): subtitle at the quote scale (>=24px). */}
            <SectionHeader
              id={ID.expertiseTitle}
              align="center"
              title="טיפול זוגי ומשפחתי בנתניה"
              subtitle="תמיכה והכוונה מקצועית לבניית אמון וחיזוק הביטחון בקשר."
            />
          </div>
        </ScrollReveal>

        {/* Editorial stage: names + crossfading photo + the active description (client island). */}
        <ScrollReveal className="lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <ExpertiseStage items={EXPERTISE_CARDS} />
        </ScrollReveal>
      </Container>
    </Section>
  );
}
