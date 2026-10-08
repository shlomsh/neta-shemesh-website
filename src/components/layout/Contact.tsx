import Image from 'next/image';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ParallaxFrame } from '../ui/ParallaxFrame';
import { SocialLinks } from './contact/SocialLinks';
import { ContactDetails } from './contact/ContactDetails';
import { MapEmbed } from './contact/MapEmbed';
import { SectionTitle } from "../ui/SectionTitle";
import { CONTACT_PHOTOS, OFFICE_PANEL, SOCIAL_PANEL } from '@/content/home/contact';
import { ANCHOR, ID } from '@/content/ids';

export default function Contact() {
  return (
    <>
      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 1 — Follow me on social
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id={ID.contactSocial}
        dir="rtl"
        data-bg-tone="dark"
        className="py-[80px] px-[24px] min-h-[100svh] flex flex-col justify-center"
      >
        <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-[48px] lg:flex-row lg:items-center lg:gap-[64px]">

          {/* Heading on mobile — shown above photos only on small screens */}
          <div className="flex flex-col gap-[24px] text-right lg:hidden">
            <ScrollReveal>
              <SectionTitle id={ID.contactSocialTitleMobile}>{SOCIAL_PANEL.heading}</SectionTitle>
            </ScrollReveal>
          </div>

          {/* Photo mosaic grid — mosaic of 3 portraits */}
          {/*
            Desktop layout (RTL mirrored from template):
              Col 1 (right, wider): photo1 top + photo2 bottom (stacked)
              Col 2 (left, narrower): photo3 spanning both rows (tall portrait)
            Mobile: single-column stack of all 3 photos
          */}
          <ScrollReveal className="w-full lg:w-[55%] shrink-0 lg:h-[calc(100svh-160px)]">
            {/* Mobile: simple vertical stack */}
            <div className="flex flex-col gap-[16px] lg:hidden">
              {CONTACT_PHOTOS.map((photo) => (
                <ParallaxFrame
                  key={photo.src}
                  className={`${photo.mobile.aspectClass} w-full rounded-card safari-clip`}
                  amount={9}
                >
                  <Image src={photo.src} alt={photo.alt} fill sizes="100vw" className={photo.imageClass} />
                </ParallaxFrame>
              ))}
            </div>

            {/* Desktop/tablet: 2-column mosaic grid */}
            <div
              className="hidden lg:grid gap-[16px] h-full"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gridTemplateAreas: '"p1 p3" "p2 p3"',
              }}
            >
              {CONTACT_PHOTOS.map((photo) => (
                <ParallaxFrame
                  key={photo.src}
                  className="min-h-0 rounded-card safari-clip"
                  style={{ gridArea: photo.desktop.area, ...photo.desktop.extraStyle }}
                  amount={9}
                >
                  <Image src={photo.src} alt={photo.alt} fill sizes={photo.desktop.sizes} className={photo.imageClass} />
                </ParallaxFrame>
              ))}
            </div>
          </ScrollReveal>

          {/* Heading + body + social icons — hidden on mobile (heading shown above) */}
          <div className="flex flex-col gap-[24px] text-right h-full lg:flex-1 justify-center">
            <ScrollReveal delay={0.1} className="hidden lg:block">
              <SectionTitle id={ID.contactSocialTitle}>{SOCIAL_PANEL.heading}</SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                className="type-lead"
              >
                {SOCIAL_PANEL.body.start}
                <strong>{SOCIAL_PANEL.body.bold}</strong>
                {SOCIAL_PANEL.body.end}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <SocialLinks />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Anchor ────────────────────────────────────────────────────────── */}
      <div id={ANCHOR.contact} className="invisible h-0" />

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 2 — Office details + map
          Template structure: details col (right in LTR → left in RTL) +
          map col (left in LTR → right in RTL, ~55% width)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id={ID.contactOffice}
        dir="rtl"
        data-bg-tone="mid"
        className="py-[80px] lg:py-12 px-[24px] min-h-[100svh] lg:h-[max(100svh,720px)] flex flex-col justify-center"
      >
        <div className="max-w-[1100px] mx-auto w-full flex flex-col">

          {/* Title row: above the card, right-aligned (RTL) on the mauve */}
          <ScrollReveal className="mb-8 md:mb-12 text-right">
            <SectionTitle id={ID.contactOfficeTitle}>{OFFICE_PANEL.heading}</SectionTitle>
          </ScrollReveal>

          {/* One cream card frames both details and map. Mauve fails contrast for any text
              (2.26:1); plum on cream is 5.55:1 (AA at any size). The card hugs its content
              (the section centres it vertically); at lg the map stretches to the details
              column's height via items-stretch, with a 360px floor. */}
          <ScrollReveal delay={0.1} className="w-full">
            <div
              data-bg-tone="cream"
              className="rounded-card bg-[var(--color-cream)] p-6 md:p-8 lg:p-10 w-full"
            >
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-stretch">

                {/* Right cell (first in RTL DOM): lead + contact details */}
                <div className="flex flex-col justify-center gap-[24px] text-right">
                  <p
                    className="type-lead"
                  >
                    {OFFICE_PANEL.body.start}
                    <strong>{OFFICE_PANEL.body.bold}</strong>
                    {OFFICE_PANEL.body.end}
                  </p>

                  <ContactDetails />
                </div>

                {/* Left cell: map, 260px on mobile, matches the details height at lg */}
                <MapEmbed className="h-[260px] lg:h-full lg:min-h-[360px] safari-clip" />
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
