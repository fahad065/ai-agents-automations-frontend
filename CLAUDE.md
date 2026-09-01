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
The requested flow: visit `/chatbots` → click a template card → land on `/chatbots/[slug]` (e.g. `/chatbots/restaurant-chatbot`) → read features/stats/demo video → pick a plan in the pricing section → land in the dashboard config portal with a 30-day trial already running.

- **`/chatbots/[slug]/page.tsx`** + **`chatbot-detail-page.tsx`** — same structure as `agent-detail-page.tsx` (hero, hero stats, capabilities, features, demo video, FAQ, closing CTA), content fetched from `GET /modules/:slug`. Two deliberate differences from the agent version: the demo video renders as a native `<video>` (chatbot demos are hosted `.mp4` files, not YouTube links like agent demos), and the hero/closing CTAs scroll to `#pricing` instead of linking straight to a dashboard — a customer still has to pick Basic/Pro/Enterprise first.
- **Pricing section** — fetches `GET /chatbot-plans` (global catalog, same 3 tiers on every template's page — see backend CLAUDE.md's "Chatbot plan catalog" section) and renders the same 3-card layout style as the agent pricing section. Each non-custom plan's button calls `POST /chatbots` with `{name, description, template, language: "both", planId}` (mapping the module slug → `Chatbot.template` enum via a small `TEMPLATE_ENUM` lookup in `chatbot-detail-page.tsx`) and redirects straight into `/dashboard/chatbots/:id` — this is what actually starts the chatbot's 30-day auto-trial (`ChatbotsService.create()` on the backend). Unauthenticated visitors go to `/auth/signup` instead. The Enterprise/`isCustom` card is a "Contact us" `mailto:` link, same pattern as `agent.pricing.hasCustomPlan`.
- **`admin-modules.tsx`** — the Module Type dropdown gained a `Chatbot` option, so admins edit these 6 templates' marketing content the same way they edit agents/automations.

### Dashboard trial/expiry banner (implemented)
**`chatbot-trial-banner.tsx`** — a per-chatbot version of the account-level `trial-banner.tsx` (that one reads `user.trialEndDate` from the auth store; this one takes a `billing: Billing` prop, since each chatbot has its own trial independent of the user's agent/automation trial). Rendered at the top of `chatbot-config-page.tsx`, right below the header. Shows an amber countdown starting 5 days before `billing.trialEndsAt` (matching the backend's `chatbot-billing.cron.ts` reminder window), and a red "stopped answering customers" banner for `awaiting_setup_payment`/`past_due`/`suspended` — its button jumps straight to the Billing tab (`setTab("billing")`) rather than a separate page, since chatbot billing lives in-page as a tab.

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

## What is next to build
1. ~~Dashboard chatbot module~~ ✅ done — creation, knowledge base, channels, conversations, analytics all live
2. ~~Chatbot pricing/billing~~ ✅ done — Billing tab, admin-set per-deal pricing, manual bank-transfer flow
3. ~~Demo videos for all 6 chatbot templates~~ ✅ done — real recordings, hosted on Vercel Blob, wired into `/chatbots`
4. ~~Chatbot template detail pages + self-serve plan pricing~~ ✅ done — see above. Not done yet: the pricing tiers (Basic/Pro/Enterprise) aren't shown anywhere except a template's detail page — there's no standalone `/pricing`-style chatbot pricing page for someone who lands without a template in mind.
5. **WhatsApp / Instagram going live** — code and UI are done; needs the account owner's real Meta Business App credentials pasted into the Channels tab, plus Instagram needs Meta App Review for `instagram_manage_messages` (can take days)
6. **Subscribe flow + payment integration for agents/automations** — chatbots now have real billing; agents/automations still only have the generic hardcoded `PLANS` list (YouTube Agent Monthly/Annual) in `payment-instructions-page.tsx`, not per-module pricing
7. **Admin panel UI revamp** (on hold)
