'use client';

import { useEffect, useRef } from 'react';
import { ANCHOR, ID } from '@/content/ids';
import { trackEvent } from '@/lib/analytics';

export function HomeSectionAnalytics() {
  const seen = useRef(new Set<string>());

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sections = new Map<Element, string>();
    const main = document.getElementById(ID.main);
    for (const section of main?.querySelectorAll(':scope > section, :scope > footer') ?? []) {
      const id = section.id || (
        section.tagName === 'FOOTER' ? 'footer' :
        section.querySelector(`#${ID.expertiseTitle}`) ? ANCHOR.expertise : ''
      );
      if (id) sections.set(section, id);
    }

    const visited = seen.current;
    let observer: IntersectionObserver | undefined;

    function observeCenter() {
      observer?.disconnect();
      observer = undefined;
      const height = document.documentElement.clientHeight;
      if (document.visibilityState !== 'visible' || height === 0 || visited.size === sections.size) return;

      // Intersect a one-pixel band at mid-screen, so even a very tall section can qualify.
      const center = Math.floor(height / 2);
      observer = new IntersectionObserver((entries, current) => {
        if (current !== observer || document.visibilityState !== 'visible') return;
        for (const entry of entries) {
          const id = sections.get(entry.target);
          if (!entry.isIntersecting || !id || visited.has(id)) continue;
          visited.add(id);
          current.unobserve(entry.target);
          trackEvent('home_section_view', { section_id: id });
        }
      }, { rootMargin: `-${center}px 0px -${height - center - 1}px 0px` });

      for (const [section, id] of sections) {
        if (!visited.has(id)) observer.observe(section);
      }
    }

    observeCenter();
    window.addEventListener('resize', observeCenter);
    document.addEventListener('visibilitychange', observeCenter);
    return () => {
      observer?.disconnect();
      observer = undefined;
      window.removeEventListener('resize', observeCenter);
      document.removeEventListener('visibilitychange', observeCenter);
    };
  }, []);

  return null;
}
