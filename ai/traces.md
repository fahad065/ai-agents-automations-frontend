# Traces — running log

Newest entry first. Append, don't rewrite.

---

## 2026-11-11 (even later) — Combobox: chevron and clear "X" were colliding

User reported the down-arrow and clear "X" icons visually overlapping on
the trigger field. Root cause: the chevron was rendered as the trigger's
own last flex child (positioned by flex layout, ending right where the
trigger's `pr-8` padding began), while the clear button was absolutely
positioned at a fixed `right-7` — the two ended up occupying overlapping
pixel ranges rather than sitting side by side with any gap.

Fixed by pulling the chevron out of the trigger's flex flow entirely —
both the chevron and the clear button are now independently
absolutely-positioned siblings inside the same `relative` wrapper
(chevron fixed at `right-2.5`, `pointer-events-none` so clicks still
reach the trigger underneath; clear button at `right-8`, a real ~6px gap
between them), with the trigger's own `pr-*` sized to match (`pr-8` with
no clear button, `pr-14` when one is shown) so the label text never runs
under either icon. Also swapped `ChevronsUpDownIcon` (the up/down double
arrow) for a plain `ChevronDownIcon`, per the explicit ask for "just show
(down) icon."

**Verified**: `tsc --noEmit` + `npm run build` clean (all 43 routes).
Playwright screenshot + `boundingBox()` measurement on a live rebuilt
server confirmed the clear button's right edge sits a clean 32px from the
trigger's edge with no overlap with the chevron.

---

## 2026-11-11 (even later) — Combobox: two real bugs from the first pass, both user-reported

User tested the new platform-wide Combobox and reported two things broken, both confirmed real and fixed.

**1. The clear "X" was invisible almost everywhere.** Root cause: the first conversion pass set `allowClear={false}` on nearly every form-field Combobox (24 occurrences across 9 files) on the theory that "a required field with a default value has no none state to clear to." That was my own inference, not something asked for — the user's original ask was explicit and universal ("once user clicks on this icon, then it will clear selected option value from the dropdown"), no carve-out for required fields. Removed every `allowClear={false}` override (`sed` across all 9 files, confirmed zero remaining via grep) — the X now shows on every Combobox once something is selected, same as originally requested. CLAUDE.md's Dropdown convention section corrected to say so explicitly, so a future session doesn't reintroduce the same wrong inference.

**2. The API Keys provider dropdown's "Other" option wasn't discoverable.** The first version's `creatable` mode only showed an "Add "<query>"" row once you'd already typed something that didn't match a known provider — nothing in the dropdown's default (unopened-search) state hinted that typing a custom value was even possible. User remembered an explicit, always-visible "Other" option from before (a real one existed pre-Combobox, as a literal `<option>`) and asked for it back. Rebuilt `Combobox`'s `creatable` mode: now an **always-visible** "Other — add a new one" row sits at the bottom of the list regardless of search text; selecting it swaps the popover to a dedicated `Input` + "Add" button (not just the search box) — closer to the original UX than the inline-typing version was. Prop names changed accordingly: `createLabel` (a function) → `createRowLabel` (static string) + `createInputPlaceholder`, updated at the one call site (`api-keys-page.tsx`).

**Verified**: `tsc --noEmit` clean, `npm run build` clean (all 43 routes). Playwright against a clean rebuild + fresh server (avoided the known stale-`.next`/Turbopack chunk flake by rebuilding before testing): confirmed the "Other — add a new provider" row renders immediately on open with no typing required, clicking it reveals the dedicated input, submitting a custom value ("Stripe Payments") selects it correctly, and the clear "X" is now visible on that selection and correctly resets the field back to its placeholder when clicked.

---

## 2026-11-11 (later) — Platform-wide dropdown convention: every native `<select>` converted to a searchable Combobox

User asked for a standing rule, not a one-off: every dropdown in this codebase should open a searchable popover (search input + filtered list below, clear "X" on the right of the field), and this should apply to every future dropdown too, not just the API Keys one from earlier today.

**New `src/components/ui/combobox.tsx`** — built on the existing (previously zero-usage) `Popover` + `Command`/cmdk primitives, first real usage of `Popover` anywhere in this codebase. `ComboboxOption{value,label,icon?,disabled?}`, props: `allowClear` (default true — shows the "X"), `creatable` (lets the user type a value not in the list; shows a "Add "<query>"" row and calls `onChange` with the raw text — used by the API Keys provider field built earlier today). Clear "X" is rendered as a sibling `<button>` positioned absolutely over the trigger field, not nested inside the trigger's own `<button>` — avoids an invalid nested-button DOM structure.

**Documented as a standing rule in CLAUDE.md** ("Dropdown convention" section, right after Styling conventions) — any new dropdown uses `Combobox`, not a bare `<select>`; real brand icons (`react-icons/si`) for known providers, colored brand hex for genuinely colorful marks (Claude orange, Gemini blue, YouTube red) vs. `currentColor` for monochrome logos (OpenAI, ElevenLabs, Ollama) so they adapt to light/dark mode.

