import React from 'react';
import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { Title } from "@/components/primitives/Title";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { TestimonialCard } from './testimonials/TestimonialCard';
import type { TestimonialData } from './testimonials/TestimonialCard';

const TESTIMONIALS: TestimonialData[] = [
  {
    id: 'card-1',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אגריפינה ואמרה',
    role: 'לקוחה',
    avatarSrc: '/images/9cc69075ddf28d5468081b32eec634a9.jpg',
    variant: 'default',
  },
  {
    id: 'card-2',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'סאדב לריסה',
    role: 'יזמית',
    avatarSrc: '/images/8405d8513ca5e9ef8a3f4dcf78a812b8.jpg',
    variant: 'highlighted',
  },
  {
    id: 'card-3',
    quote:
      'נמו אנים איפסם וולופטטם קוויה וולופטאס סיט אספרנאטור אאוט אודיט אאוט פוגיט, סד קוויה קונסקוואנטור מגני דולורס אאוס קווי רציונה וולופטטם סקווי נסקיונט.',
    name: 'אלה פריץ',
    role: 'אשת עסקים',
    avatarSrc: '/images/86e8055f5df603f4d38b578fc4485055.jpg',
    variant: 'default',
  },
];

export default function Testimonials() {
  return (
    <>
      {/* Testimonials Section */}
      <section
        id="DaRRC8Qhxc8unVfz"
        dir="rtl"
        className="bg-[var(--color-white)] relative overflow-hidden py-[clamp(48px,5vw,96px)]"
      >
        <div className="max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)]">

          {/* Section heading */}
          <ScrollReveal delay={0.1}>
            <SectionTitle id="Dct2rK7XCXJaLA2e" spanId="zxhh7nAzRvjXP5BT" className="text-center mb-[16px]">לקוחות ממליצים</SectionTitle>
            <p className="text-center font-[var(--font-stanga)] text-[var(--color-text-primary)] leading-[1.46] mb-[clamp(48px,6vw,96px)] max-w-[640px] mx-auto text-[clamp(15px,1.1vw,17px)]">
              מילים של זוגות שליוויתי בקליניקה – על הדרך שעברו, ועל הבחירה מחדש בחיבור ובקרבה.
            </p>
          </ScrollReveal>

          {/* Featured quote with portrait */}
          <div className="flex flex-col lg:flex-row items-center gap-[clamp(32px,5vw,80px)] mb-[clamp(48px,6vw,96px)] max-w-[1024px] mx-auto">
            <ScrollReveal delay={0.2} className="w-full lg:w-1/2">
              <div className="relative aspect-[4/5] rounded-[24px] overflow-hidden shadow-xl">
                <Image
                  src="/images/53a1f7530d2b45a3979a619311ec0dbf.jpg"
                  alt="זוג בטיפול"
                  fill
                  className="object-cover object-[50%_42%]"
                />
              </div>
            </ScrollReveal>

            <ScrollReveal delay={0.3} className="w-full lg:w-1/2 flex flex-col justify-center">
              <Image
                src="/images/1a0fad1200f4c50ec29a1572952d760f.svg"
                alt="סימן ציטוט"
                width={48}
                height={48}
                className="mb-[32px] opacity-80"
              />
              <p className="text-[clamp(18px,1.6vw,22px)] text-[var(--color-text-primary)] font-[var(--font-canva-accent)] font-bold leading-[1.6] mb-[40px] text-right">
                למדנו לנווט בין אתגרים ביחד, לשקם את האמון ולגלות מחדש את הרגש שהביא אותנו ביחד. בזכות נטע שמש, הנישואין שלנו לא רק שרדו אלא פרחו.
              </p>
              <div className="text-right">
                <p className="font-bold text-[var(--color-text-primary)] text-[clamp(15px,1.1vw,18px)]">ויני ואלכסיי</p>
                <p className="italic text-[var(--color-text-primary)] text-[clamp(13px,0.95vw,16px)]">נשואים באושר</p>
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

      {/* CTA Section */}
      <section id="afNbX7iGTuOdSbLC" className="relative overflow-hidden flex items-center justify-center py-[clamp(80px,8vw,192px)]">
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/311529093e852ce987bfa9b8b4953c4a.jpg"
            fill
            className="object-cover opacity-90"
            alt=""
          />
          <div className="absolute inset-0 bg-black/20" />
        </div>

        <div className="relative z-10 max-w-[896px] mx-auto px-[clamp(16px,4vw,32px)] text-center">
          <ScrollReveal delay={0.1}>
            <SectionTitle id="iVtldd7PMtN1BthG" spanId="VqD8RL1Dlcv6nIpY" onDark
              className="mb-[24px] drop-shadow-md">קביעת פגישת ייעוץ</SectionTitle>
            <p className="text-white font-[var(--font-stanga)] text-[clamp(16px,1.4vw,22px)] leading-[1.46] mb-[48px] max-w-[640px] mx-auto drop-shadow-md">
              הצעד הראשון לשינוי מתחיל כאן. בואו לתאם פגישה ראשונית ולגלות מחדש את החיבור שלכם.
            </p>
            <a
              href="#contact"
              className="inline-block bg-[var(--color-brand-primary)] text-white font-bold uppercase tracking-[0.138em] py-[20px] px-[48px] rounded hover:opacity-90 transition-opacity shadow-lg"
            >
              מוזמנים ליצור קשר
            </a>
          </ScrollReveal>
        </div>
      </section>

      {/* Anchor preserved for layout tests */}
      <div id="gallery" aria-hidden="true" />

      {/* Gallery Section */}
      <section id="vln9V07dEMN7DyMa" className="bg-[var(--color-bg-light)] py-[clamp(48px,5vw,96px)]">
        <div className="max-w-[1280px] mx-auto px-[clamp(16px,4vw,48px)]">
          <ScrollReveal delay={0.1}>
            <SectionTitle id="T749khVkMfNluBNv" spanId="y5TxhTV4Bys7XHFV" className="text-center mb-[24px]">טיפול זוגי לקשר בריא ותומך</SectionTitle>
            <p className="text-center font-[var(--font-stanga)] text-[var(--color-text-primary)] leading-[1.45] mb-[64px] max-w-[768px] mx-auto text-[clamp(15px,1.1vw,18px)]">
              השקעה בקשר הזוגי שלכם היא הדרך הטובה ביותר ליצור שינוי עמוק, לשבור דפוסי התנהגות מעכבים ולמצוא חיבור חדש ומקרב.
            </p>
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[clamp(12px,1.5vw,24px)]">
            {[
              'ed8e5945d4d32bb77122e047516d0127.jpg',
              '8dd392447e30a059d68af3dd1822861c.jpg',
              '96be0cab3c596e6c5f381573217388be.jpg',
              '68f4ad2c2fc9f71c45341466dc74b73b.jpg',
              'd38f42a73c82a810716e2c763cb110bf.jpg',
              '7f063d13b9af3abb89beceffe609485f.jpg',
            ].map((img, i) => (
              <ScrollReveal
                key={img}
                delay={0.1 * (i + 1)}
                className="relative w-full aspect-[4/3] lg:aspect-square overflow-hidden rounded-[12px] shadow-sm"
              >
                <Image
                  src={`/images/${img}`}
                  alt=""
                  fill
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
