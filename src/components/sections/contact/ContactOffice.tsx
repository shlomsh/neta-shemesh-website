import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { Card } from '@/components/primitives/layout/Card';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { OFFICE_PANEL } from '@/content/home/contact';
import { ANCHOR, ID } from '@/content/ids';
import { ContactDetails } from './ContactDetails';
import { MapEmbed } from './MapEmbed';
import { RichParagraph } from './RichParagraph';

export function ContactOffice() {
  // PANEL 2 — Office details + map
  // Template structure: details col (right in LTR → left in RTL) +
  // map col (left in LTR → right in RTL, ~55% width)
  // The outer Container owns the wide gutter (maxWidth="none": its max-width would include the
  // padding); the inner 1100px column keeps the title and the cream card at that width.
  return (
    <Section id={ID.contactOffice} anchor={ANCHOR.contact} tone="mid" fit="lock" pad="section">
      <Container maxWidth="none" gutter="wide">
        <div className="mx-auto flex w-full max-w-[1100px] flex-col">

          {/* Title row: above the card, right-aligned (RTL) on the mauve */}
          <ScrollReveal className="mb-8 md:mb-12 text-start">
            <SectionTitle id={ID.contactOfficeTitle}>{OFFICE_PANEL.heading}</SectionTitle>
          </ScrollReveal>

          {/* One cream card frames both details and map. Mauve fails contrast for any text
              (2.26:1); plum on cream is 5.55:1 (AA at any size). The card hugs its content
              (the section centres it vertically); at lg the map stretches to the details
              column's height via items-stretch, with a 360px floor. */}
          <ScrollReveal delay={0.1} className="w-full">
            <Card surface="cream" pad="lg" className="w-full">
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-12 items-stretch">

                {/* Right cell (first in RTL DOM): lead + contact details */}
                <div className="flex flex-col justify-center gap-[24px] text-start">
                  <RichParagraph line={OFFICE_PANEL.body} />

                  <ContactDetails />
                </div>

                {/* Left cell: map, 260px on mobile, matches the details height at lg */}
                <MapEmbed className="h-[260px] lg:h-full lg:min-h-[360px] safari-clip" />
              </div>
            </Card>
          </ScrollReveal>
        </div>
      </Container>
    </Section>
  );
}