**Every live native `<select>` converted** (29 found via grep, 28 converted — `admin/admin-pipelines.tsx`'s is the one exception, confirmed dead code via grep for `AdminPipelines` import references before skipping it, same shadow-file pattern as the three dead files deleted in the admin-panel-revamp cleanup pass):
- `admin/admin-modules.tsx` — 9 selects (2 page filters + 7 inside the create/edit dialog's Basic/Pipeline tabs)
- `dashboard/users-page.tsx` — 4 (role/plan in the edit modal, status/plan page filters)
- `dashboard/overview.tsx` — 1 (pipeline-table type filter)
- `dashboard/chatbots-page.tsx` — 2 (admin "Build for" client picker, template filter)
- `dashboard/pipeline-logs-page.tsx` — 1 (module filter)
- `dashboard/chatbot-config-page.tsx` — 2 (the chat/embedding AI provider pickers added earlier today — now with real brand icons too, not plain text)
- `dashboard/activity-logs-page.tsx` — 2 (entity type / action filters)
- `dashboard/modules-page.tsx` — 4 (2 country selectors with flag icons, schedule frequency, status filter)
- `dashboard/subscriptions-page.tsx` — 2 (status/type filters)

Each conversion also removed its file's now-dead `selectClass`/`inputStyle` constant where nothing else referenced it, rather than leaving unused style strings behind.

**Real mid-build correction**: user flagged that the dropdown's provider icons (built earlier today for the API Keys page) were generic emoji, not real brand marks — asked specifically for Claude's orange logo, Gemini's blue icon, and OpenAI's own logo. Swapped to `react-icons/si` (Simple Icons): `SiOpenai`/`SiAnthropic`/`SiGooglegemini`/`SiYoutube`/`SiElevenlabs`/`SiOllama`, all already resolvable in the installed `react-icons@5.6.0`. Reused the same icon set in `chatbot-config-page.tsx`'s AI Model provider pickers for consistency.

**One real test-fixture bug caught before it was mistaken for an app bug**: an early Playwright check against a mocked `GET /api-keys` returning `{data: []}` threw `e.filter is not a function` inside the page — traced to `api-keys-page.tsx`'s `setKeys(res.data || [])`, which expects the real backend's raw-array response shape (`ApiKeysService.getKeys()` returns the array directly, no envelope), not a wrapped object. Fixed the test mock, not the app. Separately hit the known "ChunkLoadError / page renders as an unstyled bullet list" Turbopack flake noted in an earlier CLAUDE.md session on this exact codebase — confirmed it wasn't code-related by seeing the identical broken render on the very first, pre-interaction screenshot too, then cleared `.next` and restarted on a fresh port, which resolved it cleanly.

**Verified**: `tsc --noEmit` clean after every file, final `npm run build` clean (all 43 routes). Playwright: full open → search → select → clear → creatable-add flow confirmed working end-to-end on the API Keys provider Combobox (including the real anthropic/gemini/openai/youtube/elevenlabs/ollama icons rendering correctly), plus a visual pass on `modules-page.tsx`'s country Combobox (flag icons + checkmark) and `admin-modules.tsx`'s 4-Combobox Pipeline tab inside its dialog (no layout regressions, correct default values).

---

## 2026-11-11 — Add API Key dialog: dropdown + "Other" free-text provider

Companion to the backend's matching entry — read that one first (the
`provider` field is no longer enum-constrained, so any typed name is
accepted and normalized).

`api-keys-page.tsx`'s `KeyDialog` provider picker changed from a
button-grid to a real `<select>` dropdown, per the user's explicit ask.
Picking "Other — add a new provider" reveals a free-text `Input` instead
(new `isCustomProvider` state) — typing into it sets both `provider` and
`label` together, same auto-fill pattern known providers already used.
Each known `<option>` is prefixed with its existing `PROVIDERS` emoji
icon; "Other" is prefixed with 🔑, per a follow-up ask mid-build for icon
parity. No change needed to the table/badge rendering — it already fell
back to 🔑 for any provider not found in `PROVIDERS`, so a freshly-typed
custom provider picks up the right icon automatically.

**Verified**: `tsc --noEmit` + `npm run build` clean, all 43 routes.

---

## 2026-11-10 (even later) — Multi-provider AI (OpenAI/Claude/Gemini) for chatbots — companion to backend's `apikeys` rebuild

Companion to the backend's matching entry — read that one first for the
full design discussion (provider always explicit, model defaults to
"auto", and the real finding that agents/automations don't use BYOK at
all yet — deferred, chatbots went first per the user's own sequencing).

- `api-keys-page.tsx`'s `PROVIDERS` list gained Anthropic and Gemini
  entries (icon/color/helpUrl/placeholder), reused automatically
  everywhere else in the file that already looks up `PROVIDERS.find(...)`
  — no separate table to keep in sync.
- `chatbot-config-page.tsx`: new `AiModelConfig` type + `chatModelConfig`/
  `embeddingModelConfig` on the `Chatbot` interface and `overview` form
  state, round-tripped through the existing `PUT /chatbots/:id` (no new
  route). New "AI Model" `Section` on the Overview tab — a provider
  dropdown + model text input (placeholder "auto") for chat, and a
  separate pair for embeddings (dropdown only offers OpenAI/Gemini, with
  a one-line note on why Anthropic isn't an option there).
- The OpenAI-only key-gate (`AddOpenAiKeyDialog`, the dialog that prompts
  for a key before setup if one's missing) was generalized to
  `AddProviderKeyDialog` — takes whichever provider the bot is actually
  configured for and missing a key on. `checkOpenaiKey()` →
  `checkRequiredKeys()` now checks both the chat provider's key and the
  embedding provider's key (they can differ), surfacing the chat one
  first if both are missing since that's the more severe gap (no reply
  at all vs. just unranked knowledge).

**Verified**: `tsc --noEmit` + `npm run build` clean, all 43 routes.

---

## 2026-11-10 (later same day) — Delete Account dialog rebuilt: mode picker (Instant vs 8-day), typed confirm for Instant

Companion to the backend's matching entry — read that one first. The
single confirm `AlertDialog` from the first version is now a real
`Dialog` with a two-card mode picker:
- **"Delete in 8 days (recommended)"** — same plain-confirm flow as
  before, just relabeled with the corrected day-count and the day-7
  reminder mentioned explicitly in the card's own description.
- **"Delete instantly"** — selecting it reveals a typed confirmation
  input (`Type DELETE to confirm`); the destructive button stays
  disabled until the text matches exactly. On success, redirects to
  `/auth/login` after a short delay instead of showing the pending-
  deletion banner, since there's nothing pending — it already happened.

`requestDeletion()` now posts `{mode}` and branches its own success
handling per mode (instant → sign out and redirect; scheduled → show
the countdown banner, same as before). The Deactivate Account card's
description was also corrected to state what actually happens — "you
won't be able to log back in... email hello@logicmate.io to have an
admin reactivate it" — replacing the vaguer "reversible by contacting
support" from the first draft, since this behavior was already live on
the backend (`AuthService.login()` already blocked `isActive: false`
accounts) and just hadn't been described accurately in the UI copy.

**Verified**: `tsc --noEmit` clean, `next build` clean — no new routes,
same `/dashboard/settings` Security tab.

---

## 2026-11-10 — Account deletion + data export UI, in Settings → Security

Companion to the backend's matching entry (read that one first for the
confirmed policy: 7-working-day notice, account stays usable throughout,
billing anonymized not deleted, export covers everything). This is the
UI half, all in the existing Danger Zone section of `settings-page.tsx`
— no new page, since the user specifically pointed at "there is an
option to deactivate the account... we can utilize or implement
remaining functionality here."

- **"Download My Data"** card — `GET /account/export` with
  `responseType: "blob"`, triggers a real browser download
  (`logicmate-my-data.xlsx`) via a throwaway `<a download>` element.
  Sits above the existing Deactivate card since it's the thing a user
  should do *before* either deactivating or deleting.
- **"Delete Account Permanently"** card — only rendered when no deletion
  is already pending. Confirm dialog states the policy in plain language
  (7 working days, account stays usable, billing kept-anonymized,
  cancel-anytime) before calling `POST /account/deletion/request`.
- **Pending-deletion banner** — once `GET /account/deletion/status`
  returns a `pendingDeletionAt`, the Delete card is replaced by a red
  banner stating the exact date and a "Cancel Deletion Request" button
  (`POST /account/deletion/cancel`). Fetched alongside the existing
  notification-preferences load on mount, not a separate loading state.
- **Deliberately not built**: a global dashboard-wide banner (like
  `verify-email-banner.tsx`) for the pending-deletion state — the user's
  ask was scoped to the Settings page itself, and this would be the
  first thing to add if a future session decides account-wide visibility
  matters more than Settings-only.

**Verified**: `tsc --noEmit` clean, `next build` clean, 44 routes
(unchanged — no new route, just the existing `/dashboard/settings`
page's Security tab extended).

---

## 2026-11-09 — Activity Logs page added; two real Notifications bugs fixed

Companion to the backend's matching entry (read that one first for the
`activity_logs` design) — this is the frontend half: a new page, plus
two Notifications bugs caught while building the redirect-after-login
flow the user specifically asked about.

- **New `/dashboard/activity-logs` page** (`activity-logs-page.tsx`),
  nav item added to `src/config/nav.ts` under "Dashboard" — **not**
  `adminOnly`, since every user sees their own feed and only admin gets
  the filters + every-account view, same data source, branched client-
  side on `user.role`. Server-paginated (`page`/`limit`, same ChevronLeft/
  Right pattern as `cms-page.tsx`'s blog list) — this was deliberate per
  the user's explicit requirement that this scale to "tons of records"
  without fetching everything client-side.
- **Real bug #1, the one the user described directly**: "an user
  receives an email... clicks... should sign in and then redirect to
  particular url" — traced to `src/proxy.ts` (the dashboard auth-gate
  middleware) setting `?from=<path>` on the redirect to `/auth/login`,
  while `login-form.tsx`/`signup-form.tsx` only ever read `?redirect=`
  (the same param the Google OAuth `state` round-trip and the chatbot
  autostart flow already use end to end). Every protected-URL click
  while logged out silently lost its destination and always landed back
  on the plain `/dashboard` post-login. Fixed in `proxy.ts`: now sets
  `redirect` to the full original path **plus its query string** (e.g.
  `/dashboard/chatbots/abc?tab=conversations`, not just the bare path —
  the old code dropped query params too, a second half of the same bug).
- **Real bug #2, found while auditing `actionUrl` end to end**:
  `notifications-page.tsx`'s click handler called `router.push(notif.
  actionUrl)` unconditionally — but `actionUrl` is sometimes a real
  external link (`onPipelineComplete`'s YouTube URL), and Next's router
  silently mishandles an absolute external URL passed to `push()`. New
  shared `src/lib/notification-nav.ts` (`navigateToAction()`) checks for
  `http(s)://` and opens those in a new tab instead.
- **Real bug #3, same audit**: `site-header.tsx`'s notification-bell
  dropdown (the one in the top nav, separate from the full
  `/dashboard/notifications` page) didn't navigate anywhere on click at
  all — it only marked the notification as read. Wired it to the same
  `navigateToAction()` helper.

**Verified**: `tsc --noEmit` clean, `next build` clean, 44 routes (up
from 43 — the new `/dashboard/activity-logs`).

---

## 2026-11-08 (even later) — Real slug mismatch found and fixed — code now matches what's actually saved

User tested `/cookies` locally and got a 404 from the backend. Root
cause: they'd saved the 7 structural pages from `/dashboard/cms` using
their own slugs, not the short ones every fetch call assumed —
`about-logicmate`, `contact-us`, `privacy-policy`, `terms-of-service`,
`cookie-policy`, `frequently-asked-questions`, `refund-policy`. Every
hardcoded fetch (`about`, `contact`, `privacy`, `terms`, `cookies`,
`faq`, `refund`) was looking up a slug that simply didn't exist.

Fixed every call site to match the real saved values — no data was
touched, this is purely a code-side fix:
- `app/(marketing)/privacy/page.tsx`, `terms/page.tsx`, `cookies/page.tsx`,
  `refund/page.tsx` — the `<LegalPage slug="...">` prop each passes.
- `components/marketing/about-page.tsx`, `contact-page.tsx`,
  `faq-page.tsx` — their own internally-hardcoded `fetch(.../cms/content/
  page/...)` URLs.
- `components/dashboard/cms-page.tsx` — `CORE_PAGE_SLUGS` (the "can't
  delete this, it backs a real route" list) and the `includeFaq` toggle's
  default-on heuristic, both previously keyed on the short slugs.

See the backend repo's `traces.md` for the matching `CmsPageSlug` enum
fix (`seed()` and the About-page backfill both reference that enum, so
one change there covered both).

**Worth remembering for next time**: the URL a page lives at (`/cookies`,
a Next.js folder name) and the slug stored for its `cms` document in
Mongo (`cookie-policy`) are two independent things — nothing enforces
them matching, they just need to be wired together correctly in whatever
code does the fetch. A mismatch here reads as "page 404s" with no error
anywhere obviously pointing at "wrong slug" — worth checking first
whenever one of the 7 structural pages 404s unexpectedly.

Verified: `tsc --noEmit` clean, `next build` clean, all 43 routes still
generating.

---

## 2026-11-08 (later same day) — "+ New Page" actually added — pages are now creatable, not just editable

Follow-up: the user caught that the previous rewrite (below) still only
let you *edit* the 7 fixed pages, with no way to add a new one — pointed
out directly: "I should be able to add both blogs and pages from
dashboard/cms... Right now I can't add pages." Also: "no script or
seeding directly now" — i.e. this needs to be real UI, not a backfill/seed
workaround.

- `PageEditModal` generalized to a create-or-edit modal (`item` is now
  optional — no `item` means create). Create mode adds a Slug input
  (auto-generated from title, editable before first save, shown as
  read-only after), a Published switch, and AR variants for
  `metaTitle`/`metaDescription` that the edit form was missing entirely
  before (schema already had `metaTitle_ar`/`metaDescription_ar`, just
  never exposed in this UI).
- `CmsPage()`'s Pages tab switched from fetching the 7 hardcoded slugs one
  by one to `GET /cms/admin?type=page&limit=100` — the same generic
  listing the Blog tab already used, filtered by type. A newly created
  page just shows up in this list like any other.
- **New public route to actually serve a new page**: a brand-new page
  document had nowhere to render — there's no generic page-by-slug route,
  only 7 dedicated folders (`about/`, `contact/`, ...). Added
  `src/app/(marketing)/[slug]/page.tsx` (+ `components/marketing/
  generic-page.tsx`) — a catch-all that fetches `/cms/content/page/:slug`
  and renders it through the same shared `CmsPage`/`CmsContent` shell the
  legal pages use. Next.js always prefers a literal route segment over a
  dynamic one, so this can't shadow `/about`, `/pricing`, etc. — confirmed
  via a real build showing `ƒ /[slug]` alongside every existing literal
  route with no conflicts.
- **Deletion added for pages too, but gated**: the 7 structural slugs
  (`CORE_PAGE_SLUGS`, renamed from `PAGE_SLUGS`) each back a real,
  hardcoded Next.js route — deleting their content would break a live
  page, so no delete button renders for them. Any other page (admin-
  created, rendered through the new catch-all) gets a delete button,
  same `AlertDialog` soft-delete pattern as blog posts. The one shared
  delete handler (`confirmDelete`, renamed from `confirmDeletePost`) and
  its dialog now read `deleteTarget.type` to word the confirmation
  correctly for either kind.
- A `CUSTOM` badge marks non-structural pages in the list, and a `DRAFT`
  badge shows when `isPublished === false`, mirroring the blog list's
  Live/Draft badge.

**Verified**: `tsc --noEmit` clean, `next build` clean — 43 routes now
(up from 42), including the new `ƒ /[slug]`.

---

## 2026-11-08 — CMS admin page rebuilt against the new unified `/cms/admin` API

Companion to the backend's "CMS API redesigned too" trace entry — read
that one first for the why. Summary on this side:

- Every public marketing page that fetches CMS content switched from
  `/cms/pages/:slug` and `/cms/blog(/:slug)` to the new
  `/cms/content/:type/:slug` and `/cms/content?type=...` routes:
  `about-page.tsx`, `contact-page.tsx`, `faq-page.tsx`, `legal-page.tsx`,
  `blog-post-page.tsx`, `blog-list-page.tsx`, and
  `app/(marketing)/blog/[slug]/page.tsx`'s `generateMetadata`. Response
  shape is unchanged (still flat — `flattenCms()` on the backend still
  spreads `pageMeta`/`blogMeta` onto the top level), so none of these
  pages needed any change beyond the URL.
- `dashboard/cms-page.tsx` (the real, live admin CMS editor — confirmed
  via the actual route import, not assumed) fully rewritten against
  `/cms/admin`, `/cms/admin/:id`, `/cms/admin` (POST), `/cms/admin/:id`
  (PUT/DELETE), `/cms/admin/seed`. Fixed a real naming bug while rewriting
  it: the old `interface CmsPage` shadowed the exported `CmsPage`
  component (same file, different namespaces, so TypeScript allowed it,
  but it read as a bug on a skim) — renamed to `CmsItem`.
- **Kept the two-tab, two-modal UI (Blog Posts / Pages)** — this is a
  deliberate choice to flag, not an oversight: a fixed page (FAQ items,
  no author/tags/publish-date) and a blog post (author/tags/publish-date,
  no FAQ) have genuinely different field sets, so one form covering both
  would just be a maze of `if (type === 'page')` conditionals. What's
  unified is the data model and the one backend resource both modals now
  hit — not the shape of the editing forms.
- `src/components/admin/admin-cms.tsx` **deleted** — confirmed dead,
  never imported anywhere (grep for `AdminCms`/`admin-cms` found only
  self-matches). Same recurring dead-shadow-file pattern this codebase
  has hit before (`dashboard/admin-users.tsx` behind `users-page.tsx`,
  etc. — see earlier phases of the admin-panel-revamp work in this repo's
  main CLAUDE.md). `src/components/marketing/cms-page.tsx` is a
  completely different, small, unrelated public layout shell (no API
  calls at all) — confirmed and left untouched.
- Pages are still only ever **edited**, never created, from this admin
  UI — the 7 fixed slugs (`PAGE_SLUGS` in the component) correspond to
  real Next.js routes (`/about`, `/contact`, ...), so there was never a
  "+ New Page" button to begin with and still isn't one.

**Verified:** had to `npm install` first — no `node_modules` existed in
this sandbox session yet (790 packages installed). Then `tsc --noEmit`
clean, `next build` clean, all 42 routes generating (including
`/dashboard/cms`).

---

## 2026-11-07 — `ai/` folder created, no frontend implementation started yet

`fahad-development` branch created from `main` and pushed. This `ai/`
folder written alongside the equivalent (fuller) one in the backend repo.
No frontend code changes have been made yet — the migration hasn't reached
a phase that needs frontend work (Phase 5, per
`ai-agents-automations-backend/ai/implementation-guide.md`). Check that
file's phase status, and this repo's own `rules.md`/`implementation-guide.md`,
before starting any frontend task related to this redesign.

## 2026-11-11 — Documents subsection added to the Profile page (not a separate route)

User explicitly rejected a separate `/dashboard/documents` route/page for
the new `documents` entity (see the backend repo's `ai/architecture.md`
"documents" section for the schema/endpoints, already built and pushed
before this change): *"I don't want separate URL like
/dashboard/documents... it should be under profiles page... in UI
perspective I just need only one page as profile, and under the same
profile page we will have subsection called documents."*

- `src/components/dashboard/profile-page.tsx` gained a new "Documents"
  `Section`, placed between the existing "Content Preferences" and
  "Appearance" sections — same inline-styled `Section`/`colors` pattern
  as the rest of this file (this page was never part of the
  Tailwind/shadcn admin-panel-revamp batches, so it stayed consistent
  with its own existing convention rather than introducing a second
  styling system mid-file). The database side is unchanged from what the
  backend already built — a separate `documents` Mongo collection, not
  an embedded array — this was purely a frontend routing/placement
  correction, nothing about the data model needed to change.
- Upload row: a `Combobox` (document type, `creatable`) + native file
  input (accept jpg/png/webp/pdf) + an Upload button. `getDocumentTypeOptions(country)`
  returns country-specific presets (UAE → Emirates ID/Trade License/etc,
  Kenya → National ID/KRA PIN/etc, plus Saudi/US/UK/India/Pakistan) merged
  with a generic fallback set (Passport/National ID/Driving
  License/Business Registration Certificate/Tax Certificate) for any
  other country — the Combobox's `creatable` "Other" row covers anything
  not on either list, per the user's own stated requirement.
- List of the user's existing documents below the upload row (type, date,
  formatted file size, a "View" link to the file, a delete icon) — empty
  state when there are none. Delete goes through a real `AlertDialog`
  confirm (`deleteTarget` state), matching this whole project's
  established "no `confirm()`, always a real dialog" convention, even on
  this otherwise-inline-styled page (same precedent `modules-page.tsx`
  set in an earlier phase: mixing a shadcn dialog into an inline-styled
  page is already normal here).
- The upload request is **plain `fetch` with `FormData`**, not the `api`
  axios instance already imported in this file — `api` is an axios
  instance created with a default `Content-Type: application/json`
  header, which does not get discarded automatically for a `FormData`
  body the way a bare `fetch`/XHR does, and would have broken the
  multipart boundary. `GET`/`DELETE` on `/documents` still go through the
  normal `api` instance, since those are plain JSON requests with no such
  conflict.
- **Still pending, not done by the user yet**: `BLOB_READ_WRITE_TOKEN`
  needs to be added as a Railway env var on the backend for uploads to
  actually work in production (flagged again here since this is the
  frontend half of the same feature finally landing).
- **Still deferred, not started**: the "first confirmed payment → one-time
  nudge to upload a document" banner, reusing `ProfileCompletionBanner`
  per the user's own instruction — blocked on `userservices`/invoicing
  not existing yet, same as noted when the backend module was built.

**Verified:** `tsc --noEmit` clean, `npm run build` clean (all 44 routes,
including `/dashboard/profile`), and a Playwright pass against a mocked
`GET/POST/DELETE /documents` and `GET /users/profile` confirmed: the
Documents section renders in the correct position (between Content
Preferences and Appearance, not a separate page), an existing document
row displays correctly, the document-type Combobox shows the UAE presets
for a UAE-country user, the delete `AlertDialog` opens with the right
document name, and there's zero horizontal overflow at 390px.

## 2026-11-12 — `users` module aligned to the finalized backend schema

Companion to the backend's matching traces.md entry (see
`ai-agents-automations-backend/ai/architecture.md`'s `users` section for
the full detail) — user asked to implement the complete users module,
frontend and backend, per the finalized schema in that redesign's
`architecture.md`.

