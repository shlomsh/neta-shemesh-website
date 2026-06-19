## REPORT A — EXECUTOR
```
SECTION:            tests
AGENT/MODEL:        self / gemini-2.5-flash
WORKTREE BRANCH:    chore/spec-cleanup-retry
TASK (1 line):      delete dead Canva DOM test specs

FILES (path → one-line responsibility):
  - tests/example.spec.ts → deleted
  - tests/animations.spec.ts → deleted
  - tests/computed-style-golden.spec.ts → deleted
  - tests/dom-fingerprint.spec.ts → deleted

CARD DECOMPOSITION (if any cards):
  N/A

STANDARD COMPLIANCE (count + ✅/❌):
  [ ] Fresh-authored, NOT transcribed from Canva markup ......... N/A
  [ ] Static inline style={{ }} ................................ N/A
  [ ] Cryptic 16-char Canva IDs ............................... N/A
  [ ] Tailwind rem-scale utilities (p-4/gap-6/text-xl/max-w-6xl) N/A
  [ ] Canva markers SectionBand/gridArea/AnimatedBlock/rise-*/linear_fade/pulse/dangerouslySetInnerHTML N/A
  [ ] No dependence on canva-source/styles.css ................ N/A
  [ ] dir="rtl" + reflows 1-up@375 → desktop@1280 ............. N/A
  [ ] ScrollReveal used; opacity resolves to 1 under reducedMotion N/A
  [ ] next build .............................................. N/A

LOOK & FEEL PARITY @1280 (same as before?): N/A

NEEDS A MANAGER-OWNED SHARED CHANGE? (globals.css / fonts / layout.tsx / page.tsx / primitives):
  NONE

BLOCKERS / STOP REASONS: NONE
GIT: confirmed NO git mutations (read-only `git diff --stat` only) ✅
SELF-VERDICT: READY FOR REVIEW
```
