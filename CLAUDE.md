# LogicMate — Frontend

## Platform overview
LogicMate is a B2B AI automation marketplace targeting UAE and Kenya markets. Businesses subscribe to pre-built AI agents, automation pipelines, and chatbots — no code required. Think Shopify App Store but for AI workflows.

## GitHub repos (all three services)
- **This repo (frontend):** https://github.com/fahad065/ai-agents-automations-frontend.git
- **Backend (NestJS):** https://github.com/fahad065/ai-agents-automations-backend.git
- **Python pipelines:** https://github.com/fahad065/logicmate-python-services.git

## Stack
- **Framework:** Next.js App Router (NOT Pages Router)
- **Styling:** Inline styles only — no Tailwind, no CSS modules, no external UI framework
- **State:** Zustand (`src/store/`) for auth and theme
- **Icons:** `lucide-react` + `react-icons/fa` — do NOT use `Instagram` from lucide (it doesn't exist), use `FaInstagram` from `react-icons/fa`
- **Hosting:** Vercel
- **API base URL:** `http://localhost:4000/api/v1` (dev) / production via env var `NEXT_PUBLIC_API_URL`

## Running locally
```bash
npm install
npm run dev   # starts on port 3000
```

## Project structure
```
src/
  app/
    (marketing)/      # public-facing pages (navbar + footer layout)
    (dashboard)/      # authenticated dashboard pages
    (auth)/           # login, signup, forgot-password, OAuth callback
    (admin)/          # admin-only layout
  components/
    marketing/        # one component per page (e.g. about-page.tsx, pricing-page.tsx)
    dashboard/        # dashboard panels and modals
    admin/            # admin-only panels
    layout/           # Navbar, Footer, Providers
    auth/             # auth forms
    ui/               # shared primitives (button, card, dialog, etc.)
  hooks/
    use-lang.ts       # bilingual language hook
    use-theme.ts      # dark/light theme hook
  lib/
    api.ts            # public API calls (unauthenticated)
    api-client.ts     # authenticated API calls (attaches JWT)
    dashboard-api.ts  # dashboard-specific API calls
    auth.ts           # auth helpers
    translations.ts   # EN/AR UI string translations
  store/
    auth.store.ts     # Zustand auth state (user, token)
    theme.store.ts    # Zustand theme state
  types/index.ts      # shared TypeScript interfaces
```

## Route groups
| Group | Layout | Pages |
|---|---|---|
| `(marketing)` | Navbar + Footer | home, agents, automations, chatbots, industries, pricing, about, contact, blog, faq, privacy, terms, cookies, refund |
| `(dashboard)` | Dashboard shell | overview, modules, cms-modules, cms, industries, billing, payments, payment-instructions, subscriptions, users, notifications, api-keys, pipeline-logs, settings |
| `(auth)` | Auth layout | login, signup, forgot-password, callback |

## Bilingual architecture (CRITICAL — read this before touching any page)

### Language state
```ts
const { lang, isAr, setLang } = useLang();
// lang: "en" | "ar"
// isAr: boolean
// stored in localStorage("lm_lang")
// language change dispatches CustomEvent("lm_lang_change")
```

### Content rendering pattern
Every CMS-driven component follows this pattern — never deviate:
```tsx
const title = page ? ((isAr && page.title_ar) ? page.title_ar : page.title) : null;
const subtitle = page ? ((isAr && page.subtitle_ar) ? page.subtitle_ar : page.subtitle) : null;
const content = page ? ((isAr && page.content_ar) ? page.content_ar : page.content) : null;
```

### Arabic fields on CMS documents
- Pages: `title_ar`, `subtitle_ar`, `content_ar`
- Blog posts: `title_ar`, `excerpt_ar`, `content_ar`
- FAQ: `faqItems_ar` (array of `{question, answer, order}`)
- Modules: `name_ar`, `tagline_ar`, `description_ar`, `capabilities_ar`
- Contact: `contactInfo.address_ar`

### Arabic content dialect
All Arabic content uses **UAE dialect (Gulf Arabic)** — not Modern Standard Arabic.

### RTL rendering
Arabic text areas use `dir="rtl"` and `textAlign: "right"`. Do not add RTL to the whole page, only to AR content containers.

### Admin CMS bilingual editing
`src/components/dashboard/cms-page.tsx` — contains `PageEditModal` and `BlogModal`.
- Both have EN tab (purple theme) / AR tab (amber theme) toggle
- EN tab: standard fields
- AR tab: `_ar` suffixed fields, `dir="rtl"` inputs, "Arabic mode active" amber banner
- Blog list shows 🇦🇪 badge for posts with `title_ar` populated

## CMS-driven pages
These pages fetch content from the backend at runtime — content is NOT hardcoded:

| Page | Slug | Component |
|---|---|---|
| About | `about` | `marketing/about-page.tsx` |
| Contact | `contact` | `marketing/contact-page.tsx` |
| FAQ | `faq` | `marketing/faq-page.tsx` |
| Privacy | `privacy` | `marketing/legal-page.tsx` |
| Terms | `terms` | `marketing/legal-page.tsx` |
| Cookies | `cookies` | `marketing/legal-page.tsx` |
| Refund | `refund` | `marketing/legal-page.tsx` |
| Blog posts | dynamic | `marketing/blog-post-page.tsx` |

Fetch pattern: `GET /api/v1/cms/pages/:slug` — returns full document including `_ar` fields.

## Modules / Products
Three product categories (all data from backend):
- **AI Agents** (`pipelineCategory: "standalone"`, `type: "agent"`) — `/agents`, `/agents/[slug]`
- **Automations** (`pipelineCategory: "standalone"`, `type: "automation"`) — `/automations`, `/automations/[slug]`
- **Chatbots** — `/chatbots` (marketing page built; dashboard module = next to build)

### nicheSlug values (12 niches)
`content_social`, `real_estate`, `healthcare`, `hr_recruitment`, `ecommerce_retail`, `marketing`, `hospitality`, `education`, `logistics`, `agriculture`, `finance`, `internal_copilot`

## Dashboard key pages
- `/dashboard` — overview with stats, trial banner, pipeline status widget
- `/dashboard/modules` — user's active modules (subscribed/trial)
- `/dashboard/cms-modules` — admin: manage the module catalog
- `/dashboard/cms` — admin: edit CMS pages + blog posts (bilingual)
- `/dashboard/industries` — admin: manage industry/niche data
- `/dashboard/billing` — billing records
- `/dashboard/pipeline-logs` — pipeline run history
- `/dashboard/api-keys` — API key management
- `/dashboard/settings` — user profile settings

## Auth flow
1. Email/password login → `POST /api/v1/auth/login` → JWT access + refresh tokens
2. Google OAuth → `/api/v1/auth/google` → redirects to `/auth/callback` with tokens in URL params
3. Token stored in Zustand auth store + localStorage
4. `api-client.ts` attaches `Authorization: Bearer <token>` to all authenticated requests
5. Admin guard on backend checks `user.role === "admin"`

## Admin credentials (production)
- Email: `fahad@test.com`
- Password: `Admin@123`

## Styling conventions
- Inline styles only — all `style={{...}}` objects
- Color palette from `useTheme()`: `colors.bg`, `colors.text`, `colors.textMuted`, `isDark`
- Purple brand: `#7c3aed`, `#6d28d9`, `#a78bfa`
- Amber for Arabic/secondary: `#f59e0b`, `rgba(245,158,11,0.12)`
- Gradient text: `background: "linear-gradient(...)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent"`
- Max page width: `1280px` with `margin: "0 auto"`

## What has been built (complete)
- All marketing pages including `/chatbots`
- Full bilingual CMS (EN + AR UAE dialect) for all legal, FAQ, about, contact pages
- Bilingual blog CRUD with AR tab in admin
- Industries / niches pages
- Agent and automation detail pages
- Dashboard overview, modules, billing, pipeline-logs, api-keys, settings, notifications
- Auth (email + Google OAuth)
- Navbar (Industries, Chatbots, About, Pricing) + Footer with all links
- Admin-only "Email Sender" tab in Settings (multi-select recipients, rich text editor, sends via backend `POST /admin/email/send`)
- **Full chatbot dashboard module** (see below)

## Chatbot dashboard module (implemented)

Nav item "Chatbots" (Bot icon) in `dashboard-shell.tsx`, positioned after "My Modules", visible to both regular users and admins.

### Routes
- `/dashboard/chatbots` → `chatbots-page.tsx` — list view
- `/dashboard/chatbots/[id]` → `chatbot-config-page.tsx` — tabbed config view

### `chatbots-page.tsx`
- Grid of chatbot cards: status badge (draft=amber/active=green/inactive=gray), template emoji, enabled-channel icons, created date
- "+ New Chatbot" → modal with name, description, 6 template picker cards (Restaurant🍽️/Real Estate🏠/Clinic💆/E-commerce🛍️/Gym🏋️/Education🎓) + Custom/Blank, language select → `POST /chatbots` → redirects to the config page
- Delete via `confirm()` → `DELETE /chatbots/:id`

### `chatbot-config-page.tsx` — 5 tabs, each lazy-loads its data on first visit
1. **Overview** — name/description/persona/language, 3-way status switch (draft/active/inactive) with live `PUT`, fallback message EN + AR (amber AR styling matching the CMS pattern), human handoff toggle
2. **Knowledge Base** — add/list/delete entries of type FAQ / Text / URL. This is what the AI engine answers from — nothing here means the bot only ever returns the fallback message.
3. **Channels** — three cards:
   - **Website**: enable toggle, color picker, welcome message EN+AR, on enable fetches `GET /chatbots/:id/embed-code` and shows the `<script>` snippet with a copy button
   - **WhatsApp**: enable toggle, Phone Number ID + Access Token (masked inputs), read-only webhook URL `${NEXT_PUBLIC_API_URL}/webhooks/whatsapp/:embedKey` with copy button
   - **Instagram**: same pattern, webhook URL `${NEXT_PUBLIC_API_URL}/webhooks/instagram/:embedKey`
   - Each card PUTs only its own `channels.X` sub-object
4. **Conversations** — recent sessions from `GET /chatbots/:id/conversations`, expandable to a chat-bubble thread view
5. **Analytics** — stat cards + proportional-width bars for `GET /chatbots/:id/analytics`

### Website embed widget — `public/chatbot-widget.js`
Vanilla JS, zero dependencies, self-injects a floating chat bubble + panel. Reads config from `window.LMChatbot = {embedKey, color, apiUrl, botName, welcomeMessage, welcomeMessageAr}` (the backend's embed-code generator writes this object). Persists a session ID in `localStorage`, POSTs to `${apiUrl}/chat/:embedKey`, auto-detects Arabic via `navigator.language` and flips to RTL bubble alignment. This file is served statically from the frontend's own domain — the backend's `getEmbedCode()` points `<script src>` at `${FRONTEND_URL}/chatbot-widget.js`.

**Resolved:** the backend's embed-code generator reads `BACKEND_URL` (Railway's real public domain) — confirmed correctly set in production. If the widget ever silently fails to reach the API, check `BACKEND_URL` and `FRONTEND_URL` on Railway first (see backend CLAUDE.md).

### Billing tab (6th tab on `chatbot-config-page.tsx`) — implemented
No fixed public pricing — every chatbot's price is set by hand from the dashboard, per deal. `isAdmin` comes from `useAuthStore()`; the pricing editor and "Confirm Payment Received" buttons only render for admins, never for the chatbot owner.
- **Status badge** — Trial / Awaiting Setup Payment / Active / Past Due / Suspended, color-coded
- **Admin only:** setup fee, monthly fee, currency, trial end date, internal deal notes → `PUT /chatbots/:id/pricing`; two "Confirm Payment Received" buttons (setup / monthly) → `POST /chatbots/:id/confirm-payment`
- **Owner-facing:** when a fee is owed, the same bank-transfer + "I've paid" pattern as `payment-instructions-page.tsx` — bank details, transaction reference input, `POST /chatbots/:id/notify-payment`
- **Billing history** — pulled from `GET /chatbots/:id/billing` → `{billing, history}`

### Marketing page (`chatbots-page.tsx`) — now backend-driven, links to real detail pages
The template grid used to be a hardcoded `TEMPLATES` array. It's now fetched from `GET /modules?moduleType=chatbot` (same catalog + admin CMS editor agents/automations use — see "Chatbot template detail pages" below) and each card is a `Link` to `/chatbots/[slug]`. The **"Watch it in action"** button on each card still works exactly as before — it's a `<button>` inside the card `Link` with `preventDefault`/`stopPropagation` so clicking it opens the shared demo-video modal (`demoVideo` state + `<video>` element) instead of navigating. The hero's **"See a demo"** button still opens the same modal with `GENERAL_DEMO_URL`, a broader product overview video — that one stayed hardcoded, it isn't per-template.

Every demo video is a recording of a *real* chatbot answering *real* questions through the actual `/chat/:embedKey` endpoint — not a mockup. Built via headless Chrome (puppeteer-core) driving the widget on a throwaway demo HTML page, OpenAI TTS (`onyx` voice) for narration, `ffmpeg` for assembly. See `scripts/upload-demo-video.mjs` for how a finished video gets a real hosted URL. Each template's `demoVideoUrl` now lives on its `ModuleTemplate` doc (editable via `/dashboard/cms-modules`), not in frontend code.

**"Free" claims were removed** (commit `f0941c3`) — the page used to say "Start free" / "Free 30 days, no credit card" / "Get started free" from before chatbot billing existed. Now: "Get started" (hero + closing CTA) and "Custom pricing, built for your business" (closing badge). If you're ever asked to add a video or pricing copy to this page again, check it doesn't reintroduce a "free" claim — chatbots are setup fee + monthly, not free.

### Chatbot template detail pages + pricing (implemented)
The requested flow: visit `/chatbots` → click a template card → land on `/chatbots/[slug]` (e.g. `/chatbots/restaurant-chatbot`) → read features/stats/demo video → pick the plan in the pricing section → land in the dashboard config portal with a 30-day trial already running.

**Pricing mechanism changed since this was first built** — originally each template fetched a separate `GET /chatbot-plans?template=<slug>` (Basic/Pro/Enterprise tiers from a standalone backend catalog with no admin UI). That's gone. Chatbots now price exactly like agents/automations: `agent.pricing` (`monthly`/`annual`/`features`/`hasCustomPlan`/`customLabel`) comes straight off the `GET /modules/:slug` response, admin-edited from `/dashboard/cms-modules`'s Pricing tab — see backend CLAUDE.md's "Chatbot self-serve pricing" section for why. The pricing section is now the **same JSX as `agent-detail-page.tsx`'s** (Monthly card / Annual card "Most Popular" / optional Custom "Contact us" card) — no separate component, no per-plan channel restrictions (one plan, everything included: website + WhatsApp + Instagram).

- **`/chatbots/[slug]/page.tsx`** + **`chatbot-detail-page.tsx`** — same structure as `agent-detail-page.tsx` (hero, hero stats, capabilities, features, demo video, FAQ, pricing, closing CTA), content fetched from `GET /modules/:slug`. Two deliberate differences from the agent version: the demo video renders as a native `<video>` (chatbot demos are hosted `.mp4` files, not YouTube links like agent demos), and the hero/closing CTAs scroll to `#pricing` instead of linking straight to a dashboard.
- **Getting started** — clicking Monthly or Annual (`handleGetStarted()`) calls `POST /chatbots` with `{name, description, template, language: "both", moduleSlug}` (`moduleSlug` is the new bit — backend uses it to read `module.pricing.monthly` onto `billing.monthlyFee`; `template` still maps the module slug → `Chatbot.template` enum via `TEMPLATE_ENUM`) and redirects straight into `/dashboard/chatbots/:id` — this is what starts the chatbot's 30-day auto-trial (`ChatbotsService.create()` on the backend). Unauthenticated visitors go to `/auth/signup` instead. The Custom/`hasCustomPlan` card is a "Contact us" `mailto:` link, same as the agent version.
- **Demo video** — renders as a plain `<video>`, with an `onError` fallback (small "couldn't load" card + a direct link to the file) instead of a silently broken player if the Vercel Blob URL is ever unreachable, and `key={agent.demoVideoUrl}` so the player actually remounts if the URL changes between templates.
- **`admin-modules.tsx`** — the Module Type dropdown gained a `Chatbot` option, so admins edit these 6 templates' marketing content **and pricing** the same way they edit agents/automations. Note: the form's Pricing tab only exposes `pricingMonthly`/`pricingAnnual`/`pricingFeatures` — `hasCustomPlan`/`customLabel` aren't wired into the form UI yet (same gap exists for agents/automations too; the youtube-agent's Custom card was set directly in `SEED_MODULES`, not through the dashboard).