- `users-page.tsx` (admin users CRUD): `isActive: boolean` → `status:
  'active'|'inactive'` throughout (interface, edit-form state, the
  Account Active `Switch`, the status filter `Combobox` — options changed
  from `true`/`false` to `active`/`inactive`, the query param sent to
  `GET /users` changed from `isActive=` to `status=`). The "Modules"
  column now sums `totalAgents + totalAutomations + totalChatbots` — the
  backend's admin list response gained `totalChatbots` alongside the
  (still-present-in-the-API-response, now-computed-not-stored)
  `totalAgents`/`totalAutomations`.
- `settings-page.tsx`'s Notifications tab: local `notifs` state keys
  renamed to match the backend's new nested shape 1:1
  (`onComplete`/`onFail`/`trialExpiry`/`billing`/`emailUpdates` instead of
  `notifyOnComplete`/etc.), read from `u.notifyPreferences?.x` instead of
  flat top-level fields, and the save call now sends
  `{notifyPreferences: notifs}` instead of 5 flat keys.
- `usage-page.tsx`'s `TenantUsage` interface: `isActive?: boolean` → the
  real `status?: 'active'|'inactive'` (was declared but never actually
  rendered anywhere — a type-only fix).
- `types/index.ts` and `auth.store.ts`'s `User` interfaces: `planType` was
  typed `"trial" | "lifetime" | "pro" | "free"` — none of the last three
  match the real backend `PlanType` enum
  (`trial|paid|free_forever|expired`), confirmed via grep this was pure
  type drift with no runtime logic actually depending on the wrong values.
  Fixed both to the real enum, and added `isActive`→`status` there too
  (`types/index.ts`'s `User` turned out to be dead/unused — nothing
  imports it — fixed anyway for correctness since it was cheap).

