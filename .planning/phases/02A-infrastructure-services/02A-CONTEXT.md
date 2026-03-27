# Phase 2A: Infrastructure Services - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2A delivers the platform's service infrastructure layer so every feature built in 2B and 2C ships already gated, metered, and instrumented. Specifically: a central gating service controlling 3-tier feature access, a full usage metering pipeline that logs every cost-bearing action before execution, PostHog analytics (cloud) with session recording and cohort analysis, and a DataEnrichmentService with stub implementations defining the Stage 1/Stage 2 boundary.

</domain>

<decisions>
## Implementation Decisions

### Gating Service (TIER-01 through TIER-07)
- **D-01:** Central config-driven gating — a single configuration layer (TS config file or database table) defines feature-to-tier assignments; all components call this service, never individual plan checks scattered in UI components
- **D-02:** Three tiers: Tier 1 (always free — Stage 1 public data, manual calculator, Deal Score from manual data), Tier 2 (preview free — show data clearly, gate the action not the visibility), Tier 3 (Pro only — full enrichment, analysis, export)
- **D-03:** Tier 2 critical pattern: "See everything, do more with Pro" — never blur, hide, or obscure data; gate the ability to use it (include in analysis, save, export)
- **D-04:** Tier assignments are intentionally preliminary — architecture must support rapid iteration on what's free vs paid without engineering effort; limits configurable per tier without code deployments
- **D-05:** Evolve existing `lib/services/gating.ts` (binary free/pro `requirePro()`) into the 3-tier gating service — do not create a parallel system

### Usage Metering (METER-01, METER-02, METER-04, METER-05, METER-08, METER-09, METER-10)
- **D-06:** Every metered action logged BEFORE execution with: user_id, timestamp, action_type, cost_estimate_cents, api_provider, property_id (nullable), metadata JSON, plan_at_time_of_action
- **D-07:** Expand existing `lib/schema/usage-log.ts` and `lib/services/usage.ts` to match the full METER-01 spec — add missing columns (cost_estimate_cents, api_provider, metadata, plan_at_time_of_action)
- **D-08:** Soft limits: every metered action checks configurable limit before executing; limits defined in central config per plan tier (same config as gating service)
- **D-09:** At 80% of any limit: show usage indicator as a banner in account settings; at 100%: show blocking message with upgrade/overage option — never silently fail
- **D-10:** Beta strategy (first 90 days): set all limits to "unlimited", log everything, enforce nothing
- **D-11:** Limits can be set to "unlimited" — the check still runs, it just never blocks

### PostHog Analytics (ANLYT-01 through ANLYT-04, ANLYT-08, ANLYT-09, ANLYT-10, ANLYT-11)
- **D-12:** PostHog Cloud (posthog.com) — not self-hosted; configured via `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` env vars
- **D-13:** PostHog provider wraps the entire app layout — do not initialize per-page
- **D-14:** Privacy-safe: no PII in event properties; identify users by user_id not email
- **D-15:** User lifecycle events wired in Phase 2A: `signed_up`, `signed_in`, `signed_out`, `email_verified`, `subscription_started`, `subscription_cancelled`, `upgrade_clicked`
- **D-16:** Data pull events (`stage1_data_pull_started`, `stage1_data_pull_completed`, `stage2_data_pull_started`, `stage2_data_pull_completed`) fire server-side to prevent ad blocker suppression
- **D-17:** PostHog person properties updated server-side on plan changes
- **D-18:** Feature flags for A/B testing paywall placement and upgrade prompt copy — configure the infrastructure, actual experiments come in later phases
- **D-19:** Key funnels configured: signup → first analysis → upgrade; address entered → data pulled → analysis completed; upgrade clicked → subscription started; shared link viewed → recipient signup; free user → paywall hit → upgrade
- **D-20:** Event taxonomy follows ANLYT-01 through ANLYT-11 in REQUIREMENTS.md — that is the source of truth for event names and properties

### Session Recording (SESS-01 through SESS-07)
- **D-21:** All sessions recorded for first 90 days of beta — no exceptions
- **D-22:** After 90 days: all free tier sessions + first 5 sessions of every new paid user
- **D-23:** Never record payment screens (Stripe Checkout is external — automatic)
- **D-24:** Flag sessions with rage clicks for priority UX review
- **D-25:** Flag sessions where user hit paywall but did not upgrade
- **D-26:** Heatmaps configured on: Property Intelligence page, Portfolio page, pricing/upgrade modal

### Cohort Analysis (COHRT-01 through COHRT-05)
- **D-27:** Cohorts configured from day one in PostHog: week 1 retention, month 1 retention, feature adoption (DADU week 1 vs week 4), acquisition source, market (King County vs others), deal score (avg above 66 vs below 40)