### Standalone chatbot pricing on `/pricing` (implemented)
`pricing-page.tsx`'s filter tabs (`FILTER_TABS_EN`/`_AR`) gained a **"Chatbots"** tab alongside All/Industries/AI Agents/Automations. Since chatbots are now priced exactly like agents/automations, this is just one more branch on the existing `filtered` computation (`if (filter === "chatbots") return m.moduleType === "chatbot"`) — chatbots render through the exact same `PricingCard` component as everything else, with `isBot` picked out alongside the existing `isBundle`/`isAuto` flags to pick the right type label ("Chatbot"), icon (`MessageCircle`), and detail-page link (`/chatbots/[slug]`). No separate fetch, no separate card component — the `ChatbotPlan` interface, `ChatbotTemplateCard`, and the chatbot-only render branch that used to live here were all removed.

### Dashboard trial/expiry banner (implemented)
**`chatbot-trial-banner.tsx`** — a per-chatbot version of the account-level `trial-banner.tsx` (that one reads `user.trialEndDate` from the auth store; this one takes a `billing: Billing` prop, since each chatbot has its own trial independent of the user's agent/automation trial). Rendered at the top of `chatbot-config-page.tsx`, right below the header. Shows an amber countdown starting 5 days before `billing.trialEndsAt` (matching the backend's `chatbot-billing.cron.ts` reminder window), and a red "stopped answering customers" banner for `awaiting_setup_payment`/`past_due`/`suspended` — its button jumps straight to the Billing tab (`setTab("billing")`) rather than a separate page, since chatbot billing lives in-page as a tab.

