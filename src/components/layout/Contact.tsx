import Image from 'next/image';
import { ScrollReveal } from '../ui/ScrollReveal';
import { SocialLinks } from './contact/SocialLinks';
import { ContactDetails } from './contact/ContactDetails';
import { MapEmbed } from './contact/MapEmbed';
import { SectionTitle } from "../ui/SectionTitle";

// ─── Content ────────────────────────────────────────────────────────────────
const SOCIAL_HEADING = 'עקבו אחריי';
const SOCIAL_BODY_START = 'בואו נשמור על קשר גם ברשתות החברתיות. שם אני משתפת תובנות, כלים ומחשבות על ';
const SOCIAL_BODY_BOLD = 'זוגיות, הורות';
const SOCIAL_BODY_END = ' וצמיחה אישית.';

const OFFICE_HEADING = 'המשרד שלי';
const OFFICE_BODY_START = 'קליניקה נעימה ובטוחה, מרחב שבו תרגישו ';
const OFFICE_BODY_BOLD = 'עטופים, מובנים';
const OFFICE_BODY_END = ' ומקובלים.';

const ADDRESS_STRONG = 'שביל המוביל, כפר יעבץ';
const ADDRESS_LABEL = 'הגיעו אלי';
const PHONE = '+972 54-571-1060';
const PHONE_LABEL = 'התקשרו אלי היום';
const EMAIL = 'INFO@YOURWEBSITE.COM';
const EMAIL_LABEL = 'שלחו לי אימייל';

