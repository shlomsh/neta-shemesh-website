# SEO Action Plan — נטע שמש
**Updated:** 2026-06-21 (v2)  
**Site:** https://nettashemesh.vercel.app  
**Current score:** 65/100 → **Target after remaining fixes: ~82/100**

---

## Status: What's Done ✅

| Item | Done |
|---|---|
| Meta description | ✅ |
| Title with location | ✅ |
| robots.txt (with AI crawler allowlist) | ✅ |
| sitemap.xml | ✅ |
| JSON-LD schema (LocalBusiness + Person + 4 Services) | ✅ |
| Open Graph + Twitter Card | ✅ |
| Canonical + hreflang he-IL | ✅ |
| Security headers (X-Frame, CSP, HSTS, etc.) | ✅ |
| Expertise H2 → local keyword | ✅ |
| Contact image alt text | ✅ |
| Font display: swap + preload | ✅ |
| Phone → +972 54-571-1060 | ✅ |
| WhatsApp link | ✅ |
| Image cache headers | ✅ |

---

## CRITICAL — None remaining ✅

---

## HIGH — Fix this week

### H-A — Replace email placeholder
**Effort:** 2 min | **File:** `src/components/layout/Contact.tsx:22`

```tsx
const EMAIL = 'INFO@YOURWEBSITE.COM'  // → netta@[realdomain].com
```

This is the last placeholder in the contact section. One line change.

---

### H-B — Add real social links
**Effort:** 5 min | **Files:** `SocialLinks.tsx` + `layout.tsx`

In `src/components/layout/contact/SocialLinks.tsx`:
```tsx
{ href: 'https://www.facebook.com/[netta-real-page]', ... }
{ href: 'https://www.instagram.com/[netta-handle]/', ... }
```

In `src/app/layout.tsx` — update `sameAs`:
```ts
sameAs: [
  'https://www.facebook.com/[netta-real-page]',
  'https://www.instagram.com/[netta-handle]/',
],
```

Connecting the business entity to real social profiles is a meaningful Google Knowledge Graph signal.

---

### H-C — Replace Lorem Ipsum testimonials
**Effort:** 10 min (code) + content from Netta | **File:** `src/components/layout/Testimonials.tsx`

Replace each `quote`, `name`, and `role` with real content. First names / initials are fine. Even brief quotes ("השיחות עם נטע עזרו לנו לפתח שפה משותפת") are far better than Lorem Ipsum.

Once real quotes exist, add Review schema to the `@graph` in `layout.tsx`.

---

### H-D — Fix sitemap lastModified to be dynamic
**Effort:** 1 min | **File:** `src/app/sitemap.ts:6`

```ts
// CURRENT — hardcoded past date:
lastModified: new Date('2025-06-01'),

// FIX — always reflects actual current date:
lastModified: new Date(),
```

Googlebot uses this signal to prioritize recrawls. A stale 2025 date signals "nothing changed, skip."

---

### H-E — Set up Google Search Console
**Effort:** 30 min (one-time) | **Impact:** Indexation monitoring, real CWV, crawl error alerts

1. Go to search.google.com/search-console → Add property → `https://nettashemesh.vercel.app`
2. Choose DNS or HTML tag verification. For HTML tag, add to `layout.tsx`:
   ```tsx
   verification: { google: 'YOUR_VERIFICATION_CODE' }
   ```
3. Submit sitemap: `https://nettashemesh.vercel.app/sitemap.xml`
4. Check URL inspection for the homepage — confirm it's indexed

---

## MEDIUM — Fix within 1 month

### M-A — Add "קצת עלי" About Me section ⭐ Highest content impact
**Effort:** 1 hr dev + bio content from Netta | **Impact:** E-E-A-T, AI citability, conversion

A practitioner bio is the #2 most-read section on therapy sites. Its absence means:
- Google has no credentials to evaluate for E-E-A-T
- AI assistants (ChatGPT, Perplexity) have nothing to cite when answering "מטפלת זוגית כפר יעבץ"
- Prospective clients can't confirm they're in the right hands

