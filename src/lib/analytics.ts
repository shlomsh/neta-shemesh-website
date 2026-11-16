import { SITE } from '@/content/site';

type AnalyticsEvent = 'phone_click' | 'whatsapp_click' | 'blog_view' | 'blog_read_10s';

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (command: 'event', event: AnalyticsEvent, parameters: Record<string, string | number>) => void;
  }
}

// Server-side build guard: previews and local runs must not send real visitor events.
export const GOOGLE_ANALYTICS_ENABLED = process.env.VERCEL_ENV === 'production';

export function trackEvent(event: AnalyticsEvent, parameters: Record<string, string | number> = {}) {
  // The root layout installs the queue before hydration, only on production builds.
  window.gtag?.('event', event, {
    send_to: SITE.ga4MeasurementId,
    page_path: window.location.pathname,
    ...parameters,
  });
}
