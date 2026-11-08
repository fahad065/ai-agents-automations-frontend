# Implementation guide — frontend slice

Full phase plan and reasoning: `ai-agents-automations-backend/ai/implementation-guide.md`.
This is just the frontend-relevant parts, in the same order.

## Phase 1 (backend builds `services`) — frontend follow-on
Once `GET /services` (or wherever the new catalog gets served) is live,
repoint every catalog-reading page: `/agents`, `/automations`, `/chatbots`
list pages, `/pricing`, the admin `cms-modules` editor. Don't start this
before the backend phase is actually live — check `traces.md`.

## Phase 2 (backend builds `userservices`) — no frontend work yet
This phase is backend schema + migration only. The frontend keeps using
today's `GET /usermodules/my` / `GET /chatbots` endpoints until Phase 5,
*unless* the backend keeps those endpoints working by translating under the
hood during the transition — confirm which before assuming either way.

## Phase 5 — "My Services" (the real frontend phase)
Depends on backend Phases 2+3+4 being live. Build the unified list +
type-adaptive detail page described in `rules.md`. This replaces:
- `modules-page.tsx` (My Modules)
- The chatbot list page's ownership-listing role (its UI *shape* — cards,
  create modal, etc. — can likely be reused; only the data source changes)

## Phase 6 (backend: `feedback`, `activity_logs`, `cms` merge) — frontend follow-on
- `feedback`: a public-facing display component (rating + text) on each
  service's marketing detail page, and a one-time prompt somewhere in "My
  Services" for a customer to leave feedback on a service they own (once,
  enforced server-side per `{user_id, userservice_id}`).
- `activity_logs`: admin-only — a filterable activity feed page, similar
  shape to the existing admin usage/audit pages.
- **`cms` merge is ✅ done, merged to `main`, 2026-11-08** — turned out to
  need real frontend work, not "likely no visible change" as this section
  originally guessed: the backend API itself was redesigned (not kept
  backward-compatible), so every public page's fetch call and the whole
  admin editor (`dashboard/cms-page.tsx`) were rewritten against the new
  `/cms/content/...` and `/cms/admin/...` routes. Also added real page
  *creation* (not just editing the 7 fixed slugs) via a generic catch-all
  route, and FAQ sections on any page, not just the dedicated `/faq`
  page. See `traces.md` for the full breakdown — several entries, newest
  first.

## Phase 7 (agents/automations) — frontend follow-on
Build the "Run History" tab for the agent/automation side of "My Services,"
backed by `pipeline_runs`. Not before Phase 5's chatbot-side work is done
and shipped — chatbot-first priority applies here too.
