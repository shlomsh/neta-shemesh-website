# Deployment

The site currently deploys to **two hosts in parallel** while a possible cutover
from Vercel to Azure Static Web Apps is evaluated.

| | Vercel (production) | Azure SWA (staging) |
|---|---|---|
| URL | `https://www.netashemesh.co.il` | `https://yellow-tree-0d5623803.7.azurestaticapps.net` |
| Trigger | push to `main` | `.github/workflows/azure-static-web-apps.yml` |
| Rendering | normal Next build | static export (`output: 'export'`) |
| Images | Next optimizer, AVIF → WebP → JPEG | **unoptimized — originals as-is** |
| Headers | `headers()` in `next.config.ts` | `public/staticwebapp.config.json` |
| Indexable | yes | **no** — see below |

Both hosts build from the same commit. Nothing is host-specific in component
code; the difference is two environment variables.

---

## How one codebase targets both

`next.config.ts` keys off `BUILD_STATIC_EXPORT`:

```ts
const isStaticExport = process.env.BUILD_STATIC_EXPORT === 'true';
```

- **unset** (Vercel) → normal build, image optimizer on, `images.formats`
  offering AVIF then WebP.
- **`'true'`** (Azure workflow) → `output: 'export'` and
  `images: { unoptimized: true }`, because a static export has no server to
  optimize on.

`src/config/constants.ts` keys off `NEXT_PUBLIC_SITE_URL`, falling back to the
production domain. It drives the canonical, `og:url`, the sitemap, and the
JSON-LD `@id`s.

> **`images` is deliberately a single conditional key, not folded into the
> `output: 'export'` spread.** A second `images` key placed after that spread
> silently overrides `unoptimized: true` and breaks the Azure build. It is a
> plain object-literal override, so TypeScript does not catch it.

### Routes that need `force-static`

A static export cannot have dynamic route handlers. `src/app/sitemap.ts`
carries `export const dynamic = 'force-static'`. Any future metadata route
(`robots.ts`, `opengraph-image.tsx`, …) needs the same or the Azure build fails
with *"export const dynamic … not configured"*.

---

## Staging must never be indexable

Because Azure builds set `NEXT_PUBLIC_SITE_URL` to the Azure host, every page
there **canonicalises to itself** — a complete crawlable duplicate of the real
site. Left open, Google can index it in competition with production.

Two independent guards:

1. **`layout.tsx`** emits `robots: { index: false, follow: false }` whenever
   `SITE_URL` is not the production domain. This covers *any* non-production
   host and re-enables itself automatically when a build points at production.
2. **`public/staticwebapp.config.json`** sends `X-Robots-Tag: noindex, nofollow`
   as a global header.

> **Do not add `Disallow: /` to robots.txt on staging.** `Disallow` blocks
> crawling, not indexing: Google can still index an uncrawlable URL it finds
> linked, and a blocked crawler never sees the `noindex`. Crawlable **plus**
> noindex is the combination that actually de-indexes.

### Cutover checklist

If the custom domain moves to Azure, these change **together**:

1. `NEXT_PUBLIC_SITE_URL` in `.github/workflows/azure-static-web-apps.yml` →
   the production domain, or remove it.
2. The `X-Robots-Tag` line in `public/staticwebapp.config.json` → delete it.

Guard 1 above releases itself once step 1 is done. Doing step 2 without step 1
publishes a competing copy; step 1 without step 2 de-indexes the real site.

---

## What triggers a production deploy

Vercel attributes every deployment to the **commit author** and checks that
identity has access to the project. On a personal plan only the account owner
qualifies, so a push authored by anyone else produces no deployment — and it
fails silently rather than erroring.

This bit us implicitly: the Azure work (`4f1846d`) was authored by a second
contributor and only reached `main` inside merge commit `21beb86`, which GitHub
attributed to the account owner. That is the only reason it deployed.

`.github/workflows/vercel-deploy.yml` removes the dependency on authorship by
POSTing to a **Vercel Deploy Hook**, which carries no author attribution.

**This is already configured.** Recorded here so it can be rebuilt — notably
after a change of project ownership.

The whole setup is doable from the CLI; no dashboard needed:

```bash
vercel deploy-hooks list                              # hook: github-actions-main, ref main
vercel deploy-hooks create <name> --ref main          # if it needs recreating
```

To store the URL without it landing in a terminal transcript:

```bash
url=$(vercel deploy-hooks list | sed -n '/^{/,$p' | jq -r '.hooks[0].url')
printf '%s' "$url" | gh secret set VERCEL_DEPLOY_HOOK --repo <owner>/<repo>
```

Vercel's own Git trigger is disabled in **`vercel.json`**, not via the dashboard
toggle:

```json
"git": { "deploymentEnabled": { "main": false } }
```

Version-controlled on purpose: it is reviewable, and it survives a change of
project ownership. Without it, every owner-authored push deploys twice — once
from Git, once from the hook. `deploymentEnabled` gates **Git events only**;
deploy hooks are a separate trigger and keep working. Verified by firing the
workflow with no push and watching a deployment appear.

With Vercel's trigger off, this workflow is the **only** path to production,
which is why it runs the unit suite before firing the hook. It skips with a
warning rather than failing if `VERCEL_DEPLOY_HOOK` is missing.

### If ownership of the Vercel project changes

The Git-author check inverts: the previous owner becomes the unauthorized
author. The hook is what makes this a non-event, because it carries no author
attribution. After any transfer:

1. `vercel deploy-hooks list` — confirm the hook still exists. A transfer can
   reset Git integration.
2. If it is gone, recreate it and re-set the `VERCEL_DEPLOY_HOOK` secret.
3. `gh workflow run "Deploy to Vercel"` and confirm a new deployment appears.
4. Rebuild the domain configuration — see **Domains and DNS** below. It is more
   than re-adding a hostname.