### Signup/login redirect preservation (implemented)
Clicking "Get started" on a chatbot's pricing card while logged out used to just `router.push("/auth/signup")` with no memory of which template/plan the visitor wanted — after signing up (which routes to `/verify-email`, not straight to the dashboard) they'd land on `/dashboard` with no chatbot created, and have to rediscover the template page and click through again. Fixed with a `redirect` query param threaded across the whole auth chain:

- `chatbot-detail-page.tsx`'s `handleGetStarted()`: when unauthenticated, redirects to `/auth/signup?redirect=${encodeURIComponent('/chatbots/' + slug + '?autostart=1')}` instead of a bare `/auth/signup`.
- `signup-form.tsx`: reads `redirect` via `useSearchParams()`, forwards it onto the `/verify-email` push, and onto the "Sign in" footer link (in case they already have an account and bail to login instead of registering).
- `verify-email/page.tsx`: reads `redirect` too. On successful token verification, redirects there instead of always `/dashboard`. In the "check your inbox" idle state, added a **"Continue now — verify email later"** button that jumps straight to `redirect` — this works because `signup-form.tsx` already calls `setAuth()` with real tokens immediately on registration (before email verification), so the visitor is genuinely authenticated at this point, just not yet verified. Also fixed a pre-existing dead link in this file: the two "Back to login" links pointed to `/login`, which 404s — the real route is `/auth/login` (`src/app/(auth)/auth/login/page.tsx`).
- `login-form.tsx`: reads `redirect`, uses it on successful login instead of always `/dashboard`; also forwards it onto the "Sign up free" footer link.
- Back on `chatbot-detail-page.tsx`, an effect watches for `?autostart=1` — once `agent` has loaded and `isAuthenticated` is true, it fires `handleGetStarted()` automatically (once, guarded by a ref) and strips the query param via `router.replace()` so a refresh doesn't re-trigger it.
- `useSearchParams()` in a statically-rendered page requires a Suspense boundary in Next.js or the build fails (`next build` caught this immediately) — added `<Suspense>` wrappers to `src/app/(auth)/auth/login/page.tsx` and `.../auth/signup/page.tsx`, mirroring the pattern `verify-email/page.tsx` already used. `/chatbots/[slug]` didn't need one since that route is already dynamic (`ƒ`), not statically prerendered.

