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

## What is next to build
1. **Dashboard chatbot module** — UI for creating/configuring/deploying chatbots
2. **Channel integrations** — Website embed widget, WhatsApp, Instagram connect
3. **Subscribe flow** — for AI agents and automations
4. **Payment integration**
5. **Admin panel UI revamp** (on hold)
