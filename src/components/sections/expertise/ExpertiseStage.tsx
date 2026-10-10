'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { Photo } from '@/components/primitives/ui/Photo';
import { cx } from '@/lib/cx';
import { ID } from '@/content/ids';
import type { ExpertiseCardData } from '@/content/types';

interface ExpertiseStageProps {
  items: ExpertiseCardData[];
}

/** Hover-intent delay (ms): a pointer passing over a name on its way elsewhere does not flip the stage. */
const HOVER_INTENT_MS = 70;

/**
 * The Expertise editorial stage (NS-52): four names set large in Elamy down the start side, one big photo
 * on the other side that crossfades to the active name's image, and the active name's description opening
 * under it. A disclosure list (button `aria-expanded` + `aria-controls` -> a labelled region), not a tablist:
 * the description has to sit under its own name, and a tabpanel may not live inside a tablist.
 *
 * Input: hover (fine pointer), focus (keyboard) and click/tap all activate; ArrowUp/ArrowDown/Home/End move
 * focus between the names. The first item is active in the server HTML, so no-JS and first paint are complete.
 * Motion is CSS only (crossfade + grid-rows reveal) and switched off under `prefers-reduced-motion`.
 * The photos are decorative copies of the names (aria-hidden, alt=""): the names and descriptions carry the content.
 */
export function ExpertiseStage({ items }: ExpertiseStageProps) {
  const uid = useId();
  const [active, setActive] = useState(0);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastPointer = useRef<{ x: number; y: number } | null>(null);
  const buttons = useRef<Array<HTMLButtonElement | null>>([]);

  const clearHover = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };
  // A pending hover-intent flip must not fire after unmount.
  useEffect(
    () => () => {
      if (hoverTimer.current) clearTimeout(hoverTimer.current);
    },
    [],
  );
  const onEnter = (i: number) => {
    clearHover();
    if (i === active) return;
    hoverTimer.current = setTimeout(() => setActive(i), HOVER_INTENT_MS);
  };
  const onKeyDown = (e: React.KeyboardEvent, i: number) => {
    const last = items.length - 1;
    const next = e.key === 'ArrowDown' ? (i === last ? 0 : i + 1) : e.key === 'ArrowUp' ? (i === 0 ? last : i - 1) : e.key === 'Home' ? 0 : e.key === 'End' ? last : null;
    if (next === null) return;
    e.preventDefault();
    buttons.current[next]?.focus();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] gap-region items-stretch w-full max-w-[75rem] mx-auto lg:flex-1 lg:min-h-80">
      {/* Names: first in the DOM so reading order and Tab order start here; at lg this is the start (right, RTL) column. On phones each photo opens inside its own panel. */}
      <div role="group" aria-labelledby={ID.expertiseTitle} className="order-2 lg:order-1 flex flex-col justify-center gap-1 lg:gap-2">
        {items.map((item, i) => {
          const isActive = i === active;
          const buttonId = `${uid}-tab-${i}`;
          const panelId = `${uid}-panel-${i}`;
          return (
            <div key={item.slug} className="relative">
              {/* Active marker: a decorative mauve bar on the start edge (no text on mauve). */}
              <span
                aria-hidden="true"
                className={cx(
                  'absolute start-0 top-3 bottom-3 w-1 rounded-full bg-mauve origin-center transition-[transform,opacity] duration-300 motion-reduce:transition-none',
                  isActive ? 'scale-y-100 opacity-100' : 'scale-y-0 opacity-0',
                )}
              />
              <button
                ref={(el) => {
                  buttons.current[i] = el;
                }}
                type="button"
                id={buttonId}
                aria-expanded={isActive}
                aria-controls={panelId}
                onFocus={() => {
                  clearHover();
                  setActive(i);
                }}
                onClick={() => {
                  clearHover();
                  setActive(i);
                }}
                onMouseMove={(e) => {
                  // Real pointer movement only: when the stage re-flows under a resting pointer the browser replays
                  // synthetic mouse events with no movement, which would otherwise cascade through the names.
                  const last = lastPointer.current;
                  lastPointer.current = { x: e.clientX, y: e.clientY };
                  if (!last || last.x !== e.clientX || last.y !== e.clientY) onEnter(i);
                }}
                onMouseLeave={clearHover}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="block w-full text-start ps-5 py-2 rounded-tile cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-plum"
              >
                <span className="type-title font-normal [letter-spacing:normal] block transition-transform duration-300 motion-reduce:transition-none">
                  {item.title}
                </span>
              </button>
              <div
                id={panelId}
                role="region"
                aria-labelledby={buttonId}
                className={cx(
                  'grid transition-[grid-template-rows,visibility] duration-400 ease-out motion-reduce:transition-none',
                  isActive ? 'grid-rows-[1fr] visible' : 'grid-rows-[0fr] invisible',
                )}
              >
                <div className="overflow-hidden min-h-0">
                  {/* Blush section (plum = 3.89:1, AA large only): the description must stay at the quote scale (>=24px). */}
                  <p className="type-quote max-w-prose ps-5 pt-1 pb-3">{item.description}</p>
                  {/* Phones: the photo travels with its own name (the shared stage below is lg+ only). */}
                  <div aria-hidden="true" className="lg:hidden ps-5 pb-3">
                    <Photo src={item.imageSrc} alt="" sizes="100vw" radius="card" ratio="4/3" className="w-full shadow-xl" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Photo stage: all four stacked, the active one opaque. lg+ only, height-driven (grid cell). */}
      <div
        aria-hidden="true"
        className="hidden lg:block lg:order-2 relative overflow-hidden rounded-card safari-clip shadow-2xl bg-plum lg:min-h-0"
      >
        {items.map((item, i) => (
          <div
            key={item.slug}
            className={cx(
              'absolute inset-0 transition-opacity duration-500 ease-in-out motion-reduce:transition-none',
              i === active ? 'opacity-100' : 'opacity-0',
            )}
          >
            <Photo src={item.imageSrc} alt="" sizes="(min-width: 1024px) 46vw, 100vw" radius="none" className="w-full h-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