Same mechanism will work for agents/automations' own "Get started" links if they're ever wired up this way — nothing chatbot-specific about the `redirect` param itself.

### Chatbots addable from "My Modules" (implemented)
`modules-page.tsx`'s marketplace browse modal (`MarketplaceModal`, opened via "+ Add Module" on `/dashboard/modules`) fetches `GET /modules` with no `moduleType` filter — so the 6 chatbot templates were **already appearing in that grid**, and clicking one opened `SubscribeModal`, which POSTs to `/usermodules/subscribe`. That's the wrong data model entirely for a chatbot (creates a `UserModule` record instead of a `Chatbot` doc — no `embedKey`, no knowledge base, nothing usable), and the form even showed an irrelevant Instagram-connect button (chatbot `platforms` includes `'instagram'`, which the form's `needsInstagram` check picks up). This was a live bug, not something added for this fix.

Fixed by branching the modal's selection handler: `if (selected.moduleType === "chatbot")` now renders a new **`AddChatbotModal`** instead of `SubscribeModal` — a lighter single-step confirm (icon, tagline, price, one "Add chatbot" button) instead of the agent/automation form's niche/schedule/API-key-mode fields, none of which apply. Confirming calls `POST /chatbots` with `{name, description, template, language: "both", moduleSlug}` — the exact same call `chatbot-detail-page.tsx`'s pricing section makes — and redirects to `/dashboard/chatbots/:id`, same as everywhere else a chatbot gets created. Grid cards also gained a small "CHATBOT" badge (next to the existing "PIPELINE" one) so it's clear before clicking which items behave differently. `CHATBOT_TEMPLATE_ENUM` (slug → `Chatbot.template` enum) is duplicated here rather than shared with `chatbot-detail-page.tsx`'s `TEMPLATE_ENUM` — same six entries, kept local to each file, consistent with how this codebase already tolerates small duplication over a shared util for a 6-line lookup table.

### Agents/automations "Get started" → straight to the module's setup form (implemented, 2026-09)
Extends the chatbot redirect mechanism above (`redirect` query param through signup/verify/login) to agents and automations, which didn't have it — `agent-detail-page.tsx`'s and `automation-detail-page.tsx`'s "Get started" links used to be bare `isAuthenticated ? "/dashboard/modules" : "/auth/signup"` (agents) or, inconsistently, `isAuthenticated ? "/dashboard" : "/auth/signup"` (automations — a pre-existing bug: authenticated users landed on the plain dashboard with no path into that module's setup at all). Neither told an unauthenticated visitor's post-signup landing spot which module they'd wanted, same gap the chatbot flow had before its fix.

