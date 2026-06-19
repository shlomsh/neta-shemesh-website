# Handoff Plan: Transition to Phase 2 (Tests)

**Priority #1 is complete**: All 7 sections have been rebuilt, the atomic cutover from Canva CSS is done, legacy files deleted, and the build is green.

## Next Phase: Priority #2 - Make Tests Pass

1. **Review Test State**: Run the Playwright test suite against the new rebuilt application.
2. **Re-baseline Deliberate Layout Changes**: For areas where the visual structure legitimately changed (e.g., fluid desktop to mobile layout fixes), work with the lead/owner to accept the new visual baselines.
3. **Fix Real Regressions**: Address actual regressions captured by tests where the application diverges from the Canva template at the 1280px reference width (or critical mobile clipping).
4. **Agent Delegation**: Assign failing tests to the corresponding subagents for specific sections as tracked in `ALLOCATION.md`.

## Follow-up Phases

- **Priority #3**: Fix remaining QA bugs logged in `QA_BUGS.md`.
- **Priority #4**: Visual/template match (two-server visual regression against `http://localhost:8899`).
