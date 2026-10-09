# Dependency audit — netta-shemesh-website (NS-50, phase 1)

Date: 2026-10-09. Read-only audit; nothing was installed, upgraded or edited. Baseline: `package.json` / `package-lock.json` at `f017cc1` (identical at `2cfeb28`, the `origin/main` this doc is committed on). Registry data from `npm outdated --long`, `npm view`, `npm audit` on the same day.

Caveats:
- `node_modules` in the main checkout was being modified by another session while this audit ran (vitest/tailwind versions flipped between `npm ls` calls). All "current" versions below are taken from the lockfile, not from `node_modules`.
- Local Node is v24.13.0, npm 11.8.0. `npm outdated` picks the newest version whose `engines` match the running Node, so it **hides** packages whose latest needs a newer Node (see jsdom).
- framer-motion is being removed by NS-14/15. It is listed for completeness and not recommended for upgrade.

## 1. Top findings

1. **`next@16.2.9` is vulnerable to a stack of advisories, including 3 critical RCEs** (`npm audit --omit=dev`: 1 critical, 4 high, 1 moderate, all in the production tree). The whole 16.2.x line is still flagged (16.2.12 is the last 16.2 release and is inside the vulnerable range for the newest advisories), so the only fix is a minor bump to **>= 16.3.8** (npm audit proposes 16.4.0, non-major). It is exact-pinned, so `npm update` will not move it.
2. **Transitive prod vulnerabilities all ride on Next**: nested `postcss@8.4.31` (high, 4 advisories), optional `sharp@0.34.5` (high, 3), plus `nanoid`, `source-map-js`, `baseline-browser-mapping` which a lockfile-only refresh fixes. Next 16.3.8+/16.4.0 depends on `postcss 8.5.23` and `sharp ^0.35.4`, which clears both.
3. **Real exposure of this site is lower than the severity suggests, but not zero.** Site is on Vercel (platform runs its own image optimizer and routing; Windows-host and custom-server advisories do not apply). The Azure SWA deploy is a static export with no server at all. The app uses no Server Actions, no middleware/proxy, no rewrites, no `next/og`. It does use `next/image` with `formats: ['image/avif', ...]` (relevant to the AVIF image-optimizer RCE class, on self-hosted setups) and static/ISR-style pages. Treat as "upgrade now", not "emergency".
4. **Version hygiene is loose**: no `engines`, no `.nvmrc`/`.node-version`, CI uses floating `node-version: lts/*` (which flips to Node 26 around now), `@types/node` is `^20` while local/runtime Node is 24, and pins are a mix of exact (`next`, `react`, `react-dom`, `eslint-config-next`) and bare-major carets (`^4`, `^5`, `^9`, `^19`, `^20`).
5. **Unused / misplaced**: `fontkit` is never imported (only mentioned in a README line and two comments about one-off font measurement); `scripts/generate-logos.js` requires `playwright`, which is not declared (resolved only because `@playwright/test` pulls it in). Everything else declared is genuinely used. The 4 remaining `npm audit` findings that look scary but are dev-only (`braces`/`micromatch`/`fast-glob`/`@next/eslint-plugin-next`) have **no usable fix**: the audit's suggestion (`eslint-config-next@14.2.35`) is a major downgrade.

## 2. Summary table

Type = semver distance from current to latest. "Wanted" = highest version satisfying the current range in `package.json`.

