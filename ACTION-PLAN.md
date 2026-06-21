# SEO Action Plan — נטע שמש
**Generated:** 2026-06-21  
**Site:** https://nettashemesh.vercel.app  
**Current score:** 36/100 → **Target after Critical fixes: ~65/100**

---

## CRITICAL — Fix immediately (blocks trust & indexing)

### C1 — Replace all placeholder contact & social data
**Effort:** 15 min | **Impact:** Trust, local SEO, click-through, real conversions

Replace in `src/components/layout/Contact.tsx`:
```tsx
const PHONE = '(232) 000-8888'     // → Netta's real number
const EMAIL = 'INFO@YOURWEBSITE.COM' // → Netta's real email
```

Replace in `src/components/layout/contact/SocialLinks.tsx`:
```tsx
{ href: 'https://facebook.com', ... }    // → https://facebook.com/[real-page]
{ href: 'https://instagram.com', ... }   // → https://instagram.com/[real-handle]
```

Also fix the Hero CTA tel links in `HeroCTA.tsx` / `HeroSubtext.tsx` (found `tel:+01234567890` and `tel:+012345678`).

---

### C2 — Replace Lorem Ipsum testimonials with real ones
**Effort:** 30 min (content) + 10 min (code) | **Impact:** E-E-A-T, conversion rate, Review schema eligibility

In `src/components/layout/Testimonials.tsx`, replace all 3 `quote` strings and the `name`/`role` values with real client testimonials. Use initials or first names if full names aren't available. The existing structure handles everything — content is the only blocker.

---

### C3 — Add meta description
**Effort:** 5 min | **Impact:** Click-through rate from search results

In `src/app/layout.tsx`:
```tsx
export const metadata: Metadata = {
  metadataBase: new URL('https://nettashemesh.vercel.app'),
  title: 'נטע שמש | טיפול זוגי ומשפחתי — כפר יעבץ',
  description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ. ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קבעו פגישת ייעוץ ראשונה עוד היום.',
};
```

---

### C4 — Create robots.txt
**Effort:** 5 min | **Impact:** Crawler guidance, sitemap discovery

Create `/public/robots.txt`:
```
User-agent: *
Allow: /

Sitemap: https://nettashemesh.vercel.app/sitemap.xml
```

---

### C5 — Create sitemap.xml
**Effort:** 15 min | **Impact:** URL discovery, indexation speed

Create `/src/app/sitemap.ts` (Next.js auto-serves at `/sitemap.xml`):
```ts
import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://nettashemesh.vercel.app',
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
  ];
}
```

---

### C6 — Add LocalBusiness + Person JSON-LD schema
**Effort:** 20 min | **Impact:** Rich results eligibility, local knowledge panel, AI citability

In `src/app/layout.tsx`, add a `<Script>` tag (or use Next.js metadata `other` for JSON-LD):
```tsx
// In the <head> via layout.tsx
const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['LocalBusiness', 'HealthAndBeautyBusiness'],
      '@id': 'https://nettashemesh.vercel.app/#business',
      name: 'נטע שמש — טיפול זוגי ומשפחתי',
      description: 'מטפלת זוגית ומשפחתית מוסמכת',
      url: 'https://nettashemesh.vercel.app',
      telephone: '[REAL_PHONE]',
      email: '[REAL_EMAIL]',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'שביל המוביל',
        addressLocality: 'כפר יעבץ',
        addressCountry: 'IL',
      },
      sameAs: ['[REAL_FB_URL]', '[REAL_IG_URL]'],
    },
    {
      '@type': 'Person',
      '@id': 'https://nettashemesh.vercel.app/#netta',
      name: 'נטע שמש',
      jobTitle: 'מטפלת זוגית ומשפחתית',
      worksFor: { '@id': 'https://nettashemesh.vercel.app/#business' },
      url: 'https://nettashemesh.vercel.app',
    },
  ],
};

// In RootLayout JSX:
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>
```

---

## HIGH — Fix within 1 week

### H1 — Add Open Graph + Twitter Card metadata
**Effort:** 10 min | **Impact:** WhatsApp/Facebook link previews, social sharing appearance

