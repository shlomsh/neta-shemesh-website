'use client';

import { useEffect, useRef } from 'react';
import { trackEvent } from '@/lib/analytics';

const READ_TIME_MS = 10_000;

export function BlogAnalytics({ slug }: { slug: string }) {
  const visit = useRef({ slug: '', viewed: false, read: false, elapsed: 0 });

  useEffect(() => {
    if (visit.current.slug !== slug) {
      visit.current = { slug, viewed: false, read: false, elapsed: 0 };
    }
    const state = visit.current;
    const parameters = { article_id: slug };
    if (!state.viewed) {
      trackEvent('blog_view', parameters);
      state.viewed = true;
    }

    let startedAt: number | null = null;
    let timer: ReturnType<typeof setTimeout> | undefined;

    function pause() {
      clearTimeout(timer);
      if (startedAt !== null) {
        state.elapsed += performance.now() - startedAt;
        startedAt = null;
      }
    }

    function resume() {
      if (document.visibilityState !== 'visible' || state.read || startedAt !== null) return;
      startedAt = performance.now();
      timer = setTimeout(() => {
        pause();
        if (state.elapsed >= READ_TIME_MS && document.visibilityState === 'visible') {
          trackEvent('blog_read_10s', parameters);
          state.read = true;
        } else {
          resume();
        }
      }, Math.max(0, READ_TIME_MS - state.elapsed));
    }

    function onVisibilityChange() {
      pause();
      resume();
    }

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('pagehide', pause);
    window.addEventListener('pageshow', resume);
    resume();
    return () => {
      pause();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('pagehide', pause);
      window.removeEventListener('pageshow', resume);
    };
  }, [slug]);

  return null;
}
