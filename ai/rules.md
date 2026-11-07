# Frontend rules for this migration

Read the backend repo's `ai/architecture.md` and `ai/rules.md` first — the
hard schema constraints live there. These are the frontend-specific
decisions already settled during design. Don't re-litigate them without a
real reason; they were chosen for stated reasons, not arbitrarily.

1. **"My Services" is one page, type-adaptive, not several pages.** One
   sidebar nav item. One list, from one `GET` against `userservices`
   (filtered by `user_id`, optionally by `type` client-side for a visual
   tab/filter within the list if wanted — that's a UI choice, not a second
   API call). One detail route (`/dashboard/services/:id`), one page
   component, with the **tab set** varying by `userservices.type`:
   - `chatbot`: Overview, Knowledge Base, Channels, Conversations,
     Analytics, Billing — reuse `chatbot-config-page.tsx`'s existing tab
     structure and the vertical-nav-card convention already standardized
     across the dashboard (same pattern as `settings-page.tsx`).
   - `agent` / `automation`: Overview, Schedule, Run History (backed by
     `pipeline_runs`, Phase 7), Billing.
   Do not build a second sidebar item for agents/automations, and do not
   build a visually different tab-switcher pattern for the two — same
   nav/tab component, different tab *contents*.

2. **The marketing `/services` page reuses `/pricing`'s filter-tab
   component.** All/Agents/Automations/Chatbots filtering already exists
   and works there — don't build a new filter component for `/services`.

3. **Don't build anything against the old `modules`/`usermodules`/`chatbots`
   (ownership fields) API shapes once Phase 1/2 land on the backend.** If a
   frontend task references `GET /modules`, `GET /usermodules/my`, or
   `GET /chatbots` for ownership data after those phases are live, that's a
   sign the task predates the migration — check `traces.md` for the current
   phase before building against an endpoint that might already be
   replaced.

4. **No work on this starts before the corresponding backend phase is live
   and verified.** The frontend phase order mirrors the backend's — see
   `implementation-guide.md`.