**What the bio should contain** (see the full brief sent to Netta):
- Training & certification body
- Years of experience
- Therapeutic approach / modalities used
- Who she works with
- Personal "why" — what drew her to couples/family work

**SEO keywords to weave in naturally** (one use each):
- טיפול זוגי
- טיפול משפחתי
- מטפלת מוסמכת
- כפר יעבץ

---

### M-B — Verify IndexNow key file exists
**Effort:** 2 min | **File:** `/public/c3e73d9f77ad4e8992f89fff10073308.txt`

`robots.txt` references this file. Confirm it exists:
```bash
ls public/c3e73d9f77ad4e8992f89fff10073308.txt
```
If missing, create it with the key as its sole content:
```
c3e73d9f77ad4e8992f89fff10073308
```

---

### M-C — Add hero image `priority` prop
**Effort:** 5 min | **File:** `src/components/layout/hero/HeroBackground.tsx`

Find the main hero image/background and ensure it has `priority` on any `<Image>` component, or a `<link rel="preload">` if it's a CSS background. This is the LCP element on almost every device.

---

### M-D — Add FAQ section with FAQPage schema
**Effort:** 2 hrs | **Impact:** FAQ rich results, AI Q&A, conversion

Suggested questions (all high-intent, commonly searched):
1. כמה עולה פגישת טיפול זוגי?
2. כמה פגישות בדרך כלל נדרשות?
3. האם הפגישות חסויות?
4. האם ניתן לקבל טיפול גם אונליין?
5. מתי כדאי לפנות לטיפול זוגי?

Add as a visible accordion or Q&A section + FAQPage JSON-LD in `layout.tsx`.

---

### M-E — Set up analytics (privacy-first)
**Effort:** 30 min | **Impact:** Measure SEO ROI, track conversions

Options (no cookie banner needed):
- **Plausible** — €9/mo, GDPR-compliant, no cookies
- **Fathom** — similar, slightly cheaper
- **Vercel Analytics** — free tier, built-in for Vercel deployments (easiest)

For Vercel Analytics — just enable in Vercel dashboard, then add `<Analytics />` from `@vercel/analytics/react` to `layout.tsx`.

---

### M-F — Replace raw `<img>` with `<Image>` in Contact section
**Effort:** 30 min | **File:** `src/components/layout/Contact.tsx`

The 3 mosaic photos use raw `<img>` — no WebP/AVIF conversion, no lazy-load optimization, no responsive sizes. Replacing with Next.js `<Image>` gives automatic format conversion and ~40% smaller file sizes.

---

## LOW — Backlog

### L-A — Remove unused Dganit font
**File:** `/public/fonts/Dganit-Medium.woff2`  
Not loaded in `layout.tsx`. Delete to save ~50KB per page.

### L-B — Add llms.txt
Create `/public/llms.txt` following the llms.txt spec. Signals AI crawlers how to cite this practice. Low but free.

### L-C — Add custom .co.il domain
An Israeli domain strengthens geo-targeting. Low urgency until content is complete.

### L-D — Rename image files to descriptive names
Replace MD5 hashes with meaningful names for image search visibility.

### L-E — Add Review schema once real testimonials exist
Template ready in audit report. Can be added to `@graph` in `layout.tsx` as soon as H-C (real testimonials) is done.

---

## Revised Sprint Plan

**Today (30 min) — Quick unblocks:**
H-A (email) → H-B (social links) → H-D (sitemap date)

**This week:**
H-C (real testimonials from Netta) → H-E (GSC setup) → M-B (IndexNow file check)

**Next 2 weeks:**
M-A (About Me bio — waiting on Netta's text) → M-C (hero priority prop) → M-D (FAQ section)

**Month 2:**
M-E (Analytics) → M-F (next/image in Contact) → L-A (remove Dganit) → L-B (llms.txt)

---

## Score Projection

| Milestone | Score |
|---|---|
| Now (v2) | 65 |
| After H-A, H-B, H-C, H-D | ~72 |
| After M-A (About Me) + M-D (FAQ) | ~80 |
| After GSC + Analytics + GBP | ~85 |
| After custom domain + blog | 90+ |
