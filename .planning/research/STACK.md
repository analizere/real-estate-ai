# Stack Research

**Domain:** Real estate investment SaaS — API-first, freemium, external data integrations
**Researched:** 2026-03-25
**Confidence:** MEDIUM (Next.js 16 verified via official blog; auth/billing/ORM from training data through Aug 2025 with noted gaps)

---

## Context

This is a **greenfield build** on top of an existing prototype (Next.js 16.2.1, React 19.2.4, Tailwind v4). The prototype is UI-only — no auth, no database, no API layer. The new build must support:

- REST API layer consumed by web, mobile (future), and browser plugin (future)
- Auth + freemium subscription gating
- External API integrations: Rentcast, county assessor/GIS APIs (Portland, Seattle metros)
- Market-scoped zoning rules database (updatable without code changes)
- Per-market data pipelines
- Variable-cost API metering (live data gated behind paid tier)

---

## Recommended Stack

### Core Technologies

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Next.js | 16.2.1 (installed) | Full-stack framework, App Router, API routes | Already installed; App Router + Route Handlers give first-class REST API support; avoid version churn at greenfield start. Note: Next.js 16 has significant breaking changes from 15 — read `/node_modules/next/dist/docs/` or official upgrade guide before writing any code. |
| React | 19.2.4 (installed) | UI layer | Already installed; React 19 Server Components + `use cache` directive align with Next.js 16 caching model. |
| TypeScript | 5.x (installed) | Type safety | Required for a data-heavy domain with complex nested types (property records, zoning rules, financial calculations). Strict mode enforced. |
| Tailwind CSS | v4 (installed) | Styling | Already installed; v4 is a CSS-first config that differs materially from v3 — do not rely on v3 class-variant documentation. |
| PostgreSQL | 16+ | Primary data store | Standard choice for SaaS with relational data needs: user accounts, subscriptions, property lookups, zoning rules. Strongly typed, mature, and supported by all major hosting platforms. Use Neon or Supabase for managed hosting on a solo build. |
| Drizzle ORM | 0.30+ | Database access layer | TypeScript-native ORM with schema-as-code. Significantly less magic than Prisma — SQL-transparent, no hidden N+1 queries, migrations are plain SQL files you own. Better fit than Prisma for a data-pipeline-heavy app where query transparency matters. |

### Auth

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Better Auth | 1.x | Authentication | Self-hosted, TypeScript-native auth library. Works natively with Next.js App Router without the session/server boundary friction of Auth.js (NextAuth v5). Supports email/password, OAuth, and — critically — has a subscription/org plugin that maps to freemium gating. Does not require an external service. Confidence: MEDIUM (well-established in community by Aug 2025; verify current version and plugin API before implementation). |

**Why not Clerk:** Clerk is an external service with per-MAU pricing. At early stage with unknown user counts, this adds unpredictable cost and vendor lock-in. If the founder wants zero auth infrastructure maintenance, Clerk is the escape hatch — but for an API-first SaaS where the session model needs to work across web + mobile + plugin, owning the auth layer matters.

**Why not Auth.js (NextAuth v5):** Auth.js works but has significant friction with Next.js App Router: edge runtime limitations, complex session forwarding to API routes, adapter-required database integration. Better Auth was specifically designed for the App Router model.

### Billing and Subscriptions

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| Stripe | Current | Subscription billing, freemium gating | Industry standard. Stripe Billing handles subscription lifecycles (free → paid upgrade, cancellation, dunning). Stripe webhooks drive plan changes in your database. No credible alternative for a new SaaS build. |
| `stripe` (npm) | 16.x+ | Stripe Node.js SDK | Official SDK. Use server-side only — never expose Stripe secret key to client components. |

**Freemium gating pattern:** Store `plan` and `subscription_status` on the user record in PostgreSQL. Middleware (now `proxy.ts` in Next.js 16) or API route checks gate live-data endpoints. Stripe webhooks update plan status on subscription events. Do not use Stripe as the source of truth for plan status in hot paths — sync to your own DB.

### Database Hosting

