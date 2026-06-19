import { ScrollReveal } from '../ui/ScrollReveal';
import { ExpertiseCard } from './expertise/ExpertiseCard';
import { EXPERTISE_CARDS } from './expertise/expertiseData';

export default function Expertise() {
  return (
    <>
      {/* Anchor target — keep id so layout/nav tests resolve */}
      <div id="expertise" aria-hidden="true" />

      <section
        dir="rtl"
        className="
          w-full
          bg-[var(--color-dark)]
          py-[clamp(48px,7vw,96px)]
          px-[clamp(16px,5vw,80px)]
        "
      >
        {/* Section header */}
        <ScrollReveal delay={0}>
          <div className="text-center mb-[clamp(32px,5vw,64px)]">
            <h2
              id="vyKTmOw3YNYlJZPL"
              className="
                section-header on-dark
                font-[var(--font-canva-secondary)]
                text-[var(--color-white)]
                text-[clamp(28px,4.375vw,56px)]
                leading-[1.2]
                tracking-[-0.01em]
                mb-[clamp(12px,1.5vw,20px)]
              "
            >
              מרחב בטוח לקשר שלכם
            </h2>
            <p
              className="
                font-[var(--font-canva-primary)]
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

        {/* Cards grid: 1-up @375, 2-up @640, 4-up @1280 */}
        <div
          className="
            grid
            grid-cols-1
            sm:grid-cols-2
            xl:grid-cols-4
            gap-[clamp(12px,2vw,24px)]
            max-w-[1280px]
            mx-auto
          "
        >
          {EXPERTISE_CARDS.map((card, index) => (
            <ExpertiseCard
              key={card.title}
              {...card}
              delay={index * 0.12}
            />
          ))}
        </div>
      </section>
    </>
  );
}
