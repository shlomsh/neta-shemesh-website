import { Title } from '../primitives/Title';
import { Prose } from '../primitives/Prose';
import { ScrollReveal } from '../ui/ScrollReveal';
import StepCard from './StepCard';

/**
 * Services — ground-up rebuild.
 *
 * Band A: "איך זה עובד?" — dark band, right text column + 2×2 step-card grid.
 * Band B: "סיפורי הצלחה" — dark band, centered heading + intro + video.
 *
 * Zero Tailwind rem utilities. All spacing in px/clamp/%.
 * No AnimatedBlock, no cleanFadeUp. Reveal via ScrollReveal (framer-motion whileInView).
 */

const STEPS = [
  {
    step: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
    imageSrc: '/images/458a9d55ce04ee5d6ff51c404cdc915a.jpg',
    imageObjectPosition: '50% 50%',
  },
  {
    step: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
    imageSrc: '/images/0cfa79f0cdffa491b0ddde7da08ff582.jpg',
    imageObjectPosition: '50% 50%',
  },
  {
    step: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
    imageSrc: '/images/3d824070dc5563aa93f1a328eea2d93c.jpg',
    imageObjectPosition: '50% 50%',
  },
  {
    step: '04.',
    title: 'רכישת כלים ויישום',
    bullets: [
      'למידת כלים פרקטיים לתקשורת מקרבת',
      'פתרון קונפליקטים וחיבור מחדש',
      'תרגול ויישום בחיי היומיום שלכם',
    ],
    imageSrc: '/images/2830fcad4852229bcdffb0a37956e095.jpg',
    imageObjectPosition: '58.27% 50%',
  },
];