Verified: `tsc --noEmit` + `npm run build` clean (44 routes), and a
Playwright pass against mocked `GET /users` / `PATCH /users/profile`
confirmed: the Modules column sums all three counts correctly, the
Account Active switch reflects `status === "active"` for an active user,
the status filter dropdown offers Active/Inactive, and saving
notification preferences posts the correct nested
`{notifyPreferences: {...}}` body and the toggles render the mocked
values correctly on load.

## 2026-11-12 — Phase 0 frontend cleanup

Companion to the backend traces.md entry of the same date.
`modules-page.tsx`'s marketplace no longer calls `GET /niches` — that
route was never registered on the backend, so the request 404'd, rejected
the `Promise.all`, and left the "+ Add Module" grid empty. Niche filter
pills are now derived from the loaded modules' `nicheSlug` values.
Removed the dead trends/content-ideas helpers from `dashboard-api.ts`.
Industries pages (`/industries`, `/industries/:slug`,
`/dashboard/industries`) intentionally untouched until Phase 1/2.
Verified: tsc + build clean, Playwright confirmed the marketplace grid and
niche pills render with no `/niches` request.

## 2026-11-12 — Phase 1: catalog readers switched to `/services`

Companion to the backend traces.md entry of the same date. Every catalog
reader moved from `/modules` to `/services` with the renamed fields
(`moduleType`→`type`, `features`→`featureCards`, `isActive`/`isComingSoon`
→`status`): agents/automations/chatbots list + detail pages, the three
`[slug]/page.tsx` metadata fetchers, `/pricing`, `industry-detail-page`,
homepage `agents-section`/`automations-section`, `sitemap.ts`,
`dashboard-api.ts`, the dashboard marketplace (`modules-page.tsx` — it
still sends `moduleType` to `/usermodules/activate`, since that's the
UserModule field name, now sourced from `module.type`), and
`admin-industries.tsx`'s module picker.

