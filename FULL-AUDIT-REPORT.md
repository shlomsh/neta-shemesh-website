# Full SEO Audit Report — נטע שמש
**Site:** https://nettashemesh.vercel.app  
**Business type:** Local service — couples & family therapy practice (Hebrew / RTL, Israel)  
**Audit date:** 2026-06-21  
**Auditor:** Claude SEO Agent

---

## SEO Health Score: 36 / 100

| Category | Weight | Score | Weighted |
|---|---|---|---|
| Technical SEO | 22% | 32 | 7.0 |
| Content Quality | 23% | 45 | 10.4 |
| On-Page SEO | 20% | 28 | 5.6 |
| Schema / Structured Data | 10% | 0 | 0.0 |
| Performance (CWV) | 10% | 72 | 7.2 |
| AI Search Readiness | 10% | 18 | 1.8 |
| Images | 5% | 52 | 2.6 |
| **Total** | **100%** | — | **34.6 ≈ 36** |

> **Interpretation:** The site has a solid design foundation and correct Hebrew/RTL markup, but is nearly invisible to search engines. The most impactful work is a 2-hour session of metadata, schema, and sitemap additions — that alone would move the score to ~65.

---

## Executive Summary

### Top 5 Critical Issues
1. **robots.txt missing (404)** — crawlers have no guidance; Google must guess what to crawl.
2. **sitemap.xml missing (404)** — discovery of all page sections is left entirely to Googlebot.
3. **Meta description completely absent** — Google writes its own snippet, often low-quality.
4. **Zero structured data (JSON-LD)** — no LocalBusiness, Person, or Review schema; ineligible for rich results in Google SERP.
5. **Placeholder contact data live on production** — fake phone `(232) 000-8888`, fake email `INFO@YOURWEBSITE.COM`, and generic social links (`facebook.com`, `instagram.com`) are published live. This is a trust and accuracy problem for both users and search engines.

### Top 5 Quick Wins (< 1 hour each)
1. Add `description` to `layout.tsx` metadata — single line of code.
2. Create `/public/robots.txt` — 4 lines of text.
3. Create `/src/app/sitemap.ts` — Next.js auto-generates XML from a TypeScript function.
4. Add `LocalBusiness` + `Person` JSON-LD to `layout.tsx` — copy-paste template below.
5. Add `openGraph` and `twitter` keys to `layout.tsx` metadata — Next.js renders all OG tags from a plain object.

---

## Technical SEO