### DataEnrichmentService (DATA-01 through DATA-03, DATA-05 through DATA-10)
- **D-28:** Implement as `DataEnrichmentService` with `stage1Enrich(address)` and `stage2Enrich(propertyId, features[])` as distinct methods — free/paid boundary explicit in codebase
- **D-29:** Stub implementations that return mock data with the correct interface — not just types/interfaces. Stage 1 adapters are stubs that return realistic mock property data; real adapters built in Phase 5
- **D-30:** Cache TTL definitions per field type: static (180 days), semi-static (30 days), dynamic (24–48 hours), skip trace (never cache)
- **D-31:** Track `cache_source` per field: county_api | gis_api | openstreetmap | rentcast | attom | internal
- **D-32:** County data quality tiers defined: King County WA (Excellent), Multnomah County OR (Good), Pierce County WA (Moderate), Snohomish County WA (Moderate)
- **D-33:** Graceful degradation: show available data clearly, flag missing fields explicitly rather than failing silently
- **D-34:** Track cache hit rate as a key infrastructure metric

### Claude's Discretion
- DataEnrichmentService internal architecture (class vs module, dependency injection pattern)
- PostHog SDK version and initialization pattern (as long as it wraps the app layout)
- Gating config storage format (TS const vs JSON file vs database table) — as long as it's a single source of truth that can be changed without code deployments
- Schema migration strategy for expanding usage_log table
- File organization for new services within `lib/services/`

</decisions>

<canonical_refs>
## Canonical References

**Downstream agents MUST read these before planning or implementing.**

### Requirements (source of truth for all decisions)
- `.planning/REQUIREMENTS.md` — Full requirement specs: TIER-01–07, METER-01–10, ANLYT-01–04/08–11, SESS-01–07, COHRT-01–05, DATA-01–10
- `.planning/ROADMAP.md` — Phase 2A goal, success criteria, dependency chain

### Architecture Rules (CLAUDE.md sections — MANDATORY)
- `CLAUDE.md` §"Property data caching" — Field-level lazy invalidation architecture
- `CLAUDE.md` §"Staged data pull architecture" — Two-stage enrichment rules
- `CLAUDE.md` §"Data tier architecture" — Three-tier gating rules, anti-patterns
- `CLAUDE.md` §"Usage metering" — Logging-before-execution rules, beta strategy
- `CLAUDE.md` §"Analytics (PostHog)" — Event taxonomy, session recording, dual logging
- `CLAUDE.md` §"Performance and code quality" — React Query, optimistic UI, background jobs
- `CLAUDE.md` §"Architectural Rules" — Business logic separation (hooks/services/API, not UI components)

### Existing Code (evolve, don't replace)
- `lib/services/gating.ts` — Current binary free/pro gating; evolve to 3-tier
- `lib/services/usage.ts` — Current basic usage logging; expand to full METER-01 spec
- `lib/schema/usage-log.ts` — Current minimal schema; expand with new columns
- `lib/schema/auth.ts` — Better Auth schema (user, session, subscription tables)

### Framework Docs (MANDATORY per AGENTS.md)
- `node_modules/next/dist/docs/` — Read before writing any Next.js code; Next.js 16 has breaking changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/services/gating.ts` — `authenticateAndCheckTier()` and `requirePro()` already handle auth + subscription check; evolve into 3-tier gating
- `lib/services/usage.ts` — `logUsage()`, `updateUsageStatus()`, `getUserUsage()` already work with Drizzle + Neon; expand schema and types
- `lib/schema/usage-log.ts` — Drizzle schema for usage_log table; add columns for cost_estimate_cents, api_provider, metadata, plan_at_time_of_action
- `lib/db.ts` — Neon + Drizzle connection already configured
- `lib/auth.ts` — Better Auth with Stripe plugin already configured
- `components/ui/` — 20+ shadcn components available (card, badge, alert, dialog, button, form-field, etc.)
- `app/account/` — Account settings page exists; usage banner can be added here

### Established Patterns
- **Drizzle ORM** with `pgTable` definitions in `lib/schema/`
- **Service layer** in `lib/services/` — business logic separated from route handlers
- **Route handlers** in `app/api/v1/` — billing, usage, webhooks already exist
- **Server-enforced gating** via `requirePro()` called in Route Handlers
- **Tailwind CSS v4** via PostCSS with `@theme inline` tokens in globals.css

### Integration Points
- `app/layout.tsx` — Where PostHog provider wraps the app (alongside existing ThemeProvider)
- `app/api/v1/` — Where new metering and data enrichment API routes will live
- `lib/services/` — Where DataEnrichmentService and expanded gating/metering services go
- `lib/schema/` — Where new Drizzle schemas for enrichment cache and expanded usage_log go
- `app/account/settings/` — Where 80% usage banner surfaces

</code_context>

<specifics>
## Specific Ideas

- User explicitly stated: all architectural decisions are already documented in REQUIREMENTS.md and CLAUDE.md — those are the source of truth. No additional product decisions needed for this phase.
- DataEnrichmentService should have stub implementations returning mock data (not just interfaces) so 2B/2C can develop against realistic data shapes.
- The gating config and metering limits should share the same central configuration layer (per TIER-06 and METER-08).

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope. All decisions were pre-documented in requirements.

</deferred>

---

*Phase: 02A-infrastructure-services*
*Context gathered: 2026-03-27*
