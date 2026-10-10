import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { Card } from '@/components/primitives/layout/Card';
import { BodyText } from '@/components/primitives/ui/BodyText';
import { Photo } from '@/components/primitives/ui/Photo';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, ID } from '@/content/ids';
import { INTRO_PHOTOS } from '@/content/home/about';
import { OrganicBg } from './OrganicBg';

/**
 * `sizes` = the width the IMAGE renders at (NS-30). The 3:2 sources are cover-fitted into square cells, so the
 * image is 1.5x the cell wide (about 66vw below lg); the tall cell spans two rows, so it is about 2x that
 * (136vw). From lg the cells are height-driven (about 600px / 1200px at 1440x900).
 */
const COLLAGE_SQUARE_SIZES = '(min-width: 1024px) 600px, 66vw';
const COLLAGE_TALL_SIZES = '(min-width: 1024px) 1200px, 136vw';

export function Intro() {
  // ── Section 1: Intro with photo collage + text ──
  return (
    <Section id={ID.aboutIntro} anchor={ANCHOR.about} tone="mid" fit="lock" pad="section" seam>
      <Container maxWidth="2xl" gutter="wide" className="relative lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
        <div className="flex flex-col gap-10 lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_1.25fr] lg:gap-section-tight">

          {/* Photo collage — left column on desktop (wider, height-driven to the section), top on mobile */}
          <div className="relative w-full grid grid-cols-2 gap-4 lg:order-2 lg:min-h-0 lg:h-full lg:grid-rows-2">
            <ScrollReveal className="lg:min-h-0">
              <Photo
                src={INTRO_PHOTOS[0].src}
                sizes={COLLAGE_SQUARE_SIZES}
                alt=""
                radius="card"
                ratio="square"
                fillCellAtLg
                objectPosition={INTRO_PHOTOS[0].objectPosition}
              />
            </ScrollReveal>
            <ScrollReveal delay={0.24} className="row-span-2 lg:min-h-0">
              <Photo
                src={INTRO_PHOTOS[2].src}
                sizes={COLLAGE_TALL_SIZES}
                alt=""
                radius="card"
                objectPosition={INTRO_PHOTOS[2].objectPosition}
                className="h-full"
              />
            </ScrollReveal>
            <ScrollReveal delay={0.12} className="lg:min-h-0">
              <Photo
                src={INTRO_PHOTOS[1].src}
                sizes={COLLAGE_SQUARE_SIZES}
                alt=""
                radius="card"
                ratio="square"
                fillCellAtLg
                objectPosition={INTRO_PHOTOS[1].objectPosition}
              />
            </ScrollReveal>
          </div>

          {/* Text column */}
          <div className="relative w-full flex flex-col justify-center gap-6 lg:order-1 lg:self-center">
            <OrganicBg className="opacity-60 z-0 pointer-events-none" />

            <ScrollReveal className="relative z-10">
              <SectionTitle id={ID.aboutIntroTitle}>ליווי מקצועי לזוגות</SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.12} className="relative z-10">
              {/* Veil card: cream 85% over mauve (--surface-veil) is 4.97:1 against plum, so the
                  copy can sit at the lead scale. data-bg-tone="cream" keeps plum text. */}
              <Card surface="veil" pad="md" className="text-start flex flex-col gap-4">
                <BodyText className="type-lead max-w-prose">
                  מערכות יחסים הן מסע משותף ומורכב. לפעמים, אתגרי היומיום,
                  השחיקה או המשברים מעלים בנו תחושות של ריחוק ובדידות, דווקא
                  בתוך הביחד.
                </BodyText>
                <BodyText className="type-lead max-w-prose">
                  בקליניקה שלי, אני מציעה לכם מרחב בטוח ומקבל שבו נוכל
                  להניח את מנגנוני ההגנה, ללמוד להקשיב באמת זה לזו, ולמצוא
                  את הגשר חזרה לחיבור, קירבה וביטחון זוגי.
                </BodyText>
              </Card>
            </ScrollReveal>
          </div>
        </div>
      </Container>
    </Section>
  );
}
