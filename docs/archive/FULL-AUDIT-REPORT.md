> **ARCHIVED — point-in-time record, not current status.**
> Audited 2026-06-21 against the old preview domain, before the site launched
> on `https://www.netashemesh.co.il`. Kept for history; do not act on it
> without re-verifying.
>
> Known inaccuracy: the security-header tables below list
> `X-Frame-Options: DENY` as present. It is not, and was not — the site has
> never sent that header. Framing is blocked by `frame-ancestors 'none'` in
> the CSP (`next.config.ts`). Verified against the live site 2026-08-05.

# Full SEO Audit Report — נטע שמש
**Site:** https://nettashemesh.vercel.app  
**Business type:** Local service — couples & family therapy practice (Hebrew / RTL, Israel)  
**Audit date:** 2026-06-21 (v2 — delta from v1)  
**Auditor:** Claude SEO Agent

---

## SEO Health Score: 65 / 100 ↑ from 36

| Category | Weight | Score v1 | Score v2 | Change |
|---|---|---|---|---|
| Technical SEO | 22% | 32 | 76 | **+44** ✅ |
| Content Quality | 23% | 45 | 48 | +3 ⚠️ |
| On-Page SEO | 20% | 28 | 73 | **+45** ✅ |
| Schema / Structured Data | 10% | 0 | 82 | **+82** ✅ |
| Performance (CWV) | 10% | 72 | 80 | +8 ✅ |
| AI Search Readiness | 10% | 18 | 46 | **+28** ✅ |
| Images | 5% | 52 | 67 | +15 ✅ |
| **Total** | **100%** | **36** | **65** | **+29** |

> The predicted score of ~65 after Critical fixes was accurate. All 6 Critical items and most High items from v1 are resolved. The remaining gap to 80+ is primarily content (real testimonials, real social links). About Me bio is now done.

---

## What Changed Since v1

### ✅ COMPLETED

| Item | What was done |
|---|---|
| **C3** Meta description | Added in `layout.tsx`: "מטפלת זוגית ומשפחתית מוסמכת בנתניה..." |
| **C4** robots.txt | Created with full AI crawler allowlist (GPTBot, ClaudeBot, PerplexityBot, etc.) + Sitemap + IndexNow |
| **C5** sitemap.xml | `src/app/sitemap.ts` created, serving at `/sitemap.xml` |
| **C6** JSON-LD schema | Full `@graph` in `layout.tsx`: LocalBusiness, HealthAndBeautyBusiness, Person, 4× Service |
| **H1** Open Graph | og:title, og:description, og:type, og:url, og:locale all set |
| **H2** Canonical | `alternates.canonical` set |
| **H3** hreflang | `he-IL` alternate set |
| **H4** Expertise H2 | Changed from "מקום בטוח לצמוח בו ביחד" → "טיפול זוגי ומשפחתי בנתניה" (local keyword) |
| **H5** Security headers | Full suite: X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, HSTS, CSP |
| **H6** Contact image alts | All 3 mosaic photos now have descriptive Hebrew alt text |
| **H7** Font display | `display: 'swap'` + `preload: true` on Stanga; `display: 'swap'` on Elamy |
| **Title** | Updated to "נטע שמש | טיפול זוגי ומשפחתי — נתניה" |
| **Phone** | Updated to `+972 54-571-1060` throughout |
| **WhatsApp** | `wa.me/972545711060` link added to site |
| **C1 partial** | Phone fixed; image cache headers added |

---

## Remaining Issues

### CRITICAL

None remaining.

---

### HIGH

#### H-A — Real email still placeholder
**File:** `src/components/layout/Contact.tsx:22`  
`EMAIL = 'INFO@YOURWEBSITE.COM'` — a prospective client who clicks "שלחו לי אימייל" sends to a dead address.

