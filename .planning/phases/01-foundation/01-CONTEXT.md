# Phase 1: Foundation - Context

**Gathered:** 2026-03-25
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 1 delivers the platform's infrastructure skeleton: working user accounts (email/password + Google OAuth), server-enforced freemium gating, Stripe subscription billing, a metered usage logging table, a versioned REST API layer (`/api/v1/`), and the full shared component library that every subsequent phase consumes. Nothing visible to peer investors is built in Phase 1 except the auth screens, account settings, and the component library itself.

</domain>

<decisions>
## Implementation Decisions

### shadcn Initialization
- **D-01:** shadcn base style: **New York** — compact, data-dense, suited to a metrics-heavy real estate analysis tool
- **D-02:** Border radius: **6px (0.375rem)** — matches `--radius` already specified in UI-SPEC; keeps components modern without being bubbly
- **D-03:** Base color: **zinc** — neutral base that pairs cleanly with the custom `#006aff` accent defined in UI-SPEC
- **D-04:** Init command: `npx shadcn@latest init --style new-york --base-color zinc` — planner must include this as an explicit task; update UI-SPEC frontmatter to `shadcn_initialized: true` after running

### Email Transport
- **D-05:** Email provider: **Resend** — has a native Better Auth adapter, free tier (3,000/month), API key in minutes, no server config required
- **D-06:** Account not yet created — plan includes a provisioning task: create Resend account, use the `resend.dev` sandbox domain during development (no custom domain needed for Phase 1), generate API key
- **D-07:** No custom domain for Phase 1 — use Resend sandbox (`onboarding@resend.dev` as sender during dev); production sender domain deferred until post-MVP

### External Services — All Must Be Provisioned
All four external services are unprovisioned. Plan must include explicit setup tasks for each:

