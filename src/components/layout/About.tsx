import Image from 'next/image';
import { ScrollReveal } from '../ui/ScrollReveal';
import { ParallaxFrame } from '../ui/ParallaxFrame';
import { PhotoPanel } from './about/PhotoPanel';
import { SectionTitle } from "../ui/SectionTitle";
import { QuoteBlock } from "./about/QuoteBlock";
import { CredentialsList } from './about/CredentialsList';
import { OrganicBg } from './about/OrganicBg';

import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { BodyText } from '@/components/primitives/ui/BodyText';
import { ANCHOR, ID } from '@/content/ids';
import { SITE } from '@/content/site';
import { stagger } from '@/lib/motion';
import {
  BIO_QUOTE_LINES,
  CREDENTIALS,
  CREDENTIAL_ICONS,
  CREDENTIALS_ART,
  INTRO_PHOTOS,
  PROFILE_PHOTO,
  QUOTE_ICON,
  REIGNITE_PHOTOS,
} from '@/content/home/about';

// ─── Component ───────────────────────────────────────────────────────────────

export function AboutIntro() {
  return (
    <>
      {/* ── Section 1: Intro with photo collage + text ── */}
      <Section id={ID.aboutIntro} anchor={ANCHOR.about} tone="mid" fit="lock" pad="section" seam>
        <Container maxWidth="2xl" gutter="wide" className="relative lg:flex lg:min-h-0 lg:flex-1 lg:flex-col">
          <div className="flex flex-col gap-[40px] lg:grid lg:min-h-0 lg:flex-1 lg:grid-cols-[1fr_1.25fr] lg:gap-[clamp(40px,5vw,80px)]">

            {/* Photo collage — left column on desktop (wider, height-driven to the section), top on mobile */}
            <div className="relative w-full grid grid-cols-2 gap-[16px] lg:order-2 lg:min-h-0 lg:h-full lg:grid-rows-2">
              <ScrollReveal className="lg:min-h-0">
                <PhotoPanel
                  src={INTRO_PHOTOS[0].src}
                  objectPosition={INTRO_PHOTOS[0].objectPosition}
                  className="aspect-square lg:aspect-auto lg:h-full"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.24} className="row-span-2 lg:min-h-0">
                <PhotoPanel
                  src={INTRO_PHOTOS[2].src}
                  objectPosition={INTRO_PHOTOS[2].objectPosition}
                  className="h-full"
                />
              </ScrollReveal>
              <ScrollReveal delay={0.12} className="lg:min-h-0">
                <PhotoPanel
                  src={INTRO_PHOTOS[1].src}
                  objectPosition={INTRO_PHOTOS[1].objectPosition}
                  className="aspect-square lg:aspect-auto lg:h-full"
                />
              </ScrollReveal>
            </div>

            {/* Text column */}
            <div className="relative w-full flex flex-col justify-center gap-[24px] lg:order-1 lg:self-center">
              <OrganicBg className="opacity-60 z-0 pointer-events-none" />

              <ScrollReveal className="relative z-10">
                <SectionTitle id={ID.aboutIntroTitle}>ליווי מקצועי לזוגות</SectionTitle>
              </ScrollReveal>

              <ScrollReveal delay={0.12} className="relative z-10">
                {/* Veil card: cream 85% over mauve (--surface-veil) is 4.97:1 against plum, so the
                    copy can sit at the lead scale. data-bg-tone="cream" keeps plum text. */}
                <div
                  data-bg-tone="cream"
                  className="rounded-card bg-[var(--surface-veil)] p-6 md:p-8 text-right flex flex-col gap-4"
                >
                  <BodyText className="type-lead max-w-[65ch]">
                    מערכות יחסים הן מסע משותף ומורכב. לפעמים, אתגרי היומיום,
                    השחיקה או המשברים מעלים בנו תחושות של ריחוק ובדידות, דווקא
                    בתוך הביחד.
                  </BodyText>
                  <BodyText className="type-lead max-w-[65ch]">
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
      {/* lg+: one screen (min 100svh; floor 720px) with the bio vertically centred. fit="grow"
          (min-h, not h) so a short viewport grows the section rather than clipping the running text. */}
      <Section id={ID.aboutMeSection} anchor={ANCHOR.aboutMe} tone="cream" fit="grow" pad="section" seam>
        <Container maxWidth="2xl" gutter="wide" className="relative z-10">
          <div className="flex flex-col gap-[48px] lg:flex-row lg:items-start lg:gap-[clamp(40px,6vw,80px)]">

            {/* Right Column: Narrative Text */}
            <div className="w-full lg:w-[60%] flex flex-col gap-[28px]">
              
              {/* Title */}
              <ScrollReveal>
                <SectionTitle id={ID.aboutMeTitle} dir="rtl">קצת עלי</SectionTitle>
              </ScrollReveal>

              {/* Introduction/Bio Narrative */}
              <ScrollReveal delay={0.24} className="flex flex-col gap-[16px]">
                <BodyText className="type-lead">
                  נעים להכיר, אני נטע שמש. עובדת סוציאלית קלינית (<span className="font-latin">M.S.W</span>) ומטפלת מוסמכת לטיפול זוגי ולטיפול משפחתי בנתניה, עם 14 שנות ניסיון בליווי אנשים, זוגות ומשפחות בתהליכי שינוי, משבר וצמיחה.
                </BodyText>
                <BodyText className="type-lead">
                  אני מלווה זוגות, הורים ומשפחות המתמודדים עם אתגרי החיים – משברי זוגיות, קשיי תקשורת, עומסי ההורות ושינויים משמעותיים במעגל החיים המשפחתי. לעיתים קרובות אלו רגעים שבהם תחושת הקרבה מתרחקת, הקונפליקטים מתעצמים, וההתמודדות היומיומית הופכת מורכבת ומעייפת.
                </BodyText>
                <BodyText className="type-lead">
                  הדרך המקצועית שלי נבנתה מתוך שטח מגוון ומאתגר – במערכות הציבוריות ובקליניקה הפרטית, שם ליוויתי משפחות מתחילת דרכן ועד גיל ההתבגרות, נשים יוצאות מקלט ומשפחות אומנה. כיום אני מטפלת בתחנה לטיפול זוגי ומשפחתי בלב השרון, ומקבלת בקליניקה הפרטית שלי בשכונת פולג בנתניה.
                </BodyText>
                <BodyText className="type-lead">
                  אני מאמינה שבתוך כל קושי טמון גם פוטנציאל לצמיחה, להבנה מחודשת ולשינוי משמעותי. בקליניקה אני מציעה מרחב טיפולי בטוח, מכיל ולא שיפוטי, בגובה העיניים – מקום שבו אפשר לעצור, להניח את מנגנוני ההגנה ולהתבונן בדפוסים שמלווים את היחסים. העבודה הטיפולית שלי משלבת הבנה פסיכודינמית עמוקה וראייה מערכתית – התבוננות במערכות היחסים בהווה לצד הבנת החוויות שעיצבו אותנו לאורך השנים – יחד עם חשיבה פרקטית המכוונת לשינוי יציב.
                </BodyText>
                <BodyText className="type-lead">
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
                    alt={SITE.name}
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
                    lines={BIO_QUOTE_LINES}
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
      <Section id={ID.aboutCredentials} anchor={ANCHOR.credentials} tone="dark" fit="free" pad="section" seam>
        {/* Subtle couple line-art background at low opacity */}
        <img
          src={CREDENTIALS_ART}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="absolute bottom-0 left-0 w-[65%] h-[65%] object-contain object-bottom-left pointer-events-none select-none opacity-[0.18] z-0"
        />

        <Container maxWidth="2xl" gutter="wide" className="relative z-[1]">
          <div className="flex flex-col items-center gap-[clamp(56px,8vw,100px)]">

            <ScrollReveal>
              <SectionTitle id={ID.aboutCredentialsTitle} className="text-center" dir="rtl">ליווי להתגברות על מכשולים וחיזוק הקשר בין בני הזוג
              </SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.12}>
              <CredentialsList items={CREDENTIALS} checkIconSrc={CREDENTIAL_ICONS} onDark />
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
      {/* lg+: exactly one screen (100svh; floor 720px so a short viewport grows rather than clips).
          Flex chain Section -> Container -> wrapper -> grid hands the remaining height to the
          photo grid, so the frames crop (object-cover) instead of overflowing. */}
      <Section id={ID.aboutGallery} anchor={ANCHOR.reignite} tone="mid" fit="lock" pad="section" seam>
        <Container maxWidth="2xl" gutter="wide" className="relative z-[1] lg:flex lg:flex-1 lg:min-h-0 lg:flex-col">
          <div className="flex flex-col gap-[40px] items-center lg:flex-1 lg:min-h-0 lg:gap-9">

            {/* Heading + sub-text */}
            <div className="flex flex-col items-center text-center">
              <ScrollReveal>
                <SectionTitle id={ID.aboutGalleryTitle} dir="rtl">להצית מחדש את הקשר הזוגי
                </SectionTitle>
              </ScrollReveal>

              {/* Subtitle sits on mauve by owner decision (decorative title lockup, same
                  exception as the Elamy titles; 2.26:1). Inherits the section's cream text. */}
              <ScrollReveal delay={0.12}>
                <BodyText centered className="type-quote max-w-[65ch] mt-3 md:mt-4">
                  תמיכה והכוונה לבנייה מחדש של האמון וריפוי פצעים רגשיים בקשר.
                </BodyText>
              </ScrollReveal>
            </div>

            {/* Gallery row — three portrait photos with rounded corners + dark border */}
            <div className="grid grid-cols-1 gap-[16px] w-full sm:grid-cols-3 lg:flex-1 lg:min-h-[320px] lg:grid-rows-1">
              {REIGNITE_PHOTOS.map((panel, i) => (
                <ScrollReveal key={i} delay={stagger(i)} className="lg:h-full lg:min-h-0">
                  {/* below lg: intrinsic aspect 348:531; lg+: frame fills the grid's remaining
                      height and the photo crops (object-cover) while drifting within it */}
                  <ParallaxFrame
                    className="aspect-[348/531] lg:aspect-auto lg:h-full rounded-card outline-[1.5px] outline-[var(--color-plum)] safari-clip"
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