In `src/app/layout.tsx`, extend the metadata export:
```tsx
export const metadata: Metadata = {
  // ...existing...
  openGraph: {
    type: 'website',
    url: 'https://nettashemesh.vercel.app',
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ. ליווי לזוגות ומשפחות בתהליכי שינוי וצמיחה.',
    locale: 'he_IL',
    siteName: 'נטע שמש',
    // og:image is auto-provided by opengraph-image.tsx ✅
  },
  twitter: {
    card: 'summary_large_image',
    title: 'נטע שמש | טיפול זוגי ומשפחתי',
    description: 'מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ.',
  },
};
```

---

### H2 — Add canonical URL to metadata
**Effort:** 2 min | **Impact:** Prevents duplicate content issues

```tsx
alternates: {
  canonical: 'https://nettashemesh.vercel.app',
},
```

---

### H3 — Add hreflang for Hebrew/Israel targeting
**Effort:** 5 min | **Impact:** Correct geo targeting for Hebrew speakers in Israel

Add to `alternates` in metadata:
```tsx
alternates: {
  canonical: 'https://nettashemesh.vercel.app',
  languages: {
    'he-IL': 'https://nettashemesh.vercel.app',
  },
},
```

---

### H4 — Differentiate Expertise section H2 for local keyword
**Effort:** 5 min | **Impact:** Keyword diversity, local targeting

`Expertise.tsx` currently uses `"מקום בטוח לצמוח בו ביחד"` as its H2 — identical to the H1. Change it to a keyword-rich alternative:

```tsx
// In Expertise.tsx — replace the SectionTitle text:
<SectionTitle ...>טיפול זוגי ומשפחתי בכפר יעבץ</SectionTitle>
// or: "תחומי המומחיות שלי" / "מה אני מציעה"
```

---

### H5 — Add security headers to next.config.ts
**Effort:** 20 min | **Impact:** Security, trust signals, OWASP compliance

```ts
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      ],
    },
  ];
},
```

---

### H6a — Add WhatsApp contact button
**Effort:** 15 min | **Impact:** Conversion — WhatsApp is the primary contact channel in Israel

Add a WhatsApp CTA button alongside (or replacing) the phone link in `HeroNav.tsx` and `ContactDetails.tsx`. Use `https://wa.me/972545711060` with an optional pre-filled message via `?text=שלום+נטע,+אשמח+לשמוע+קצת+יותר+פרטים`.

Placement options:
- **HeroNav** — secondary pill button next to the existing phone pill, with WhatsApp icon
- **ContactDetails** — additional row in the contact list using the WhatsApp icon SVG
- **Floating button** — fixed bottom-left FAB visible on all sections (high visibility, common pattern for therapy sites in IL)

The floating FAB is highest-impact for conversion; the nav pill is highest-visibility. Recommend both.

---

### H6 — Fix contact images missing alt text
**Effort:** 10 min | **Impact:** Accessibility (WCAG 2.1 AA), image SEO

In `src/components/layout/Contact.tsx`, all 3 mosaic photos have `alt=""`. Add descriptive alt text:
```tsx
alt="נטע שמש — תמונה מהקליניקה"
alt="נטע שמש בפגישת ייעוץ"
alt="אווירת הקליניקה של נטע שמש"
```

---

### H7 — Add font-display: swap and preload critical font
**Effort:** 10 min | **Impact:** LCP, visual stability, CWV

In `src/app/layout.tsx`, update font declarations:
```tsx
const stanga = localFont({
  src: [...],
  variable: '--font-stanga',
  display: 'swap',  // ADD THIS
  preload: true,    // ADD THIS (preloads stanga-regular only)
});

const elamy = localFont({
  src: [...],
  variable: '--font-elamy',
  display: 'swap',  // ADD THIS
});
```

---

### H8 — Set up Google Search Console
**Effort:** 30 min (one-time) | **Impact:** Real crawl data, indexation status, CWV field data

1. Go to search.google.com/search-console
2. Add property for `https://nettashemesh.vercel.app`
3. Add DNS TXT record or HTML meta verification tag via `layout.tsx` metadata:
   ```tsx
   verification: { google: '[GSC_VERIFICATION_CODE]' }
   ```
4. Submit sitemap once C5 is done.

---

## MEDIUM — Fix within 1 month

### M1 — Add priority prop to Hero LCP image
**Effort:** 5 min | **Impact:** LCP score, Core Web Vitals

