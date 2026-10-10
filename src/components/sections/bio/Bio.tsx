import { ScrollReveal } from '@/components/motion/ScrollReveal';
import { Section } from '@/components/primitives/layout/Section';
import { Container } from '@/components/primitives/layout/Container';
import { BodyText } from '@/components/primitives/ui/BodyText';
import { Photo } from '@/components/primitives/ui/Photo';
import { SectionTitle } from '@/components/primitives/ui/SectionTitle';
import { ANCHOR, ID } from '@/content/ids';
import { SITE } from '@/content/site';
import { BIO_QUOTE_LINES, PROFILE_PHOTO, QUOTE_ICON } from '@/content/home/about';
import { LineArt } from '@/components/site/LineArt';
import { QuoteBlock } from './QuoteBlock';
import { Signature } from './Signature';

export function Bio() {
  // ── Section 2: Merged About Me (Introduction, Quote, Photo & Signature) ──
  // lg+: one screen (min 100svh; floor 720px) with the bio vertically centred. fit="grow"
  // (min-h, not h) so a short viewport grows the section rather than clipping the running text.
  // `overflow-hidden!` (instead of the Section default `overflow-clip`) on purpose: the left column's
  // `lg:sticky lg:top-[120px]` is NOT inert today. This section is a (never-scrolling) scroll container, so the
  // sticky offset resolves against it and parks the column at the bottom of its slack (29px at 1280-1440x900,
  // 71px at 1024x768, 0 at 1920x1080). Under `overflow-clip` it would bind to the window instead and either
  // drift (sticky) or sit that many px higher (static): a visible change. No ParallaxFrame lives in this
  // section, so the `view()` timelines elsewhere are unaffected.
  return (
    <Section id={ID.aboutMeSection} anchor={ANCHOR.aboutMe} tone="cream" fit="grow" pad="section" seam className="overflow-hidden!">
      <Container maxWidth="2xl" gutter="wide" className="relative z-10">
        <div className="flex flex-col gap-[48px] lg:flex-row lg:items-start lg:gap-[clamp(40px,6vw,80px)]">

          {/* Right Column: Narrative Text */}
          <div className="w-full lg:w-[60%] flex flex-col gap-[28px]">
            
            {/* Title (NS-54: the clinic armchair as a marker beside it, same row) */}
            <ScrollReveal>
              <SectionTitle id={ID.aboutMeTitle} marker={<LineArt name="chair" marker />}>קצת עלי</SectionTitle>
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
              <Photo
                src={PROFILE_PHOTO}
                alt={SITE.name}
                sizes="(max-width: 1024px) 320px, 320px"
                radius="card"
                ratio="4/3"
                outlined
                objectPosition="50% 35%"
                className="w-full max-w-[320px] shadow-[0_16px_30px_-15px_rgba(122,89,120,0.3)]"
              />
            </ScrollReveal>

            {/* Quote Block & Signature */}
            <div className="flex flex-col gap-[16px] relative mt-[8px]">
              <ScrollReveal delay={0.28} className="absolute -top-[24px] start-0">
                <img // eslint-disable-line @next/next/no-img-element -- decorative SVG quote mark; next/image does not optimise SVG
                  src={`${QUOTE_ICON}?v=2`}
                  alt=""
                  aria-hidden="true"
                  width={71}
                  height={40}
                  loading="lazy"
                  className="w-[clamp(28px,3.5vw,40px)] h-auto"
                />
              </ScrollReveal>

              <ScrollReveal delay={0.36} className="relative z-10 pt-[12px] ps-[16px]">
                <QuoteBlock
                  lines={BIO_QUOTE_LINES}
                />
              </ScrollReveal>

              <ScrollReveal className="relative z-10 pt-[8px] ps-[16px]">
                <Signature />
              </ScrollReveal>
            </div>

          </div>

        </div>
      </Container>
    </Section>
  );
}
