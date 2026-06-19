# Token Sheet / Decision Memo — Services (`cQd2ufFBWvr5c6ki` + `Qh3ZkxvVXI70qfpT`)

Services is the **rem-coupling** case, not a redesign. It is already semantic/reflowing
(text column + 4 `StepCard`s; dark "סיפורי הצלחה" video band). Its only real `styles.css`
dependency is that its Tailwind **rem utilities** (`py-32`, `max-w-6xl`, `gap-12`, `mt-8`,
`py-24`, `p-5`…) ride the vw-scaled `html` font-size (`1rem ≈ 12.8px` at 1280), so they'd jump
~+25% at the final cutover. (`cleanFadeUp`/`AnimatedBlock` live in globals.css + the legacy
`ScrollAnimator` runtime — independent of `styles.css`, but swapped for consistency.)

## ✅ Team-lead decision — BRUTAL REBUILD (updated 2026-06-19)
Directive from owner: *"be brutal with the refactoring… short blanket is killing us! just rewrite.
We'll go over the tests and fix them together."* So drop the timid render-neutral constraint.
- **Rewrite clean.** Keep the (already good) structure/copy as the content spine, but build it
  **properly fluid from scratch** — px/clamp/%, real reflow — don't try to reproduce the old vw-scaled
  render. Match the token-sheet intent at 1280; reflow cleanly below.
- **De-rem-couple completely:** zero Tailwind rem spacing/size utilities remain. Do NOT aim for
  byte-identical desktop goldens — **goldens WILL change and that's fine.** Report the diffs;
  the human re-baselines with the lead afterward. Executor must NOT run `UPDATE_GOLDEN`.
- **Animations:** swap `AnimatedBlock` + `cleanFadeUp` → `ScrollReveal` (Client Leaf Pattern; stagger
  as a `delay = index*0.x` prop computed in the server parent). `StepCard` already uses `ScrollReveal`.
- Remove the empty `dangerouslySetInnerHTML={{__html:''}}` on `#page-7`.
- Keep `Title`/`Prose` primitives (clamp-based already; import only, don't modify).
- Keep color utilities (`bg-canva-bg`, `bg-canva-dark`, `bg-canva-mid`, `text-canva-dark`,
  `text-white`) — they're `@theme` colors, not rem.

## rem→px anchor (×12.8 at 1280) — reference, executor verifies by measuring
`px-5`→16 · `py-16`→51 · `sm:py-24`→77 · `lg:py-32`→102 · `gap-12`→38 · `lg:gap-16`→51 ·
`mt-6`→19 · `mt-8`→26 · CTA `py-3.5`→11 / `px-8`→26 · `gap-6`→19 · `sm:gap-7`→22 ·
`py-24`→77 · `max-w-6xl`→922 · `max-w-3xl`→614 · `max-w-5xl`→819 · `mb-16`→51 · `gap-4`→13 ·
`px-4`→13 · `rounded-2xl`→16 · StepCard `p-5`→16 / `sm:p-6`→19 · `mt-2`→6 · `mb-3`→10 · `gap-1.5`→5.
(`text-[clamp(...)]` font sizes and `lg:w-[360px]`/`rounded-[28px]` are already px — keep.)

## Done when
- Zero Tailwind rem utilities remain in `Services.tsx`/`StepCard.tsx`; no `AnimatedBlock`/`cleanFadeUp`.
- `next build` green; `layout-fit.spec.ts` green at 375/768/1280.
- 1280 render unchanged (before/after screenshots ~identical; desktop golden not forced).
- Structural: heading "איך זה עובד?" visible, 4 step-cards present, "סיפורי הצלחה" visible, video present.