In `src/components/layout/hero/HeroBackground.tsx`, find the main hero image and add `priority`:
```tsx
<Image src="..." alt="..." priority /> // Tells Next.js to preload this image
```

---

### M2 — Replace raw `<img>` with `next/image` in Contact section
**Effort:** 30 min | **Impact:** Performance, WebP/AVIF delivery, bandwidth

The 3 mosaic photos in `Contact.tsx` use raw `<img>` tags. Replace with `<Image>` from `next/image` for automatic optimization.

---

### M3 — Add Service schema for each expertise area
**Effort:** 20 min | **Impact:** Rich results for specific therapy services

Add 4 `Service` schema entries under the LocalBusiness for: טיפול זוגי, טיפול משפחתי, הדרכת הורים, ליווי אישי.

---

### M4 — Add FAQ section with FAQ schema
**Effort:** 1–2 hrs | **Impact:** FAQ rich results, AI citability, conversion

Common questions for therapy practices:
- כמה עולה פגישה?
- כמה פגישות צריך?
- האם הפגישות חסויות?
- האם אתם עובדים עם ביטוחים?

Add as visible content + FAQPage JSON-LD.

---

### M5 — Set up Google Business Profile (GBP)
**Effort:** 1–2 hrs | **Impact:** Maps ranking, "near me" searches, phone/direction clicks

1. Create/claim GBP listing for "נטע שמש טיפול זוגי"
2. Add address, phone, hours, photos
3. Link to the website
4. Start collecting real reviews (send review link to past clients)

---

### M6 — Add Google Analytics / privacy-respecting analytics
**Effort:** 30 min | **Impact:** Understanding traffic, conversion tracking

Add to `layout.tsx` or via Next.js Script component. Consider Plausible or Fathom for GDPR-friendlier analytics (no cookie consent banner needed).

---

### M7 — Rename image files to descriptive names
**Effort:** 2–3 hrs | **Impact:** Image search visibility

Current: `cd66a766bd49488df6445af5e15baf9d.jpg`  
Target: `netta-shemesh-couples-therapy-session.jpg`

This requires updating all import/src references and running through the public/ folder.

---

## LOW — Backlog

### L0 — Add FAQ section with FAQ schema
**Effort:** 1–2 hrs | **Impact:** FAQ rich results, AI citability, conversion
Common questions: כמה עולה פגישה? כמה פגישות צריך? האם הפגישות חסויות? האם עובדים עם ביטוחים?
Add as visible content + `FAQPage` JSON-LD. Postponed — implement after core content is live.

### L1 — Add llms.txt for AI crawler guidance
Create `/public/llms.txt` following the llms.txt spec to guide AI crawlers on citability.

### L2 — Consider adding a blog / resource section
Even 4–6 articles (e.g., "5 סימנים שהגיע הזמן לטיפול זוגי") would dramatically increase keyword surface area and E-E-A-T signals.

### L3 — Remove Dganit-Medium.woff2 if unused
The font file exists in `/public/fonts/` but is not referenced in `layout.tsx`. Dead weight (~50KB).

### L4 — Add breadcrumb schema if pages are added
Premature now, but important if a blog or subpages are added.

### L5 — Custom domain
`nettashemesh.vercel.app` is functional but a `.co.il` domain (e.g., `nettashemesh.co.il`) signals Israeli local relevance more strongly to Google.

---

## Implementation Order (Recommended Sprint)

**Day 1 (2 hrs) — Foundation:**
C1 (placeholder data) → C3 (meta description) → C4 (robots.txt) → C5 (sitemap) → C6 (JSON-LD)

**Day 2 (1.5 hrs) — Polish:**  
H1 (Open Graph) → H2 (canonical) → H3 (hreflang) → H4 (Expertise H2 keyword) → H6 (image alt text)

**Day 3 (1 hr) — Infra:**  
H5 (security headers) → H7 (font display) → H8 (GSC setup + submit sitemap)

**Week 2:**  
C2 (real testimonials) → M1 (LCP priority) → M2 (next/image in Contact) → M5 (GBP)

**Month 2:**  
M3 (Service schema) → M4 (FAQ) → M6 (Analytics) → L1 (llms.txt)