| Package | Current | Wanted | Latest | Type | Risk | Recommendation |
|---|---|---|---|---|---|---|
| next | 16.2.9 (exact) | 16.2.9 | 16.4.0 | minor (2 minors) | Medium. Security fix. 16.4 notes list: strict route matching default, unmatched App pages now error, `unstable_` prefix removed from `navigation()`/`prefetch()`, Turbopack export-name mangling on in prod builds, legacy PPR removed. Site is a small App Router app, so likely no impact, but must build in both modes (Vercel SSR and `BUILD_STATIC_EXPORT=true`). | **Upgrade now** (target 16.4.0; fallback 16.3.8 if a regression appears) |
| eslint-config-next | 16.2.9 (exact) | 16.2.9 | 16.4.0 | minor | Low. Keep in lockstep with `next`. | **Upgrade now**, same batch as next |
| react / react-dom | 19.2.4 (exact) | 19.2.4 | 19.3.0 | minor | Low-Medium. No advisories. Hydration-sensitive tests exist (`reduced-motion-hydration`, `scroll-reveal-ssr`), so they are the canary. 19.3.0 is from 2026-09-09. | Batch later (C) |
| @types/react | 19.2.17 | 19.3.0 | 19.3.0 | minor | Low. Move with react. | Batch later (C) |
| @types/react-dom | 19.2.3 | 19.3.0 | 19.3.0 | minor | Low. Move with react. | Batch later (C) |
| tailwindcss | 4.3.1 | 4.3.3 | 4.3.3 | patch | Low. Lockfile-only (`^4`). | **Upgrade now** (A) |
| @tailwindcss/postcss | 4.3.1 | 4.3.3 | 4.3.3 | patch | Low. Currently flagged (moderate) via old postcss. | **Upgrade now** (A) |
| vitest | 4.1.9 | 4.1.11 | 5.0.3 | patch / major | Patch: low, fixes moderate `@vitest/mocker` path-traversal advisory. Major 5: needs Node `^22.12 \|\| ^24`, peer `@types/node ^22 \|\| >=24` (we are on `^20`), peer vite `^6.4 \|\| ^7 \|\| ^8`. | Patch **now** (A). Major: **hold**, own batch (E) |
| @vitejs/plugin-react | 6.0.2 | 6.1.2 | 6.1.2 | minor | Low. Peer vite `^8` (we have 8.0.16). | Batch B |
| @testing-library/react | 16.3.2 | 16.3.3 | 16.3.3 | patch | Low | **Upgrade now** (A) |
| @testing-library/jest-dom | 6.9.1 | 6.9.1 | 7.0.1 | major | Low-Medium. Needs Node >= 22; only `tests-unit/setup.ts` imports it. Little gain. | Hold (batch E with vitest 5) |
| @playwright/test | 1.61.0 | 1.64.0 | 1.64.0 | minor (3 minors) | Medium for visual work: new browser builds are downloaded and can shift sub-pixel rendering. The VR harness compares two trees with the same browser, so deltas cancel; there are no committed screenshot baselines. 1.64.0 is only 2 days old. | Batch B (wait a week) |
| eslint | 9.39.4 | 9.39.5 | 10.12.0 | patch / major | Patch: low. Major 10: **blocked**, `eslint-plugin-react`, `eslint-plugin-import`, `eslint-plugin-jsx-a11y` (all pulled in by eslint-config-next) peer-cap eslint at `^9`. | Patch **now** (A). Major: **hold** until eslint-config-next supports it |
| typescript | 5.9.3 | 5.9.3 | 7.0.2 | major (via 6.0.3) | High. `typescript-eslint` peer is `>=4.8.4 <6.1.0`, so TS 7 would break lint. Next 16.3+ can use TS 7 for `next build` type checking (`useTypeScriptCli`), but ESLint is the blocker. TS 6.0.x is allowed by the peer range. | Hold. Optional later spike: TS 6.0.3 on its own (F) |
| @types/node | 20.19.43 | 20.19.43 | 26.6.4 | major | Medium. Types should match the Node actually used (local 24; Vercel setting unknown). Required `>=24` or `^22` by vitest 5. | Decide Node baseline first, then `^24` (D) |
| jsdom | 29.1.1 | 29.1.1 | 30.1.2 (hidden by npm outdated) | major | Medium. 30.x needs Node `^22.22.2 \|\| ^24.15.0`; local 24.13.0 does not satisfy it, which is why `npm outdated` omits it. | Hold until Node >= 24.15 locally and in CI (E) |
| fontkit | 2.0.4 | 2.0.4 | 2.0.4 | none | None, up to date but **unused** | **Remove** (see section 4) |
| framer-motion | 12.40.0 (`^12.40.0`) | 12.43.0 | 14.0.0 | minor / major | n/a | **Do not upgrade.** Removed by NS-15 (see below) |

### framer-motion (separate note)

Runtime dependency imported by 2 source files (`motion/ParallaxFrame.tsx`, `site/ContactFAB.tsx`), one test (`reduced-motion-hydration.test.tsx`) and aliased to a stub in `vitest.config.ts` (`tests-unit/__mocks__/framer-motion.tsx`). NS-14/15 removes it, which also drops the `framer-motion` alias in `vitest.config.ts` and the mock. No upgrade, no audit findings against it. When that lands, re-run section 3 of this doc to confirm `motion-dom` / `motion-utils` leave the lockfile.

