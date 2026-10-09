import { Section } from '@/components/primitives/layout/Section';
import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { ExpertiseCard } from './expertise/ExpertiseCard';
import { EXPERTISE_CARDS } from '@/content/home/expertise';
import { ANCHOR, ID } from '@/content/ids';
import { stagger } from '@/lib/motion';

export default function Expertise() {
  return (
    <>
      {/* Anchor target — keep id so layout/nav tests resolve */}
      <div id={ANCHOR.expertise} aria-hidden="true" />

      {/* lg+: exactly 100svh with NO 720px floor (floor={false}); center="start" lets the 2x2 card grid
          take the remaining height. TODO(visual): pad="none" + className padding is a near-duplicate
          of the section/gutter tokens (clamp(32px,5vw,64px) / clamp(16px,5vw,80px)); unify when the
          owner picks one rhythm. */}
      <Section
        tone="light"
        fit="lock"
        floor={false}
        center="start"
        className="py-[clamp(32px,5vw,64px)] px-[clamp(16px,5vw,80px)]"
      >
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

        {/* Cards container: stacked below lg; at lg a 2x2 grid (4 cards, mostly landscape photos) that fills the remaining height of the 100svh section (photos crop, nothing overflows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-[clamp(16px,3vw,32px)] max-w-[640px] lg:max-w-[1000px] mx-auto w-full lg:flex-1 lg:min-h-[320px]">
          {EXPERTISE_CARDS.map(({ slug, ...card }, index) => (
            <div
              key={slug}
              className="w-full h-full aspect-[4/5] lg:aspect-auto lg:min-h-0 rounded-card safari-clip"
            >
              <ExpertiseCard
                {...card}
                delay={stagger(index)}
              />
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
