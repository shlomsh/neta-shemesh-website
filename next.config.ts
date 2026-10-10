import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';

const nextConfig: NextConfig = {
  // Stop `next dev` writing its "read node_modules/next/dist/docs/" block into AGENTS.md (it made
  // every agent crawl a 4.3 MB docs folder). With this off, Next only strips that managed block and
  // never creates the file (node_modules/next/dist/server/lib/generate-agent-files.js). CLAUDE.md says
  // to read only the one guide for the API being touched.
  agentRules: false,
  // Inline the (small) CSS into the HTML: removes the render-blocking stylesheet requests and lets
  // the font files be discovered from the document itself. Lighthouse mobile showed ~850 ms of
  // render blocking from two chunks (13 KiB + 1.5 KiB); with real throttling (devtools, mobile) FCP/LCP went
  // 1.58 s -> 0.85 s locally. Cross-page CSS caching is moot on a 4-page site.
  experimental: { inlineCss: true },
  // Offer AVIF ahead of WebP — Next's default is WebP-only, and measurement
  // against production showed AVIF was never being served.
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allowed `quality` values: 75 is Next's default, 84 is PHOTO_QUALITY, 96 is PHOTO_QUALITY_DETAIL (src/lib/image-quality.ts;
    // keep the two in step: next.config.ts cannot use the `@/` alias).
    qualities: [75, 84, 96],
  },
  async redirects() {
    return [
      {
        source: "/index.html",
        destination: "/",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/images/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=604800, stale-while-revalidate=86400' },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data:",
              "font-src 'self' https://fonts.gstatic.com",
              "frame-src 'self' https://maps.google.com https://www.google.com https://*.google.com",
              "frame-ancestors 'none'",
              "media-src 'self'",
              "connect-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;

