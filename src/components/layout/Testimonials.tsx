import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TestimonialCard } from './testimonials/TestimonialCard';
import type { TestimonialData } from './testimonials/TestimonialCard';

// Toggle to re-enable the "לקוחות ממליצים" recommendations section.
// Kept in code but hidden until we have real client testimonials.
const SHOW_TESTIMONIALS = false;

const TESTIMONIALS: TestimonialData[] = [
  {
    id: 'card-1',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אגריפינה ואמרה',
    role: 'לקוחה',
    avatarSrc: '/images/testimonial-avatar-1.webp',
    variant: 'default',
  },
  {
    id: 'card-2',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'סאדב לריסה',
    role: 'יזמית',
    avatarSrc: '/images/testimonial-avatar-2.webp',
    variant: 'highlighted',
  },
  {
    id: 'card-3',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אלה פריץ',
    role: 'אשת עסקים',
    avatarSrc: '/images/testimonial-avatar-3.webp',
    variant: 'default',
  },
];

export default function Testimonials() {
  return (
    <>
      {/* Testimonials Section */}
      {SHOW_TESTIMONIALS && (
      <section
        id="DaRRC8Qhxc8unVfz"
        dir="rtl"
        data-bg-tone="cream"
        className="relative overflow-hidden py-[clamp(48px,5vw,96px)] min-h-[100svh] flex flex-col justify-center"
      >
        <div className="max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] w-full">

          {/* Section heading */}
          <ScrollReveal delay={0.1}>
            <SectionTitle id="Dct2rK7XCXJaLA2e" spanId="zxhh7nAzRvjXP5BT" className="text-center">לקוחות ממליצים</SectionTitle>
            <p className="type-quote text-center text-[var(--color-text-primary)] mt-3 md:mt-4 mb-[clamp(48px,6vw,96px)] max-w-[65ch] mx-auto">
              מילים של זוגות שליוויתי בקליניקה – על הדרך שעברו, ועל הבחירה מחדש בחיבור ובקרבה.
            </p>
          </ScrollReveal>

          {/* Featured quote with portrait */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-[clamp(32px,5vw,80px)] mb-[clamp(48px,6vw,96px)] max-w-[1024px] mx-auto">
            <ScrollReveal delay={0.2} className="w-full lg:w-[360px] shrink-0">
              <div className="relative aspect-[2/3] rounded-card overflow-hidden shadow-xl safari-clip">
                <Image
                  src="/images/testimonial-featured.webp"
                  alt="זוג בטיפול"
                  fill
                  sizes="(max-width: 1024px) 100vw, 360px"
                  className="object-cover object-[50%_42%]"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="w-full lg:flex-1 flex flex-col justify-center">
              <Image
                src="/images/testimonial-quote-mark.svg"
                alt="סימן ציטוט"
                width={48}
                height={48}
                className="mb-[32px] opacity-80 w-[48px] h-[48px]"
              />
              <p className="type-quote text-[var(--color-text-primary)] mb-[40px] text-right">
                למדנו לנווט בין אתגרים ביחד, לשקם את האמון ולגלות מחדש את הרגש שהביא אותנו ביחד. בזכות נטע שמש, הנישואין שלנו לא רק שרדו אלא פרחו.
              </p>
              <div className="text-right">
                <p className="type-body font-bold text-[var(--color-text-primary)]">ויני ואלכסיי</p>
                <p className="type-small text-[var(--color-text-primary)]">נשואים באושר</p>
              </div>
            </ScrollReveal>
          </div>

          {/* Three-card grid */}
          <div
            id="GEF7BLoFlyc3GavU"
            className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2vw,32px)] max-w-[1200px] mx-auto"
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <ScrollReveal
                key={testimonial.id}
                delay={0.2 + index * 0.12}
                className="flex"
              >
                <div className="w-full">
                  <TestimonialCard testimonial={testimonial} />
                </div>
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
      )}

      {/* CTA Section */}
      <section id="afNbX7iGTuOdSbLC" className="relative overflow-hidden flex items-center justify-center py-[clamp(80px,8vw,192px)] min-h-[100svh]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/cta-background.webp"
            fill
            sizes="100vw"
            className="object-cover opacity-90"
            alt=""
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 max-w-[896px] mx-auto px-[clamp(16px,4vw,32px)] text-center w-full">
          <ScrollReveal delay={0.1}>
            <SectionTitle id="iVtldd7PMtN1BthG" spanId="VqD8RL1Dlcv6nIpY" onDark
              className="drop-shadow-md">קביעת פגישת ייעוץ</SectionTitle>
            <p className="type-quote text-white mt-3 md:mt-4 mb-[48px] max-w-[65ch] mx-auto drop-shadow-md">
              הצעד הראשון לשינוי מתחיל כאן. בואו לתאם פגישה ראשונית ולגלות מחדש את החיבור שלכם.
            </p>
            <ButtonLink href="#contact" variant="secondary">
              מוזמנים ליצור קשר
            </ButtonLink>
          </ScrollReveal>
        </div>
      </section>

      {/* Anchor preserved for layout tests */}
      <div id="gallery" aria-hidden="true" />

      {/* Gallery Section */}
      {/* lg+: exactly one screen (100svh; floor 720px). The photo grid is height-driven (flex-1,
          frames fill their cell with object-cover) instead of aspect-driven. */}
      <section id="vln9V07dEMN7DyMa" data-bg-tone="cream" className="py-[clamp(48px,5vw,96px)] min-h-[100svh] flex flex-col justify-center lg:h-[max(100svh,720px)] lg:py-12">
        <div className="max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)] w-full lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
          <ScrollReveal delay={0.1}>
            <SectionTitle id="T749khVkMfNluBNv" spanId="y5TxhTV4Bys7XHFV" className="text-center">טיפול זוגי לקשר בריא ותומך</SectionTitle>
            <p className="type-quote text-center mt-3 md:mt-4 mb-[64px] lg:mb-8 max-w-[65ch] mx-auto">
              השקעה בקשר הזוגי שלכם היא הדרך הטובה ביותר ליצור שינוי עמוק, לשבור דפוסי התנהגות מעכבים ולמצוא חיבור חדש ומקרב.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[clamp(12px,1.5vw,24px)] lg:grid-rows-2 lg:flex-1 lg:min-h-[320px]">
            {[
              'gallery-item-1.webp',
              'gallery-item-2.webp',
              'gallery-item-3.webp',
              'gallery-item-4.webp',
              'gallery-item-5.webp',
              'gallery-item-6.webp',
            ].map((img, i) => (
              <ScrollReveal
                key={img}
                delay={0.1 * (i + 1)}
                className="relative w-full aspect-[4/3] lg:aspect-auto overflow-hidden rounded-tile shadow-sm safari-clip"
              >
                <Image
                  src={`/images/${img}`}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover hover:scale-105 transition-transform duration-700 ease-out"
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