| Option | Use When | Why |
|--------|----------|-----|
| **Neon** (recommended) | Solo/early-stage build | Serverless PostgreSQL with branch-per-environment support; free tier is generous; integrates cleanly with Drizzle; scales to production without migration. Confidence: HIGH — standard recommendation as of 2025. |
| Supabase | If you want built-in dashboard + Row Level Security | Adds PostgREST and auth layer on top of Postgres; more opinionated but useful if you want a visual DB admin. Slightly more overhead than Neon for a custom API. |
| Railway | If you want simple VM-style Postgres | Predictable pricing, no serverless cold starts — better if data pipeline jobs are long-running. |

### External API Integrations

| Service | Purpose | Pattern |
|---------|---------|---------|
| **Rentcast API** | Rent estimates for primary unit + ADU | Call from Next.js Route Handler (server-side only). Cache responses in PostgreSQL with a TTL (rent data doesn't change daily). Gate behind paid tier check before calling. |
| **County Assessor APIs** (OR/WA counties) | Property records: lot size, structure attributes, ownership | Per-county REST or GIS APIs. Multnomah County (Portland), King County (Seattle) have public REST endpoints. Wrap in a market-scoped adapter pattern (see Architecture section). |
| **City GIS APIs** | Zoning designations, parcel data | ESRI ArcGIS REST is common for OR/WA municipalities. Wrap in same adapter pattern as county assessors. |
| **RegridAPI or Loveland** | Fallback parcel data aggregator | If individual county APIs are inconsistent, Regrid provides normalized parcel data across counties. Evaluate cost before using as primary. Confidence: MEDIUM — was the standard aggregator as of mid-2025. |

**Integration pattern:** All external API calls go through a server-side adapter layer (`lib/integrations/[market]/[service].ts`). Never call external APIs from client components. Cache aggressively in PostgreSQL. Rate limit at the adapter layer, not at each call site.

### Data Pipeline / Background Jobs

| Technology | Version | Purpose | Why Recommended |
|------------|---------|---------|-----------------|
| **Inngest** or **Trigger.dev** | Current | Background jobs, per-market data refresh pipelines | Both are TypeScript-native job runners that work without a separate queue infrastructure. For a solo build, either avoids the overhead of running Redis + BullMQ. Inngest is slightly more established; Trigger.dev has a cleaner SDK. Choose one — they are not meaningfully different at this scale. Confidence: MEDIUM — both well-established by Aug 2025; verify current pricing and self-host options. |

**Why not BullMQ/Redis:** BullMQ + Redis is the right choice at scale but requires running and managing a Redis instance. For MVP with 2-3 markets and low job volume, the overhead is not justified.

### Supporting Libraries

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| `zod` | 3.x | Runtime schema validation | Validate all external API responses before storing. Validate all API route inputs. Use everywhere data crosses a trust boundary. |
| `next-safe-action` | 7.x+ | Type-safe Server Actions | Wraps Server Actions with Zod validation and error handling. Use for any form submission or mutation that doesn't need to be a REST endpoint. |
| `@tanstack/react-query` | 5.x | Client-side data fetching and caching | For any client component that needs to fetch data after initial load (property lookup status, subscription status). Do not use for initial page data — use Server Components for that. |
| `react-hook-form` | 7.x | Form state management | Address lookup form, financial inputs. Pairs with Zod via `@hookform/resolvers`. |
| `shadcn/ui` | Current | UI component system | Accessible, unstyled-by-default component primitives that work with Tailwind v4. Not a dependency — components are copied into your codebase. Preferred over Radix UI direct use or a component library with its own design system. |
| `recharts` | 2.x+ | Data visualization | Cash flow projections, BRRRR waterfall charts. Lightweight and React-native. Verify v3 release status — v3 was in progress as of Aug 2025. |
| `resend` | 2.x | Transactional email | Welcome emails, subscription receipts, usage alerts. Resend is the standard modern choice over SendGrid for new TypeScript builds. |

### Development Tools

| Tool | Purpose | Notes |
|------|---------|-------|
| **Biome** | Linting + formatting | Next.js 16 removed `next lint` as a built-in command — use Biome or ESLint directly. Biome replaces both ESLint + Prettier in one tool; faster and zero config for TypeScript projects. Confidence: HIGH — Next.js 16 blog explicitly notes this change. |
| **Vitest** | Unit + integration testing | Faster than Jest, native TypeScript, works without `ts-jest`. Use for calculator logic, adapter functions, zoning rule evaluators. |
| **Playwright** | E2E testing | Browser automation for critical flows (address lookup → analysis output, freemium gate enforcement). |
| **Neon branching** | Per-PR database branches | Neon supports branch-per-PR in CI. Free tier includes branches. Critical for testing migrations without corrupting shared dev DB. |

---

## Installation

```bash
# Core (Next.js 16 already installed)
# Add database + auth + billing
npm install drizzle-orm @neondatabase/serverless pg
npm install better-auth
npm install stripe

# Validation + forms
npm install zod react-hook-form @hookform/resolvers
npm install next-safe-action

# Client-side data fetching
npm install @tanstack/react-query @tanstack/react-query-devtools

# Email
npm install resend

# Background jobs (choose one)
npm install inngest
# OR
npm install @trigger.dev/sdk

# Dev dependencies
npm install -D drizzle-kit vitest @vitejs/plugin-react playwright biome
```

---

## Alternatives Considered

| Recommended | Alternative | When to Use Alternative |
|-------------|-------------|-------------------------|
| Drizzle ORM | Prisma | If team is larger and prefers Prisma's GUI (Prisma Studio) and migration workflow; Prisma is more ergonomic for complex relations but less transparent on generated SQL |
| Better Auth | Clerk | If the founder wants zero auth infrastructure maintenance and per-MAU cost is acceptable; Clerk handles everything out of the box but creates vendor lock-in |
| Better Auth | Supabase Auth | If you chose Supabase for hosting and want a tightly integrated auth + DB combo; avoid if using Neon |
| Neon | Supabase | If you want built-in Row Level Security, REST API over DB, or visual admin UI without a separate tool |
| Neon | Railway | If you need predictable pricing and long-running DB connections (Railway has no cold start) |
| Inngest | BullMQ + Redis | At scale (>1000 jobs/day or complex queue routing); not justified at MVP |
| Vitest | Jest | If codebase has legacy Jest config already; Jest works fine but is slower and requires more TypeScript config |
| Resend | SendGrid | If deliverability requirements are strict and the team has existing SendGrid infrastructure; Resend is simpler for new builds |

---

## What NOT to Use

| Avoid | Why | Use Instead |
|-------|-----|-------------|
| **`middleware.ts`** | Deprecated in Next.js 16 — renamed to `proxy.ts`. Still works but will be removed in a future version. | `proxy.ts` with exported `proxy` function |
| **`experimental.ppr`** | Removed in Next.js 16 — replaced by `cacheComponents: true` config | `cacheComponents` in `next.config.ts` |
| **`serverRuntimeConfig` / `publicRuntimeConfig`** | Removed in Next.js 16 | Environment variables via `.env` files |
| **`revalidateTag(tag)` single-arg form** | Deprecated in Next.js 16 — now requires second `cacheLife` argument | `revalidateTag(tag, 'max')` or `updateTag(tag)` in Server Actions |
| **Sync `params`, `cookies()`, `headers()`** | Breaking change in Next.js 16 — these are now async | `await params`, `await cookies()`, `await headers()` |
| **Prisma** (at MVP) | Generates opaque SQL that's hard to reason about for data-pipeline work; migration files are tied to Prisma client rather than plain SQL | Drizzle ORM |
| **Client-side API key exposure** | Calling Rentcast, county APIs, or Stripe from browser components leaks credentials and bypasses freemium gate | All external API calls go through Next.js Route Handlers (server-only) |
| **Hardcoding zoning rules in app code** | Makes per-market updates require deployments; defeats the competitive moat | Store zoning rules in PostgreSQL with market + municipality scoping |
| **MLS integration** | API access is expensive and gated by MLS boards; not needed for BRRRR/DADU analysis | County assessor + GIS public APIs |
| **Next.js `next lint` command** | Removed in Next.js 16 | Run ESLint or Biome directly; `next build` no longer runs linting |
| **AMP** | Removed in Next.js 16 | Not relevant to this domain |

---

## Stack Patterns by Variant

**API-first REST layer (required for multi-client future):**
- Use Next.js Route Handlers (`app/api/[route]/route.ts`) for all data-fetching and mutation APIs
- Never put business logic in page Server Components that isn't also accessible via a Route Handler
- Route Handlers are Node.js-runtime by default in Next.js 16 — no edge runtime surprises

**Freemium gating:**
- Check `user.plan` from your DB in each protected Route Handler
- Use `proxy.ts` for route-level redirects (e.g., redirect `/analysis/*` to `/upgrade` if free tier)
- Never trust client-side plan checks — always enforce on the server

**Per-market data pipeline:**
- One adapter module per market per data source: `lib/integrations/portland/assessor.ts`, `lib/integrations/seattle/gis.ts`
- Market registry in DB, not in code: adding a new market is a DB row + adapter file, not a code change in core logic
- Background jobs (Inngest/Trigger.dev) run nightly refresh for market data; store results in PostgreSQL

**Zoning rules database:**
- Table: `zoning_rules(market, municipality, zone_code, rule_type, value, effective_date, source_url)`
- Query at analysis time — rules are data, not code
- Admin UI or simple JSON import for rule updates (no deployments needed for rule changes)

**Subscription state:**
- Source of truth: PostgreSQL `subscriptions` table
- Synced via Stripe webhooks on `customer.subscription.updated`, `customer.subscription.deleted`
- Never call Stripe API in hot paths — read from your DB

---

## Version Compatibility

| Package | Compatible With | Notes |
|---------|-----------------|-------|
| Next.js 16.2.1 | Node.js 20.9+ | Next.js 16 dropped Node.js 18 support — verify host environment |
| Next.js 16.2.1 | TypeScript 5.1+ | Min TS version raised in Next.js 16 |
| React 19.2.4 | Next.js 16.2.1 | Installed together — do not upgrade React independently without checking Next.js compatibility |
| Tailwind v4 | PostCSS (postcss.config.mjs) | Tailwind v4 is CSS-first, not JS config — `tailwind.config.js` is not used; configure in CSS files via `@theme` |
| Drizzle ORM | Neon serverless driver (`@neondatabase/serverless`) | Use `neon()` as the HTTP driver for serverless; use `@neondatabase/serverless` + `ws` for WebSocket in long-lived connections |
| Better Auth | Next.js App Router | Designed for App Router; does not require edge runtime |
| Stripe | Node.js only | Never import `stripe` in client components or edge functions |
| `@tanstack/react-query` v5 | React 19 | React Query v5 supports React 19 — verify with current docs before installing |

---

## Key Next.js 16 Gotchas (Verified)

Source: [nextjs.org/blog/next-16](https://nextjs.org/blog/next-16), published October 21, 2025

1. **`proxy.ts` replaces `middleware.ts`** — rename file, rename export to `proxy`. `middleware.ts` is deprecated (still works for edge runtime cases but will be removed).
2. **Async-only `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()`** — any sync access is a runtime error. Await everything.
3. **`revalidateTag()` requires second argument** — `revalidateTag(tag, 'max')` for SWR; `updateTag(tag)` in Server Actions for read-your-writes.
4. **`cacheComponents: true`** replaces `experimental.ppr` and `experimental.dynamicIO` — all caching is opt-in via `"use cache"` directive.
5. **Parallel routes require `default.js`** — all parallel route slots need explicit `default.js` or build fails.
6. **`next lint` removed from build** — set up Biome or ESLint in CI separately.
7. **Turbopack is now the default bundler** — custom webpack configs still work with `next dev --webpack` but Turbopack is on by default.
8. **`serverRuntimeConfig` / `publicRuntimeConfig` removed** — use `.env` files.
9. **Node.js 20.9+ required** — Node.js 18 is no longer supported.
10. **`next/image` local src with query strings** requires `images.localPatterns` config.

---

## Sources

- **[nextjs.org/blog/next-16](https://nextjs.org/blog/next-16)** — Verified via WebFetch. Published October 21, 2025. All Next.js 16 breaking changes and new APIs sourced here. Confidence: HIGH.
- **Project package.json** — Confirmed installed versions: next@16.2.1, react@19.2.4, tailwindcss@4. Confidence: HIGH.
- **Training data (auth, billing, ORM, job runners)** — Knowledge through August 2025. Better Auth, Drizzle, Neon, Inngest/Trigger.dev, Resend recommendations reflect community consensus as of that date. Verify current versions before installing. Confidence: MEDIUM.
- **Training data (external APIs)** — Rentcast API, county GIS patterns for OR/WA based on training data. County API availability may have changed. Confidence: LOW — verify each county's current API documentation before implementation.

---

*Stack research for: Real estate investment SaaS (BRRRR + DADU analysis)*
*Researched: 2026-03-25*
