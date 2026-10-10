import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { Photo } from '@/components/primitives/ui/Photo';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { CONTACT_PHOTOS, SOCIAL_PANEL } from '@/content/home/contact';
import { ID } from '@/content/ids';
import { PHOTO_QUALITY_DETAIL } from '@/lib/image-quality';
import { SocialLinks } from './SocialLinks';
import { RichParagraph } from './RichParagraph';

export function ContactSocial() {
  // PANEL 1 — Follow me on social
  // The outer Container owns the wide gutter (maxWidth="none": its max-width would include the
  // padding); the inner 1100px row keeps the content at that width.
  return (
    <Section id={ID.contactSocial} tone="dark" fit="free" pad="section">
      <Container maxWidth="none" gutter="wide">
        <div className="mx-auto flex w-full max-w-[68.75rem] flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">

          {/* Heading on mobile — shown above photos only on small screens */}
          <div className="flex flex-col gap-6 text-start lg:hidden">
            <SectionTitle id={ID.contactSocialTitleMobile}>{SOCIAL_PANEL.heading}</SectionTitle>
          </div>

          {/* Photo mosaic grid — mosaic of 3 portraits */}
          {/*
            Desktop layout (RTL mirrored from template):
              Col 1 (right, wider): photo1 top + photo2 bottom (stacked)
              Col 2 (left, narrower): photo3 spanning both rows (tall portrait)
            Mobile: single-column stack of all 3 photos
          */}
          <ScrollReveal className="w-full lg:w-[55%] shrink-0 lg:h-[calc(100svh-2*var(--spacing-section))]">
            {/* Mobile: simple vertical stack */}
            <div className="flex flex-col gap-4 lg:hidden">
              {CONTACT_PHOTOS.map((photo) => (
                <Photo
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  quality={photo.detail ? PHOTO_QUALITY_DETAIL : undefined}
                  sizes="100vw"
                  radius="card"
                  ratio={photo.mobile.ratio}
                  objectPosition={photo.objectPosition}
                  motion={{ parallax: 9 }}
                  className="w-full"
                />
              ))}
            </div>

            {/* Desktop/tablet: 2-column mosaic grid */}
            <div
              className="hidden lg:grid gap-4 h-full"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gridTemplateAreas: '"p1 p3" "p2 p3"',
              }}
            >
              {CONTACT_PHOTOS.map((photo) => (
                <Photo
                  key={photo.src}
                  src={photo.src}
                  alt={photo.alt}
                  quality={photo.detail ? PHOTO_QUALITY_DETAIL : undefined}
                  sizes={photo.desktop.sizes}
                  radius="card"
                  objectPosition={photo.objectPosition}
                  motion={{ parallax: 9 }}
                  style={{ gridArea: photo.desktop.area }}
                  className="min-h-0"
                />
              ))}
            </div>
          </ScrollReveal>

          {/* Heading + body + social icons — hidden on mobile (heading shown above) */}
          <div className="flex flex-col gap-6 text-start h-full lg:flex-1 justify-center">
            <SectionTitle id={ID.contactSocialTitle} className="hidden lg:block">{SOCIAL_PANEL.heading}</SectionTitle>

            <ScrollReveal delay={0.2}>
              <RichParagraph line={SOCIAL_PANEL.body} />
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <SocialLinks />
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