Admin editor (`admin-modules.tsx`): the two contradictory "Active" /
"Coming Soon" checkboxes became one Status Combobox (active / coming
soon / inactive); the dead Output Type field was removed; endpoints moved
to `/services` and `/services/admin/all?limit=200`.

Pre-existing bug fixed: `/pricing` and the admin list both showed only 20
of the 22 catalog entries (default page size). Still open: the editor's
Testimonials tab never persisted anything (no such field on the schema).

Verified: tsc + build clean; Playwright against mock data generated from
the real compiled backend seed + mapper — /pricing renders all 22 with 11
coming-soon overlays, agent feature cards and chatbot $39/$79 tiers render,
the admin list shows 22 of 22, the edit dialog has the Status picker, and
saving PATCHes `/services/:id` with only the new field names. Zero calls
to `/modules`.

## 2026-11-12 — Services landing page; navbar Industries -> Services; schema trims

- Navbar: "Industries" replaced with "Services" -> `/services` (same
  `NAV_LINKS` array feeds desktop and mobile menus). `/industries` pages
  still exist and are still linked from the footer and homepage —
  intentionally untouched until industries become bundle services.
- New `/services` (`services-list-page.tsx`): fetches all services, search
  + a type `Combobox` (AI Agents / Automations / Chatbots), filter synced
  to `?type=` so filtered views are linkable. Chatbot cards show "From
  $X" (lowest tier). Cards link to `/services/<slug>`.
