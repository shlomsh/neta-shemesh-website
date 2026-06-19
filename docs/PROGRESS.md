# Migration Progress / Resume Handoff

Living status doc for the Canva→Next/Tailwind rebuild loop. Read this + `agents.md` to resume.
Last updated: 2026-06-19 (end of session).

## ⚡ Refactor stance: GROUND-UP REBUILD, SAME LOOK (owner directive 2026-06-19)
*"Be brutal with the refactoring — we're stepping up to a rebuild, it'll be easier. Short blanket is
killing us, just rewrite. The look and feel should be the exact same, but rebuild the components from
the ground up — no local/global conflicts anymore. We'll fix and align to the tests and template
afterwards."*
- **Look & feel identical** — match the template/current appearance at 1280 and reflow below. This is a
  re-implementation, NOT a redesign.
- **Ground-up, self-contained components** — each section is a clean React+Tailwind component that does
  NOT depend on `canva-source/styles.css`, the global rem/vw engine, global keyframes (`cleanFadeUp`),
  or the SectionBand grid. End the two-coordinate-system conflict: styling is local px/clamp/%, immune
  to the final `html{font-size:16px}` flip. Don't transcribe gridArea/cryptic IDs (keep only IDs needed
  as link/anchor/test hooks).
- **Tests + template alignment happen AFTERWARD, together — not a blocking gate.** Hard gates for
  executors are only `next build` + `layout-fit.spec.ts` (375/768/1280) + structural asserts. Pixel/
  DOM-fingerprint goldens are EXPECTED to change — executors report diffs and **never** `UPDATE_GOLDEN`;
  lead + owner re-baseline the suite together after sections land.

## Execution tempo: SWIFT, no mid-rewrite spiral (owner directive 2026-06-19)
- Executors **loop to completion autonomously** — rebuild the whole section, don't stop to ask.
- **Be swift. Just rebuild.** Do NOT over-engineer; no abstractions/options/edge-case gold-plating
  beyond what the section needs to look the same and reflow.
- **Do NOT run checks iteratively during the rewrite** (that's the spiral). Write the clean component
  end-to-end, THEN run verification ONCE at the end: one `next build` + one `layout-fit` run +
  structural asserts + before/after screenshots. Report; never `UPDATE_GOLDEN`.

## Operating model (as of this session)
- **Team lead (orchestrator) makes ALL decisions and owns ALL git.** Executor subagents edit +
  test ONLY — no git ops of any kind. Lead reviews evidence at gates, merges, commits checkpoints.
- **Subagents MUST run on the `sonnet` model** (pass `model: "sonnet"` to every Agent spawn).
- **Parallelism:** up to 2 executors at once, each in its own **isolated git worktree** (separate
  `.next`, disjoint files) so concurrent builds/files can't collide. Lead reconciles each worktree
  back into `main` after its gate passes.
  - ⚠️ Caveat learned: a worktree with **no file changes is auto-cleaned** when its agent dies, so a
    crashed agent leaves nothing to recover. Have executors save work early / report often.

## Queue (simple → complex). Status against `src/` this session:
1. **Footer** — SectionBand + 3 gridArea + rise-*. ⬜ NOT STARTED (Phase 1 dispatched, agent died on 529).
2. **Services** — rem-coupled + AnimatedBlock/cleanFadeUp; `dangerouslySetInnerHTML` empty blob. ⬜ NOT STARTED (Phase 1 dispatched, agent process lost).
3. Hero — SectionBand + 4 gridArea + rise-*. ⬜
4. Contact — SectionBand + 4 gridArea + rise-*. ⬜
5. About — SectionBand + 8 gridArea + rise-*. ⬜
6. Expertise — SectionBand + 10 gridArea + rise-*. ⬜
7. Testimonials — 4 raw blobs + heavy rem (45 utilities). ⬜ (full Phase-1 rebuild)
8. **ATOMIC CUTOVER** (only after ALL above are off the SectionBand grid): one commit — drop
   `import "../../canva-source/styles.css"` from `layout.tsx`, add `html{font-size:16px}` to
   globals, delete `ViewportScale.tsx`, re-tune surviving rem dims, re-baseline goldens. ⬜

## Decisions already ratified (don't re-ask)
- **Footer** — token sheet `docs/tokens/footer.md`. Photo bg + subtle dark gradient scrim; faithful
  3 hand-drawn brand-primary CTA highlight shapes (hidden ≤768); keep tall/cinematic (~720px @1280,
  fluid below). White centered RTL text. Phase-1 = kill SectionBand/gridArea/rise-*, px-clamp (no
  rem), ScrollReveal stagger.
- **Services** — decision memo `docs/tokens/services.md`. NOT a redesign; a de-coupling. Convert all
  Tailwind rem utilities → px/clamp anchored render-neutral at 1280 (rem×12.8); desktop golden must
  stay byte-identical; swap AnimatedBlock/cleanFadeUp → ScrollReveal; drop empty
  `dangerouslySetInnerHTML`. Edit only `Services.tsx` + `StepCard.tsx`.

## RESUME TOMORROW — exact next action
Re-dispatch **Footer** (Track 1) and **Services** (Track 2) Phase-1 executors, **on `sonnet`**, each
in an isolated worktree, background. The full prompts used this session are in the session transcript;
both token sheets are committed. After each returns proof (build green, `layout-fit.spec.ts` green at
375/768/1280, structural asserts, before/after screenshots at 1280+375, read-only `git diff`, NO
`UPDATE_GOLDEN`): review at GATE 2, reconcile worktree → `main`, commit a checkpoint, update this file.

## Invariants (never violate — see agents.md §4)
- Rebuilt sections use **px/clamp/%, never Tailwind rem spacing** (silently vw-scaled → +25% jump at cutover).
- `styles.css` removal is ONE atomic FINAL commit, AFTER every SectionBand section is off the grid.
- `toBeVisible()` passes on `opacity:0`; for fade-ins assert `toHaveCSS('opacity','1')`.
- No destructive git by anyone; no scratch files committed; build against `next start` on a fresh port.
