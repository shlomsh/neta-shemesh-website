# Allocation Matrix — Bugs & Failing Tests → Section Owner Agent

Team lead owns this. Each QA bug and each failing test is assigned to the agent responsible for that
section. Every assigned agent must return PROOF; the lead rejects and re-dispatches on any slip.
Statuses: OPEN · ASSIGNED · FIX-CLAIMED (awaiting proof) · VERIFIED · DEFERRED.

## Per-section owners (current)
| Section | State | Owner for fixes |
|---------|-------|-----------------|
| Footer | rebuilt, merged | follow-up agent if needed |
| Services | rebuilt, merged | follow-up agent if needed |
| Expertise | rebuilt (build green), worktree | Expertise fix-agent |
| Contact | rebuilt (UNPROVEN build) | Contact verify/fix-agent |
| Hero | rebuilding (haiku) + font-fix queued | Hero fix-agent |
| About | not started | Wave 2 agent |
| Testimonials | not started | Wave 2 agent |

## QA bug allocation (from docs/QA_BUGS.md)
| Bug | Sev | Owner section | Status | Note |
|-----|-----|---------------|--------|------|
| Hero avatar crop/mask mismatch (1280) | P2 | Hero | FIX-CLAIMED | Hero rebuild told to mask avatar; verify |
| Hero title left-edge clip (375) | P1 | Hero | FIX-CLAIMED | px/clamp rebuild should fix; verify |
| **Hero title font + "נטע שמש" logo font wrong** | P1 | Hero (font-fix agent) | ASSIGNED | owner screenshot; Stanga-weight/font-synthesis gotcha |
| About hardcoded block width w-[450px] (1280) | P2 | About | OPEN | Wave 2 |
| About background SVG z-index stacking (768) | P2 | About | OPEN | Wave 2 |
| Expertise dark-vs-cream card bg (1280) | P2 | — | DEFERRED | palette call → #4 template-match pass, not now |
| Expertise missing stagger (375) | P3 | Expertise | FIX-CLAIMED | rebuild added ScrollReveal stagger; verify |
| Expertise broken header card (P1) | P1 | Expertise | FIX-CLAIMED | rebuild fixed cream-on-dark; verify |
| Services +25% inflation (1280) | P1 | Services | FIX-CLAIMED | de-coupling rebuild; verify |
| Services card grid squish (375) | P2 | Services | FIX-CLAIMED | verify reflow |
| Testimonials structure fragmentation/blobs (1280) | P1 | Testimonials | OPEN | Wave 2 (full rebuild) |
| Testimonials font weight / Stanga bold (375) | P2 | Testimonials | OPEN | Wave 2; shares root w/ Hero font (font-synthesis) |
| Contact form field spacing (1280) | P2 | Contact | FIX-CLAIMED | rebuild set 24px rhythm; verify |
| Footer link touch targets <48px (375) | P3 | Footer | OPEN | not addressed in rebuild; assign follow-up |
| Footer layout collapse / gridArea (1280) | P1 | Footer | FIX-CLAIMED | rebuild removed SectionBand; verify |

## Failing-test allocation
PENDING: lead delegated a suite run to enumerate failures by spec + section. Once received, each failing
test is assigned to its section owner here. Pixel/DOM goldens that fail purely because a section was
intentionally rebuilt are NOT bugs — they get deliberately re-baselined (lead + owner), not "fixed".
