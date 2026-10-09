import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { Photo } from '@/components/primitives/ui/Photo';
import { SectionSubtitle } from '@/components/primitives/ui/SectionHeader';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, ID } from '@/content/ids';
import { stagger } from '@/lib/motion';
import { REIGNITE_PHOTOS } from '@/content/home/about';

/**
 * `sizes` = the width the image renders at (NS-30), including the 1.19 scale of the parallax layer: about
 * 108vw in the single column below 640px, 36vw in the three columns, 720px at lg (height-driven). The
 * sources are 768px wide, so nothing above that is ever used.
 */
const GALLERY_SIZES = '(min-width: 1024px) 720px, (min-width: 640px) 36vw, 108vw';

export function Reignite() {
  // ── Section 4: Re-ignite connection — photo gallery + heading ──
  // lg+: exactly one screen (100svh; floor 720px so a short viewport grows rather than clips).
  // Flex chain Section -> Container -> wrapper -> grid hands the remaining height to the
  // photo grid, so the frames crop (object-cover) instead of overflowing.
  return (
    <Section id={ID.aboutGallery} anchor={ANCHOR.reignite} tone="mid" fit="lock" pad="section" seam>
      <Container maxWidth="2xl" gutter="wide" className="relative z-[1] lg:flex lg:flex-1 lg:min-h-0 lg:flex-col">
        <div className="flex flex-col gap-[40px] items-center lg:flex-1 lg:min-h-0 lg:gap-9">

          {/* Heading + sub-text */}
          <div className="flex flex-col items-center text-center">
            <ScrollReveal>
              <SectionTitle id={ID.aboutGalleryTitle}>להצית מחדש את הקשר הזוגי
              </SectionTitle>
            </ScrollReveal>

            {/* Subtitle sits on mauve by owner decision (decorative title lockup, same
                exception as the Elamy titles; 2.26:1). Inherits the section's cream text. */}
            <ScrollReveal delay={0.12}>
              <SectionSubtitle align="center">
                תמיכה והכוונה לבנייה מחדש של האמון וריפוי פצעים רגשיים בקשר.
              </SectionSubtitle>
            </ScrollReveal>
          </div>

          {/* Gallery row — three portrait photos with rounded corners + dark border */}
          <div className="grid grid-cols-1 gap-[16px] w-full sm:grid-cols-3 lg:flex-1 lg:min-h-[320px] lg:grid-rows-1">
            {REIGNITE_PHOTOS.map((panel, i) => (
              <ScrollReveal key={i} delay={stagger(i)} className="lg:h-full lg:min-h-0">
                {/* below lg: intrinsic aspect 348:531; lg+: frame fills the grid's remaining
                    height and the photo crops (object-cover) while drifting within it */}
                <Photo
                  engine="next"
                  src={panel.src}
                  sizes={GALLERY_SIZES}
                  alt=""
                  radius="card"
                  ratio="348/531"
                  fillCellAtLg
                  outlined
                  objectPosition={panel.objectPosition}
                  motion={{ parallax: 9 }}
                />
              </ScrollReveal>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  );
}
