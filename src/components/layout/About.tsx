import { ScrollReveal } from '../ui/ScrollReveal';
import { PhotoPanel } from './about/PhotoPanel';
import { SectionTitle } from "../ui/SectionTitle";
import { QuoteBlock } from "./about/QuoteBlock";
import { CredentialsList } from './about/CredentialsList';
import { OrganicBg } from './about/OrganicBg';
import type { Credential } from './about/CredentialsList';

import { ScrollAnchor } from '@/components/primitives/layout/ScrollAnchor';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { BodyText } from '@/components/primitives/ui/BodyText';

// ─── Data ────────────────────────────────────────────────────────────────────

const photoPanels = [
  {
    src: '/images/17bebae32af462ae5e9c2885c4f1750c.jpg',
    objectPosition: '50% 50%',
    aspectPct: 87.06,
    radiusX: '9%',
    radiusY: '10.4%',
  },
  {
    src: '/images/1c2a7477c15666cecc2b164c84a0bed8.jpg',
    objectPosition: '48.1% 47.7%',
    aspectPct: 87.06,
    radiusX: '9%',
    radiusY: '10.4%',
  },
  {
    src: '/images/6f51fa01092daf6b558e0ff274debe53.jpg',
    objectPosition: '55.3% 50%',
    aspectPct: 93.07,
    radiusX: '4.5%',
    radiusY: '4.8%',
  },
] as const;

const galleryPanels = [
  {
    src: '/images/e32becfeb791b0a6bcc85c45a0e6fa51.jpg',
    objectPosition: '50% 50%',
  },
  {
    src: '/images/96be0cab3c596e6c5f381573217388be.jpg',
    objectPosition: '50% 50%',
  },
  {
    src: '/images/996bfa8eae734c587f45d866d0e7a3e1.jpg',
    objectPosition: '50% 50%',
  },
] as const;

const quoteLines = [
  'הטיפול הזוגי מספק לכם מרחב מוגן, בו תוכלו לפרק את השתיקות, ללמוד להקשיב ולהתחיל לבנות מחדש את הקשר.',
  'יחד, נלמד לזהות את הדינמיקה הזוגית ולייצר שפה משותפת שמחזירה את הקרבה הביתה.',
];

const credentials: Credential[] = [
  { text: '15 שנות ניסיון קליני' },
  { text: 'חברה באגודה לטיפול זוגי ומשפחתי' },
  { text: 'עובדת סוציאלית קלינית' },
  { text: 'M.S.W. עובדת סוציאלית קלינית' },
  { text: 'פרס מנטור מצטיין ABCT' },
  { text: 'דירוג 5 כוכבים עקבי מלקוחות' },
];

const CHECK_ICON = '/images/4e3686725d22ef08df30137416c9368d.svg';
const QUOTE_ICON = '/images/42fd096b86fdf26f4525532e1d5bbd85.svg';
const PROFILE_PHOTO = '/images/9af276f56eebc541c83057d036de0714.jpg';
const RAYS_BG = '/images/d06ba91ec14a00cf227ed30587771514.jpg';
const WHITE_RAYS_BG = '/images/b43948bd4c0a0535200651858e1e4708.jpg';

// ─── Component ───────────────────────────────────────────────────────────────

