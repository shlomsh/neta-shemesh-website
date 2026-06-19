import { ScrollReveal } from '../ui/ScrollReveal';
import { SocialLinks } from './contact/SocialLinks';
import { ContactDetails } from './contact/ContactDetails';
import { MapEmbed } from './contact/MapEmbed';
import { ContactForm } from './contact/ContactForm';

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
const PHONE = '(232) 000-8888';
const PHONE_LABEL = 'התקשרו אלי היום';
const EMAIL = 'INFO@YOURWEBSITE.COM';
const EMAIL_LABEL = 'שלחו לי אימייל';

// ─── Images (photo grid in social section) ───────────────────────────────────
const PHOTOS = [
  { src: '/images/cd66a766bd49488df6445af5e15baf9d.jpg', className: 'col-span-1 row-span-1' },
  { src: '/images/06156d8b9572da9e8cf4bac79706e046.jpg', className: 'col-span-1 row-span-1' },
  {
    src: '/images/cf06e9544f6ebccd5ec2e44960196ab6.jpg',
    srcSet: '/images/21b39277211129c0ca3e465e0f913219.jpg 534w, /images/cf06e9544f6ebccd5ec2e44960196ab6.jpg 801w',
    sizes: '(max-width: 375px) 76vw, (max-width: 768px) 37vw, 21vw',
    className: 'col-span-1 row-span-2',
  },
];

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
        className="bg-[var(--color-dark)] py-[80px] px-[24px]"
      >
        <div className="max-w-[1100px] mx-auto flex flex-col gap-[48px] lg:flex-row lg:items-center lg:gap-[64px]">

          {/* Left col on desktop: photo grid */}
          <ScrollReveal delay={0} className="w-full lg:w-[55%] shrink-0">
            <div className="grid grid-cols-2 grid-rows-2 gap-[12px]">
              {/* top-right portrait */}
              <div className="rounded-[8px] overflow-hidden aspect-[4/3]">
                <img
                  src="/images/cd66a766bd49488df6445af5e15baf9d.jpg"
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
              {/* top-left portrait */}
              <div className="rounded-[8px] overflow-hidden aspect-[4/3]">
                <img
                  src="/images/06156d8b9572da9e8cf4bac79706e046.jpg"
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover object-[30%_64%]"
                />
              </div>
              {/* bottom spanning portrait */}
              <div className="col-span-2 rounded-[8px] overflow-hidden aspect-[2/1]">
                <img
                  src="/images/cf06e9544f6ebccd5ec2e44960196ab6.jpg"
                  srcSet="/images/21b39277211129c0ca3e465e0f913219.jpg 534w, /images/cf06e9544f6ebccd5ec2e44960196ab6.jpg 801w"
                  sizes="(max-width: 375px) 76vw, (max-width: 768px) 37vw, 21vw"
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </ScrollReveal>

          {/* Right col on desktop: heading + body + social icons */}
          <div className="flex flex-col gap-[24px] text-right">
            <ScrollReveal delay={0.1}>
              <h2
                id="ZgJbejfHoeBrgmf7"
                className="section-header on-dark"
              >
                {SOCIAL_HEADING}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <p
                className="leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-canva-primary)] text-[var(--color-white)]"
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
          PANEL 2 — Office details + map + contact form
      ══════════════════════════════════════════════════════════════════════ */}
      <section
        id="contact-office"
        dir="rtl"
        className="bg-[var(--color-dark)] py-[80px] px-[24px] border-t border-[#5c4d5c]"
      >
        <div className="max-w-[1100px] mx-auto flex flex-col gap-[48px] lg:flex-row lg:gap-[64px]">

          {/* Right col on desktop: heading + body + details */}
          <div className="flex flex-col gap-[24px] text-right lg:w-[45%] shrink-0">
            <ScrollReveal delay={0}>
              <h2
                id="zNSWHTotP3XOaXao"
                className="section-header on-dark"
              >
                {OFFICE_HEADING}
              </h2>
            </ScrollReveal>

            <ScrollReveal delay={0.1}>
              <p
                className="leading-[1.45] tracking-[0.012em] font-[family-name:var(--font-canva-primary)] text-[var(--color-white)]"
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

            {/* Map — full width on mobile, inside detail col on desktop */}
            <ScrollReveal delay={0.3}>
              <MapEmbed />
            </ScrollReveal>
          </div>

          {/* Left col on desktop: contact form */}
          <div className="flex flex-col gap-[24px] lg:flex-1">
            <ScrollReveal delay={0.1}>
              <h3
                className="text-right text-[var(--color-white)] font-[family-name:var(--font-canva-secondary)]"
              >
                שלחו הודעה
              </h3>
            </ScrollReveal>

            <ScrollReveal delay={0.2}>
              <ContactForm />
            </ScrollReveal>
          </div>
        </div>
      </section>
    </>
  );
}
