import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';
// Static export is only enabled when BUILD_STATIC_EXPORT=true (used for Azure
// Static Web Apps). Vercel builds without this env, keeping full SSR/image support.
const isStaticExport = process.env.BUILD_STATIC_EXPORT === 'true';

const nextConfig: NextConfig = {
  ...(isStaticExport ? { output: 'export' as const } : {}),
  // Kept as one conditional key rather than folded into the spread above: a
  // second `images` key after the spread would silently override it and break
  // the static export.
  //
  // Static export has no optimizer, so images ship as-is. Everywhere else,
  // offer AVIF ahead of WebP — Next's default is WebP-only, and measurement
  // against production showed AVIF was never being served.
  images: isStaticExport
    ? { unoptimized: true }
    : { formats: ['image/avif' as const, 'image/webp' as const] },
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

