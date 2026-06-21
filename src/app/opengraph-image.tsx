import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const runtime = 'nodejs';
export const alt = 'נטע שמש — טיפול זוגי ומשפחתי';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image() {
  const logoData = readFileSync(join(process.cwd(), 'public/images/logo-horizontal-light.png'));
  const logoSrc = `data:image/png;base64,${logoData.toString('base64')}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#574964',
          gap: 32,
          padding: '80px 120px',
        }}
      >
        {/* Soft blob accent */}
        <div
          style={{
            position: 'absolute',
            width: 560,
            height: 460,
            background: '#9F8383',
            opacity: 0.18,
            borderRadius: '42% 58% 55% 45% / 55% 48% 52% 45%',
            top: 80,
            right: 120,
          }}
        />

        {/* Logo */}
        <img
          src={logoSrc}
          width={480}
          height={143}
          style={{ objectFit: 'contain' }}
        />

        {/* Divider */}
        <div style={{ width: 64, height: 2, background: '#C8AAAA', opacity: 0.6, borderRadius: 2 }} />

        {/* Tagline — system Hebrew font fallback, branding is in the logo PNG */}
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 32,
            color: '#C8AAAA',
            letterSpacing: '0.02em',
            direction: 'rtl',
          }}
        >
          טיפול זוגי ומשפחתי
        </div>
      </div>
    ),
    { ...size }
  );
}
