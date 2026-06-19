'use client';

import { ScrollReveal } from '../../ui/ScrollReveal';

const VIDEO_SRC =
  'https://kromaticdesignstudio.my.canva.site/couples-therapist/videos/89bd97854bc9df2d72598489e7d46e4a.mp4';

export function SuccessStories() {
  return (
    <div
      id="Qh3ZkxvVXI70qfpT"
      className="relative w-full bg-canva-dark py-[96px] flex flex-col items-center"
    >
      <div className="flex flex-col items-center text-center gap-[16px] max-w-[768px] mx-auto mb-[64px] px-[16px]">
        <ScrollReveal delay={0.1}>
          <h2
            id="eIrsfUtmMjgXi5KA"
            className="font-[family-name:var(--font-canva-accent)] text-[clamp(32px,5vw,56px)] font-normal leading-tight text-white"
          >
            <span>סיפורי הצלחה</span>
          </h2>
        </ScrollReveal>

        <ScrollReveal delay={0.25}>
          <p className="text-white/90 text-[clamp(15px,1.6vw,18px)] leading-[1.6] tracking-[0.012em]">
            הנה כמה זוגות שעברו את התהליך בקליניקה ויצרו מציאות חדשה ומקרבת בחייהם.
          </p>
        </ScrollReveal>
      </div>

      <ScrollReveal delay={0.4} className="w-full max-w-[960px] px-[16px]">
        <div className="w-full rounded-[16px] overflow-hidden shadow-2xl">
          <video
            src={VIDEO_SRC}
            playsInline
            autoPlay
            muted
            controls
            className="w-full object-cover aspect-video block"
          />
        </div>
      </ScrollReveal>
    </div>
  );
}
