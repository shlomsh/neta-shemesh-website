# Visual regression harness

Pixel-compares the **current working tree** against any **git ref** at 0 px tolerance. No PNG baselines are
committed: every run builds the ref in a temp worktree and records its shots on the spot.

```
npm run vr -- <baseline-ref> [--pages home,blog,post] [--viewports 375,1440] [--sections <ids>] [--no-build] [--keep]
```

Examples:

```
npm run vr -- main                                  # everything, working tree vs main
npm run vr -- HEAD                                  # tree vs its own last commit (a pure refactor must be 0 px)
npm run vr -- main --pages home --viewports 375     # just the home page at 375
npm run vr -- main --pages home --sections hero,intro-lead,3
```

## What it does

1. `git worktree add --detach <tmp>/baseline <ref>`; `node_modules` is cloned in (`cp -cR`, copy-on-write).
2. `next build` the baseline, then `next build` the working tree (2 builds; run sequentially to spare the CPU).
3. `next start` both on two free ports. Their PIDs are printed; both process groups are killed and the temp
   worktree is removed when the run ends, including on failure or Ctrl-C.
4. Playwright (`tests/visual/playwright.config.ts`, Chromium only) records the baseline shots into a temp
   snapshot dir (`--update-snapshots=all`), then compares the candidate with `toHaveScreenshot`
   (`maxDiffPixels: 0`, `threshold: 0`).
5. Prints a table (shot, viewport, diff px, status) and exits non-zero on any diff, size change, missing
   shot, or horizontal overflow (`scrollWidth > clientWidth`, checked at every viewport).

Diff images (`*-actual.png`, `*-expected.png`, `*-diff.png`) land in `tests/visual/.out/` (gitignored).

## Shots

- **home**: one element screenshot per top-level `main > section` plus `footer` (not full page: at 375 px the
  page is taller than Chromium's capture limit) at 1280x900, 1440x900, 1920x1080, 768x1024, 375x812.
  Shots are keyed by position (`home-03`), the section id is only shown as a label, so an id rename is not a diff.
- **blog**: the blog index, full page, at 1280x900, 768x1024, 375x812.
- **post**: the first post linked from the blog index, full page, same three viewports.

Determinism: `reducedMotion: 'reduce'` (ScrollReveal, parallax and hero render their final static frame,
SoftSnap is off), `deviceScaleFactor: 1`, `animations: 'disabled'`, the Google Maps `<iframe>` is masked, the
page is scrolled once so lazy images load, then `document.fonts.ready` and `img.decode()` are awaited.
**Hover, focus and in-flight animation are therefore not covered.**

## Scoping flags (size the gate to the blast radius)

| Flag | Meaning |
|---|---|
| `--pages home,blog,post` | subset of pages (default: all three) |
| `--viewports 375,1440` | subset of widths: 1280, 1440, 1920, 768, 375 (blog/post only exist at 1280, 768, 375) |
| `--sections hero,intro-lead,3` | home sections by element id, 1-based index (`3` or `03`). The filter is applied to both sides, so after renaming an id use the index |
| `--no-build` | reuse the existing working-tree `.next` instead of rebuilding it (may be stale; the baseline is always built) |
| `--keep` | keep the temp worktree and snapshots for debugging (servers are still stopped; remove with `git worktree remove --force <path>`) |

## Not picked up by the normal Playwright run

The default `playwright.config.ts` has `testIgnore: '**/visual/**'`, and the VR config only matches
`vr.shots.ts`, so `npx playwright test` never runs these shots.

## Files

- `run.mjs`: the runner (worktrees, builds, servers, two Playwright passes, summary).
- `vr.shots.ts`: the shots, driven by `VR_*` env vars set by the runner.
- `playwright.config.ts`: VR-only config (0 px, reduced motion, 2 workers).
