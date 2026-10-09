import Image from 'next/image';
import { ScrollReveal } from '@/components/ui/ScrollReveal';
import { stagger } from '@/lib/motion';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { Photo } from '@/components/primitives/ui/Photo';
import { TestimonialCard } from './testimonials/TestimonialCard';
import { TESTIMONIALS } from '@/content/home/testimonials';
import { GALLERY_IMAGES } from '@/content/home/gallery';
import { ANCHOR, ID, anchorHref } from '@/content/ids';

// Toggle to re-enable the "לקוחות ממליצים" recommendations section.
// Kept in code but hidden until we have real client testimonials.
const SHOW_TESTIMONIALS = false;

export default function Testimonials() {
  return (
    <>
      {/* Testimonials Section */}
      {SHOW_TESTIMONIALS && (
      <Section id={ID.testimonials} tone="cream" fit="free" pad="tight">
        <Container maxWidth="2xl">

          {/* Section heading */}
          <ScrollReveal delay={0.1}>
            <SectionHeader
              id={ID.testimonialsTitle}
              align="center"
              title="לקוחות ממליצים"
              subtitle="מילים של זוגות שליוויתי בקליניקה – על הדרך שעברו, ועל הבחירה מחדש בחיבור ובקרבה."
              subtitleClassName="mb-[clamp(48px,6vw,96px)]"
            />
          </ScrollReveal>

          {/* Featured quote with portrait */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-[clamp(32px,5vw,80px)] mb-[clamp(48px,6vw,96px)] max-w-[1024px] mx-auto">
            <ScrollReveal delay={0.2} className="w-full lg:w-[360px] shrink-0">
              <Photo
                engine="next"
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
            id={ID.testimonialsGrid}
            className="grid grid-cols-1 md:grid-cols-3 gap-[clamp(16px,2vw,32px)] max-w-[1200px] mx-auto"
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
      )}

      {/* CTA Section */}
      {/* Photo band: no tone. dir={undefined} keeps today's markup (this section never had a dir). */}
      <Section id={ID.ctaBand} fit="free" center="middle" dir={undefined} className="py-[clamp(80px,8vw,192px)]">
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
            <SectionHeader
              id={ID.ctaBandTitle}
              align="center"
              onPhoto
              title="קביעת פגישת ייעוץ"
              subtitle="הצעד הראשון לשינוי מתחיל כאן. בואו לתאם פגישה ראשונית ולגלות מחדש את החיבור שלכם."
              subtitleClassName="mb-[48px]"
            />
            <ButtonLink href={anchorHref(ANCHOR.contact)} variant="secondary">
              מוזמנים ליצור קשר
            </ButtonLink>
          </ScrollReveal>
        </div>
      </Section>

      {/* Anchor preserved for layout tests */}
      <div id={ANCHOR.gallery} aria-hidden="true" />

      {/* Gallery Section */}
      {/* lg+: exactly one screen (100svh; floor 720px). The photo grid is height-driven (flex-1,
          frames fill their cell with object-cover) instead of aspect-driven. */}
      <Section id={ID.photoGallery} tone="cream" fit="lock" pad="tight" dir={undefined}>
        <Container maxWidth="2xl" className="lg:flex-1 lg:min-h-0 lg:flex lg:flex-col">
          <ScrollReveal delay={0.1}>
            <SectionHeader
              id={ID.photoGalleryTitle}
              align="center"
              title="טיפול זוגי לקשר בריא ותומך"
              subtitle="השקעה בקשר הזוגי שלכם היא הדרך הטובה ביותר ליצור שינוי עמוק, לשבור דפוסי התנהגות מעכבים ולמצוא חיבור חדש ומקרב."
              subtitleClassName="mb-[64px] lg:mb-8"
            />
          </ScrollReveal>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-[clamp(12px,1.5vw,24px)] lg:grid-rows-2 lg:flex-1 lg:min-h-[320px]">
            {GALLERY_IMAGES.map((img, i) => (
              <Photo
                key={img}
                engine="next"
                src={`/images/${img}`}
                alt=""
                sizes="(max-width: 768px) 50vw, 33vw"
                radius="tile"
                ratio="4/3"
                fillCellAtLg
                zoom
                motion={{ reveal: 0.1 * (i + 1) }}
                className="w-full shadow-sm"
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