Rather than reusing chatbot's `?autostart=1` pattern (which fires a `POST` immediately), agents/automations use `/usermodules/activate` via `SubscribeModal` on `/dashboard/modules`, a real form (niche/schedule/API-key-mode) that needs the visitor's input — there's nothing to "autostart" without them filling it in. So instead of auto-submitting, the fix deep-links straight to that module's setup **form**:

- Both detail pages now compute `const openModulePath = \`/dashboard/modules?openModule=${agent.slug}\`;` and `getStartedHref = isAuthenticated ? openModulePath : \`/auth/signup?redirect=${encodeURIComponent(openModulePath)}\`` once, right after the not-found guard, and every "Get started"/"Add to dashboard" `<Link href=...>` on the page (there are 4 on each) now points at `getStartedHref` — replacing the old per-link ternary. automation-detail-page.tsx's target changed from `/dashboard` to `/dashboard/modules` as part of this, fixing the bug above.
- `modules-page.tsx`'s `MyModulesPage` reads `?openModule=<slug>` on mount (`useSearchParams`), and if present opens the marketplace (`setShowMarketplace(true)`) with a new `pendingSlug` state, then strips the param via `router.replace`.
- `MarketplaceModal` gained an `initialSlug` prop: once its own `GET /modules` fetch resolves, if a module matches `initialSlug` it calls `setSelected()` on it directly — reusing the exact same branch that already exists for manually clicking a grid card, so a chatbot slug still opens `AddChatbotModal` and an agent/automation slug still opens `SubscribeModal`. No new modal, no new activation code path — just a way to land on the modal already open.
- `src/app/(dashboard)/dashboard/modules/page.tsx` needed a `<Suspense>` wrapper added around `<MyModulesPage />` for the same `useSearchParams()`-on-a-static-page reason hit earlier with login/signup.
- Caveat carried over from the pre-existing marketplace grid, not introduced by this fix: `MarketplaceModal` fetches `/modules?country=<selected country>` (default `"UAE"`), so if a module's `availableIn` doesn't include the visitor's current dashboard country selection, `initialSlug` simply won't match anything and the visitor sees the plain grid instead of the module pre-opened — a silent no-op fallback, not a crash.

