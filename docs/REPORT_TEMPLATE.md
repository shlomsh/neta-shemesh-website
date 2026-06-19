# Agent Report Template (fill and return verbatim)

Two report types. EXECUTORS fill **Report A** after building. REVIEWERS fill **Report B**
independently (re-run the checks themselves — do NOT trust the executor's numbers). The team lead
reads only these and decides. Keep it tight: fill every field, use ✅/❌/⚠️, paste counts + evidence.

---

## REPORT A — EXECUTOR
```
SECTION:            <Hero | Services | …>
AGENT/MODEL:        <id> / <haiku|sonnet>
WORKTREE BRANCH:    <worktree-agent-…>
TASK (1 line):      <what you were asked to build>

FILES (path → one-line responsibility):
  - src/components/layout/<Section>.tsx → <…>
  - src/components/layout/<section>/<X>.tsx → <…>
  - …

CARD DECOMPOSITION (if any cards):
  <CardComponent> = <InnerA> + <InnerB> + <InnerC>   (props: <…>)

STANDARD COMPLIANCE (count + ✅/❌):
  [ ] Fresh-authored, NOT transcribed from Canva markup ......... <✅/❌>
  [ ] Static inline style={{ }} ................................ count=<n>  (target 0; dynamic-only allowed)  <✅/❌>
  [ ] Cryptic 16-char Canva IDs ............................... count=<n>  (target 0)  <✅/❌>
      kept (section+heading ids only): <id1>, <id2>
  [ ] Tailwind rem-scale utilities (p-4/gap-6/text-xl/max-w-6xl) count=<n> (target 0)  <✅/❌>
  [ ] Canva markers SectionBand/gridArea/AnimatedBlock/rise-*/linear_fade/pulse/dangerouslySetInnerHTML
      counts=<sb/ga/ab/rise/fade/pulse/dsih>  (target all 0)  <✅/❌>
  [ ] No dependence on canva-source/styles.css ................ <✅/❌>
  [ ] dir="rtl" + reflows 1-up@375 → desktop@1280 ............. <✅/❌>
  [ ] ScrollReveal used; opacity resolves to 1 under reducedMotion <✅/❌>
  [ ] next build .............................................. <GREEN/RED>
      <paste last ~8 lines of build output>

LOOK & FEEL PARITY @1280 (same as before?): <✅ same / ⚠️ minor delta: …>
  screenshots (/tmp only): <paths @1280 & @375>

NEEDS A MANAGER-OWNED SHARED CHANGE? (globals.css / fonts / layout.tsx / page.tsx / primitives):
  <NONE | describe exactly what + why>

BLOCKERS / STOP REASONS: <NONE | …>
GIT: confirmed NO git mutations (read-only `git diff --stat` only) <✅>
SELF-VERDICT: <READY FOR REVIEW | BLOCKED>
```

---

## REPORT B — REVIEWER (independent; re-run the checks yourself)
```
SECTION:            <…>
REVIEWED BRANCH:    <worktree-agent-…>
REVIEWER/MODEL:     <id> / <haiku|sonnet>
RE-RAN CHECKS INDEPENDENTLY (grep + build yourself, not trusting executor): <✅/❌>

PER-CRITERION VERDICT (PASS/FAIL + your own evidence file:line / count):
  Fresh-authored (no transcribed Canva structure) ....... <PASS/FAIL> — <evidence>
  No static inline style={{ }} .......................... <PASS/FAIL> — count=<n>
  No cryptic 16-char IDs (only section+heading kept) ..... <PASS/FAIL> — count=<n>
  No Tailwind rem-scale utilities ....................... <PASS/FAIL> — count=<n>
  No Canva markers (SB/GA/AB/rise/fade/pulse/dSIH) ....... <PASS/FAIL> — counts=<…>
  No styles.css dependence .............................. <PASS/FAIL>
  RTL + responsive reflow 375→1280 ...................... <PASS/FAIL>
  ScrollReveal + reducedMotion opacity:1 ................ <PASS/FAIL>
  next build GREEN (you ran it) ......................... <PASS/FAIL> — <evidence>

DECOMPOSITION QUALITY: <good | needs work> — <notes: are cards real inner components w/ clean props?>
LOOK & FEEL PARITY @1280 vs prior: <matches | deltas: …>  (screenshot compare path /tmp)
DEFECTS FOUND (severity): <list | NONE>
SHARED-CHANGE REQUESTS the executor flagged — valid? <…>

OVERALL VERDICT: <ACCEPT | ACCEPT-WITH-FOLLOWUPS | REJECT>
TOP REASONS: <2-4 bullets>
IF REJECT — what to re-allocate to the executor: <precise list>
```
