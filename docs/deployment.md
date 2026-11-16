# Deployment

The site ships to **one target: Vercel**, production at `https://www.netashemesh.co.il`. A push to `main` deploys through Vercel's Git integration (no workflow, hook or token). `vercel.json` sets `npm run build`, `.next` output and the test gate below.

## Environment variables

`NEXT_PUBLIC_SITE_URL` (`src/content/site.ts`, inlined at build time) defaults to `https://www.netashemesh.co.il`. It drives the canonical, `og:url`, the sitemap and the JSON-LD `@id`s. When it points anywhere else (a preview, a tunnel), `layout.tsx` emits `robots: noindex, nofollow`, so a staging copy never competes with production (`tests-unit/lib/noindex-host.test.ts`). Never add `Disallow: /` to `robots.txt` for that: a blocked crawler never sees the `noindex`.

**Web Analytics** (`@vercel/analytics`, rendered in `layout.tsx` only when `VERCEL` is set, so local runs and tests stay silent) is cookieless, needs no consent banner and is served same-origin under `/_vercel/insights/` (covered by the CSP's `'self'`). Eran must enable it once in the Vercel project (Project → Analytics → Enable); until then it collects nothing.

## Google Analytics 4 and Google Ads

GA4 uses `SITE.ga4MeasurementId` (`G-664E7DFVEJ`, a public measurement ID, not a secret). It is enabled only when Vercel sets `VERCEL_ENV=production` at build time; previews and local runs do not load the tag or track articles. No additional environment variable or package is needed. The small queue initializes before hydration so events are retained while the external tag loads asynchronously. Contact links keep their native navigation; analytics never waits for a network request or prevents a call/WhatsApp from opening. Ad blockers can prevent delivery.

| Event | When | Custom parameters |
|---|---|---|
| `phone_click` | Any clinic phone link is activated, including navigation, footer and floating pill | `page_path` |
| `whatsapp_click` | Any clinic WhatsApp link is activated | `page_path` |
| `blog_view` | An article opens, once per visit (including Next.js client navigation) | `article_id` (slug), `page_path` |
| `blog_read_10s` | The article has accumulated at least 10 seconds in a visible tab, once per visit | `article_id`, `page_path` |

Hidden-tab and page-cache time does not count; leaving the article cancels its timer. Returning to an article through navigation starts a new visit. The threshold measures visible dwell time, not proof of reading, and contact events measure clicks, not completed calls or messages.

GA4's standard `page_view` is separate from `blog_view`. In **Admin → Data streams → Web → Enhanced measurement → Page views → Advanced settings**, keep page loads and browser-history changes enabled so regular page views follow Next.js navigation. Do not install the same tag again through GTM or Vercel.

Setup in the Google accounts (not performed by a code deploy):

1. In GA4, confirm the web stream's measurement ID matches `SITE.ga4MeasurementId`. Use **Realtime**, or Tag Assistant plus **DebugView**, to verify the four events. For a local verification build, explicitly set `VERCEL_ENV=production`, rebuild, and intercept Google's script/collection requests so synthetic events do not reach the live property.
2. Register `article_id` as an event-scoped custom dimension (**Admin → Custom definitions**) to break down both article events by post. Reports can take 24–48 hours to populate.
3. Mark only `phone_click` and `whatsapp_click` as **key events**. Link the Google Ads account under **Product links → Google Ads links**, with auto-tagging enabled in Ads.
4. In Google Ads, create/import conversions from those two GA4 key events. Use **Count: One** for leads, and make them **Primary** if the campaign should optimize toward contacts. Do not also import the generic outbound `click` or add duplicate direct Ads conversions for the same action.
5. Keep article events for analysis, not primary bidding goals. If imported into Ads at all, make them **Secondary**.

**Privacy:** Unlike the existing Vercel analytics, GA4 uses cookies and sends data to Google. Establish the appropriate privacy notice and consent handling for the site's audience before enabling collection where consent is required; this integration is not a consent banner/CMP. Google Signals and advertising personalization are disabled in the tag configuration; do not enable remarketing or sensitive-audience targeting based on therapy article visits. Custom events send no phone number, email or WhatsApp message. GA4 also collects standard page metadata, so never put personal data in URLs or page titles. Review enhanced measurement separately (especially outbound-click collection). CSP allows the measurement endpoints from Google's [GA4 CSP guidance](https://developers.google.com/tag-platform/security/guides/csp); direct Ads/remarketing endpoints are intentionally not added.

## The test gate

Vercel does not wait for GitHub Actions, so a red `playwright.yml` cannot stop a deploy. The gate is `vercel.json` `ignoreCommand` → `scripts/vercel-ignore-build.sh`, which runs `eslint --max-warnings 0`, `tsc --noEmit` and `vitest run` before every build (all three always run, so one log shows every failure; a few seconds locally). `installCommand` is `npm ci`. **Exit codes are inverted:**

| Exit | Meaning |
|---|---|
| `1` | lint, types and tests passed (or the runners could not be installed): **build proceeds** |
| `0` | a check failed: **build skipped**, production keeps the previous deploy |

It fails open on infrastructure problems and closed on real check failures: a check that cannot run must not silently freeze the site. A skipped build still reports **green** on GitHub (status "Canceled by Ignored Build Step"); check the deployment list, not the check mark. `playwright.yml` (workflow `CI`: lint, `tsc`, unit, build, Playwright on chromium, webkit, iphone, ipad) is the backstop and shows the failing test in red.

## Why the repository is public

Vercel attributes each deployment to the **commit author** and checks that identity against the project. On the Hobby plan, collaboration is not supported for private repositories, so a commit by anyone other than the account owner is refused ("Deployment was blocked"). That happened to Eran's commits (`61df089`, `44c0b79` sat undeployed for two days). Public repositories lift the restriction on any plan; verified by building a fresh-SHA copy of a previously blocked commit to Ready. **Do not make the repo private.** A Deploy Hook does not dodge the check (the hook deploys the branch head, Vercel resolves its author and discards it while the `curl` returns 2xx). Alternatives if it ever must go private: Pro plan with contributors as team members, or GitHub Actions + `vercel deploy` with a full-account token (a team-scoped token fails with `User not found`).

If ownership of the Vercel project changes, the check inverts (the previous owner becomes the unauthorized author). After a transfer: confirm the repo is still public, push a commit and confirm a production deployment appears, and rebuild the domain setup below.

## Domains and DNS

Responsibility is split:

- **Vercel** decides which hostnames route to the project and holds the apex→www redirect. It does not host DNS (`vercel dns ls` is denied: that is expected).
- **MyNames** (`ns1.mynames.co.il`, `ns2.mynames.co.il`) is authoritative for `netashemesh.co.il` and holds the records: `www` CNAME to a `*.vercel-dns-*.com` target (account-specific, changes if the project moves account) and an apex A record to Vercel's anycast address. Copy values from Vercel's Domains page, not from a passing `dig`.

| Hostname (Project → Settings → Domains) | Role |
|---|---|
| `www.netashemesh.co.il` | Production |
| `netashemesh.co.il` | **308 redirect to www** |
| `netashemesh.vercel.app` | auto-assigned, ignore |

The apex→www 308 is Vercel configuration, not DNS and not in this repo: it does not travel with the domain. Re-adding the hostnames on another account without recreating it serves apex and www side by side and splits the canonical signal. `nettashemesh.co.il` (double t) is an old typo domain, deliberately not attached. Checked 2026-10-10: record TTL 300 s, apex answers 308 to www. Before any move, re-check with `dig +noall +answer www.netashemesh.co.il` and lower TTLs at least an hour ahead.

## Rollback

Vercel dashboard → project → **Instant Rollback** on the Production Deployment tile (or ⋮ on a deployment in Deployments). On the Hobby plan only the immediately previous production deployment is eligible. After a rollback Vercel stops auto-assigning production domains, so new pushes do not go live until you click **Undo Rollback** (or `vercel promote <deployment>`). Env var changes are not applied to a rolled-back build. Fix forward afterwards with a `git revert` on `main`.

## Gotchas

- Open Graph and Twitter images are committed PNGs in `src/app/`, updated by hand when branding or wording changes (the generated-from-JSX version faked RTL by reversing characters, which corrupts mixed Hebrew/Latin text).
- Security headers and the CSP are `headers()` in `next.config.ts`, the only copy. `images.qualities` must list every `quality` a `Photo` uses (`src/lib/image-quality.ts`; `next.config.ts` cannot use the `@/` alias, so keep the two in step).
