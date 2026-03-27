# Phase 2A: Infrastructure Services - Context

**Gathered:** 2026-03-27
**Status:** Ready for planning

<domain>
## Phase Boundary

Phase 2A delivers the platform's service infrastructure layer so every feature built in 2B and 2C ships already gated, metered, and instrumented. Specifically: a hybrid GatingService (TS config + database override table) controlling 3-tier feature access, a full usage metering pipeline with per-action-type independent limits, PostHog Cloud analytics with session recording and cohort analysis, and a DataEnrichmentService with stub implementations returning realistic mock data that define the permanent Stage 1/Stage 2 interface contract.

</domain>

<decisions>
## Implementation Decisions

### Gating Service (TIER-01 through TIER-07)
- **D-01:** Hybrid GatingService — TypeScript config as base tier assignments, database override table for per-user/per-feature overrides
- **D-02:** Precedence rule: user-level override beats global override beats config file — document this in code comments
- **D-03:** Feature names stored as strings validated against a TypeScript enum that is the single source of truth — validate on insert, add startup check that logs any database overrides with unrecognized feature names
- **D-04:** Override table schema:
  - `id` (uuid pk)
  - `scope` (enum: user/global/cohort)
  - `user_id` (uuid nullable, fk → users.id)
  - `cohort_id` (uuid nullable)
  - `feature` (varchar, not null, validated against TS enum)
  - `tier_override` (integer 1/2/3, not null)
  - `is_active` (boolean, default true)
  - `expires_at` (timestamp nullable — null = permanent)
  - `granted_by` (uuid not null — admin user_id or 'system')
  - `reason` (varchar not null — e.g. 'beta_access', 'trial', 'founder_grant')
  - `metadata` (jsonb nullable)
  - `created_at` (timestamp not null)
  - `updated_at` (timestamp not null)
- **D-05:** Indexes: `(user_id, feature, is_active)`, `(scope, feature, is_active)`, `(expires_at)`
- **D-06:** Cache gating results per user session with 5-minute TTL, invalidate on override change
- **D-07:** Weekly background job soft-deletes expired overrides by setting `is_active: false` — never hard delete, preserve audit trail
- **D-08:** GatingService response object: `{ allowed: boolean, reason: 'LIMIT_REACHED' | 'TIER_REQUIRED' | 'OVERRIDE' | null, action: string, overageAvailable: boolean }` — `overageAvailable` is always false in MVP but the field must exist for future overage billing without refactoring
- **D-09:** Three tiers: Tier 1 (always free — Stage 1 public data, manual calculator, Deal Score from manual data), Tier 2 (preview free — show data clearly, gate the action not the visibility), Tier 3 (Pro only — full enrichment, analysis, export)
- **D-10:** Tier 2 critical pattern: "See everything, do more with Pro" — never blur, hide, or obscure data; gate the ability to use it (include in analysis, save, export)
- **D-11:** Evolve existing `lib/services/gating.ts` (binary free/pro `requirePro()`) into the hybrid GatingService — do not create a parallel system

### Usage Metering (METER-01, METER-02, METER-04, METER-05, METER-08, METER-09, METER-10)
- **D-12:** Every metered action logged BEFORE execution with: user_id, timestamp, action_type, cost_estimate_cents, api_provider, property_id (nullable), metadata JSON, plan_at_time_of_action
- **D-13:** Expand existing `lib/schema/usage-log.ts` and `lib/services/usage.ts` to match the full METER-01 spec — add missing columns (cost_estimate_cents, api_provider, metadata, plan_at_time_of_action)
- **D-14:** Action-level limits — each action type (lookups, skip traces, saved analyses, lists, PDF exports) has completely independent limit tracking. Hitting one limit never blocks any other action type
- **D-15:** Hard stop at 100% per action type. Structured GatingService response: `{ allowed: false, reason: 'LIMIT_REACHED', action: 'lookup', overageAvailable: false }`. When overage billing ships in a future phase, flip `overageAvailable: true` and add the UI flow — no structural changes needed
- **D-16:** Beta strategy (first 90 days): set all limits to "unlimited", log everything, enforce nothing
- **D-17:** Limits can be set to "unlimited" — the check still runs, it just never blocks