### Marketing assets — `LogicMate/marketing-assets/chatbot-demos/`
Sits one level up from all three repos (sibling to the frontend/backend/python-services folders), **not tracked by any of the three git repos**. Holds the source `.mp4` files before upload. Also home to `sunset-cafe-demo.html` and the 5 other `{template}-demo.html` throwaway capture pages that live in the frontend's `public/` folder during a recording session — those are deliberately **never committed** (test-only, would ship a fake landing page to production). Check `git status` before committing anything touching `public/*-demo.html`.

`ai-agents-automations-frontend/scripts/upload-demo-video.mjs` — one-off Vercel Blob uploader:
```bash
node --env-file=.env.local scripts/upload-demo-video.mjs <local-file-path> [blob-pathname]
```
Needs `BLOB_READ_WRITE_TOKEN` in `.env.local` (Vercel dashboard → project → Storage → Blob). Prints the real hotlinkable URL on success.

## Performance pass (2026-08)
A separate review (not this session originally) recommended: remove GSAP, add `next/image`, add dynamic imports for heavy pages, add `loading.tsx` skeletons, adopt React Query. Verified each claim against the actual codebase before acting — two were wrong:
- **GSAP is used in 11 marketing components** (`hero-section.tsx`, `stats-section.tsx`, `marketplace-section.tsx`, `agents-section.tsx`, `automations-section.tsx`, `features-section.tsx`, `testimonials-section.tsx`, `niches-section.tsx`, `cta-section.tsx`, `agent-detail-page.tsx`, `automation-detail-page.tsx`), not just `hero-section.tsx` — removing it is a real animation rewrite across all of them, not a 30-minute job. **Not done** — too much risk/effort for the claimed win; revisit deliberately if it's ever actually prioritized.
- **React Query was already installed and wired** (`QueryClientProvider` in `layout/providers.tsx`) but had zero `useQuery` call sites anywhere — the real gap was adoption, not installation. **Not done** — adopting it means touching every data-fetching component; a real project, not a quick win.
- `next/image` — of the 10 raw `<img>` tags, 8 are the 30×30 `/icon.svg` logo (Next/Image gives zero benefit to a tiny SVG). Only the 2 `user.avatar` images in `dashboard-shell.tsx` were genuine candidates (external Google/GitHub URLs, already allowlisted in `next.config.ts` → `images.remotePatterns`). **Done.**
- **Dynamic imports** — added `next/dynamic` + a `Loader2` fallback (with its own local `@keyframes spin`, since the codebase defines that per-component rather than globally) to the three heaviest dashboard page wrappers: `dashboard/cms/page.tsx` (→ `cms-page.tsx`, 973 lines), `dashboard/cms-modules/page.tsx` (→ `admin-modules.tsx`, 1145 lines), `dashboard/chatbots/[id]/page.tsx` (→ `chatbot-config-page.tsx`, 1119 lines). **Done.**
- **`loading.tsx` skeletons** — none existed anywhere in `src/app/`. Not added in this pass — folded into the dynamic-import fallbacks above instead, which cover the same heavy-page-load perceived-performance goal without a second parallel mechanism.