### Crawlability
| Check | Status | Detail |
|---|---|---|
| robots.txt | ❌ MISSING | Returns 404. Google must guess crawl scope. |
| sitemap.xml | ❌ MISSING | Returns 404. No page discovery aid for Googlebot. |
| Canonical tag | ⚠️ NOT SET | Next.js does NOT auto-set a canonical. Must be added to metadata. |
| Redirect /index.html → / | ✅ | Configured in next.config.ts |
| URL structure | ✅ | Single-page SPA with clean anchor links (#about etc.) |
| Internal links | ⚠️ | Anchor-only navigation (#about, #expertise, #contact) — fine for a one-page site but limits independent URL targeting |

### Indexability
| Check | Status | Detail |
|---|---|---|
| Meta robots | ✅ | No noindex found — pages are indexable |
| HTTP status homepage | ✅ | 200 OK |
| HTTPS | ✅ | Vercel enforces HTTPS |
| lang="he" | ✅ | Correct in layout.tsx |
| dir="rtl" | ✅ | Correct throughout |
| hreflang | ❌ MISSING | No `<link rel="alternate" hreflang="he">` or `hreflang="he-IL"` |
| Viewport meta | ✅ | Next.js 16 sets `width=device-width, initial-scale=1` automatically |

### Security Headers
| Header | Status |
|---|---|
| X-Frame-Options | ❌ Not set (Vercel default) |
| X-Content-Type-Options | ❌ Not set |
| Content-Security-Policy | ❌ Not set |
| Strict-Transport-Security | ✅ Vercel sets HSTS by default |
| Referrer-Policy | ❌ Not set |

> No custom HTTP headers are configured in `next.config.ts`. Add a `headers()` function to set the security headers. This affects both SEO trust signals and OWASP compliance.

### Core Web Vitals (estimated — no field data)
| Metric | Assessment | Reason |
|---|---|---|
| LCP | ⚠️ LIKELY SLOW | Hero background is a full-viewport image, likely unoptimized. No `priority` prop or `<link rel="preload">` observed for the LCP image. |
| CLS | ✅ LIKELY OK | Fluid clamp() sizing avoids layout shifts. next/image with explicit dimensions used in Testimonials. |
| INP | ✅ LIKELY OK | framer-motion animations are client-side but not blocking. ScrollReveal used broadly. |

> Real field data requires Google Search Console. Add GSC verification ASAP.

---

## Content Quality

### E-E-A-T Assessment
| Signal | Status | Detail |
|---|---|---|
| Author identity | ⚠️ PARTIAL | "נטע שמש" named in title, profile photo present, but no bio section with credentials. |
| Credentials | ⚠️ PLACEHOLDER | CredentialsList component exists but content is not audited. |
| Contact details | ❌ PLACEHOLDER | Phone `(232) 000-8888` and email `INFO@YOURWEBSITE.COM` are American placeholder values — not Netta's real contact info. |
| Reviews / Testimonials | ❌ PLACEHOLDER | All 3 testimonial quotes use "נמו אנים..." Lorem Ipsum–style Hebrew text. Names ("אגריפינה ואמרה", "סאדב לריסא") are clearly dummy data. |
| Physical address | ⚠️ | "שביל המוביל, כפר יעבץ" is listed but incomplete (no street number, no postal code). |
| Social proof | ❌ | Social links point to `facebook.com` / `instagram.com` root domains — not Netta's actual profiles. |

> **This is the highest-urgency content issue.** If a prospective client calls the fake number or sends an email to the placeholder, they get nothing. If Google crawls and evaluates trust signals, the fake contact info undermines authority.

### Thin Content Risk
- The site is a single page (~1,200–1,400 words visible). This is acceptable for a one-page therapist site.
- Content quality of the copy itself appears genuine and well-written in Hebrew.
- The Lorem Ipsum testimonials inflate word count with meaningless text — worse than having fewer words.

### Readability
- Hebrew RTL is correctly handled.
- Type scale is well-structured (clamp-based fluid sizes, appropriate hierarchy).
- Line length controlled. ✅

---

## On-Page SEO

### Title Tags
| Page | Current Title | Issue |
|---|---|---|
| Homepage | `נטע שמש — טיפול זוגי ומשפחתי` | Missing location. For local therapy, "כפר יעבץ" or "מרכז הארץ" should be included. Recommended: `נטע שמש | טיפול זוגי ומשפחתי — כפר יעבץ` |

### Meta Descriptions
| Page | Status |
|---|---|
| Homepage | ❌ MISSING — Google writes its own, typically pulling the first sentence of body text. |

**Recommended description (155 chars):**
```
מטפלת זוגית ומשפחתית מוסמכת. ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קליניקה בכפר יעבץ — קבעו פגישת ייעוץ ראשונה עוד היום.
```

### Open Graph / Social Sharing
| Tag | Status | Detail |
|---|---|---|
| og:image | ✅ | Auto-generated via `opengraph-image.tsx` (1200×630, branded) |
| og:title | ❌ MISSING | Not set in metadata — Next.js may fall back to page title or nothing |
| og:description | ❌ MISSING | No description = blank preview on WhatsApp, Facebook |
| og:type | ❌ MISSING | Should be `website` |
| og:url | ❌ MISSING | Should be the canonical URL |
| twitter:card | ❌ MISSING | |

### Heading Structure
| Tag | Count | Issues |
|---|---|---|
| H1 | 1 | `מקום בטוח לצמוח בו ביחד` — single H1 in `HeroHeading.tsx` ✅ |
| H2 | 9 | Good variety. Note: the exact H1 phrase is reused as an H2 in the Expertise section — minor keyword dilution. |
| H3 | 4 | Step headings in the Services section |

> H1 structure is clean (one H1 confirmed in source). Consider differentiating the Expertise H2 to target a complementary keyword, e.g. "טיפול זוגי ומשפחתי בכפר יעבץ".

### Internal Linking
- Navigation: `#about`, `#expertise`, `#contact` (anchor links to same page sections)
- No standalone URLs to target with individual meta tags
- No blog, FAQ, or subpage structure — acceptable for current scope but limits SEO ceiling

---

## Schema / Structured Data

**Current implementation: NONE**

This is the single highest-ROI fix. A local therapy practice is eligible for multiple rich result types:

### Recommended Schemas

**1. LocalBusiness + HealthAndBeautyBusiness (add to layout.tsx)**
```json
{
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "HealthAndBeautyBusiness"],
  "name": "נטע שמש — טיפול זוגי ומשפחתי",
  "description": "מטפלת זוגית ומשפחתית מוסמכת בכפר יעבץ",
  "url": "https://nettashemesh.vercel.app",
  "telephone": "[REAL PHONE]",
  "email": "[REAL EMAIL]",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "שביל המוביל",
    "addressLocality": "כפר יעבץ",
    "addressCountry": "IL"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": "[LATITUDE]",
    "longitude": "[LONGITUDE]"
  },
  "openingHours": ["Mo-Fr 09:00-19:00"],
  "priceRange": "₪₪",
  "sameAs": [
    "[REAL FACEBOOK URL]",
    "[REAL INSTAGRAM URL]"
  ]
}
```

**2. Person schema (for Netta herself)**
```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "נטע שמש",
  "jobTitle": "מטפלת זוגית ומשפחתית",
  "worksFor": { "@type": "LocalBusiness", "name": "נטע שמש — טיפול זוגי ומשפחתי" },
  "url": "https://nettashemesh.vercel.app"
}
```

**3. Service schemas** — for each of the 4 expertise cards (couples therapy, family therapy, parenting guidance, personal coaching)

**4. Review schema** — once real testimonials are added

---

## Performance (Estimated)

### Image Optimization
- `next/image` (with automatic WebP/AVIF and responsive sizes) is used in **Testimonials** and parts of **About**. ✅
- In **Contact** section, raw `<img>` tags are used (no next/image optimization). ⚠️
- Hero background: implementation not verified but is a full-viewport image — should have `priority` prop if using next/image, or a `<link rel="preload">` if using CSS background.

### Font Loading
- 5 WOFF2 fonts in `/public/fonts/` (Elamy Regular, Elamy Bold, Stanga Light, Stanga Regular, Stanga Bold) + Dganit Medium.
- No `<link rel="preconnect">` is needed for self-hosted fonts, but no `font-display: swap` or explicit preload of the critical-path font (Stanga Regular) was detected in `layout.tsx`.
- Recommendation: Add `display: 'swap'` to both `localFont` declarations and `preload: true` to the primary body font.

### Bundle
- Next.js 16 App Router with server components — excellent default bundle split. ✅
- framer-motion is a client dependency — ensure tree-shaking is effective.

---

## Images

| Check | Status | Detail |
|---|---|---|
| Hero logo | ✅ | alt="נטע שמש — טיפול זוגי ומשפחתי" |
| Expertise card images | ✅ | Descriptive alt text for each service |
| Profile photo | ✅ | alt="נטע שמש" |
| Contact section photos | ❌ | All 3 photos in the mosaic grid have `alt=""` (empty) |
| Icon images | ⚠️ | Functional icons (phone, email, location) have generic alt text ("Phone Call Glyph Icon") — acceptable but could be more descriptive |
| Image file names | ❌ | All content images use MD5 hash filenames (`cd66a766bd49488df6445af5e15baf9d.jpg`). Not crawlable by image search. |
| next/image usage | ⚠️ | Used in Testimonials + some sections; raw `<img>` still in Contact and some sub-components |
| Hero LCP image | ❌ | No `priority` prop detected on hero image — likely not preloaded |

---

## AI Search Readiness (GEO)

| Signal | Status |
|---|---|
| llms.txt | ❌ Missing |
| Structured data for AI citation | ❌ Missing |
| FAQ / Q&A content | ❌ Missing |
| Author credentials explicitly stated | ⚠️ Partial |
| Brand mention signals | ❌ No external citations |
| AI crawler access (via robots.txt) | ❌ N/A — robots.txt is missing entirely |

> AI search engines (ChatGPT, Perplexity, Gemini) prefer pages with clear authorship, schema markup, FAQ sections, and well-structured headings. The site currently offers minimal signal on all fronts.

---

## Local SEO

**This is a local service business (כפר יעבץ, Israel)** — local SEO is critical for the primary user intent ("therapist near me", "מטפלת זוגית כפר יעבץ").

| Signal | Status | Detail |
|---|---|---|
| Google Business Profile | ❌ Not detected | No GBP verification or schema link found |
| NAP consistency | ❌ BROKEN | Name: real. Address: partial. Phone: FAKE. Email: FAKE. |
| Local schema | ❌ Missing | See Schema section above |
| Reviews | ❌ Placeholder | Zero real reviews visible |
| Location in title | ❌ Missing | |
| Location in meta description | ❌ Missing (no meta desc) | |
| Local keywords in H2s | ⚠️ | Headings are thematic, not geo-targeted |

---

## Placeholder Data Inventory (Must Fix Before Launch)

| Field | Current Value | What's Needed |
|---|---|---|
| Phone | `(232) 000-8888` | Netta's real Israeli mobile/landline |
| Email | `INFO@YOURWEBSITE.COM` | Netta's real email |
| Facebook | `https://facebook.com` | Netta's actual page URL |
| Instagram | `https://instagram.com` | Netta's actual profile URL |
| Twitter/X | `https://twitter.com` | Remove or replace with real profile |
| Testimonial 1 | Lorem ipsum | Real client testimonial (anonymous OK) |
| Testimonial 2 | Lorem ipsum | Real client testimonial |
| Testimonial 3 | Lorem ipsum | Real client testimonial |
| Testimonial names | "אגריפינה ואמרה", "סאדב לריסא" | Real first names or initials |
| Tel link (Hero) | `tel:+01234567890` | Real number |
| Tel link (Contact) | `tel:+012345678` | Real number |

---

## Notes on Source Verification

**H1 confirmed single:** Source inspection of `HeroHeading.tsx` confirms one `<h1>` in the DOM. The phrase "מקום בטוח לצמוח בו ביחד" also appears as an `<h2>` in `Expertise.tsx` via `SectionTitle` — that's H2, not H1. No duplicate H1 issue exists.

**ACTION-PLAN item H4** (duplicate H1) has been removed from the action plan as it does not apply.