## 3. Security (`npm audit`, lockfile at f017cc1)

| Scope | Total | Critical | High | Moderate | Low |
|---|---|---|---|---|---|
| `npm audit --omit=dev` (ships to prod) | 6 | 1 | 4 | 1 | 0 |
| `npm audit` (full, incl. dev) | 18 | 1 | 13 | 4 | 0 |

### 3.1 Production tree (6 packages)

| Package (path) | Sev | Advisories (summary) | Fix without a major bump? |
|---|---|---|---|
| **next** 16.2.9 (direct) | critical | 3 critical RCEs: Windows-hosted servers (GHSA-p293-qw3h-jr36), Image Optimization API with AVIF (GHSA-2xp9-vwfh-vxw4), `next/og` ImageResponse (GHSA-vcvr-r3jv-pc5j). High: middleware/proxy bypass under Turbopack (GHSA-6gpp-xcg3-4w24), Server Actions DoS and SSRF (GHSA-m99w-x7hq-7vfj, GHSA-89xv-2m56-2m9x), rewrites SSRF (GHSA-p9j2-gv94-2wf4), Image Optimization SSRF (GHSA-cjq9-62q9-8jv4). Moderate/low: cache confusion x2, unbounded Server Action payload, SVG image DoS, server-function endpoint disclosure, SSG/ISR cache poisoning x2 (GHSA-4jqv-mc3x-m676, GHSA-mcj8-r9mp-w47p), metadata image route disclosure, dev MCP endpoint disclosure | **Yes**: `next@16.4.0` (not semver-major). Minimum clean version is 16.3.8 (the newest advisory ranges end at `<16.3.8`). Needs the exact pin changed, since `next` is pinned. |
| **postcss** 8.4.31 (nested in `node_modules/next/node_modules`) | high | XSS via unescaped `</style>` (GHSA-qx2v-qp2m-jg93); arbitrary file read via sourceMappingURL x3 (GHSA-6g55-p6wh-862q, GHSA-fxqj-rqcc-2cmp, GHSA-r28c-9q8g-f849) | **Yes**, via next >= 16.3.8 (depends on postcss 8.5.23). Not fixable on 16.2.x. |
| **sharp** 0.34.5 (optional dep of next) | high | libvips CVEs (GHSA-f88m-g3jw-g9cj), libheif (GHSA-rgj7-g3m4-5g8c), librsvg (GHSA-wq5f-xc86-pv6w) | **Yes**, via next >= 16.3.8 (`sharp ^0.35.4`, resolves to a patched 0.35.x) |
| **nanoid** 3.3.12 (via postcss) | high | Infinite loop with negative/zero size in custom generators (GHSA-28wg-ghj8-5hjv, GHSA-2v37-7h3g-55p8). Not reachable from our code. | **Yes**, `npm audit fix` (lockfile only) |
| **source-map-js** 1.2.1 (via postcss) | high | Event-loop DoS via indexed source-map offsets (GHSA-68fv-2mgg-jv7q). Build-time only. | **Yes**, `npm audit fix` (1.2.2) |
| **baseline-browser-mapping** 2.10.37 (via next) | moderate | Process termination on invalid input (GHSA-w5vr-8v7q-w6rv). Build-time only. | **Yes**, `npm audit fix` (>= 2.11.0) |

### 3.2 Additional findings in the full audit (dev tooling only, 12 more)

| Package | Sev | Advisory | Fix without a major bump? |
|---|---|---|---|
| undici 7.28.0 (via jsdom) | high | ~15 advisories (cache disclosure, WebSocket DoS, TLS bypass in BalancedPool, etc.). Test-only: jsdom never talks to the network in our tests. | Yes, `npm audit fix` -> >= 7.29.1 |
| brace-expansion 1.1.15 / 5.0.6 (eslint, typescript-estree) | high | Multiple ReDoS / recursion DoS | Yes, `npm audit fix` |
| js-yaml 4.2.0 (eslint) | high | Quadratic CPU on merge keys / omap | Yes, `npm audit fix` (>= 4.3.2) |
| browserslist 4.28.2 (eslint-plugin-react-hooks -> babel) | high | Unbounded memory, crash on untrusted stats file | Yes, `npm audit fix` |
| postcss 8.5.15 (top-level, via @tailwindcss/postcss / vite) | high | Same sourceMappingURL family | Yes: `tailwindcss`/`@tailwindcss/postcss` 4.3.3 pulls postcss 8.5.29 |
| @tailwindcss/postcss 4.3.1 | moderate | via postcss | Yes: 4.3.3 |
| vitest 4.1.9, @vitest/mocker | moderate | Path traversal via mock redirect (GHSA-82fw-gwwq-j7x9) | Yes: vitest 4.1.11 |
| braces 3.0.3, micromatch 4.0.8, fast-glob 3.3.1, @next/eslint-plugin-next, eslint-config-next | high | `braces` stack-exhaustion DoS on deeply nested patterns | **No usable fix.** Audit offers `eslint-config-next@14.2.35` (major downgrade); even `eslint-config-next@16.4.0` still pins `fast-glob 3.3.1`. Dev-only lint tooling that globs our own repo files; accept the risk and re-check when fast-glob/braces release a fix. |