### Metering UX
- **D-18:** 80% warning surfaces BOTH inline on the relevant feature AND in Account Settings
- **D-19:** 100% block message is contextual — appears only on the specific action that's exhausted, never as a global account lockout
- **D-20:** Usage tracker in Account Settings as primary home showing all metered actions with current usage, limit, and "resets in X days"
- **D-21:** Contextual inline indicators on specific features — address search bar shows lookup count, skip trace shows its own counter inline

### PostHog Analytics (ANLYT-01 through ANLYT-04, ANLYT-08, ANLYT-09, ANLYT-10, ANLYT-11)
- **D-22:** PostHog Cloud (posthog.com), US region — not self-hosted; configured via `NEXT_PUBLIC_POSTHOG_KEY` and `NEXT_PUBLIC_POSTHOG_HOST` env vars. Apply for $50k startup credits after setup
- **D-23:** PostHog provider wraps the entire app layout — do not initialize per-page
- **D-24:** Privacy-safe: no PII in event properties; identify users by user_id not email, property_id not address, never log raw addresses
- **D-25:** Server-side events for all data pull actions (prevents ad blocker suppression), client-side for all user interactions
- **D-26:** PostHog person properties updated server-side on plan changes
- **D-27:** Feature flags infrastructure configured for A/B testing paywall placement and upgrade prompt copy — actual experiments come in later phases
- **D-28:** Key funnels configured: signup → first analysis → upgrade; address entered → data pulled → analysis completed; upgrade clicked → subscription started; shared link viewed → recipient signup; free user → paywall hit → upgrade

### PostHog Event Scoping (CRITICAL)
- **D-29:** Phase 2A instruments ONLY these events: `signed_up` (method), `signed_in` (method), `signed_out`, `subscription_started` (plan, price), `subscription_cancelled`, `upgrade_clicked` (source)
- **D-30:** Do NOT pre-instrument events for features that don't exist yet — calculator events (`analysis_started`, `calculator_input_changed`, `deal_score_computed` etc.) wire up in Phase 2B; portfolio events (`list_created`, `tag_applied` etc.) wire up in Phase 2C; DADU events in Phase 4
- **D-31:** Event taxonomy follows ANLYT-01 through ANLYT-11 in REQUIREMENTS.md — that is the source of truth for event names and properties

### Session Recording (SESS-01 through SESS-07)
- **D-32:** All sessions recorded for first 90 days of beta — no exceptions
- **D-33:** After 90 days: all free tier sessions + first 5 sessions of every new paid user
- **D-34:** Never record payment screens (Stripe Checkout is external — automatic)
- **D-35:** Flag sessions with rage clicks for priority UX review
- **D-36:** Flag sessions where user hit paywall but did not upgrade
- **D-37:** Heatmaps configured on: Property Intelligence page, Portfolio page, pricing/upgrade modal

### Cohort Analysis (COHRT-01 through COHRT-05)
- **D-38:** Cohorts configured from day one in PostHog: week 1 retention, month 1 retention, feature adoption (DADU week 1 vs week 4), acquisition source, market (King County vs others), deal score (avg above 66 vs below 40)

### DataEnrichmentService (DATA-01 through DATA-03, DATA-05 through DATA-10)
- **D-39:** Implement as `DataEnrichmentService` with `stage1Enrich(address)` and `stage2Enrich(propertyId, features[])` as distinct methods — free/paid boundary explicit in codebase
- **D-40:** Interface contract is PERMANENT — the interface is what Phase 5 real APIs build against. Only the implementation swaps out
- **D-41:** Stub implementations return varied realistic King County WA mock data based on address input — not just types/interfaces. Include realistic field values: lot size, zoning code, beds/baths, sqft, year built, owner name, last sale date/price, tax assessed value, parcel boundaries
- **D-42:** Include basic address normalization in the stub
- **D-43:** Include error handling patterns in the stub (not just happy path) so Phase 5 inherits the right error patterns
- **D-44:** Cache TTL definitions per field type: static (180 days), semi-static (30 days), dynamic (24–48 hours), skip trace (never cache)
- **D-45:** Track `cache_source` per field: county_api | gis_api | openstreetmap | rentcast | attom | internal
- **D-46:** County data quality tiers defined: King County WA (Excellent), Multnomah County OR (Good), Pierce County WA (Moderate), Snohomish County WA (Moderate)
- **D-47:** Graceful degradation: show available data clearly, flag missing fields explicitly rather than failing silently
- **D-48:** Track cache hit rate as a key infrastructure metric

