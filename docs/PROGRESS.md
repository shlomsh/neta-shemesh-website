# Migration Progress / Resume Handoff

Living status doc for the Canva→Next/Tailwind rebuild loop. Read this + `agents.md` to resume.
Last updated: 2026-06-19 (end of session).

**Priority #1 (remove all Canva structure / modern Next-React-Tailwind) is COMPLETE.**
All 7 sections rebuilt + decomposed, atomic cutover done, legacy deleted, build green.

**Next phases:**
- Priority #2: Make tests pass
- Priority #3: Fix QA bugs
- Priority #4: Visual/template match (two-server visual regression)

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

## STYLING STANDARD: Tailwind classes, NOT inline CSS (owner directive 2026-06-19, emphatic — "the whole point")
Cryptic IDs + inline `style={{}}` are the Canva antipattern; reproducing them as inline styles is NOT a
migration. Every rebuilt section MUST be idiomatic Tailwind:
- Style with Tailwind utility CLASSES. For engine-independent sizing use ARBITRARY-VALUE classes:
  `p-[16px]`, `px-[clamp(16px,4vw,64px)]`, `gap-[19px]`, `text-[clamp(24px,4.4vw,56px)]`, `leading-[1.1]`,
  `tracking-[-0.02em]`, `max-w-[922px]`, `min-h-[clamp(560px,56.25vw,720px)]`, `rounded-[28px]`.
- DO NOT use Tailwind default rem-scale utilities (`p-4`, `gap-6`, `text-xl`, `max-w-6xl`) — they are
  rem/vw-coupled.
- DO NOT use inline `style={{}}` EXCEPT for genuinely dynamic per-instance values (a computed stagger
  delay, a dynamic background-image URL, a per-index transform). No static styling via `style`.
- NO cryptic 16-char IDs — semantic classNames only; keep ONLY the section id + heading id(s) needed for
  anchors/tests.
- Backward-compatible look & feel: pixels unchanged, just expressed in clean Tailwind.
NOTE: Footer/Contact/Expertise already landed using inline styles — they need a Tailwind-class conversion
pass (look-preserving) before #1 is considered done.

## NO TESTS DURING THE REWRITE PHASE (owner directive 2026-06-19, emphatic)
We are mid short-blanket. Do straightforward refactoring ONLY. Do NOT run Playwright / the test suite
during the rewrite — that is the spiral. Tests get fixed/re-baselined ONLY AFTER every legacy piece is
completely removed (all sections rebuilt + atomic styles.css cutover done). Agents may run a single
`next build` sanity check; no test runs. Priority order stays: #1 remove all Canva → #2 tests → #3 QA
bugs → #4 template match.

### End-of-rewrite VALIDATION agent (owner-requested) — run AFTER cutover, BEFORE touching tests
Dispatch one final sonnet agent to confirm NO loose ends remain: zero SectionBand/gridArea/AnimatedBlock/
rise-*/linear_fade/pulse/dangerouslySetInnerHTML/cryptic-16-char-IDs/Tailwind-rem-utilities across all
src/components/layout/*.tsx; `canva-source/styles.css` import gone from layout.tsx; ViewportScale deleted
and unreferenced; globals.css free of orphaned Canva rules (cleanFadeUp, expertise-desc, vw-engine vars);
no leftover legacy files/imports; `next build` green. It REPORTS a loose-ends list (read-only audit) — it
does not fix. Lead then assigns any loose end to an agent. Only after this is clean do we start #2 (tests).

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
1. **Footer** — ✅ COMPLETE
2. **Services** — ✅ COMPLETE
3. Hero — ✅ COMPLETE
4. Contact — ✅ COMPLETE
5. About — ✅ COMPLETE
6. Expertise — ✅ COMPLETE
7. Testimonials — ✅ COMPLETE
8. **ATOMIC CUTOVER** — ✅ COMPLETE

## Decisions already ratified (don't re-ask)
- **Footer** — token sheet `docs/tokens/footer.md`. Photo bg + subtle dark gradient scrim; faithful
  3 hand-drawn brand-primary CTA highlight shapes (hidden ≤768); keep tall/cinematic (~720px @1280,
  fluid below). White centered RTL text. Phase-1 = kill SectionBand/gridArea/rise-*, px-clamp (no
  rem), ScrollReveal stagger.
- **Services** — decision memo `docs/tokens/services.md`. NOT a redesign; a de-coupling. Convert all
  Tailwind rem utilities → px/clamp anchored render-neutral at 1280 (rem×12.8); desktop golden must
  stay byte-identical; swap AnimatedBlock/cleanFadeUp → ScrollReveal; drop empty
  `dangerouslySetInnerHTML`. Edit only `Services.tsx` + `StepCard.tsx`.

## Hero font fix (owner, 2026-06-19) — HARD requirement at the Hero gate
The current hero renders the title ("מקום בטוח לצמוח בו ביחד.") and the top-right "נטע שמש" logo in the
WRONG font (looks like a fallback / non-heavy face — likely the `font-synthesis: none` + missing Stanga
heavy-weight gotcha, agents.md §4). After the Hero rebuild lands, dispatch a dedicated sonnet agent to
fix the hero title font AND the "נטע שמש" logo font to match the template (:8899). Do NOT merge Hero to
main until both fonts are correct. (Can't run in parallel with the Hero rebuild — same file.)

## Consolidation directive (owner, 2026-06-19): at the NEXT checkpoint
When the running executors land, **consolidate everything into `main`**: commit all working changes,
then merge the rebuild worktree branches (`worktree-agent-abb7e86dc9a5577db` = Footer,
`worktree-agent-ab5564e1e35b8691a` = Services) into `main`, then remove those worktrees + delete their
branches. NOTE: agents don't commit, so their work is *uncommitted* inside the worktree — lead commits
it on the branch (or applies the diff to main) before merging. **Do NOT** touch the foreign Gemini
worktree/branch `subagent-Senior-Next-js-Architect-...-e7cfe458` (under `~/.gemini/`) — not ours; ask first.

## RESUME TOMORROW — exact next action
Begin Priority #2: Make tests pass. We will start assigning failing tests to agents and re-baselining where intentional layout changes were made. See `docs/HANDOFF.md` for details.

## Invariants (never violate — see agents.md §4)
- Rebuilt sections use **px/clamp/%, never Tailwind rem spacing** (silently vw-scaled → +25% jump at cutover).
- `styles.css` removal is ONE atomic FINAL commit, AFTER every SectionBand section is off the grid.
- `toBeVisible()` passes on `opacity:0`; for fade-ins assert `toHaveCSS('opacity','1')`.
- No destructive git by anyone; no scratch files committed; build against `next start` on a fresh port.