export default function About() {
  return (
    <>
      {/* ── Section 1: Intro with photo collage + text ── */}
      <ScrollAnchor id="about" />

      <Section id="about-intro" bgVariant="mid" className="-mt-px py-[clamp(56px,8vw,120px)]">
        <Container maxWidth="2xl" className="relative px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col gap-[40px] lg:flex-row-reverse lg:items-start lg:gap-[clamp(40px,5vw,80px)]">

            {/* Photo collage — left column on desktop, top on mobile */}
            <div className="relative flex-1 w-full lg:w-1/2 grid grid-cols-2 gap-[16px]">
              <div className="flex flex-col gap-[16px]">
                <ScrollReveal delay={0}>
                  <PhotoPanel
                    src={photoPanels[0].src}
                    objectPosition={photoPanels[0].objectPosition}
                    aspectPct={100}
                    radiusX="8%"
                    radiusY="8%"
                  />
                </ScrollReveal>
                <ScrollReveal delay={0.12}>
                  <PhotoPanel
                    src={photoPanels[1].src}
                    objectPosition={photoPanels[1].objectPosition}
                    aspectPct={100}
                    radiusX="8%"
                    radiusY="8%"
                  />
                </ScrollReveal>
              </div>
              <div className="h-full">
                <ScrollReveal delay={0.24}>
                  <PhotoPanel
                    src={photoPanels[2].src}
                    objectPosition={photoPanels[2].objectPosition}
                    aspectPct={150}
                    radiusX="4%"
                    radiusY="2.6%"
                  />
                </ScrollReveal>
              </div>
            </div>

            {/* Text column */}
            <div className="relative w-full lg:w-[40%] flex flex-col justify-center gap-[24px]">
              <OrganicBg className="opacity-60 z-0 pointer-events-none" />

              <ScrollReveal delay={0} className="relative z-10">
                <SectionTitle id="GDq1TYUPnp1UCFMP" onDark>ליווי מקצועי לזוגות</SectionTitle>
              </ScrollReveal>

              <ScrollReveal delay={0.12} className="relative z-10">
                <div className="flex flex-col gap-[1em]">
                  <BodyText onDark className="type-lead">
                    מערכות יחסים הן מסע משותף ומורכב. לפעמים, אתגרי היומיום,
                    השחיקה או המשברים מעלים בנו תחושות של ריחוק ובדידות, דווקא
                    בתוך הביחד.
                  </BodyText>
                  <BodyText onDark className="type-lead">
                    בקליניקה שלי, אני מציעה לכם מרחב בטוח ומקבל שבו נוכל
                    להניח את מנגנוני ההגנה, ללמוד להקשיב באמת זה לזו, ולמצוא
                    את הגשר חזרה לחיבור, קירבה וביטחון זוגי.
                  </BodyText>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Section 2: Quote block ── */}
      <ScrollAnchor id="page-3" />

      <Section id="about-quote" bgVariant="cream" fullHeight className="-mt-px py-[clamp(48px,7vw,100px)]">
        <Container maxWidth="2xl" className="relative px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start lg:gap-[clamp(40px,5vw,80px)]">

            {/* Profile circle photo */}
            <ScrollReveal delay={0} className="shrink-0 self-center lg:self-start">
              <div className="relative overflow-hidden rounded-full w-[clamp(96px,12vw,160px)] h-[clamp(96px,12vw,160px)]">
                <img
                  src={PROFILE_PHOTO}
                  alt="נטע שמש"
                  loading="lazy"
                  className="w-full h-full object-cover object-[50%_38%]"
                />
                {/* thin ring matching original stroke */}
                <div className="absolute inset-0 rounded-full shadow-[0_0_0_1.5px_var(--color-text-muted)]" />
              </div>
            </ScrollReveal>

            {/* Quote content */}
            <div className="flex flex-col gap-[20px] flex-1 min-w-0">
              <ScrollReveal delay={0.12}>
                <img
                  src={QUOTE_ICON}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  className="w-[clamp(40px,5.6vw,72px)] h-auto opacity-30"
                  style={{ filter: 'brightness(0) saturate(100%) invert(22%) sepia(18%) saturate(800%) hue-rotate(260deg) brightness(60%)' }}
                />
              </ScrollReveal>

              <ScrollReveal delay={0.24}>
                <QuoteBlock
                  lines={quoteLines}
                  authorName="נטע שמש"
                  authorTitle="פסיכולוגית קלינית"
                />
              </ScrollReveal>

              <ScrollReveal delay={0.36}>
                <p className="type-signature mt-[clamp(8px,1.5vw,16px)] tracking-[-0.02em]">
                  נטע שמש
                </p>
              </ScrollReveal>
            </div>
          </div>
        </Container>
      </Section>

      {/* ── Section 3: Credentials list ── */}
      <ScrollAnchor id="page-4" />

      <Section id="about-credentials" bgVariant="light" fullHeight className="-mt-px py-[clamp(56px,8vw,120px)]">
        {/* Subtle rays background at low opacity */}
        <img
          src={RAYS_BG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.18] z-0"
        />

        <Container maxWidth="2xl" className="relative z-[1] px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col items-center gap-[40px]">

            <ScrollReveal delay={0}>
              <SectionTitle id="YoSfu967TqAAsgNM" className="text-center" dir="rtl">ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג
              </SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <CredentialsList items={credentials} checkIconSrc={CHECK_ICON} />
            </ScrollReveal>
          </div>
        </Container>
      </Section>

      {/* ── Section 4: Re-ignite connection — photo gallery + heading ── */}
      <ScrollAnchor id="about-2" />

      <Section id="about-gallery" bgVariant="white" className="-mt-px py-[clamp(56px,8vw,120px)]">
        {/* White-rays decorative bg */}
        <img
          src={WHITE_RAYS_BG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-100 z-0"
        />

        <Container maxWidth="2xl" className="relative z-[1] px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col gap-[40px] items-center">

            {/* Heading + sub-text */}
            <div className="flex flex-col items-center gap-[16px] text-center">
              <ScrollReveal delay={0}>
                <SectionTitle id="JkkbI1eIj5p9V33T" dir="rtl">להצית מחדש את הקשר הזוגי
                </SectionTitle>
              </ScrollReveal>

              <ScrollReveal delay={0.12}>
                <BodyText centered className="type-lead">
                  תמיכה והכוונה לבנייה מחדש של האמון וריפוי פצעים רגשיים בקשר.
                </BodyText>
              </ScrollReveal>
            </div>

            {/* Gallery row — three portrait photos with rounded corners + dark border */}
            <div className="grid grid-cols-1 gap-[16px] w-full sm:grid-cols-3">
              {galleryPanels.map((panel, i) => (
                <ScrollReveal key={i} delay={i * 0.12}>
                  <div className="relative overflow-hidden rounded-[4.3%/2.82%] outline-[1.5px] outline-[var(--color-black)] safari-clip">
                    {/* intrinsic aspect ratio 348:531 ≈ 152.5% */}
                    <div className="pt-[152.47%]" />
                    <img
                      src={panel.src}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: panel.objectPosition }}
                    />
                  </div>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
