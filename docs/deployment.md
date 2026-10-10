# Deployment

The site ships to **one target: Vercel**, production at `https://www.netashemesh.co.il`. A push to `main` deploys through Vercel's Git integration (no workflow, hook or token). `vercel.json` sets `npm run build`, `.next` output and the test gate below.

## Environment variables

Only one is read by code: `NEXT_PUBLIC_SITE_URL` (`src/content/site.ts`, inlined at build time). Production leaves it unset and gets `https://www.netashemesh.co.il`. It drives the canonical, `og:url`, the sitemap and the JSON-LD `@id`s. When it points anywhere else (a preview, a tunnel), `layout.tsx` emits `robots: noindex, nofollow`, so a staging copy never competes with production (`tests-unit/lib/noindex-host.test.ts`). Never add `Disallow: /` to `robots.txt` for that: a blocked crawler never sees the `noindex`. `.env.example` also lists `NEXT_PUBLIC_GA_ID`; no code reads it.

## The test gate

Vercel does not wait for GitHub Actions, so a red `playwright.yml` cannot stop a deploy. The gate is `vercel.json` `ignoreCommand` → `scripts/vercel-ignore-build.sh`, which runs `vitest run` before every build. **Exit codes are inverted:**

| Exit | Meaning |
|---|---|
| `1` | tests passed (or the runner could not be installed): **build proceeds** |
| `0` | tests failed: **build skipped**, production keeps the previous deploy |

It fails open on infrastructure problems and closed on real test failures: a suite that cannot run must not silently freeze the site. A skipped build still reports **green** on GitHub (status "Canceled by Ignored Build Step"); check the deployment list, not the check mark. `playwright.yml` (lint, `tsc`, unit, build, Playwright) is the backstop and shows the failing test in red.

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
