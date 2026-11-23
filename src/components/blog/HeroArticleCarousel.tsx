'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/primitives/layout/Card';
import { ButtonLink } from '@/components/primitives/ui/ButtonLink';
import { IconButton } from '@/components/primitives/ui/IconButton';
import { Photo } from '@/components/primitives/ui/Photo';
import styles from './HeroArticleCarousel.module.css';

type Slide = {
  href: string;
  cover: string;
  alt: string;
  readTime: string;
  hook: string;
  text: string;
};

type Props = {
  slides: readonly Slide[];
  eyebrow: string;
  label: string;
  all: string;
  previous: string;
  next: string;
  pause: string;
  play: string;
};

export function HeroArticleCarousel({ slides, eyebrow, label, all, previous, next, pause, play }: Props) {
  const [position, setPosition] = useState({ index: 0, outgoing: -1, step: 1 });
  const [paused, setPaused] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const total = slides.length;
  const { index, outgoing, step } = position;
  const current = slides[index];

  function advance(step: number) {
    setPosition(({ index }) => ({ index: (index + step + total) % total, outgoing: index, step }));
  }

  useEffect(() => {
    if (paused || hovered || focused || total < 2) return;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let timer: number | undefined;
    function schedule() {
      window.clearTimeout(timer);
      if (!motion.matches && document.visibilityState === 'visible') {
        timer = window.setTimeout(() => {
          setPosition(({ index }) => ({ index: (index + 1) % total, outgoing: index, step: 1 }));
        }, 5_000);
      }
    }
    schedule();
    motion.addEventListener('change', schedule);
    document.addEventListener('visibilitychange', schedule);
    return () => {
      window.clearTimeout(timer);
      motion.removeEventListener('change', schedule);
      document.removeEventListener('visibilitychange', schedule);
    };
  }, [index, paused, hovered, focused, total]);

  if (!current) return null;

  return (
    <Card
      surface="cream"
      pad="md"
      role="region"
      aria-label={eyebrow}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setFocused(false);
      }}
      className="mx-auto flex max-w-lg flex-col gap-2 border border-plum/25 shadow-lift max-lg:w-full max-lg:p-3!"
    >
      <span className="type-eyebrow max-sm:[@media(max-height:725px)]:hidden">{eyebrow}</span>
      <p className="type-small max-sm:[@media(max-height:725px)]:hidden">{label}</p>
      <div className="grid overflow-clip" aria-live={paused || focused || hovered ? 'polite' : 'off'} aria-atomic="true">
        {slides.map((slide, i) => {
          const active = i === index;
          const motionClass = active
            ? outgoing === -1 ? '' : step > 0 ? styles.enterNext : styles.enterPrevious
            : i === outgoing ? step > 0 ? styles.exitNext : styles.exitPrevious : 'invisible';
          return (
            <div key={slide.href} aria-hidden={!active} inert={!active} className={`col-start-1 row-start-1 flex min-w-0 items-start gap-3 ${motionClass}`}>
              <Photo src={slide.cover} alt={slide.alt} radius="tile" ratio="square" sizes="(min-width: 1024px) 96px, 64px" loading={i === 0 ? 'eager' : undefined} className="w-16 shrink-0 lg:w-24" />
              <div className="min-w-0">
                <h2 className="type-card-title font-bold">
                  <Link href={slide.href} className="rounded-sm underline decoration-plum/45 underline-offset-4 focus-ring focus-visible:ring-inset focus-visible:ring-plum">
                    {slide.hook}
                  </Link>
                </h2>
                <p className="type-lead max-sm:[@media(max-height:725px)]:hidden">{slide.text}</p>
                <p className="type-small">{slide.readTime}</p>
              </div>
            </div>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <ButtonLink size="sm" href="/blog">{all}</ButtonLink>
        {total > 1 && (
          <div className="flex items-center">
            <IconButton label={previous} className="focus-visible:outline-2 focus-visible:outline-plum" onClick={() => advance(-1)}>
              <svg aria-hidden="true" className="text-plum" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 5 7 7-7 7" /></svg>
            </IconButton>
            <IconButton label={paused ? play : pause} className="focus-visible:outline-2 focus-visible:outline-plum motion-reduce:hidden!" onClick={() => setPaused(!paused)}>
              <svg aria-hidden="true" className="text-plum" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={paused ? 'M8 5v14l11-7Z' : 'M9 5v14m6-14v14'} /></svg>
            </IconButton>
            <IconButton label={next} className="focus-visible:outline-2 focus-visible:outline-plum" onClick={() => advance(1)}>
              <svg aria-hidden="true" className="text-plum" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 5-7 7 7 7" /></svg>
            </IconButton>
          </div>
        )}
      </div>
    </Card>
  );
}
