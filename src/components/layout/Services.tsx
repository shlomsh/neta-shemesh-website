import { StepCard } from './StepCard';
import { Title } from '../primitives/Title';
import { Prose } from '../primitives/Prose';
import { AnimatedBlock } from '../primitives/AnimatedBlock';

const STEPS = [
  {
    id: 'TJd201kGm4eHaYMB',
    imageSrc: 'images/458a9d55ce04ee5d6ff51c404cdc915a.jpg',
    numberText: '01.',
    title: 'הערכה ראשונית והגדרת מטרות',
    bullets: [
      'הבנת הרקע והקשיים הייחודיים שלכם',
      'הגדרת יעדים זוגיים ברורים לטיפול',
      'יצירת מפת דרכים מותאמת אישית',
    ],
  },
  {
    id: 'VRK89oTUdaytslbw',
    imageSrc: 'images/0cfa79f0cdffa491b0ddde7da08ff582.jpg',
    numberText: '02.',
    title: 'בניית יחסי אמון',
    bullets: [
      'יצירת מרחב בטוח ומכיל עבורכם',
      'הקשבה אמפתית ומקרבת ללא שיפוטיות',
      'ביסוס ביטחון ראשוני בתוך הטיפול',
    ],
  },
  {
    id: 'v0CR4uwM408NRIDy',
    imageSrc: 'images/3d824070dc5563aa93f1a328eea2d93c.jpg',
    numberText: '03.',
    title: 'חקירה והבנה זוגית',
    bullets: [
      'זיהוי דפוסי התקשורת החוזרים שלכם',
      'הבנת הצרכים הרגשיים העמוקים',
      'חשיפת מעגלי הפגיעות והתקיעות',
    ],
  },
  {
    id: 'W36vHDRoyDXumtPZ',
    imageSrc: 'images/2830fcad4852229bcdffb0a37956e095.jpg',
    numberText: '04.',
    title: 'רכישת כלים ויישום',
    bullets: [
      'למידת כלים פרקטיים לתקשורת מקרבת',
      'פתרון קונפליקטים וחיבור מחדש',
      'תרגול ויישום בחיי היומיום שלכם',
    ],
  },
];

export default function Services() {
  return (
    <>
      <div 
        id="page-7"
        
        style={{ "visibility": "hidden" }}
        dangerouslySetInnerHTML={{ __html: `` }}
      />

      <section
        id="cQd2ufFBWvr5c6ki"
        dir="rtl"
        className="relative w-full bg-canva-bg px-5 py-16 sm:py-24 lg:py-32"
      >
        <div className="mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-start lg:gap-16">

          {/* Text column — first in DOM → right side in RTL */}
          <div className="text-right lg:w-[360px] lg:shrink-0">
            <AnimatedBlock animation="cleanFadeUp 800ms 100ms both paused">
              <Title tier="section" onDark={false} text="איך זה עובד?" id="pEc3w8pe4QAw5k7o" spanId="lEBZC8bpB2HUMalg" />
            </AnimatedBlock>

            <AnimatedBlock animation="cleanFadeUp 800ms 250ms both paused" className="mt-6 block">
              <Prose className="text-canva-dark text-[clamp(15px,1.6vw,18px)]" style={{ lineHeight: '1.6', letterSpacing: '0.012em' }}>
                התהליך בקליניקה מבוסס על שלבים מובנים שמאפשרים יצירת קשר בטוח, הבנת שורש הבעיה ורכישת כלים פרקטיים לשינוי.
              </Prose>
            </AnimatedBlock>

            <AnimatedBlock animation="cleanFadeUp 800ms 400ms both paused" className="mt-8 block">
              <a href="#contact" className="inline-flex items-center justify-center bg-canva-mid text-white font-bold py-3.5 px-8 text-[15px] tracking-[0.138em] uppercase">
                צרו קשר
              </a>
            </AnimatedBlock>
          </div>

          {/* Cards — one ordered grid that reflows (1-up → 2-up). Stagger is a
              visual-only translate at sm+, so it never disturbs source order. */}
          <div className="grid flex-1 grid-cols-1 gap-6 sm:grid-cols-2 sm:gap-7">
            {STEPS.map((step, i) => (
              <StepCard
                key={step.id}
                {...step}
                index={i}
                className={i % 2 === 1 ? 'sm:translate-y-12' : ''}
              />
            ))}
          </div>
        </div>
      </section>


      <div id="page-8" />

      <div 
        id="Qh3ZkxvVXI70qfpT"
        className="relative w-full bg-canva-dark py-24 flex flex-col items-center"
      >
        <div className="flex flex-col items-center text-center gap-4 max-w-3xl mx-auto mb-16 px-4">
          <AnimatedBlock animation="cleanFadeUp 800ms 100ms both paused">
            <Title tier="section" onDark={true} text="סיפורי הצלחה" id="eIrsfUtmMjgXi5KA" spanId="qEQsTBBQ8lF4QUSv" />
          </AnimatedBlock>
          
          <AnimatedBlock animation="cleanFadeUp 800ms 250ms both paused">
            <Prose className="text-white text-center">
              הנה כמה זוגות שעברו את התהליך בקליניקה ויצרו מציאות חדשה ומקרבת בחייהם.
            </Prose>
          </AnimatedBlock>
        </div>

        <AnimatedBlock animation="cleanFadeUp 800ms 400ms both paused" className="w-full max-w-5xl px-4">
          <div className="w-full rounded-2xl overflow-hidden shadow-2xl">
            <video 
              src="https://kromaticdesignstudio.my.canva.site/couples-therapist/videos/89bd97854bc9df2d72598489e7d46e4a.mp4" 
              playsInline 
              autoPlay 
              muted 
              controls 
              className="w-full object-cover aspect-video block"
            />
          </div>
        </AnimatedBlock>
      </div>
    </>
  );
}
