# Docs index

**Board of record:** the live kanban, https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt (private to the owner). Ticket status lives there; the documents here are context and may lag it.

## Current

| Doc | What it is for |
|---|---|
| `stability-perf-plan-2026-10.md` | The iPhone stability and performance problem statement, hypotheses and evidence; section 9 summarises the outcome. |
| `typography-guideline-2026-10.md` | Record of the typography audit and the decisions taken. Where it disagrees with `CLAUDE.md`, `CLAUDE.md` wins. |
| `visual-roadmap-2026-10.md` | What shipped visually, what the owner rejected (do not re-propose), and the open ideas. |
| `deployment.md` | Vercel (production) and Azure SWA (staging) deployment, the env switches, and headers. Read before touching `next.config.ts`. |
| `neta.md` | Who Neta is and what the site is for; the source of truth for copy. |

## Archive (`archive/`)

Superseded or point-in-time documents, kept for history. Each starts with a banner saying what replaced it.

- `architecture-review-2026-10.md`: the architect's review (82 KB): findings, target APIs, execution plan, and the decisions (section 6). History; read only when a task names it.
- `sprint-board-2026-10.md`: snapshot of the ticket list, superseded by the live kanban.
- `tech-debt-plan-2026-10.md`: the behaviour-neutral refactor plan (executed). Its section 6 describes the pixel-diff method still cited from `agents.md`.
- `ACTION-PLAN.md`, `FULL-AUDIT-REPORT.md`: the June 2026 SEO audit, written before launch.

Design rules live in the repo root: `CLAUDE.md` (design system), `agents.md` (project context), `netta_voice.md` (copy tone).
