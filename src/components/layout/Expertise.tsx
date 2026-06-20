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
        data-bg-tone="dark"
        className="
          w-full
          py-[clamp(32px,5vw,64px)]
          px-[clamp(16px,5vw,80px)]
          min-h-[100svh]
          flex flex-col justify-center
        "
      >
        {/* Section header */}
        <ScrollReveal delay={0}>
          <div className="text-center mb-[clamp(24px,4vw,48px)]">
            <SectionTitle id="vyKTmOw3YNYlJZPL" onDark className="mb-[clamp(12px,1.5vw,20px)]">מקום בטוח לצמוח בו ביחד.</SectionTitle>
            <p
              className="
                font-[var(--font-stanga)]
                text-[var(--color-white)]
                text-[clamp(15px,1.4vw,19px)]
                leading-[1.45]
                tracking-[0.012em]
                opacity-90
                max-w-[560px]
                mx-auto
              "
            >
              תמיכה והכוונה מקצועית לבניית אמון וחיזוק הביטחון בקשר.
            </p>
          </div>
        </ScrollReveal>

        {/* Cards container: 2x2 grid tightly constrained to fit 100svh on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[clamp(16px,3vw,32px)] max-w-[640px] mx-auto w-full">
          {EXPERTISE_CARDS.map((card, index) => (
            <div 
              key={card.title} 
              className="w-full h-full aspect-[4/5] lg:aspect-square"
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
