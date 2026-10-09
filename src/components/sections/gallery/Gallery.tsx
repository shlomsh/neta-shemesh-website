import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { SectionHeader } from '@/components/primitives/ui/SectionHeader';
import { Photo } from '@/components/primitives/ui/Photo';
import { GALLERY_IMAGES } from '@/content/home/gallery';
import { ANCHOR, ID } from '@/content/ids';
import { cx } from '@/lib/cx';

/**
 * Per-ROW reveal stagger (NS-47). The tiles fade in one after another within a row, and the stagger
 * restarts on every row, so a tile on the third phone row is never held back by the five before it.
 * The delay is the `--reveal-delay` custom property that globals.css reads (`ScrollReveal` only emits it
 * as an inline style when `delay > 0`), set here by class so it can change per breakpoint. One entry per
 * column, and the arrays must match the grid below: 2 columns below md, 3 from md. Whole class strings,
 * because Tailwind reads them verbatim.
 */
const DELAY_BASE = ['[--reveal-delay:0s]', '[--reveal-delay:0.1s]'];
const DELAY_MD = ['md:[--reveal-delay:0s]', 'md:[--reveal-delay:0.1s]', 'md:[--reveal-delay:0.2s]'];

export function Gallery() {
  return (
    <>
      {/* Anchor preserved for layout tests */}
      <div id={ANCHOR.gallery} aria-hidden="true" />

      {/* Gallery Section */}
      {/* lg+: exactly one screen (100svh; floor 720px). The photo grid is height-driven (flex-1,
          frames fill their cell with object-cover) instead of aspect-driven. */}
      <Section id={ID.photoGallery} tone="cream" fit="lock" pad="tight">
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
                zoom="self"
                motion={{ reveal: 0 }}
                className={cx('w-full shadow-sm', DELAY_BASE[i % DELAY_BASE.length], DELAY_MD[i % DELAY_MD.length])}
              />
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
