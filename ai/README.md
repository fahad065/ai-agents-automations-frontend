# `ai/` folder — start here

Same purpose as the backend repo's `ai/` folder: lets any Claude Code
session, in any environment, pick up the database architecture migration
without replaying the conversation that designed it.

**The full schema lives in the backend repo**, not here —
`ai-agents-automations-backend/ai/architecture.md` is the single source of
truth for all 13 collections. Read that first. This folder only covers what
changes on the frontend as a result.

| File | Purpose |
|---|---|
| `overview.md` | What this repo is, and what's changing here because of the redesign. |
| `rules.md` | Frontend-specific constraints for this migration (mostly UX decisions already settled — don't re-litigate them). |
| `implementation-guide.md` | The frontend-specific slice of the phase plan (full plan is in the backend repo). |
| `traces.md` | Running, dated log. Newest entry first. |

This repo's own `CLAUDE.md` still documents every feature already shipped
and the platform-wide conventions (inline styles vs. Tailwind/shadcn,
bilingual rendering pattern, etc.) — this folder doesn't repeat any of
that, only what's new for the migration.

**Branch**: `fahad-development`, not `main`. Do not push to `main` unless
explicitly told to.