- New `/services/[slug]`: server-side lookup of the service's type, then
  renders the existing `AgentDetailPage`/`AutomationDetailPage`/
  `ChatbotDetailPage` — no duplicated detail code; unknown slug -> 404.
  Old `/agents|/automations|/chatbots/<slug>` URLs still work.
- Services trimmed to the UML: `/agents` and `/automations` filter by
  `nicheSlug` instead of `category`; marketplace lost its country picker
  and per-run cost line; admin editor lost Category / Available In /
  Est. Cost fields (niche filter replaces the category filter).
- `User` types: removed `totalVideosGenerated`/`totalCreditsUsed`/
  `trialReminderSent` (dropped from the backend schema).

Verified: tsc + build clean; Playwright against a mock API on :4000
serving data generated from the real compiled seed + mapper (needed
because `/services/[slug]` fetches server-side): navbar shows Services,
not Industries; landing shows 22; filters give 9 / 4 / 9 with the URL
updating; `?type=automation` deep link works; agent, chatbot and
automation detail pages render under `/services/`; unknown slug 404s; no
mobile overflow at 390px.

## 2026-11-12 — Marketing site navigation restructured around Services

User asked for a top bar where visitors immediately understand what LogicMate
offers, with the footer and the landing/detail pages matching.

**Structure (single source: `src/config/service-types.ts`)**
- `/services` — every service, with search + type filter, plus a "browse by
  type" row of three tiles (AI Agents / Automations / Chatbots, with live
  counts) linking to each type's landing page.
