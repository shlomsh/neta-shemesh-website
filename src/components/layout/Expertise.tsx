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

        {/* Cards container: stacked vertically with sticky positioning */}
        <div className="flex flex-col relative w-full pb-[10vh]">
          {EXPERTISE_CARDS.map((card, index) => (
            <div 
              key={card.title} 
              className="sticky top-0 lg:top-[10vh] h-[100dvh] lg:h-[80vh] w-full flex items-center justify-center p-[20px] lg:p-[40px]"
            >
              <div className="w-full h-full max-w-[1024px] mx-auto shadow-2xl">
                <ExpertiseCard
                  {...card}
                  delay={0}
                />
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
