# Visual regression harness

Pixel-compares the **working tree** against any **git ref** at 0 px tolerance. No baselines are committed: every run builds the ref in a temp worktree and records its shots on the spot.

```
npm run vr -- <baseline-ref> [--pages home,blog,post] [--viewports 375,1440] [--sections <ids>] [--no-build] [--keep]
npm run vr -- HEAD                                  # a pure refactor must be 0 px
npm run vr -- main --pages home --viewports 375     # scope the gate to the blast radius
```

## What it does

1. `git worktree add --detach` the ref into a temp dir, clone `node_modules` in (`cp -cR`; `npm ci` if the lockfile differs).
2. `next build` both trees, `next start` them on two free ports.
3. Playwright (`playwright.config.ts` here, Chromium only, 2 workers) records the baseline into a temp snapshot dir, then compares the candidate with `toHaveScreenshot` (`maxDiffPixels: 0`, `threshold: 0`).
4. Prints a table and exits non-zero on any diff, size change, missing shot or horizontal overflow. Servers and the worktree are cleaned up even on failure. Diff images land in `tests/visual/.out/` (gitignored).

## Shots

- **home**: one element shot per top-level `main > section` plus `footer`, keyed by position (`home-03`) so an id rename is not a diff, at 1280x900, 1440x900, 1920x1080, 768x1024, 375x812.
- **blog** (index) and **post** (the first post), full page, at 1280, 768 and 375.

Deterministic: `reducedMotion: 'reduce'` (final static frames, SoftSnap off), `animations: 'disabled'`, map iframe masked, fonts and images awaited. **Hover, focus and in-flight animation are not covered.**

## Flags

- `--pages` / `--viewports`: subsets (blog and post exist only at 1280, 768, 375).
- `--sections hero,intro-lead,3`: home sections by element id or 1-based index; applied to both sides, so after an id rename use the index.
- `--no-build`: reuse the working tree's `.next` (may be stale; the baseline is always built).
- `--keep`: keep the temp worktree for debugging (`git worktree remove --force <path>` when done).

The default `playwright.config.ts` has `testIgnore: '**/visual/**'`, so `npx playwright test` never runs these. Files: `run.mjs` (runner), `vr.shots.ts` (shots, driven by `VR_*` env vars), `playwright.config.ts`.