Azure has no equivalent problem: its workflow authenticates with a repository
secret, so it deploys on any push from any author.

---

## Domains and DNS

Responsibility is split, and the split is the thing people get wrong:

- **Vercel** decides which hostnames route to the project, and holds the
  apex→www redirect. It does **not** host DNS for this domain.
- **MyNames** (`ns1.mynames.co.il`, `ns2.mynames.co.il`) is authoritative for
  `netashemesh.co.il` and holds the actual records and their TTLs.

Vercel's Domains page shows the record *values it expects* and whether what is
published matches. `vercel dns ls` returns *"You don't have permission to list
the domain record"* — that is Vercel confirming it does not manage this zone,
not an access problem.

### Target state (Project → Settings → Domains)

| Hostname | Role |
|---|---|
| `www.netashemesh.co.il` | Production |
| `netashemesh.co.il` | **308 redirect → `www.netashemesh.co.il`** |
| `netashemesh.vercel.app` | auto-assigned by Vercel; changes on transfer, ignore |

> **The apex→www 308 is Vercel configuration, not a DNS record.** It does not
> travel with the domain and it is not in this repo. Re-adding the hostnames on
> another account without recreating it leaves apex and www both serving, which
> splits the canonical signal — bad at any time, worse while the site is still
> establishing itself with Google.

`nettashemesh.co.il` (double `t`) is an old typo domain. It resolves to nothing
and is deliberately not attached.

### DNS records

Published at MyNames, not here:

- `www` → **CNAME** → a `*.vercel-dns-*.com` target. **The hostname is
  account-specific**, so it changes if the project moves to another Vercel
  account.
- apex → **A** → a Vercel anycast address. The value rotates between lookups;
  that is normal. Always copy what Vercel's Domains page asks for rather than
  whatever `dig` returned a moment ago.

### Before any cutover or transfer

TTL is **3600s**, so a bad moment costs up to an hour of downtime. Lower both
records to **300s at least an hour beforehand** — resolvers cache the old value
until it expires, so doing it at the same time as the switch achieves nothing.

```bash
dig +noall +answer www.netashemesh.co.il   # confirm the TTL actually dropped
```

---

## The gap: image optimization

**This is the one difference a visitor feels, and it is unresolved.**

A static export has no image optimizer, so Azure serves every original file at
full resolution — the same bytes to a 375px phone as to a 5K display. Measured
across the 30 images the homepage references:

| | bytes | note |
|---|---|---|
| Azure, as served | 1,749,052 | originals, **0 `srcset` attributes** |
| Vercel, WebP @640 | 482,402 | 15 `srcset` attributes |

That was **3.6×**, measured *before* AVIF was enabled. Vercel now serves AVIF,
so the real multiple is larger — `npm run compare:deploys` reports the current
figure.

### What closing it would take

A build-time pipeline: pre-generate width variants with `sharp` in a `prebuild`
step, and point `images.loader` at a custom loader that maps
`(src, width)` → a generated path. Host-agnostic, so both deploys serve
identical bytes.

Three things that will bite whoever builds it:

- **`deviceSizes` must be narrowed to exactly the widths generated.** Next emits
  a `srcset` entry per configured width regardless of what exists on disk, so
  the defaults produce a srcset full of 404s — worse than no optimization,
  because the browser picks a broken candidate.
- **Source widths vary from 630px to 2189px** (`about-profile-neta.webp` is
  630×638; `cta-background.webp` is 2189×1460). A single fixed ladder is wrong
  in both directions. Derive per-image: generate `min(sourceWidth, rung)` and
  skip rungs above the source. Vercel's own ladder is inert above the source —
  `contact-clinic-atmosphere.webp` is 801px wide, so 828/1080/1920/3840 all
  return the identical file.
- **A custom loader cannot content-negotiate.** One URL per width means no
  `Accept`-based AVIF/WebP branching. Matching Vercel's AVIF therefore needs a
  `<picture>` wrapper across ~39 `next/image` call sites — materially more work
  than the WebP-only version.

---

## Verifying parity

```bash
npm run compare:deploys          # full check
npm run compare:deploys -- --fast   # skip the image-weight pass
```

Diffs the two origins on security headers, content types, routing,
indexability, and image payload at a 375px viewport. Exits non-zero on real
differences. It preflights both hosts and aborts if either is unreachable,
because a rate-limited host returns empty headers for every check and would
otherwise report a screenful of differences that do not exist.

Reported as `NOTE` and deliberately **not** failures:

- `sitemap.xml` is `text/xml` on Azure, `application/xml` on Vercel — both
  spec-legal, Google treats them alike.
- `/index.html` redirects `301` on Azure, `308` on Vercel — both permanent, and
  the distinction only matters for POST.
- Azure omits `; charset=utf-8` on `Content-Type` — the document carries
  `<meta charSet="utf-8">`, so Hebrew renders correctly either way.

Run it after any change to `next.config.ts` or `staticwebapp.config.json`.
Those two files are the two sources of truth for the same header policy, and
they drift silently.

---

## Gotchas learned the hard way

- **SWA route headers *merge* with `globalHeaders`, they do not replace them.**
  Verified against the live deploy. Restating security headers inside a route
  entry is redundant.
- **`public/staticwebapp.config.json`, not the repo root.** `public/` is copied
  into `out/`, and `out` is the workflow's `app_location`. A copy at the repo
  root never ships.
- **Extensionless files get the wrong MIME type on SWA.** The generated
  `opengraph-image` route produced an extensionless file that SWA served as
  `application/octet-stream`. It is now a committed
  `src/app/opengraph-image.png`; anything referencing it needs the `.png`.