### 3.3 What `npm audit fix` would do

`npm audit fix --dry-run` ends with the same 18 findings because 17 of them need either the pinned `next` (exact pin outside the range) or the upgrade of directly declared packages. A plain `npm audit fix` fixes only the lockfile-level transitive items (undici, brace-expansion, js-yaml, browserslist, nanoid, source-map-js, baseline-browser-mapping). The `next` entry needs the package.json edit in Batch A below.

## 4. Unused and misplaced dependencies

Method: a Node script scanning `src/`, `tests-unit/`, `tests/`, `scripts/` and root config files (`*.ts`, `*.mjs`, `*.json`, CSS `@import`/`@plugin`, workflows) for each declared name; cross-checked with `npx --yes depcheck --json`.

| Package | Where used | Verdict |
|---|---|---|
| next, react, react-dom | `src/**`, `next.config.ts`, `tests-unit/**` | Used at runtime. Correctly in `dependencies`. |
| framer-motion | `ParallaxFrame.tsx`, `ContactFAB.tsx`, one test, vitest alias + mock | Used, going away with NS-15 |
| @playwright/test | `playwright.config.ts`, `tests/**`, `tests/visual/**` | Used by tests only; devDep is correct. Next also lists it as an optional peer. |
| @tailwindcss/postcss | `postcss.config.mjs` (string key) | **Used** (depcheck false positive) |
| tailwindcss | `@import "tailwindcss"` in `src/app/globals.css` | **Used** (depcheck false positive) |
| @testing-library/react | 11 unit tests | Used (test-only; devDep correct) |
| @testing-library/jest-dom | `tests-unit/setup.ts` | Used (test-only) |
| @vitejs/plugin-react, jsdom, vitest | `vitest.config.ts`, tests | Used (test-only) |
| eslint, eslint-config-next | `eslint.config.mjs` | Used |
| typescript, @types/node, @types/react, @types/react-dom | type-checking, `next build`, ESLint | Used implicitly (no import needed) |
| **fontkit** | **only `package.json`**. README line 50 ("parsed with fontkit") and two comments in `globals.css` / `type-scale-css.test.ts` say fontkit was used once to measure Elamy. No script, test or config imports it. | **Unused. Remove.** Both depcheck and the grep agree. If the owner wants to keep the one-off measurement reproducible, put the script in `scripts/` first, or run it via `npx -p fontkit`. Also fix the README sentence, which claims it is part of the font loading. |

Other hygiene points:
- **Undeclared import**: `scripts/generate-logos.js` does `require('playwright')`. depcheck reports it as missing. It currently resolves only because `@playwright/test` depends on `playwright`. Either declare `playwright` or switch to `require('@playwright/test')`'s `chromium`.
- **Runtime devDeps**: none. Nothing in `src/` imports a devDependency; `@types/*` and `typescript` are build-time only. Next resolves `typescript` and `@types/*` during `next build`, so on Vercel they must stay installed (they are, since Vercel installs devDependencies for build).
- **Test-only dependencies in `dependencies`**: none.
- **Implicit dependency**: `sharp` is not declared; it is Next's optional dependency (`0.34.5` today) and is what the image optimizer uses on Vercel and on `next start`.

## 5. Version hygiene

