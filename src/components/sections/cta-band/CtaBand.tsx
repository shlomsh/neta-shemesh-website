import Image from 'next/image';
import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { ANCHOR, ID, anchorHref } from '@/content/ids';

/** The "קביעת פגישת ייעוץ" photo band. A photo section: no tone, so no data-bg-tone. */
export function CtaBand() {
  return (
    <Section id={ID.ctaBand} fit="free" center="middle" className="py-[clamp(80px,8vw,192px)]">
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
  );
}