- `/agents`, `/automations`, `/chatbots` — one landing page per type.
- `/agents/<slug>`, `/automations/<slug>`, `/chatbots/<slug>` — the ONLY
  detail URLs. `/services/<slug>` now permanently redirects (308) to the
  canonical one (it briefly rendered the detail page itself, which meant two
  URLs per page). `/services` cards link straight to canonical URLs.
- Breadcrumbs everywhere follow the same tree:
  `Services › AI Agents › Youtube Agent` (detail pages' "← All agents" back
  links replaced; `/chatbots` gained a breadcrumb it never had).

**Top bar:** `Services ▾` · `About` · `Pricing`. Services opens (hover or
click; Escape / outside click / navigation close it) a menu with the three
types — icon + one-line description each — and "View all services". Mobile:
Services is an expandable group. The standalone "Chatbots" link is gone (it's
under Services now). Services highlights on any `/services`, `/agents`,
`/automations`, `/chatbots` path.

**Footer:** Services (All services, AI Agents, Automations, Chatbots, By
industry) · Company (About, Pricing, Blog, Contact, FAQ) · Legal. "By
industry" keeps the `/industries` pages reachable until they become bundles.

**Sitemap:** now lists `/chatbots` and every chatbot detail page (it only had
agents + automations), built from one `/services` fetch via the shared URL
helper; API host now comes from `NEXT_PUBLIC_API_URL` like the rest of the
site instead of a hardcoded one.

Verified with Playwright against a mock API on :4000 (data from the real
compiled seed + mapper): top bar = Services/About/Pricing; menu lists the 3
types + View all; Escape closes; menu → /agents with Services highlighted;
breadcrumbs correct on all three landing pages and detail pages; tiles show
9 / 4 / 9; card → /agents/youtube-agent; /services/restaurant-chatbot →
/chatbots/restaurant-chatbot; unknown slug 404s; footer columns as above;
mobile menu expands, navigates and closes; no mobile overflow.

## 2026-11-12 — industries removed from the site

Deleted `/industries`, `/industries/[slug]`, `/dashboard/industries`, and
`industries-list-page.tsx` / `industry-detail-page.tsx` / `admin-industries.tsx`;
removed the admin nav entry, the footer "By industry" link, and the dashboard
overview's `/industry-subscriptions` fetch + "Industry" items.

