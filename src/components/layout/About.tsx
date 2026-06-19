import { ScrollReveal } from '../ui/ScrollReveal';
import { PhotoPanel } from './about/PhotoPanel';
import { QuoteBlock } from './about/QuoteBlock';
import { CredentialsList } from './about/CredentialsList';
import { OrganicBg } from './about/OrganicBg';
import type { Credential } from './about/CredentialsList';

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
      <div id="about" className="invisible" />

      <section
        dir="rtl"
        className="relative overflow-hidden bg-[var(--color-dark)] -mt-px"
      >
        <div className="relative mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,80px)] py-[clamp(56px,8vw,120px)]">
          <div className="flex flex-col gap-[40px] lg:flex-row lg:items-start lg:gap-[clamp(40px,5vw,80px)]">

            {/* Photo collage — left column on desktop, top on mobile */}
            <div className="relative flex-1 min-w-0 flex flex-col gap-[16px]">
              {photoPanels.map((panel, i) => (
                <ScrollReveal key={i} delay={i * 0.12}>
                  <PhotoPanel
                    src={panel.src}
                    objectPosition={panel.objectPosition}
                    aspectPct={panel.aspectPct}
                    radiusX={panel.radiusX}
                    radiusY={panel.radiusY}
                  />
                </ScrollReveal>
              ))}
            </div>

            {/* Text column */}
            <div
              className="relative flex-[0_0_clamp(260px,42%,520px)] flex flex-col justify-center gap-[24px] z-[1]"
            >
              <OrganicBg className="opacity-60" />

              <ScrollReveal delay={0} className="relative z-[1]">
                <h2
                  id="GDq1TYUPnp1UCFMP"
                  className="font-[family-name:var(--font-stanga)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-white)]"
                >
                  ליווי מקצועי לזוגות
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.12} className="relative z-[1]">
                <div
                  className="flex flex-col gap-[1em] text-[var(--color-white)] font-[family-name:var(--font-canva-primary)] text-[clamp(15px,1.2vw,18px)] leading-[1.453] tracking-[0.012em]"
                >
                  <p>
                    מערכות יחסים הן מסע משותף ומורכב. לפעמים, אתגרי היומיום,
                    השחיקה או המשברים מעלים בנו תחושות של ריחוק ובדידות, דווקא
                    בתוך הביחד.
                  </p>
                  <p>
                    בקליניקה שלי, אני מציעה לכם מרחב בטוח ומקבל שבו נוכל
                    להניח את מנגנוני ההגנה, ללמוד להקשיב באמת זה לזו, ולמצוא
                    את הגשר חזרה לחיבור, קירבה וביטחון זוגי.
                  </p>
                </div>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 2: Quote block ── */}
      <div id="page-3" className="invisible" />

      <section
        dir="rtl"
        className="relative overflow-hidden bg-[var(--color-dark)] -mt-px"
      >
        <div className="relative mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,80px)] py-[clamp(48px,7vw,100px)]">
          <div className="flex flex-col gap-[32px] lg:flex-row lg:items-start lg:gap-[clamp(40px,5vw,80px)]">

            {/* Profile circle photo */}
            <ScrollReveal delay={0} className="shrink-0 self-center lg:self-start">
              <div
                className="relative overflow-hidden rounded-full w-[clamp(96px,12vw,160px)] h-[clamp(96px,12vw,160px)]"
              >
                <img
                  src={PROFILE_PHOTO}
                  alt="נטע שמש"
                  loading="lazy"
                  className="w-full h-full object-cover object-[50%_38%]"
                />
                {/* thin ring matching original stroke */}
                <div
                  className="absolute inset-0 rounded-full shadow-[0_0_0_1.5px_var(--color-text-muted)]"
                />
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
                  className="w-[clamp(40px,5.6vw,72px)] h-auto"
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
                <p
                  className="text-[var(--color-white)] font-[family-name:var(--font-canva-accent)] text-[clamp(28px,3vw,44px)] leading-[1.095] tracking-[-0.02em] normal-case"
                >
                  נטע שמש
                </p>
              </ScrollReveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Section 3: Credentials list ── */}
      <div id="page-4" className="invisible" />

      <section
        dir="rtl"
        className="relative overflow-hidden bg-[var(--color-white)] -mt-px"
      >
        {/* Subtle rays background at low opacity */}
        <img
          src={RAYS_BG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-[0.18] z-0"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,80px)] py-[clamp(56px,8vw,120px)]">
          <div className="flex flex-col items-center gap-[40px]">

            <ScrollReveal delay={0}>
              <h2
                id="YoSfu967TqAAsgNM"
                className="font-[family-name:var(--font-stanga)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-canva-dark)] text-center"
                dir="rtl"
              >
                ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <CredentialsList items={credentials} checkIconSrc={CHECK_ICON} />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ── Section 4: Re-ignite connection — photo gallery + heading ── */}
      <div id="about-2" className="invisible" />

      <section
        dir="rtl"
        className="relative overflow-hidden bg-[var(--color-white)] -mt-px"
      >
        {/* White-rays decorative bg */}
        <img
          src={WHITE_RAYS_BG}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover pointer-events-none select-none opacity-100 z-0"
        />

        <div className="relative z-[1] mx-auto w-full max-w-[1280px] px-[clamp(24px,5vw,80px)] py-[clamp(56px,8vw,120px)]">
          <div className="flex flex-col gap-[40px] items-center">

            {/* Heading + sub-text */}
            <div className="flex flex-col items-center gap-[16px] text-center">
              <ScrollReveal delay={0}>
                <h2
                  id="JkkbI1eIj5p9V33T"
                  className="font-[family-name:var(--font-stanga)] font-bold text-[clamp(28px,4.375vw,56px)] leading-[1.2] tracking-[-0.01em] normal-case text-[var(--color-canva-dark)]"
                  dir="rtl"
                >
                  להצית מחדש את הקשר הזוגי
                </h2>
              </ScrollReveal>

              <ScrollReveal delay={0.12}>
                <p
                  className="text-[var(--color-text-primary)] max-w-[640px] font-[family-name:var(--font-canva-primary)] text-[clamp(15px,1.2vw,18px)] leading-[1.453] tracking-[0.012em]"
                  dir="rtl"
                >
                  תמיכה והכוונה לבנייה מחדש של האמון וריפוי פצעים רגשיים בקשר.
                </p>
              </ScrollReveal>
            </div>

            {/* Gallery row — three portrait photos with rounded corners + dark border */}
            <div className="grid grid-cols-1 gap-[16px] w-full sm:grid-cols-3">
              {galleryPanels.map((panel, i) => (
                <ScrollReveal key={i} delay={i * 0.12}>
                  <div
                    className="relative overflow-hidden rounded-[4.3%/2.82%] outline-[1.5px] outline-[var(--color-black)]"
                  >
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
        </div>
      </section>
    </>
  );
}