- **D-08:** **Neon Postgres** — create Neon account and project, get connection string, configure connection pooling for Next.js (the `@neondatabase/serverless` driver with `neon()` for serverless/edge, NOT the standard `pg` driver — common gotcha: standard pg driver holds open connections and exhausts Neon's connection limit under Next.js serverless)
- **D-09:** **Stripe** — create Stripe account (if not exists), configure test mode, create a Product ("Real Estate AI Pro") with two Prices (monthly and annual), capture the Price IDs for `.env`
- **D-10:** **Stripe webhook** — implementation approach: webhook endpoint at `/api/v1/webhooks/stripe` receives `checkout.session.completed`, `customer.subscription.updated`, and `customer.subscription.deleted` events and syncs subscription state to Neon; plan includes Stripe CLI setup for local webhook forwarding (`stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe`)
- **D-11:** **Google OAuth** — plan includes step-by-step instructions: create Google Cloud project, enable Google+ API / OAuth 2.0, configure consent screen (External, add test users), create OAuth 2.0 client ID (Web application type), add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google` (dev) and `https://<vercel-url>/api/auth/callback/google` (prod — add after Vercel deploy). Plan must document both URIs because the Google console requires prod URI added before going live.

### Environment Variables
- **D-12:** Plan must produce a complete `.env.example` file with every required variable named correctly, including:
  ```
  # Database
  DATABASE_URL=          # Neon pooled connection string
  DATABASE_URL_UNPOOLED= # Neon direct connection string (for migrations only)

  # Better Auth
  BETTER_AUTH_SECRET=    # 32+ char random string
  BETTER_AUTH_URL=       # http://localhost:3000 (dev) / https://your-domain.com (prod)

  # Google OAuth
  GOOGLE_CLIENT_ID=
  GOOGLE_CLIENT_SECRET=

  # Resend
  RESEND_API_KEY=
  RESEND_FROM_EMAIL=     # onboarding@resend.dev (dev) / hello@yourdomain.com (prod)

  # Stripe
  STRIPE_SECRET_KEY=     # sk_test_... (dev)
  STRIPE_WEBHOOK_SECRET= # whsec_... (from stripe listen output)
  STRIPE_PRICE_ID_MONTHLY=
  STRIPE_PRICE_ID_ANNUAL=
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY= # pk_test_...

  # App
  NEXT_PUBLIC_APP_URL=   # http://localhost:3000 (dev) / https://your-domain.com (prod)
  ```

### Deployment
- **D-13:** Vercel deployment is part of Phase 1 — the phase is complete only when peer investors can access a live URL with working auth and subscription flow
- **D-14:** Vercel not yet connected — plan includes: create Vercel project, connect GitHub repo, add all production env vars, trigger first deploy; executor documents browser steps since they can't be scripted
- **D-15:** No custom domain for Phase 1 — use the Vercel-assigned `.vercel.app` URL; update `NEXT_PUBLIC_APP_URL` and Google OAuth redirect URI after first deploy

### Claude's Discretion
- Database schema table names and column conventions (Drizzle schema design, migration naming, index strategy)
- Better Auth session configuration (session expiry duration, cookie settings)
- API route organization structure under `/api/v1/` beyond auth and billing
- Middleware vs per-route guard pattern for freemium gating — plan should follow the server-enforced Route Handler pattern from STATE.md decisions
- `next-themes` or `class` strategy for dark mode toggling (UI-SPEC specifies CSS variable approach)

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Project Specs
- `.planning/phases/01-foundation/01-UI-SPEC.md` — Visual and interaction contract for all Phase 1 screens (auth pages, account settings, component library spec); includes component inventory, copywriting, color/typography/spacing tokens
- `.planning/REQUIREMENTS.md` — Phase 1 requirements: AUTH-01–05, BILL-01–06, API-01–03, COMP-01–06
- `.planning/PROJECT.md` — Constraints section (API-first, variable data costs, founder bandwidth); Key Decisions table (Better Auth + Drizzle + Neon + Stripe, freemium gate is server-enforced)
- `.planning/STATE.md` — Accumulated decisions from initialization including: metering table must exist before any live API call; freemium gate at Route Handler level not UI; DADU zoning stored as DB rows (relevant to schema design for Phase 1)

### Framework Docs (MANDATORY per AGENTS.md)
- `node_modules/next/dist/docs/` — Read before writing any Next.js code; Next.js 16 has breaking changes from prior versions
- `AGENTS.md` — Project-level instruction to read Next.js docs before coding

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `app/globals.css` — Existing Tailwind v4 globals file; design tokens for Phase 1 component library must be added here using `@theme inline` (NOT in a tailwind.config.*)
- `app/layout.tsx` — Geist font already loaded via `next/font/google`; Phase 1 layout wraps this with theme provider and auth session provider
- `lib/mock-properties.ts` — Prototype data layer; to be replaced entirely; no patterns to carry forward

### Established Patterns
- **Tailwind v4 via PostCSS** — no `tailwind.config.*` file; `@theme inline` in `globals.css` is the only place for custom tokens
- **TypeScript strict mode** — tsconfig already set; all new code must pass strict checks
- **App Router only** — no Pages Router; all Route Handlers in `app/api/`

### Integration Points
- `app/layout.tsx` — Root layout where auth session provider and theme provider will be mounted
- `app/globals.css` — Where all design tokens get defined
- No existing auth, DB, or API code — clean slate

</code_context>

<specifics>
## Specific Ideas

### Provisioning Detail Requirements
The user explicitly requested that provisioning tasks be fully detailed with no debugging ambiguity. Plans must include:

1. **Complete `.env.example`** — Every variable with correct name, description, and example value (captured in D-12 above)
2. **Neon connection pooling** — Use `@neondatabase/serverless` with `neon()` for Next.js serverless functions; use `DATABASE_URL_UNPOOLED` for Drizzle migrations only (direct connection bypasses pooler); document this split clearly
3. **Stripe CLI for local webhooks** — Include `stripe listen --forward-to localhost:3000/api/v1/webhooks/stripe` command in local dev setup task; note that `STRIPE_WEBHOOK_SECRET` comes from the CLI output, not the dashboard
4. **Google OAuth redirect URIs** — Document both localhost (`http://localhost:3000/api/auth/callback/google`) and the Vercel URL (to be added after first deploy); note that Better Auth's callback path is `/api/auth/callback/google` by default
5. **Better Auth secret generation** — Include `openssl rand -base64 32` command for generating `BETTER_AUTH_SECRET`

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within Phase 1 scope.

</deferred>

---

*Phase: 01-foundation*
*Context gathered: 2026-03-25*