export default function Contact() {
  return (
    <>
      {/* ── Anchor ────────────────────────────────────────────────────────── */}
      <div id="contact" className="invisible h-0" />

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 1 — Follow me on social
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="contact-social"
        dir="rtl"
        data-bg-tone="mid"
        className="py-[80px] px-[24px]"
      >
        <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-[48px] lg:flex-row lg:items-center lg:gap-[64px]">

          {/* Heading on mobile — shown above photos only on small screens */}
          <div className="flex flex-col gap-[24px] text-right lg:hidden">
            <ScrollReveal delay={0}>
              <SectionTitle id="ZgJbejfHoeBrgmf7-mobile" onDark>{SOCIAL_HEADING}</SectionTitle>
            </ScrollReveal>
          </div>

          {/* Photo mosaic grid — mosaic of 3 portraits */}
          {/*
            Desktop layout (RTL mirrored from template):
              Col 1 (right, wider): photo1 top + photo2 bottom (stacked)
              Col 2 (left, narrower): photo3 spanning both rows (tall portrait)
            Mobile: single-column stack of all 3 photos
          */}
          <ScrollReveal delay={0} className="w-full lg:w-[55%] shrink-0">
            {/* Mobile: simple vertical stack */}
            <div className="flex flex-col gap-[16px] lg:hidden">
              <div className="relative overflow-hidden aspect-[4/5] w-full">
                <Image
                  src="/images/cd66a766bd49488df6445af5e15baf9d.jpg"
                  alt="נטע שמש — תמונה מהקליניקה"
                  fill
                  sizes="100vw"
                  className="object-cover object-center"
                />
              </div>
              <div className="relative overflow-hidden aspect-[4/5] w-full">
                <Image
                  src="/images/06156d8b9572da9e8cf4bac79706e046.jpg"
                  alt="נטע שמש בפגישת ייעוץ"
                  fill
                  sizes="100vw"
                  className="object-cover object-[30%_64%]"
                />
              </div>
              <div className="relative overflow-hidden aspect-[2/3] w-full">
                <Image
                  src="/images/cf06e9544f6ebccd5ec2e44960196ab6.jpg"
                  alt="אווירת הקליניקה של נטע שמש"
                  fill
                  sizes="100vw"
                  className="object-cover"
                />
              </div>
            </div>

            {/* Desktop/tablet: 2-column mosaic grid */}
            <div
              className="hidden lg:grid gap-[16px]"
              style={{
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: 'auto auto',
                gridTemplateAreas: '"p1 p3" "p2 p3"',
              }}
            >
              {/* Photo 1 — top of left column */}
              <div
                className="relative overflow-hidden aspect-[4/5]"
                style={{ gridArea: 'p1' }}
              >
                <Image
                  src="/images/cd66a766bd49488df6445af5e15baf9d.jpg"
                  alt="נטע שמש — תמונה מהקליניקה"
                  fill
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  className="object-cover object-center"
                />
              </div>
              {/* Photo 2 — bottom of left column */}
              <div
                className="relative overflow-hidden aspect-[4/5]"
                style={{ gridArea: 'p2' }}
              >
                <Image
                  src="/images/06156d8b9572da9e8cf4bac79706e046.jpg"
                  alt="נטע שמש בפגישת ייעוץ"
                  fill
                  sizes="(max-width: 1024px) 50vw, 28vw"
                  className="object-cover object-[30%_64%]"
                />
              </div>
              {/* Photo 3 — tall portrait spanning full height of right column */}
              <div
                className="relative overflow-hidden"
                style={{ gridArea: 'p3', gridRow: '1 / 3' }}
              >
                <Image
                  src="/images/cf06e9544f6ebccd5ec2e44960196ab6.jpg"
                  alt="אווירת הקליניקה של נטע שמש"
                  fill
                  sizes="(max-width: 768px) 37vw, 21vw"
                  className="object-cover"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Heading + body + social icons — hidden on mobile (heading shown above) */}
          <div className="flex flex-col gap-[24px] text-right h-full lg:flex-1 justify-center">
            <ScrollReveal delay={0.1} className="hidden lg:block">
              <SectionTitle id="ZgJbejfHoeBrgmf7" onDark>{SOCIAL_HEADING}</SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                className="type-lead tracking-[0.012em] font-[family-name:var(--font-stanga)] text-[var(--color-white)]"
              >
                {SOCIAL_BODY_START}
                <strong>{SOCIAL_BODY_BOLD}</strong>
                {SOCIAL_BODY_END}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.3}>
              <SocialLinks />
            </ScrollReveal>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════════════
          PANEL 2 — Office details + map
          Template structure: details col (right in LTR → left in RTL) +
          map col (left in LTR → right in RTL, ~55% width)
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="contact-office"
        dir="rtl"
        data-bg-tone="light"
        className="py-[80px] px-[24px] border-t border-[var(--color-canva-mid)]"
      >
        <div className="max-w-[1100px] mx-auto w-full flex flex-col gap-[48px] lg:flex-row lg:items-stretch lg:gap-[48px]">

          {/* Right col on desktop (first in RTL DOM order): heading + body + contact details */}
          <div className="flex flex-col gap-[24px] text-right lg:w-[40%] shrink-0">
            <ScrollReveal delay={0}>
              <SectionTitle id="zNSWHTotP3XOaXao">{OFFICE_HEADING}</SectionTitle>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p
                className="type-lead tracking-[0.012em] font-[family-name:var(--font-stanga)]"
              >
                {OFFICE_BODY_START}
                <strong>{OFFICE_BODY_BOLD}</strong>
                {OFFICE_BODY_END}
              </p>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <ContactDetails
                phone={PHONE}
                phoneLabel={PHONE_LABEL}
                email={EMAIL}
                emailLabel={EMAIL_LABEL}
                addressStrong={ADDRESS_STRONG}
                addressLabel={ADDRESS_LABEL}
              />
            </ScrollReveal>
          </div>

          {/* Left col on desktop (second in RTL DOM order): map — full width on mobile */}
          <ScrollReveal delay={0.3} className="lg:flex-1 min-h-[300px] lg:min-h-[400px]">
            <MapEmbed className="h-full min-h-[300px] lg:min-h-[400px]" />
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
