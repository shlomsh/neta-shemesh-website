import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { BodyText } from '@/components/primitives/ui/BodyText';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { FAQ_ITEMS } from '@/content/home/faq';
import { ANCHOR, ID } from '@/content/ids';

export function Faq() {
  return (
    <Section id={ID.faq} anchor={ANCHOR.faq} tone="mid" fit="grow" pad="section">
      <Container maxWidth="lg">
        <SectionTitle id={ID.faqTitle} className="mb-region text-center">
          שאלות נפוצות
        </SectionTitle>
        <div className="flex flex-col gap-3">
          {FAQ_ITEMS.map(({ question, answer }) => (
            <details key={question} className="group rounded-tile border border-plum/20 bg-cream/60 px-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 text-start marker:hidden focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum">
                <span className="type-card-title">{question}</span>
                <svg
                  aria-hidden="true"
                  className="size-5 shrink-0 text-plum transition-transform duration-200 group-open:rotate-180 motion-reduce:transition-none"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </summary>
              <BodyText className="type-body max-w-prose pb-5">
                {answer}
              </BodyText>
            </details>
          ))}
        </div>
      </Container>
    </Section>
  );
}
