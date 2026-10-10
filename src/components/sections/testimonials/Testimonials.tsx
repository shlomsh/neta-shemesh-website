import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { Photo } from '@/components/primitives/ui/Photo';
import { TESTIMONIALS } from '@/content/home/testimonials';
import { ID } from '@/content/ids';
import { stagger } from '@/lib/motion';
import { TestimonialCard } from './TestimonialCard';

/**
 * The "לקוחות ממליצים" recommendations section. PARKED on purpose: it is kept in code but not
 * mounted until there are real client testimonials (the `SHOW_TESTIMONIALS` flag in `app/page.tsx`).
 * Do not delete it as dead code.
 */
export function Testimonials() {
  return (
    <Section id={ID.testimonials} tone="cream" fit="free" pad="tight">
      <Container maxWidth="2xl">

        {/* Section heading */}
        <ScrollReveal delay={0.1}>
          <SectionHeader
            id={ID.testimonialsTitle}
            align="center"
            title="לקוחות ממליצים"
            subtitle="מילים של זוגות שליוויתי בקליניקה – על הדרך שעברו, ועל הבחירה מחדש בחיבור ובקרבה."
            subtitleClassName="mb-[clamp(3rem,6vw,6rem)]"
          />
        </ScrollReveal>

        {/* Featured quote with portrait */}
        <div className="flex flex-col lg:flex-row items-center justify-center gap-[clamp(2rem,5vw,5rem)] mb-[clamp(3rem,6vw,6rem)] max-w-5xl mx-auto">
          <ScrollReveal delay={0.2} className="w-full lg:w-[22.5rem] shrink-0">
            <Photo
              src="/images/testimonial-featured.webp"
              alt="זוג בטיפול"
              sizes="(max-width: 1024px) 100vw, 360px"
              radius="card"
              ratio="2/3"
              objectPosition="50% 42%"
              className="shadow-xl"
            />
          </ScrollReveal>

          <ScrollReveal delay={0.3} className="w-full lg:flex-1 flex flex-col justify-center">
            <Image
              src="/images/testimonial-quote-mark.svg"
              alt="סימן ציטוט"
              width={48}
              height={48}
              className="mb-8 opacity-80 w-12 h-12"
            />
            <p className="type-quote text-plum mb-10 text-start">
              למדנו לנווט בין אתגרים ביחד, לשקם את האמון ולגלות מחדש את הרגש שהביא אותנו ביחד. בזכות נטע שמש, הנישואין שלנו לא רק שרדו אלא פרחו.
            </p>
            <div className="text-start">
              <p className="type-body font-bold text-plum">ויני ואלכסיי</p>
              <p className="type-small text-plum">נשואים באושר</p>
            </div>
          </ScrollReveal>
        </div>

        {/* Three-card grid */}
        <div
          id={ID.testimonialsGrid}
          className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(1rem,2vw,2rem)] max-w-[75rem] mx-auto"
        >
          {TESTIMONIALS.map((testimonial, index) => (
            <ScrollReveal
              key={testimonial.id}
              delay={stagger(index, 0.2)}
              className="flex"
            >
              <div className="w-full">
                <TestimonialCard testimonial={testimonial} />
              </div>
            </ScrollReveal>
          ))}
        </div>
      </Container>
    </Section>
  );
}
