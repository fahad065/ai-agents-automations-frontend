# Traces — running log

Newest entry first. Append, don't rewrite.

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