export default function Services() {
  return (
    <>
      {/* Anchor for nav / scroll */}
      <div id="page-7" style={{ visibility: 'hidden' }} />

      {/* ── Band A: "איך זה עובד?" ── */}
      <section
        id="gpx6IiJoZn830NIC"
        style={{
          backgroundColor: 'var(--color-dark)',
          direction: 'rtl',
          padding: 'clamp(48px, 6vw, 102px) clamp(16px, 4vw, 64px)',
        }}
      >
        <div
          style={{
            maxWidth: '922px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'row-reverse', /* RTL: text on right, cards on left */
            gap: 'clamp(24px, 4vw, 51px)',
            alignItems: 'flex-start',
          }}
        >
          {/* ── Right column: heading + intro + CTA ── */}
          <div
            id="cQd2ufFBWvr5c6ki"
            style={{
              flex: '0 0 clamp(220px, 30%, 360px)',
              display: 'flex',
              flexDirection: 'column',
              gap: '19px',
              paddingTop: '8px',
            }}
          >
            <ScrollReveal delay={0.1}>
              <Title
                tier="section"
                onDark={true}
                id="pEc3w8pe4QAw5k7o"
                spanId="lEBZC8bpB2HUMalg"
                text="איך זה עובד?"
                style={{
                  direction: 'rtl',
                  fontFamily: 'var(--font-canva-secondary)',
                  margin: 0,
                  textTransform: 'none',
                }}
              />
            </ScrollReveal>

            <ScrollReveal delay={0.25}>
              <Prose
                style={{
                  color: 'var(--color-white)',
                  fontFamily: 'var(--font-canva-primary)',
                  lineHeight: '1.45312727em',
                  letterSpacing: '0.012em',
                  margin: 0,
                }}
              >
                <span style={{ color: 'var(--color-white)' }}>
                  התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי.
                </span>
              </Prose>
            </ScrollReveal>

            {/* CTA Button */}
            <ScrollReveal delay={0.4}>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                {/* Brand-primary background shape */}
                <svg
                  viewBox="0 0 247.1248 53.7725"
                  preserveAspectRatio="none"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    width: '100%',
                    height: '100%',
                    opacity: 0.75,
                    zIndex: 0,
                  }}
                >
                  <path
                    d="M247.12484693,0 L247.12484693,1 L247.12484693,52.77252489 L247.12484693,53.77252489 L246.12484693,53.77252489 L1,53.77252489 L0,53.77252489 L0,52.77252489 L0,1 L0,0 L1,0 L246.12484693,0 L247.12484693,0 Z"
                    style={{ fill: 'var(--color-brand-primary)', opacity: 1 }}
                  />
                </svg>
                <p
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    margin: 0,
                    padding: '11px 26px',
                    fontFamily: 'var(--font-canva-primary)',
                    lineHeight: '1.375em',
                    textAlign: 'center',
                    textTransform: 'uppercase',
                    letterSpacing: '0.138em',
                    direction: 'rtl',
                    color: 'var(--color-white)',
                  }}
                >
                  <a
                    href="#contact"
                    style={{
                      color: 'var(--color-white)',
                      fontWeight: 700,
                      textDecoration: 'none',
                      pointerEvents: 'all',
                    }}
                    target="_self"
                  >
                    צרו קשר
                  </a>
                </p>
              </div>
            </ScrollReveal>
          </div>

          {/* ── Left columns: 2×2 step-card grid ── */}
          <div
            style={{
              flex: '1 1 0',
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: 'clamp(12px, 2vw, 38px)',
            }}
          >
            {STEPS.map((s, i) => (
              <StepCard
                key={s.step}
                {...s}
                delay={0.1 + i * 0.15}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Page divider anchor */}
      <div id="page-8" style={{ visibility: 'hidden' }} />

      {/* ── Band B: "סיפורי הצלחה" ── */}
      <section
        id="Qh3ZkxvVXI70qfpT"
        style={{
          backgroundColor: 'var(--color-dark)',
          direction: 'rtl',
          padding: 'clamp(48px, 6vw, 77px) clamp(16px, 4vw, 64px)',
          marginTop: '-1px', /* flush join between bands */
        }}
      >
        <div
          style={{
            maxWidth: '819px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '19px',
          }}
        >
          <ScrollReveal delay={0.1}>
            <Title
              tier="section"
              onDark={true}
              id="eIrsfUtmMjgXi5KA"
              spanId="qEQsTBBQ8lF4QUSv"
              text="סיפורי הצלחה"
              style={{
                direction: 'rtl',
                fontFamily: 'var(--font-canva-secondary)',
                margin: 0,
                textAlign: 'center',
                textTransform: 'none',
              }}
            />
          </ScrollReveal>

          <ScrollReveal delay={0.25}>
            <Prose
              style={{
                color: 'var(--color-white)',
                direction: 'rtl',
                fontFamily: 'var(--font-canva-primary)',
                lineHeight: '1.45312727em',
                textAlign: 'center',
                textTransform: 'none',
                letterSpacing: '0.012em',
                margin: 0,
              }}
            >
              <span style={{ color: 'var(--color-white)' }}>
                הנה כמה זוגות שעברו את התהליך בקליניקה ויצרו מציאות חדשה ומקרבת בחייהם.
              </span>
            </Prose>
          </ScrollReveal>

          {/* Video */}
          <ScrollReveal delay={0.4} className="services-video-wrap">
            <div
              id="nej5ZbJ15K1HDR7j"
              style={{
                position: 'relative',
                width: '100%',
                paddingTop: '57%',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                }}
              >
                <div
                  className="video_container"
                  style={{
                    width: '100%',
                    height: '100%',
                    overflow: 'hidden',
                    position: 'relative',
                  }}
                >
                  <video
                    src="https://kromaticdesignstudio.my.canva.site/couples-therapist/videos/89bd97854bc9df2d72598489e7d46e4a.mp4"
                    playsInline
                    preload="none"
                    autoPlay
                    muted
                    controls
                    style={{
                      width: '100%',
                      height: '100%',
                      display: 'block',
                      objectFit: 'cover',
                    }}
                  />
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </>
  );
}
