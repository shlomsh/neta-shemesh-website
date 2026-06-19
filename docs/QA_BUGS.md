# QA Bug List — Visual Gaps (Our Build vs. Template)

Living list maintained by the QA engineer. See `docs/QA_BRIEF.md` for method. One row per distinct gap.
Servers: ours = http://localhost:3000 · template = http://localhost:8899. Reference width = **1280**.

**Severity:** P1 = breaks the look / blocking · P2 = noticeable difference · P3 = polish.
**Status:** OPEN · IN PROGRESS · FIXED · WONTFIX. Tag `[rebuild-in-flight]` for Footer/Services while active.

| # | Section | Width | Gap (ours vs template) | Measured | Screenshots | Sev | Status |
|---|---------|-------|------------------------|----------|-------------|-----|--------|
| _ex_ | Hero | 1280 | _example: heading too small vs template_ | ours 48px / tmpl 63px | /tmp/qa/hero-1280-*.png | P2 | OPEN |
|   |         |       |                        |          |             |     |        |

## Notes / open questions for the team lead
- (record anything ambiguous here — e.g. "template card is dark, ours is cream: intended?")
