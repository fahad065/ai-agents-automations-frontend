# Traces — running log

Newest entry first. Append, don't rewrite.

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
