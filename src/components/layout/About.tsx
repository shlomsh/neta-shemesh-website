import Image from 'next/image';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ParallaxFrame } from '../ui/ParallaxFrame';
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
    src: '/images/about-collage-1.webp',
    objectPosition: '50% 50%',
    aspectPct: 87.06,
  },
  {
    src: '/images/about-collage-2.webp',
    objectPosition: '48.1% 47.7%',
    aspectPct: 87.06,
  },
  {
    src: '/images/about-collage-3.webp',
    objectPosition: '55.3% 50%',
    aspectPct: 93.07,
  },
] as const;

const galleryPanels = [
  {
    src: '/images/about-gallery-1.webp',
    objectPosition: '50% 50%',
  },
  {
    src: '/images/gallery-item-3.webp',
    objectPosition: '50% 50%',
  },
  {
    src: '/images/about-gallery-3.webp',
    objectPosition: '50% 50%',
  },
] as const;

const quoteLines = [
  'הטיפול הזוגי מספק לכם מרחב מוגן, בו תוכלו לפרק את השתיקות, ללמוד להקשיב ולהתחיל לבנות מחדש את הקשר.',
  'יחד, נלמד לזהות את הדינמיקה הזוגית ולייצר שפה משותפת שמחזירה את הקרבה הביתה.',
  '- נטע'
];

const credentials: Credential[] = [
  { text: '14 שנות ניסיון קליני' },
  { text: 'מטפלת זוגית ומשפחתית' },
  { text: 'הדרכת הורים' },
  { text: 'M.S.W. עובדת סוציאלית קלינית' },
  { text: 'מנחת קבוצות' },
  { text: 'דירוג 5 כוכבים עקבי מלקוחות' },
];

const CHECK_ICONS = ['/images/jigsaw-puzzle-6.webp', '/images/jigsaw-puzzle-7.webp'];
const QUOTE_ICON = '/images/about-quote-mark.svg';
const PROFILE_PHOTO = '/images/about-profile-neta.webp';
const CREDENTIALS_ART = '/images/about-credentials-art.webp';

// ─── Component ───────────────────────────────────────────────────────────────

export function AboutIntro() {
  return (
    <>
      {/* ── Section 1: Intro with photo collage + text ── */}
      <ScrollAnchor id="about" />

      <Section id="about-intro" bgVariant="cream" fullHeight className="-mt-px py-[clamp(56px,8vw,120px)]">
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
                  />
                </ScrollReveal>
                <ScrollReveal delay={0.12}>
                  <PhotoPanel
                    src={photoPanels[1].src}
                    objectPosition={photoPanels[1].objectPosition}
                    aspectPct={100}
                  />
                </ScrollReveal>
              </div>
              <div className="h-full">
                <ScrollReveal delay={0.24}>
                  <PhotoPanel
                    src={photoPanels[2].src}
                    objectPosition={photoPanels[2].objectPosition}
                    aspectPct={150}
                  />
                </ScrollReveal>
              </div>
            </div>

            {/* Text column */}
            <div className="relative w-full lg:w-[40%] flex flex-col justify-center gap-[24px]">
              <OrganicBg className="opacity-60 z-0 pointer-events-none" />

              <ScrollReveal delay={0} className="relative z-10">
                <SectionTitle id="GDq1TYUPnp1UCFMP">ליווי מקצועי לזוגות</SectionTitle>
              </ScrollReveal>

              <ScrollReveal delay={0.12} className="relative z-10">
                <div className="flex flex-col gap-[1em]">
                  <BodyText className="type-lead">
                    מערכות יחסים הן מסע משותף ומורכב. לפעמים, אתגרי היומיום,
                    השחיקה או המשברים מעלים בנו תחושות של ריחוק ובדידות, דווקא
                    בתוך הביחד.
                  </BodyText>
                  <BodyText className="type-lead">
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
    </>
  );
}

