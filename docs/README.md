# Docs index (all .md files)

Only `CLAUDE.md` is loaded automatically. Everything else is opened on demand, by the condition in the middle column. Do not read a file because it is listed here.

**Board of record:** the live kanban, https://claude.ai/artifact/GV4NpXrzjzc4wQ1XgBthwt (private to the owner). Ticket status lives there; these documents are context and may lag it.

| File | Read when | Size |
|---|---|---|
| `../CLAUDE.md` | Always loaded (design rules). Never re-read. | 7.7 KB |
| `../agents.md` | You need the repo map, test commands or gotchas. | 4.8 KB |
| `../README.md` | A human-facing overview or setup question. | 6.9 KB |
| `../PRODUCT.md` | Design/brand skills (impeccable) or audience and positioning questions. | 2.3 KB |
| `agent-reference.md` | Touching architecture, sections, motion, soft snap, fonts, JSON-LD (§1); persona (§2); Playwright or pixel-diff detail (§3); full gotchas (§4); deploy governance (§5); file map (§6). Grep its `## N.` headings, read one section. | 12.5 KB |
| `design-system-reference.md` | Touching fonts, tokens, contrast, card heights, the pager, or an iframe embed; long form of the CLAUDE.md rules (§1 type, §2 Latin and fallbacks, §3 colour utilities, §4 contrast, §5 exceptions, §6 Section, §7 layout, §8 iframe). | 14.8 KB |
| `deployment.md` | Touching `next.config.ts`, `public/staticwebapp.config.json`, headers, canonical URLs, images, or Vercel/Azure setup. | 13.3 KB |
| `neta.md` | Writing or checking site copy against who Neta is and what the site is for. | 4.2 KB |
| `netta_voice.md` | Writing copy or blog text in Netta's tone (her own articles as reference). | 12.6 KB |
| `guide.md` | Building a CSS scroll-driven entry/exit animation (generic reference, not project rules). | 8.1 KB |
| `../src/components/README.md` | Adding or moving a component folder; layer and folder rules. | 6.5 KB |
| `../src/components/primitives/README.md` | Using or changing a primitive (Section, Card, Photo, ButtonLink, ...). | 14.5 KB |
| `../tests-unit/sanity/README.md` | A sanity test fails or you are changing what it guards. | 18.5 KB |
| `../tests/visual/README.md` | Running the pixel-diff harness against a git ref. | 3.7 KB |
| `archive/*` | History, never read unless a task names a file. | 224 KB total |

`archive/` holds superseded or point-in-time documents (architecture review, sprint board, tech-debt and stability plans, typography record, visual roadmap, dependency audit, June 2026 SEO audit). Each starts with a banner saying what replaced it. Where one disagrees with `CLAUDE.md`, `CLAUDE.md` wins. The pixel-diff method cited from `agent-reference.md` §3 is in `archive/tech-debt-plan-2026-10.md` section 6.
