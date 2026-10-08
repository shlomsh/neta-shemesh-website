import { ScrollReveal } from "../ui/ScrollReveal";
import { SectionTitle } from "../ui/SectionTitle";
import { ExpertiseCard } from './expertise/ExpertiseCard';
import { EXPERTISE_CARDS } from './expertise/expertiseData';

export default function Expertise() {
  return (
    <>
      {/* Anchor target — keep id so layout/nav tests resolve */}
      <div id="expertise" aria-hidden="true" />

      <section
        dir="rtl"
        data-bg-tone="light"
        className="
          w-full
          py-[clamp(32px,5vw,64px)] lg:py-12
          px-[clamp(16px,5vw,80px)]
          min-h-[100svh] lg:h-[100svh]
          flex flex-col justify-center lg:justify-start
        "
      >
        {/* Section header */}
        <ScrollReveal delay={0}>
          <div className="text-center mb-[clamp(24px,4vw,48px)] lg:mb-9">
            <SectionTitle id="vyKTmOw3YNYlJZPL">טיפול זוגי ומשפחתי בנתניה</SectionTitle>
            {/* Blush section (plum = 3.89:1, AA large only): paragraph at the quote scale (>=24px). */}
            <p
              className="
                type-quote
                max-w-[65ch]
                mx-auto
                mt-3 md:mt-4
              "
            >
              תמיכה והכוונה מקצועית לבניית אמון וחיזוק הביטחון בקשר.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards container: stacked below lg; at lg a 2x2 grid (4 cards, mostly landscape photos) that fills the remaining height of the 100svh section (photos crop, nothing overflows) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 lg:grid-rows-2 gap-[clamp(16px,3vw,32px)] max-w-[640px] lg:max-w-[1000px] mx-auto w-full lg:flex-1 lg:min-h-[320px]">
          {EXPERTISE_CARDS.map((card, index) => (
            <div
              key={card.title}
              className="w-full h-full aspect-[4/5] lg:aspect-auto lg:min-h-0 rounded-card safari-clip"
            >
              <ExpertiseCard
                {...card}
                delay={index * 0.12}
              />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