export function AboutBio() {
  return (
    <>
      {/* ── Section 2: Merged About Me (Introduction, Quote, Photo & Signature) ── */}
      <ScrollAnchor id="about-me" />

      <Section id="about-me-section" bgVariant="cream" className="-mt-px py-[clamp(56px,8vw,120px)]">
        <Container maxWidth="2xl" className="relative z-10 px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col gap-[48px] lg:flex-row lg:items-start lg:gap-[clamp(40px,6vw,80px)]">

            {/* Right Column: Narrative Text */}
            <div className="w-full lg:w-[60%] flex flex-col gap-[28px]">
              
              {/* Title */}
              <ScrollReveal delay={0}>
                <SectionTitle id="about-me-title" dir="rtl">קצת עלי</SectionTitle>
              </ScrollReveal>

              {/* Introduction/Bio Narrative */}
              <ScrollReveal delay={0.24} className="flex flex-col gap-[16px]">
                <BodyText className="type-lead leading-[1.65]">
                  נעים להכיר, אני נטע שמש. עובדת סוציאלית קלינית (M.S.W) ומטפלת מוסמכת לטיפול זוגי ולטיפול משפחתי בנתניה, עם 14 שנות ניסיון בליווי אנשים, זוגות ומשפחות בתהליכי שינוי, משבר וצמיחה.
                </BodyText>
                <BodyText className="type-lead leading-[1.65]">
                  אני מלווה זוגות, הורים ומשפחות המתמודדים עם אתגרי החיים – משברי זוגיות, קשיי תקשורת, עומסי ההורות ושינויים משמעותיים במעגל החיים המשפחתי. לעיתים קרובות אלו רגעים שבהם תחושת הקרבה מתרחקת, הקונפליקטים מתעצמים, וההתמודדות היומיומית הופכת מורכבת ומעייפת.
                </BodyText>
                <BodyText className="type-lead leading-[1.65]">
                  הדרך המקצועית שלי נבנתה מתוך שטח מגוון ומאתגר – במערכות הציבוריות ובקליניקה הפרטית, שם ליוויתי משפחות מתחילת דרכן ועד גיל ההתבגרות, נשים יוצאות מקלט ומשפחות אומנה. כיום אני מטפלת בתחנה לטיפול זוגי ומשפחתי בלב השרון, ומקבלת בקליניקה הפרטית שלי בשכונת פולג בנתניה.
                </BodyText>
                <BodyText className="type-lead leading-[1.65]">
                  אני מאמינה שבתוך כל קושי טמון גם פוטנציאל לצמיחה, להבנה מחודשת ולשינוי משמעותי. בקליניקה אני מציעה מרחב טיפולי בטוח, מכיל ולא שיפוטי, בגובה העיניים – מקום שבו אפשר לעצור, להניח את מנגנוני ההגנה ולהתבונן בדפוסים שמלווים את היחסים. העבודה הטיפולית שלי משלבת הבנה פסיכודינמית עמוקה וראייה מערכתית – התבוננות במערכות היחסים בהווה לצד הבנת החוויות שעיצבו אותנו לאורך השנים – יחד עם חשיבה פרקטית המכוונת לשינוי יציב.
                </BodyText>
                <BodyText className="type-lead leading-[1.65]">
                  יחד אנו מעבדים את האתגרים, מחזקים את הכוחות האישיים והמשפחתיים ומייצרים תנועה לעבר קשרים קרובים, בטוחים ומספקים יותר. אני מאמינה שחיבור אנושי חם, לצד מקצועיות ללא פשרות, הם הבסיס לכל תהליך ריפוי והתפתחות משמעותי.
                </BodyText>
              </ScrollReveal>

            </div>

            {/* Left Column: Personal Photo, Quote & Signature */}
            <div className="w-full lg:w-[40%] flex flex-col gap-[32px] lg:sticky lg:top-[120px]">
              
              {/* Personal Photo */}
              <ScrollReveal delay={0.24} className="w-full flex justify-start">
                <div className="relative aspect-[4/3] w-full max-w-[320px] overflow-hidden rounded-card outline outline-[1.5px] outline-[var(--color-plum)] shadow-[0_16px_30px_-15px_rgba(122,89,120,0.3)] safari-clip">
                  <Image
                    src={PROFILE_PHOTO}
                    alt="נטע שמש"
                    fill
                    sizes="(max-width: 1024px) 320px, 320px"
                    className="object-cover object-[50%_35%]"
                    loading="lazy"
                  />
                </div>
              </ScrollReveal>

              {/* Quote Block & Signature */}
              <div className="flex flex-col gap-[16px] relative mt-[8px]">
                <ScrollReveal delay={0.28} className="absolute -top-[24px] start-0">
                  <img
                    src={`${QUOTE_ICON}?v=2`}
                    alt=""
                    aria-hidden="true"
                    loading="lazy"
                    className="w-[clamp(28px,3.5vw,40px)] h-auto"
                  />
                </ScrollReveal>

                <ScrollReveal delay={0.36} className="relative z-10 pt-[12px] ps-[16px]">
                  <QuoteBlock
                    lines={quoteLines}
                  />
                </ScrollReveal>
              </div>

            </div>

          </div>
        </Container>
      </Section>
    </>
  );
}

export function AboutCredentials() {
  return (
    <>
      {/* ── Section 3: Credentials list ── */}
      <ScrollAnchor id="page-4" />

      <Section id="about-credentials" bgVariant="dark" fullHeight className="-mt-px py-[clamp(56px,8vw,120px)]">
        {/* Subtle couple line-art background at low opacity */}
        <img
          src={CREDENTIALS_ART}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute bottom-0 left-0 w-[65%] h-[65%] object-contain object-bottom-left pointer-events-none select-none opacity-[0.18] z-0"
        />

        <Container maxWidth="2xl" className="relative z-[1] px-[clamp(24px,5vw,80px)]">
          <div className="flex flex-col items-center gap-[clamp(56px,8vw,100px)]">

            <ScrollReveal delay={0}>
              <SectionTitle id="YoSfu967TqAAsgNM" className="text-center" dir="rtl">ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג
              </SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <CredentialsList items={credentials} checkIconSrc={CHECK_ICONS} onDark />
            </ScrollReveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

export function AboutGallery() {
  return (
    <>
      {/* ── Section 4: Re-ignite connection — photo gallery + heading ── */}
      <ScrollAnchor id="about-2" />

      <Section id="about-gallery" bgVariant="light" className="-mt-px py-[clamp(56px,8vw,120px)]">
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
                  {/* intrinsic aspect ratio 348:531 ≈ 152.5%; photo drifts within the frame */}
                  <ParallaxFrame
                    className="aspect-[348/531] rounded-card outline-[1.5px] outline-[var(--color-plum)] safari-clip"
                    amount={9}
                  >
                    <img
                      src={panel.src}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                      style={{ objectPosition: panel.objectPosition }}
                    />
                  </ParallaxFrame>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}

export default function About() {
  return (
    <>
      <AboutIntro />
      <AboutBio />
      <AboutCredentials />
      <AboutGallery />
    </>
  );
}
