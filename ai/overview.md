# What this repo does, and what's changing

Next.js (App Router) + shadcn/ui frontend, calling the NestJS backend at
`NEXT_PUBLIC_API_URL`. Full stack, every shipped feature, and the platform's
styling conventions are documented in this repo's root `CLAUDE.md` — read
that for "how does X work today."

## What the database redesign changes here

The backend is consolidating today's fragmented ownership model (`UserModule`
+ `Chatbot` + the dead `IndustrySubscription`) into one `userservices`
collection, and the catalog (`ModuleTemplate`) into one `services` collection.
See `ai-agents-automations-backend/ai/architecture.md` for the full shape.

The direct frontend consequence, already agreed during design:

**"My Services" replaces the split between "My Modules" and the chatbot
list.** One sidebar item, one list (fetched from one `userservices` query
instead of today's two separate API calls), one detail page per service
with a type-adaptive tab view inside it — not a second sidebar item, not a
separate page per type. See `rules.md` and `implementation-guide.md`.

**Marketing nav: "Services" replaces "Industries."** Industries are being
dropped as a subscription mechanism (the backend's `industry-subscriptions`
collection is confirmed broken — it never actually scheduled anything). The
navbar's "Industries" item becomes "Services," with a hover dropdown to
Agents/Automations/Chatbots and a click-through to one filterable
`/services` page — reusing `/pricing`'s existing All/Agents/Automations/
Chatbots filter-tab pattern rather than inventing a new one.

Nothing else about the platform's conventions changes because of this
redesign — inline styles stay inline styles, the Tailwind/shadcn pages stay
as they are, the bilingual rendering pattern is unchanged.

**Service detail pages get a second CTA button.** `services.brochureUrl`
(new field, see the backend's `architecture.md`) is a downloadable PDF
one-pager. The detail page (`agent-detail-page.tsx`/`chatbot-detail-page.tsx`
pattern) should render it as a second button alongside the existing "See it
works" demo-video button — "Download Brochure / Overview," a plain link to
the PDF, rendered only when `brochureUrl` is set (same optional-field
pattern as `demoVideoUrl`). First real content: a restaurant chatbot
brochure, meant to be sent to leads. Not built yet.
