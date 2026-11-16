'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { SITE, telHref, waHref } from '@/content/site';
import { trackEvent } from '@/lib/analytics';

export function GoogleAnalytics() {
  useEffect(() => {
    function onContactClick(event: MouseEvent) {
      if (event.type === 'auxclick' && event.button !== 1) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a');
      if (!link) return;

      if (link.href === telHref()) trackEvent('phone_click');
      else if (link.href === new URL(waHref()).href) trackEvent('whatsapp_click');
    }

    // Capture also covers menu links whose own handlers close/unmount the menu.
    document.addEventListener('click', onContactClick, true);
    document.addEventListener('auxclick', onContactClick, true);
    return () => {
      document.removeEventListener('click', onContactClick, true);
      document.removeEventListener('auxclick', onContactClick, true);
    };
  }, []);

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${SITE.ga4MeasurementId}`}
      strategy="afterInteractive"
    />
  );
}