| Item | State | Note |
|---|---|---|
| `engines` in package.json | **absent** | Next 16 needs Node >= 20.9; vitest 5 needs `^22.12 \|\| ^24`; jsdom 30 needs `^22.22.2 \|\| ^24.15.0`; @vitejs/plugin-react 6 needs `^20.19 \|\| >=22.12`. Add e.g. `"node": ">=22.12"` or `"^24"` once the baseline is chosen (the Node decision comes first). |
| `.nvmrc` / `.node-version` | **absent** | Node on Vercel is therefore whatever the Vercel project setting says; `.vercel/project.json` does not record it. **Verify in the Vercel dashboard** (Settings -> Node.js Version); I could not check it from here. |
| CI Node | `node-version: lts/*` in both workflows (`playwright.yml`, `azure-static-web-apps.yml`) | Floats. Node 26 becomes LTS around Oct 2026, so `lts/*` can change under us without a commit. Pin to the same major as local/Vercel (24). |
| Local Node | v24.13.0 | Below jsdom 30's 24.15 floor |
| Pins | Exact: `next`, `react`, `react-dom`, `eslint-config-next`. Caret with real version: `framer-motion ^12.40.0`, `@playwright/test ^1.61.0`, `@testing-library/* ^`, `@vitejs/plugin-react ^6.0.2`, `fontkit`, `jsdom ^29.1.1`, `vitest ^4.1.9`. **Bare-major carets**: `@tailwindcss/postcss ^4`, `tailwindcss ^4`, `@types/react ^19`, `@types/react-dom ^19`, `@types/node ^20`, `eslint ^9`, `typescript ^5` | Exact pins on `next`/`react` are deliberate, but they must be moved by hand, which is how `next` fell behind the advisories. Bare-major carets are harmless in practice because the lockfile pins resolved versions, but they make `npm outdated`'s "wanted" misleading and they print as `^4` rather than the version actually tested. Suggest writing the resolved version in every caret during the upgrade batches, and keeping `next`/`eslint-config-next` exact. |
| `lockfileVersion` | **3**, consistent with npm 11.8.0 and with `package.json` (root `packages[""]` matches; `npm ci` is used in CI) | OK |
| Duplicate React copies | `npm ls react react-dom`: a single `react@19.2.4` and `react-dom@19.2.4`, deduped under `@testing-library/react`, `framer-motion`, `next`, `styled-jsx` | OK, none |
| Duplicate postcss | 2 copies: `8.4.31` (nested in next, vulnerable), `8.5.x` top level (tailwind/vite). The nested one disappears on Next >= 16.3.8 | Fixed by Batch A |

## 6. Major-version-behind notes

| Package | Behind by | One-line risk | Migration guide |
|---|---|---|---|
| next | 2 minors (16.2 -> 16.4), not a major | See table; security-driven, check static-export and SSR builds | https://nextjs.org/blog/next-16-3 and https://nextjs.org/blog/next-16-4 ; docs: https://nextjs.org/docs/app/guides/upgrading |
| react / react-dom | 1 minor (19.2 -> 19.3) | Low | https://react.dev/blog (19.3 post) |
| typescript | 2 majors (5 -> 7) | Blocked by `typescript-eslint` peer `<6.1.0`; TS 7 is the native port; Next supports it for build type checks only | https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/ |
| eslint | 1 major (9 -> 10) | Blocked by `eslint-plugin-react`/`-import`/`-jsx-a11y` peers capped at `^9` via eslint-config-next | https://eslint.org/docs/latest/use/migrate-to-10.0.0 |
| vitest | 1 major (4 -> 5) | Needs Node 22.12/24, `@types/node` >= 22; changes to mocking/pool defaults possible | https://vitest.dev/guide/migration |
| jsdom | 1 major (29 -> 30) | Needs Node >= 24.15 / 22.22.2 | https://github.com/jsdom/jsdom/blob/main/Changelog.md |
| @testing-library/jest-dom | 1 major (6 -> 7) | Needs Node >= 22; matcher set otherwise same | https://github.com/testing-library/jest-dom/releases |
| @playwright/test | 3 minors (1.61 -> 1.64), not a major | New browser binaries; re-run VR after | https://playwright.dev/docs/release-notes |
| @types/node | 6 majors (20 -> 26) | Align to the real Node major, do not chase latest | https://nodejs.org/en/about/previous-releases |
| tailwindcss | none (4.3.1 -> 4.3.3 patch) | Low | https://tailwindcss.com/docs/upgrade-guide (only if v5 appears) |
| fontkit | none, but unused | n/a | n/a |
| framer-motion | 2 majors (12 -> 14) | Do not upgrade; removed by NS-15 | n/a |