The homepage still sells "built for 12 industries" (positioning, not the
collection), so those links now go to `/services?niche=<nicheSlug>` — new
industry filter on `/services` (Combobox, synced to `?niche=`, stacks with
`?type=`). An industry with no services yet shows "No ready-made services
for X yet — get in touch" instead of an empty grid. Hero "Explore industries"
→ "Explore services"; niches section + CTA "Browse all industries" →
"Browse all services". `next.config.ts` 308-redirects old URLs:
`/industries` → `/services`, `/industries/:slug` → `/services?niche=:slug`,
`/dashboard/industries` → `/dashboard/cms-modules`.

Pricing's "Industries" tab never used the industries collection (it showed
`niche_pipeline` services) — renamed "Pipelines" so it doesn't read as the
removed concept.

Noticed, not changed: the CMS catch-all `/[slug]` route answers unknown URLs
with a "not found" message but HTTP 200 (a soft 404) — pre-existing.

Verified: build clean (42 routes); Playwright vs mock API: old URLs redirect
as above, `?niche=real_estate` → 4 services, `+type=chatbot` → 1,
`?niche=logistics` → contact empty state, no `/industries` links on the
homepage or footer, pricing tabs All/Pipelines/AI Agents/Automations/Chatbots.

## 2026-11-12 — Cookie consent (gates Google Analytics) + real 404s

**Cookie consent.** Google Analytics (`G-5SCNDRMQ38`, via
`@next/third-parties`) used to load unconditionally from the root layout on
every page — setting `_ga`/`_ga_<id>` before any consent. Now
`components/consent/cookie-consent.tsx` owns GA: it renders
`<GoogleAnalytics>` ONLY when the stored consent has `analytics: true`
("basic" consent mode — the script isn't loaded at all until opt-in).
Banner on first visit: "Reject non-essential" and "Accept all" with equal
weight (refusing must be as easy as agreeing), "Manage settings" (Essential
always on / Analytics toggle), link to the CMS `/cookies` policy. Footer →
Legal → "Cookie settings" reopens it. Opting out after opting in expires
`_ga*`/`_gid`/`_gat` on every parent domain and reloads (GA's script is
already running in the page otherwise). Stored in localStorage
`lm_cookie_consent` `{version, analytics, decidedAt}`; bump `CONSENT_VERSION`
in `lib/cookie-consent.ts` when a new non-essential tracker is added so
everyone is asked again. Essential storage (accessToken cookie, sidebar
cookie, auth tokens, lm_lang, banner-dismiss flags) needs no consent.
Sentry sets no cookies (replay off).

**404s.** New `app/not-found.tsx` (navbar + footer, links home / services /
each type / contact, `noindex`). Dynamic routes now return real 404s via
`lib/fetch-content.ts` `lookupContent()` — only an API 404 means "missing";
an API outage still renders the page. Applied to the CMS catch-all `/[slug]`
(was a soft 404 for every mistyped URL), `/blog/[slug]`, and
`/agents|automations|chatbots/[slug]` (shared `lib/service-route.ts`, which
also 308-redirects a service opened under the wrong type, e.g.
`/agents/<chatbot slug>`). Also fixed: service detail titles were
"X — LogicMate — LogicMate" (route set the suffix AND the root title
template added it).

Verified with Playwright vs mock API: unknown page/blog/agent/chatbot/
automation URLs → 404 "Page not found"; real ones → 200;
`/agents/restaurant-chatbot` → `/chatbots/restaurant-chatbot`. Consent:
first visit shows banner and makes zero GA requests; Reject + reload → no
banner, no GA; footer link reopens in manage mode; opting in loads
`gtag/js?id=G-5SCNDRMQ38`; opting out reloads with `_ga` cookies removed;
"Accept all" loads GA; mobile banner fits (x 12, w 366 at 390px), no overflow.

## 2026-11-13 — Contact addresses: billing@ for payments, no .ai domain
Payment-failure toasts (chatbot Billing tab, payment-instructions page) and
the payment help line now point to `billing@logicmate.io`. Homepage hero
mockup URL `app.logicmate.ai/...` → `logicmate.io/...`. No `.ai` addresses
remain. Matches backend's role-based mailboxes (see backend traces).
tsc + build clean.

## 2026-11-13 — About timeline + Contact spacing
/about "How we got here": 5 narrow side-by-side cards wrapped every line to
2–3 words and stretched to the tallest card. Rebuilt as a vertical timeline
(`<ol>`, numbered nodes, per-step connector that stops at the last step,
logical `start-` positioning so it flips correctly in Arabic/RTL), max-w-2xl,
latest milestone highlighted. /contact: content section gained `mt-6 sm:mt-10`
so "Contact details"/"Send a message" no longer sit against the hero glow.
tsc + build clean; Playwright 1440/390 on both pages, no overflow.

## 2026-11-13 — CMS editor: Contact details fields
The public /contact page renders `contactInfo` (email, supportEmail, twitter,
linkedin, address, address_ar) and the backend already stores/saves it
(`pageMeta.contactInfo`), but the dashboard page editor had no inputs for it —
only reachable by seed data, so the live page showed no email at all. Added a
"Contact details" block to `PageEditModal` (only when slug === "contact"):
EN tab = email/support email/X/LinkedIn/address, AR tab = Arabic address.
Saves the whole object (spread on edit, since the backend `$set`s
`pageMeta.contactInfo` as one value). Playwright with mocked API: PUT body
carried the existing twitter value plus the new email/supportEmail/address_ar.
