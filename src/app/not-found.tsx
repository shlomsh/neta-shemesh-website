import type { Metadata } from 'next';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { BodyText } from '@/components/primitives/ui/BodyText';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { BlogHeader } from '@/components/blog/BlogHeader';
import { LineArt } from '@/components/site/LineArt';
import { PageShell } from '@/components/site/PageShell';
import { ID } from '@/content/ids';
import { SITE } from '@/content/site';

// No `robots` here: Next already adds `<meta name="robots" content="noindex">` to every not-found page, and a
// second tag from this metadata would give crawlers two directives.
export const metadata: Metadata = {
  title: `הדף לא נמצא | ${SITE.name}`,
};

/** 404 (NS-54): the seated figure in thought, drawn in on load, on the cream surface. */
export default function NotFound() {
  return (
    <PageShell overflow="clip">
      <BlogHeader />
      <Section id="not-found" tone="cream" className="py-[clamp(3.5rem,9vw,7.5rem)]">
        <Container id={ID.mainContent} maxWidth="lg" className="flex flex-col items-center text-center gap-[clamp(1rem,2vw,1.5rem)]">
          <LineArt name="individual" className="w-[clamp(11.25rem,26vw,17.5rem)] aspect-square" />
          <SectionTitle as="h1">הדף הזה לא נמצא</SectionTitle>
          <BodyText centered className="type-lead max-w-[45ch]">
            נראה שהדרך הזאת לא מובילה לשום מקום. אפשר לחזור לדף הבית ולהמשיך משם.
          </BodyText>
          <ButtonLink href="/" variant="primary" className="mt-4">
            חזרה לדף הבית
          </ButtonLink>
        </Container>
      </Section>
    </PageShell>
  );
}