(Links are the canonical doc locations for each project; I did not open every one.)

## 7. Proposed upgrade plan (small batches)

Common rules: one batch = one commit (or two) on its own branch; do not start a batch while NS-14/15 holds `package.json` (rebase after it merges, since removing framer-motion also changes the lockfile and the vitest alias); lockfile diffs must contain only the intended packages (`git diff --stat package-lock.json`); after each batch run the gate below and push to main only with owner approval (production deploy).

### Batch 0 — no-regret cleanup (before or alongside A)
- Remove `fontkit`; fix the README sentence; declare/replace the `playwright` import in `scripts/generate-logos.js`.
- Add `engines` and `.nvmrc` once the Node baseline is chosen; pin CI `node-version`.
- **Gate:** `npm ci`, `npm run lint`, `npx tsc --noEmit`, `npm run test:unit`, one `npm run build`.

### Batch A — security and patch, no API change (do first)
- `next` and `eslint-config-next` -> 16.4.0 (or 16.3.8). Lockfile-only: `tailwindcss` / `@tailwindcss/postcss` 4.3.3, `vitest` 4.1.11, `@testing-library/react` 16.3.3, `eslint` 9.39.5, then `npm audit fix` for the transitive dev items.
- Expected result: `npm audit --omit=dev` shows 0; full audit shows only the `braces`/`micromatch`/`fast-glob` family.
- **Gate:** full `vitest run` (includes `tests-unit/sanity`), lint, `tsc --noEmit`, **two builds**: `npm run build` and `BUILD_STATIC_EXPORT=true npm run build` (the Azure path), then `npm run start` + the Playwright specs once, and one `npm run vr -- <previous-ref>` against the pre-upgrade tree (expect 0 px). Next jumps two minors, so treat the Next change as its own commit inside the batch so it can be reverted alone.
- **Rollback:** revert the single commit; the lockfile reverts with it.

### Batch B — test tooling minors
- `@playwright/test` 1.64.0 (wait until it is about a week old), `@vitejs/plugin-react` 6.1.2. Run `npx playwright install chromium` for the new browser.
- **Gate:** `vitest run`, full Playwright suite once, VR run against the pre-batch ref (browser changed for both sides only if both trees use the same binary, so run both on the new one).

### Batch C — React minor
- `react`, `react-dom` 19.3.0 (exact), `@types/react`, `@types/react-dom` 19.3.0.
- **Gate:** full vitest (watch `reduced-motion-hydration`, `scroll-reveal-ssr`, `reveal-observer`), builds in both modes, browser console clean on `/` and `/blog`, VR 0 px.

### Batch D — Node baseline and types
- Choose the baseline (24 recommended: matches local and what vitest 5 / jsdom 30 require), set `engines`, `.nvmrc`, Vercel project Node version and CI. Then `@types/node` `^24`.
- **Gate:** `tsc --noEmit`, build, CI green on the pinned Node.

### Batch E — test stack majors (separate commits, in this order)
1. `jsdom` 30 (needs Node >= 24.15 first).
2. `vitest` 5 (needs D for `@types/node`). Check the vitest alias/mocks and `globals: true` config.
3. `@testing-library/jest-dom` 7.
- **Gate per commit:** `vitest run` (all of `tests-unit/**`), one build. VR not needed (no runtime code change).

### Batch F — language/lint majors (hold; revisit when ecosystem catches up)
- `eslint` 10: blocked until `eslint-config-next` ships plugins that allow it.
- `typescript`: optional spike on 6.0.3 alone (allowed by `typescript-eslint`); 7 is blocked by the `typescript-eslint` peer range. Next 16.3+ can run the `next build` type check with TS 7 independently via `useTypeScriptCli` if build time ever matters.
- **Gate:** lint, `tsc --noEmit`, builds, full vitest.

### Do not do
- No `npm audit fix --force`: it would downgrade `eslint-config-next` to 14.x.
- No framer-motion upgrade (NS-15).
- No Tailwind/React/Next majors until they exist; none are pending today.

## 8. Commands used (reproducible)

`npm outdated --long`, `npm audit --omit=dev --json`, `npm audit --json`, `npm audit fix --dry-run`, `npm ls react react-dom`, `npx --yes depcheck --json`, `npm view <pkg>@<ver> dependencies peerDependencies engines`. No install, no lockfile change.