### Claude's Discretion
- DataEnrichmentService internal architecture (class vs module, dependency injection pattern)
- PostHog SDK version and initialization pattern (as long as it wraps the app layout)
- Schema migration strategy for expanding usage_log table
- File organization for new services within `lib/services/`
- Background job framework choice for weekly expired-override cleanup (Inngest vs Trigger.dev vs cron)

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
- `lib/services/gating.ts` — Current binary free/pro gating; evolve to hybrid 3-tier GatingService
- `lib/services/usage.ts` — Current basic usage logging; expand to full METER-01 spec with per-action-type limits
- `lib/schema/usage-log.ts` — Current minimal schema; expand with new columns
- `lib/schema/auth.ts` — Better Auth schema (user, session, subscription tables)

### Framework Docs (MANDATORY per AGENTS.md)
- `node_modules/next/dist/docs/` — Read before writing any Next.js code; Next.js 16 has breaking changes

</canonical_refs>

<code_context>
## Existing Code Insights

### Reusable Assets
- `lib/services/gating.ts` — `authenticateAndCheckTier()` and `requirePro()` already handle auth + subscription check; evolve into hybrid GatingService with override table
- `lib/services/usage.ts` — `logUsage()`, `updateUsageStatus()`, `getUserUsage()` already work with Drizzle + Neon; expand schema and types
- `lib/schema/usage-log.ts` — Drizzle schema for usage_log table; add columns for cost_estimate_cents, api_provider, metadata, plan_at_time_of_action
- `lib/db.ts` — Neon + Drizzle connection already configured
- `lib/auth.ts` — Better Auth with Stripe plugin already configured
- `components/ui/` — 20+ shadcn components available (card, badge, alert, dialog, button, form-field, etc.)
- `app/account/` — Account settings page exists; usage tracker surfaces here

### Established Patterns
- **Drizzle ORM** with `pgTable` definitions in `lib/schema/`
- **Service layer** in `lib/services/` — business logic separated from route handlers
- **Route handlers** in `app/api/v1/` — billing, usage, webhooks already exist
- **Server-enforced gating** via `requirePro()` called in Route Handlers
- **Tailwind CSS v4** via PostCSS with `@theme inline` tokens in globals.css

### Integration Points
- `app/layout.tsx` — Where PostHog provider wraps the app (alongside existing ThemeProvider)
- `app/api/v1/` — Where new metering and data enrichment API routes will live
- `lib/services/` — Where DataEnrichmentService and expanded GatingService/metering services go
- `lib/schema/` — Where new Drizzle schemas for gating overrides, enrichment cache, and expanded usage_log go
- `app/account/settings/` — Where usage tracker and 80% warning banners surface

</code_context>

<specifics>
## Specific Ideas

- GatingService response object must include `overageAvailable: boolean` field from day one — always false in MVP but prevents refactoring when overage billing ships
- Feature names as TypeScript enum is the single source of truth — database overrides validated against it on insert, startup check logs unrecognized feature names
- DataEnrichmentService stubs should return varied data based on address input (not identical mock data for every address) to enable realistic testing in 2B
- PostHog startup credits: apply for $50k program after initial setup
- Usage tracker in Account Settings shows all metered action types with independent counters, limits, and reset dates

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope.

</deferred>

---

*Phase: 02A-infrastructure-services*
*Context gathered: 2026-03-27*