**Takeaway for future sessions:** treat a prior analysis's specific numeric/scope claims (file counts, "X is only used in Y", bundle-size estimates) as things to verify with `grep`/`du`/a real build before acting on, not as given facts — two of five claims here were wrong in ways that would have meant either a much bigger job than promised (GSAP) or redundant work (React Query "add").

## Mobile first-load performance fix (2026-09)
User-reported: first visit to `logicmate.io` on iPhone Safari/Chrome was slow to load, especially the hero's stats/mockup area. Root-caused (not guessed) two concrete issues in `hero-section.tsx`, both fixed without touching GSAP itself or redesigning anything — the user explicitly asked for a fix now, redesign later:
- A fully dead `setInterval(() => setTick((t) => t + 1), 3000)` re-rendering the whole component every 3 seconds forever — `tick` was never read anywhere. Removed, along with its `useState` import.
- Three `gsap.to(orb1/2/3, { repeat: -1, yoyo: true, ... })` animations moving the hero's large `blur(100–120px)` background orbs, continuously, for as long as the page stayed open. Animating position on a large-radius CSS `blur()` filter is one of the most expensive things you can hand a mobile browser every frame — especially Safari/WebKit. Removed; the orbs still render as static glow, just don't repaint every frame. The one-time GSAP entrance timeline (h1/subtitle/cta/niches/mockup fading/sliding in on load) was left untouched.
- Also deferred the Crisp chat widget script in `src/app/(marketing)/layout.tsx` from `strategy="afterInteractive"` to `strategy="lazyOnload"` — the widget isn't needed for first paint or first interaction, so it now loads during browser idle time instead of competing with real content for bandwidth/main-thread time right after hydration.

