import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { PHOTO_QUALITY } from '@/lib/image-quality';
import { ANCHOR, ID, anchorHref } from '@/content/ids';

/** The "קביעת פגישת ייעוץ" photo band. A photo section: no tone, so no data-bg-tone. */
export function CtaBand() {
  return (
    <Section id={ID.ctaBand} fit="free" phone="screen" center="middle" className="py-[clamp(5rem,8vw,12rem)]">
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cta-background.webp"
          fill
          sizes="100vw"
          quality={PHOTO_QUALITY}
          className="object-cover opacity-90"
          alt=""
        />
        <div className="absolute inset-0 bg-black/20" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-[clamp(1rem,4vw,2rem)] text-center w-full">
        <ScrollReveal delay={0.1}>
          <SectionHeader
            id={ID.ctaBandTitle}
            align="center"
            onPhoto
            title="קביעת פגישת ייעוץ"
            subtitle="הצעד הראשון לשינוי מתחיל כאן. בואו לתאם פגישה ראשונית ולגלות מחדש את החיבור שלכם."
            subtitleClassName="mb-12"
          />
          {/* "/#contact" (route-absolute) so the button also works from /blog. `halo` adds the breathing ring. */}
          <ButtonLink href={anchorHref(ANCHOR.contact, '/')} variant="secondary" halo>
            מוזמנים ליצור קשר
          </ButtonLink>
        </ScrollReveal>
      </div>
    </Section>
  );
}