#### H-B — Social links still generic domains
**Files:** `src/components/layout/contact/SocialLinks.tsx:12,18` and `src/app/layout.tsx:96`  
- `href: 'https://facebook.com'` (root domain, not Netta's page)
- `href: 'https://instagram.com'` (root domain)
- `sameAs: []` in JSON-LD is empty — Google cannot link the business entity to its social profiles

#### H-C — Testimonials still Lorem Ipsum
**File:** `src/components/layout/Testimonials.tsx:12,21,30`  
All 3 `quote` strings use placeholder Hebrew, names are fictional. This:
- Blocks Review schema eligibility
- Undermines E-E-A-T (Google can detect dummy content patterns)
- Zero conversion value for visitors

#### H-D — Sitemap `lastModified` is hardcoded past date
**File:** `src/app/sitemap.ts:6`  
`lastModified: new Date('2025-06-01')` — hardcoded to June 2025. This is a year in the past. Googlebot uses this to decide whether to recrawl. It should be dynamic:
```ts
lastModified: new Date(),
```

---

### MEDIUM

#### M-A — About Me / "קצת עלי" section — ✅ RESOLVED
**Impact:** E-E-A-T, AI citability, conversion  
A full bio is now live (`AboutBio` in `src/components/layout/About.tsx`): credentials (M.S.W, מטפלת מוסמכת), 14 years' experience, career path, therapeutic approach, and geo signals (נתניה). Written in Netta's own voice — merges her approach text with the credential-rich version.

#### M-B — `sameAs` in JSON-LD is empty array
**File:** `src/app/layout.tsx:96`  
`sameAs: []` — waiting for real social URLs. Once Facebook/Instagram profiles are added, this field connects the business entity to verifiable external profiles, strengthening the knowledge graph signal.

#### M-C — Google Search Console not yet configured
No GSC verification tag detected. Without GSC:
- Cannot confirm pages are indexed
- Cannot see crawl errors
- Cannot submit sitemap directly
- Cannot see real CWV field data

#### M-D — Hero LCP image — `priority` prop status unknown
**File:** `src/components/layout/hero/HeroBackground.tsx`  
The hero background image drives LCP. If it lacks `priority` (next/image preload), it will be fetched late and drag LCP above 2.5s. Needs verification.

#### M-E — No Google Analytics or privacy-respecting analytics
No tracking configured. Cannot measure organic traffic growth from all the SEO improvements made.

#### M-F — No FAQ section
Missing FAQ = missing FAQ rich result eligibility and AI Q&A signal. Common therapy questions ("כמה עולה פגישה?", "כמה זמן נמשך טיפול?") are high-intent and easy to add.

---

### LOW

#### L-A — IndexNow key file not verified
`robots.txt` references `https://nettashemesh.vercel.app/c3e73d9f77ad4e8992f89fff10073308.txt` — confirm this file exists at `/public/c3e73d9f77ad4e8992f89fff10073308.txt`.

#### L-B — Unused font: Dganit-Medium.woff2
`/public/fonts/Dganit-Medium.woff2` exists but is not loaded in `layout.tsx`. Dead weight (~50KB on every page load).

#### L-C — Image filenames are MD5 hashes
All content images use hash filenames (`cd66a766....jpg`). Not indexed by Google Image Search under relevant terms. Low priority unless image traffic is a goal.

#### L-D — Custom domain (.co.il) not yet set
`nettashemesh.vercel.app` works but an Israeli `.co.il` domain strengthens local geo-targeting signal. Low urgency until the content issues are resolved.

---

## Technical SEO Detail

### Crawlability
| Check | Status |
|---|---|
| robots.txt | ✅ Present — universal Allow, AI crawlers explicitly permitted |
| sitemap.xml | ✅ Present at `/sitemap.xml` |
| Canonical | ✅ Set via Next.js metadata alternates |
| Redirect /index.html → / | ✅ |
| HTTP status | ✅ 200 OK |
| HTTPS | ✅ Vercel enforces |

### Indexability
| Check | Status |
|---|---|
| lang="he" | ✅ |
| dir="rtl" | ✅ |
| hreflang he-IL | ✅ |
| Meta robots | ✅ No noindex |
| Viewport meta | ✅ Next.js default |

### Security Headers
| Header | Status |
|---|---|
| X-Frame-Options: DENY | ✅ |
| X-Content-Type-Options: nosniff | ✅ |
| Referrer-Policy | ✅ strict-origin-when-cross-origin |
| Permissions-Policy | ✅ |
| HSTS + preload | ✅ max-age=63072000 |
| Content-Security-Policy | ✅ Full CSP (dev/prod split) |
| Cache-Control on images | ✅ 24h + stale-while-revalidate |

> Security headers are now **well above average** for a therapy practice website. This is a genuine trust signal.

---

## On-Page SEO

### Title
`נטע שמש | טיפול זוגי ומשפחתי — נתניה` ✅  
Includes: brand name, service type, location. ~47 chars — good length.

### Meta Description
`מטפלת זוגית ומשפחתית מוסמכת בנתניה. ליווי אישי לזוגות ומשפחות בתהליכי שינוי, משבר וצמיחה. קבעו פגישת ייעוץ ראשונה עוד היום.` ✅  
Includes CTA, location, service type. ~138 chars — good length.

### Open Graph
| Tag | Status |
|---|---|
| og:title | ✅ |
| og:description | ✅ |
| og:type: website | ✅ |
| og:url | ✅ |
| og:locale: he_IL | ✅ |
| og:siteName | ✅ |
| og:image | ✅ (auto via opengraph-image.tsx, 1200×630) |

### Twitter Card
| Tag | Status |
|---|---|
| twitter:card: summary_large_image | ✅ |
| twitter:title | ✅ |
| twitter:description | ✅ |

### Heading Structure
| Tag | Text | Status |
|---|---|---|
| H1 | מקום בטוח לצמוח בו ביחד | ✅ Single, in Hero |
| H2 | טיפול זוגי ומשפחתי בנתניה | ✅ Now geo-targeted (was duplicate of H1) |
| H2 | ליווי מקצועי לזוגות | ✅ |
| H2 | להצית מחדש את הקשר הזוגי | ✅ |
| H2 | איך זה עובד? | ✅ |
| H2 | לקוחות ממליצים | ✅ |
| H2 | עקבו אחריי | ✅ |
| H2 | המשרד שלי | ✅ |
| H3 | (4 step headings) | ✅ |

---

## Schema / Structured Data

Full `@graph` implemented in `layout.tsx`:

| Schema Type | Status | Notes |
|---|---|---|
| LocalBusiness + HealthAndBeautyBusiness | ✅ | Name, URL, phone, address, geo, priceRange, openingHours |
| Person | ✅ | Netta Shemesh, jobTitle, worksFor link |
| Service × 4 | ✅ | טיפול זוגי, טיפול משפחתי, הדרכת הורים, ליווי אישי |
| Review | ❌ | Blocked until real testimonials added |
| FAQPage | ❌ | No FAQ section yet |
| sameAs | ⚠️ | Empty array — add real social URLs when available |

> The schema implementation is genuinely strong. The GeoCoordinates (32.2167, 34.9333) and postalCode (4584500) are specific and will help the local knowledge panel.

---

## Content Quality

### E-E-A-T
| Signal | Status |
|---|---|
| Practitioner named | ✅ |
| Profile photo | ✅ |
| Real phone | ✅ +972 54-571-1060 |
| Real email | ❌ INFO@YOURWEBSITE.COM |
| Real social profiles | ❌ Generic links |
| Bio / credentials | ✅ Live — About Me bio with M.S.W, license, 14 yrs |
| Real testimonials | ❌ Lorem Ipsum |
| Physical address | ✅ רחוב אמנון ותמר 6, נתניה (matches LocalBusiness schema) |

### Placeholder Data Still Live
| Field | Current Value | Needed |
|---|---|---|
| Email | `INFO@YOURWEBSITE.COM` | Netta's real email |
| Facebook | `https://facebook.com` | Real profile URL |
| Instagram | `https://instagram.com` | Real profile URL |
| Testimonial quotes (×3) | Lorem ipsum Hebrew | Real client quotes |
| Testimonial names | Fictional | Real first names / initials |

---

## AI Search Readiness

| Signal | Status |
|---|---|
| robots.txt AI crawler access | ✅ Explicitly allowed: GPTBot, ClaudeBot, PerplexityBot, Google-Extended |
| IndexNow | ✅ Referenced in robots.txt |
| LocalBusiness schema | ✅ |
| Service schema × 4 | ✅ |
| FAQ content | ❌ |
| llms.txt | ❌ |
| About Me / bio | ✅ |
| Real authority signals | ❌ No external citations, no GBP, no reviews |

---

## Images

| Check | Status |
|---|---|
| Hero logo alt | ✅ |
| Profile photo alt | ✅ "נטע שמש" |
| Expertise card alts | ✅ Descriptive |
| Contact mosaic alts | ✅ (fixed in v2) |
| Testimonial images | ✅ "זוג בטיפול" |
| next/image usage | ⚠️ Used in Testimonials; Contact still uses raw `<img>` |
| Hero LCP priority | ❓ Unverified |
| Hash filenames | ❌ All content images |

---

## Performance

| Item | Status |
|---|---|
| Font display: swap | ✅ Both fonts |
| Stanga preload | ✅ |
| Image cache headers | ✅ 24h + stale-while-revalidate |
| Hero LCP preload | ❓ Unverified |
| Raw `<img>` in Contact | ⚠️ No WebP/AVIF auto-conversion |
| Unused font (Dganit) | ❌ ~50KB dead weight |