Deliberately not attempted here (per CLAUDE.md's existing "Performance pass" notes and the user's own "later we will redesign the landing page" framing): removing GSAP entirely, or any other landing-page redesign work.

**Follow-up round** — user reported the homepage was still slow after the above shipped. Clarified for the record: `/` is server-rendered/statically prerendered (`○` in `next build`'s route table), not client-side-rendered from an empty shell — this was never a CSR-vs-SSR problem, the HTML content is present on arrival. What actually adds to time-to-interactive is that `page.tsx` imported all six marketing sections (`HeroSection`, `StatsSection`, `NichesSection`, `AgentsSection`, `FeaturesSection`, `CtaSection` — each a `"use client"` component running its own GSAP/ScrollTrigger animation) directly, so Next bundled all of their JS into one payload the browser must parse before any of them hydrates. Fixed by `next/dynamic`-importing everything below the hero (`ssr: true` stays the default, so content is still in the initial HTML/still indexable — only the JS chunking changes) — same pattern this file's earlier "Performance pass" section already used for the heavy dashboard pages. Measured locally with Playwright + CDP under throttled mobile emulation (1.5 Mbps / 150 ms latency / 4x CPU slowdown): full page-load event dropped from ~1.8s to ~1.3s. Left the hero itself un-split (it's above the fold, needs to load regardless) and did not touch GSAP or attempt any further redesign, same scope boundary as the first round.

## Navbar language-only selector (2026-09)
User-directed: country is being phased out as a platform concept — "In the future I will consider only language while creating any module. no consideration of country." As a first step, the navbar's country dropdown (UAE/Kenya flags) was removed entirely from `navbar.tsx` — desktop dropdown, mobile menu row, and all associated dead state (`country`, `countryOpen`, `countryRef`, `selectCountry`, the `lm_country` localStorage read, the `COUNTRIES` array). Only the EN/AR language selector remains, in both desktop and mobile nav.

**Deliberately not touched in this pass:** every other `country`/`lm_country`/`COUNTRIES`/Kenya reference in the codebase (`admin-industries.tsx`, `admin-modules.tsx`, `about-page.tsx`, `industries-list-page.tsx`, `niches-section.tsx`, `stats-section.tsx`, `features-section.tsx`, `cms-modules-page.tsx`, `settings-page.tsx`, `modules-page.tsx`) — the user framed full country removal as a **future** consideration for module creation, not an immediate ask; this pass was scoped to just the navbar dropdown the user actually pointed at. A future session removing `country` as a module-creation concept needs to touch those files (and the corresponding backend `availableIn` field) — this note exists so that work isn't rediscovered from scratch.

## What is next to build
1. ~~Dashboard chatbot module~~ ✅ done — creation, knowledge base, channels, conversations, analytics all live
2. ~~Chatbot pricing/billing~~ ✅ done — Billing tab, admin-set per-deal pricing, manual bank-transfer flow
3. ~~Demo videos for all 6 chatbot templates~~ ✅ done — real recordings, hosted on Vercel Blob, wired into `/chatbots`
4. ~~Chatbot template detail pages + self-serve plan pricing~~ ✅ done — see above.
5. ~~Standalone chatbot pricing on `/pricing`~~ ✅ done — see above.
6. **WhatsApp / Instagram going live** — code and UI are done; needs the account owner's real Meta Business App credentials pasted into the Channels tab, plus Instagram needs Meta App Review for `instagram_manage_messages` (can take days)
7. **Subscribe flow + payment integration for agents/automations** — chatbots now have real billing; agents/automations still only have the generic hardcoded `PLANS` list (YouTube Agent Monthly/Annual) in `payment-instructions-page.tsx`, not per-module pricing
8. **Admin panel UI revamp** (on hold)
