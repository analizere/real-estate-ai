# Phase 2A: Infrastructure Services - Research

**Researched:** 2026-03-27
**Domain:** Feature gating, usage metering, PostHog analytics, DataEnrichmentService architecture
**Confidence:** HIGH

---

<user_constraints>
## User Constraints (from CONTEXT.md)

### Locked Decisions

#### Gating Service (TIER-01 through TIER-07)
- **D-01:** Hybrid GatingService — TypeScript config as base tier assignments, database override table for per-user/per-feature overrides
- **D-02:** Precedence rule: user-level override beats global override beats config file — document this in code comments
- **D-03:** Feature names stored as strings validated against a TypeScript enum that is the single source of truth — validate on insert, add startup check that logs any database overrides with unrecognized feature names
- **D-04:** Override table schema: id (uuid pk), scope (enum: user/global/cohort), user_id (uuid nullable, fk → users.id), cohort_id (uuid nullable), feature (varchar, not null, validated against TS enum), tier_override (integer 1/2/3, not null), is_active (boolean, default true), expires_at (timestamp nullable), granted_by (uuid not null), reason (varchar not null), metadata (jsonb nullable), created_at/updated_at (timestamps)
- **D-05:** Indexes: (user_id, feature, is_active), (scope, feature, is_active), (expires_at)
- **D-06:** Cache gating results per user session with 5-minute TTL, invalidate on override change
- **D-07:** Weekly background job soft-deletes expired overrides by setting is_active: false — never hard delete
- **D-08:** GatingService response: `{ allowed: boolean, reason: 'LIMIT_REACHED' | 'TIER_REQUIRED' | 'OVERRIDE' | null, action: string, overageAvailable: boolean }` — overageAvailable always false in MVP
- **D-09:** Three tiers: Tier 1 (always free), Tier 2 (preview free — show clearly, gate the action), Tier 3 (Pro only)
- **D-10:** Tier 2 pattern: never blur/hide/obscure data; gate the action not the visibility
- **D-11:** Evolve existing `lib/services/gating.ts` — do not create a parallel system

#### Usage Metering (METER-01, METER-02, METER-04, METER-05, METER-08, METER-09, METER-10)
- **D-12:** Log BEFORE execution: user_id, timestamp, action_type, cost_estimate_cents, api_provider, property_id (nullable), metadata JSON, plan_at_time_of_action
- **D-13:** Expand existing `lib/schema/usage-log.ts` and `lib/services/usage.ts` — add missing columns
- **D-14:** Action-level limits — each action type has completely independent limit tracking
- **D-15:** Hard stop at 100% per action type with structured GatingService response
- **D-16:** Beta strategy: set all limits to "unlimited", log everything, enforce nothing
- **D-17:** Unlimited check still runs, it just never blocks

#### Metering UX
- **D-18:** 80% warning surfaces both inline on relevant feature AND in Account Settings
- **D-19:** 100% block is contextual — appears only on the specific action that's exhausted
- **D-20:** Usage tracker in Account Settings: all metered actions with current usage, limit, "resets in X days"
- **D-21:** Contextual inline indicators — address search bar shows lookup count, skip trace shows its own counter

#### PostHog Analytics
- **D-22:** PostHog Cloud (posthog.com), US region — env vars NEXT_PUBLIC_POSTHOG_KEY and NEXT_PUBLIC_POSTHOG_HOST
- **D-23:** PostHog provider wraps the entire app layout — not per-page
- **D-24:** No PII in event properties; user_id not email, property_id not address
- **D-25:** Server-side events for data pull actions, client-side for user interactions
- **D-26:** PostHog person properties updated server-side on plan changes
- **D-27:** Feature flags infrastructure configured for future A/B testing
- **D-28:** Key funnels configured: signup → first analysis → upgrade; address → data pull → analysis; upgrade clicked → subscription; shared link → signup; free user → paywall → upgrade

#### PostHog Event Scoping (CRITICAL)
- **D-29:** Phase 2A instruments ONLY: `signed_up` (method), `signed_in` (method), `signed_out`, `subscription_started` (plan, price), `subscription_cancelled`, `upgrade_clicked` (source)
- **D-30:** Do NOT pre-instrument events for features that don't exist yet
- **D-31:** Event taxonomy follows ANLYT-01 through ANLYT-11 in REQUIREMENTS.md

#### Session Recording (SESS-01 through SESS-07)
- **D-32:** All sessions recorded for first 90 days of beta
- **D-33:** After 90 days: all free tier + first 5 sessions of every new paid user
- **D-34:** Never record payment screens
- **D-35:** Flag sessions with rage clicks for priority UX review
- **D-36:** Flag sessions where user hit paywall but did not upgrade
- **D-37:** Heatmaps on: Property Intelligence page, Portfolio page, pricing/upgrade modal

#### Cohort Analysis (COHRT-01 through COHRT-05)
- **D-38:** Cohorts in PostHog from day one: week 1 retention, month 1 retention, feature adoption (DADU week 1 vs week 4), acquisition source, market (King County vs others), deal score (avg above 66 vs below 40)

#### DataEnrichmentService (DATA-01 through DATA-03, DATA-05 through DATA-10)
- **D-39:** `stage1Enrich(address)` and `stage2Enrich(propertyId, features[])` as distinct methods
- **D-40:** Interface contract is PERMANENT — Phase 5 real APIs build against this interface
- **D-41:** Stub implementations return varied realistic King County WA mock data based on address input
- **D-42:** Include basic address normalization in the stub
- **D-43:** Include error handling patterns in the stub (not just happy path)
- **D-44:** Cache TTL definitions: static (180 days), semi-static (30 days), dynamic (24-48 hours), skip trace (never)
- **D-45:** Track `cache_source`: county_api | gis_api | openstreetmap | rentcast | attom | internal
- **D-46:** County quality tiers: King County WA (Excellent), Multnomah County OR (Good), Pierce County WA (Moderate), Snohomish County WA (Moderate)
- **D-47:** Graceful degradation: flag missing fields explicitly, never fail silently
- **D-48:** Track cache hit rate as a key infrastructure metric

### Claude's Discretion
- DataEnrichmentService internal architecture (class vs module, dependency injection pattern)
- PostHog SDK version and initialization pattern (as long as it wraps the app layout)
- Schema migration strategy for expanding usage_log table
- File organization for new services within `lib/services/`
- Background job framework choice for weekly expired-override cleanup (Inngest vs Trigger.dev vs cron)

### Deferred Ideas (OUT OF SCOPE)
None — discussion stayed within phase scope.
</user_constraints>

---

<phase_requirements>
## Phase Requirements

| ID | Description | Research Support |
|----|-------------|------------------|
| TIER-01 | Property data organized into 3 access tiers controlled by central gating service | D-01, D-09, GatingService architecture section |
| TIER-02 | Tier 1 (always free): basic attributes, parcel display, manual calculator, Deal Score from manual | D-09, feature config enum design |
| TIER-03 | Tier 2 (preview free): rent estimate as clear number, DADU badge, Deal Score from auto data | D-09, D-10 |
| TIER-04 | Tier 2 UI pattern: show clearly, gate the action not visibility | D-10, component gate wrapper pattern |
| TIER-05 | Tier 3 (Pro $99/mo): full features, full enrichment, exports, saves | D-09, GatingService check |
| TIER-06 | Central gating service: single config, all components call this service | D-01, D-11, hybrid architecture |
| TIER-07 | Tier assignments rapidly iterable without engineering effort | D-01 config-driven design, enum + DB override |
| METER-01 | Every cost-bearing action logged BEFORE execution with full field set | D-12, schema expansion, logBeforeExecute pattern |
| METER-02 | Data pull actions metered: stage1, stage2, rent estimate, DADU, comps | D-14, action_type enum |
| METER-04 | Skip trace actions metered | D-12, D-14 |
| METER-05 | Report actions metered | D-12, D-14 |
| METER-08 | Soft limits: 80% warning, 100% block, configurable, unlimited option | D-15, D-16, D-17 |
| METER-09 | Current soft limits per tier (preliminary values) | D-16 beta strategy, limit config in gating service config |
| METER-10 | Beta strategy: unlimited for all, log everything, enforce nothing for 90 days | D-16 |
| ANLYT-01 | PostHog JS SDK in Next.js App Router, provider wraps layout | D-22, D-23, PostHog setup patterns |
| ANLYT-02 | Session recording: 90-day all-sessions beta, then selective | D-32, D-33, session recording config |
| ANLYT-03 | Privacy-safe: no PII, user_id not email | D-24 |
| ANLYT-04 | User lifecycle events tracked | D-29, event scoping |
| ANLYT-08 | Key funnels configured in PostHog | D-28 |
| ANLYT-09 | Additional operational events (address outside coverage, data inaccuracy) | D-30 — these are Phase 2B+ scope |
| ANLYT-10 | Data pull events fire server-side (posthog-node) | D-25, posthog-node singleton pattern |
| ANLYT-11 | Person properties updated server-side; feature flags infrastructure | D-26, D-27 |
| SESS-01 | Record all sessions for 90-day beta | D-32, PostHog session recording config |
| SESS-02 | After 90 days: free tier + first 5 sessions of new paid users | D-33 |
| SESS-03 | Never record payment screens | D-34 |
| SESS-04 | Flag rage click sessions | D-35, PostHog rage click detection |
| SESS-05 | Flag paywall-hit-without-upgrade sessions | D-36 |
| SESS-06 | Heatmaps on Property Intelligence, Portfolio, pricing modal | D-37 |
| SESS-07 | Founder reviews 10 sessions/week | Human activity, not a code task |
| COHRT-01 | Week 1 and month 1 retention cohorts | D-38, PostHog dynamic cohort config |
| COHRT-02 | Feature adoption cohorts (DADU week 1 vs week 4) | D-38 |
| COHRT-03 | Acquisition source cohorts | D-38 |
| COHRT-04 | Market cohorts (King County vs others) | D-38 |
| COHRT-05 | Deal score cohorts (avg >66 vs <40) | D-38 |
| DATA-01 | Two-stage enrichment architecture with distinct service methods | D-39 |
| DATA-02 | Stage 1 free data pull definition | D-39, D-41 stub design |
| DATA-03 | Stage 1 cached in ReVested DB on first lookup | D-44, D-48 cache hit rate tracking |
| DATA-05 | Cache TTLs per field type | D-44 |
| DATA-06 | Track cache_source per field | D-45 |
| DATA-07 | County data quality tiers | D-46 |
| DATA-08 | DataEnrichmentService with stage1Enrich/stage2Enrich | D-39, D-40 |
| DATA-09 | Graceful degradation | D-43, D-47 |
| DATA-10 | Track cache hit rate | D-48 |
</phase_requirements>

---

## Summary

Phase 2A builds four interconnected infrastructure services that all subsequent feature phases depend on. None involve user-visible features — this phase is about wiring the platform's nervous system so that every feature built in 2B and 2C ships already gated, metered, and instrumented.

The existing codebase (Phase 1) already has a binary `requirePro()` gating function, a minimal usage log schema, and a Neon + Drizzle database connection. Phase 2A evolves all three rather than replacing them. The gating service grows from binary free/pro to a hybrid three-tier system with database overrides. The usage schema grows from 5 columns to ~12. The database gains a new `feature_overrides` table.

PostHog is not yet installed. Both `posthog-js` (1.364.1) and `posthog-node` (5.28.8) need to be added as dependencies. The App Router integration pattern is well-established: a client-side `PHProvider` component wraps the layout, a server-side singleton client handles route handler events, and a `PostHogPageView` component (wrapped in Suspense due to `useSearchParams`) fires page view events. Session recording is configured at init time and can be controlled per-session via `disable_session_recording` and `posthog.startSessionRecording()`. Cohorts and funnels are configured manually in the PostHog UI — they are not code artifacts.

The DataEnrichmentService is a stub in this phase. Its purpose is to define the permanent interface contract that Phase 5's real API adapters will implement. The stub must return varied realistic King County WA data based on address input and must include error handling paths, not just the happy path.

**Primary recommendation:** Evolve, do not replace. Every new construct in Phase 2A extends existing code patterns (Drizzle schema files, `lib/services/` modules, `app/api/v1/` route handlers). No new architectural patterns are introduced — only the scope and richness of existing patterns expands.

---

## Project Constraints (from CLAUDE.md)

| Directive | Impact on Phase 2A |
|-----------|-------------------|
| Business logic in hooks/services/API never UI | GatingService, MeteringService, DataEnrichmentService all live in `lib/services/`; no plan checks in components |
| All UI from `/components/ui/` | Usage tracker UI (Account Settings) uses existing shadcn components only |
| React Query for all client-side fetching | Usage dashboard in Account Settings uses React Query, not raw fetch |
| API-first: all functionality exposed via `/api/v1/` | Gating checks, metering queries, enrichment — all via route handlers |
| PostHog wraps entire app layout (not per-page) | Single `PHProvider` in `app/layout.tsx` |
| No PII in PostHog events | user_id (not email), property_id (not address) |
| Server-side events for data pull actions | posthog-node in route handlers for stage1/stage2 events |
| Soft deletes everywhere | feature_overrides table uses `is_active: false` not DELETE |
| Background jobs for async work | Weekly expired-override cleanup via Inngest or Trigger.dev |
| Optimistic UI for mutations | Usage counter UI updates optimistically |

---

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| posthog-js | 1.364.1 | Client-side event capture, session recording, feature flags | Official PostHog browser SDK; required for `PostHogProvider` and `usePostHog()` hook |
| posthog-node | 5.28.8 | Server-side event capture from route handlers | Required for server-side events; prevents ad blocker suppression per D-25 |
| drizzle-orm | 0.45.1 (project) | Database schema, migrations, queries | Already in project; all schema work uses existing Drizzle patterns |
| drizzle-kit | 0.31.10 (project) | Migration generation | Already in project; `npm run db:generate && npm run db:migrate` |
| @tanstack/react-query | 5.95.2 | Client-side data fetching for usage dashboard | CLAUDE.md mandates React Query for all client-side fetching |
| inngest | 4.1.0 | Background job for weekly expired-override cleanup | Project already references Inngest/Trigger.dev for background jobs |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| zod | 4.3.6 (project) | Runtime validation for GatingService feature names | Validate feature names against enum on override insert |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| posthog-js + posthog-node | @posthog/next | @posthog/next is newer but less battle-tested; official PostHog docs still recommend the two-package approach for App Router; stick with explicit separation per D-25 |
| Inngest | Trigger.dev | Both are valid per CLAUDE.md; Inngest has better Next.js Vercel integration and is more widely documented; use Inngest |
| Drizzle generate+migrate | Drizzle push | `push` bypasses migration files; this project uses `db:generate`/`db:migrate` (confirmed in package.json scripts) — never use push on production data |

**Installation:**
```bash
npm install posthog-js posthog-node @tanstack/react-query inngest
```

**Version verification (confirmed 2026-03-27):**
- posthog-js: 1.364.1
- posthog-node: 5.28.8
- @tanstack/react-query: 5.95.2
- inngest: 4.1.0

---

## Architecture Patterns

### Recommended Project Structure

```
lib/
├── services/
│   ├── gating.ts          # EVOLVE: hybrid 3-tier + override lookup
│   ├── usage.ts           # EVOLVE: full METER-01 logging + limit checks
│   ├── enrichment.ts      # NEW: DataEnrichmentService (stage1/stage2)
│   └── posthog-server.ts  # NEW: posthog-node singleton for server-side events
├── schema/
│   ├── auth.ts            # UNCHANGED
│   ├── usage-log.ts       # EVOLVE: add cost_estimate_cents, api_provider, metadata, plan_at_time_of_action
│   ├── feature-overrides.ts  # NEW: gating override table
│   └── index.ts           # EVOLVE: export new schemas
├── config/
│   └── feature-tiers.ts   # NEW: TypeScript config — feature enum + base tier assignments + limits
app/
├── layout.tsx             # EVOLVE: add PHProvider + PostHogPageView
├── providers.tsx          # NEW: client-side PHProvider ('use client')
├── posthog-pageview.tsx   # NEW: page view tracker (Suspense wrapper required)
├── api/v1/
│   ├── usage/route.ts     # EVOLVE: expose per-action-type usage summary
│   └── enrichment/
│       └── stage1/route.ts  # NEW: stage1Enrich endpoint
components/ui/
└── usage-meter.tsx        # NEW (if not exists): inline usage counter component
tests/unit/
├── gating.test.ts         # NEW: TIER-01 through TIER-07 tests
├── metering.test.ts       # NEW: METER-01, METER-08 tests
└── enrichment.test.ts     # NEW: DATA-01, DATA-08, DATA-09 tests
```

### Pattern 1: Hybrid GatingService

**What:** A service that checks feature access by combining a TypeScript config (base tier assignments) with database override rows. Precedence: user-level override > global override > config file.

**When to use:** Every API route that gates a feature, every server component checking tier access.

**Design:**

```typescript
// lib/config/feature-tiers.ts
// Source: D-01 through D-11 (CONTEXT.md)

export enum Feature {
  STAGE1_LOOKUP = 'stage1_lookup',
  STAGE2_LOOKUP = 'stage2_lookup',
  RENT_ESTIMATE = 'rent_estimate',
  DADU_FEASIBILITY = 'dadu_feasibility',
  SAVE_ANALYSIS = 'save_analysis',
  EXPORT_PDF = 'export_pdf',
  SHARE_LINK = 'share_link',
  SKIP_TRACE = 'skip_trace',
  UNLIMITED_SAVES = 'unlimited_saves',
  SENSITIVITY_ANALYSIS = 'sensitivity_analysis',
}

// Base tier assignments — Tier 1=always free, Tier 2=preview free, Tier 3=Pro only
export const FEATURE_TIER_CONFIG: Record<Feature, 1 | 2 | 3> = {
  [Feature.STAGE1_LOOKUP]: 1,
  [Feature.STAGE2_LOOKUP]: 3,
  [Feature.RENT_ESTIMATE]: 2,
  [Feature.DADU_FEASIBILITY]: 2,
  [Feature.SAVE_ANALYSIS]: 3,
  [Feature.EXPORT_PDF]: 3,
  [Feature.SHARE_LINK]: 3,
  [Feature.SKIP_TRACE]: 3,
  [Feature.UNLIMITED_SAVES]: 3,
  [Feature.SENSITIVITY_ANALYSIS]: 3,
};

// Per-tier action limits (beta: all unlimited)
export const TIER_LIMITS: Record<string, Record<Feature, number | 'unlimited'>> = {
  free: {
    [Feature.STAGE1_LOOKUP]: 'unlimited', // beta override; set to 0 post-beta
    [Feature.STAGE2_LOOKUP]: 0,
    // ... etc
  },
  pro: {
    [Feature.STAGE1_LOOKUP]: 'unlimited',
    [Feature.STAGE2_LOOKUP]: 50,
    [Feature.SKIP_TRACE]: 10,
    // ...
  },
};
```

```typescript
// lib/services/gating.ts (evolved)
// Source: D-01 through D-11 (CONTEXT.md)

export type GatingResponse = {
  allowed: boolean;
  reason: 'LIMIT_REACHED' | 'TIER_REQUIRED' | 'OVERRIDE' | null;
  action: string;
  overageAvailable: boolean; // always false in MVP — required field for future billing
};

export async function checkFeatureAccess(
  userId: string,
  feature: Feature,
  userTier: 'free' | 'pro'
): Promise<GatingResponse>
// Precedence: user-level override > global override > config file
// Cache result per (userId, feature) with 5-minute TTL
```

### Pattern 2: Pre-execution Metering

**What:** Every metered action logs to `usage_log` BEFORE the action executes, not after. Returns the log ID so the row can be updated to 'success'/'failed' after execution.

**When to use:** Every API route that calls an external API (Stage 1 county data, Stage 2 rent estimate, skip trace).

```typescript
// lib/services/usage.ts (evolved)
// Source: D-12 through D-17 (CONTEXT.md)

export async function logAndCheckUsage(params: {
  userId: string;
  actionType: ActionType; // expanded enum
  costEstimateCents: number;
  apiProvider: string;
  propertyId?: string;
  metadata?: Record<string, unknown>;
  planAtTimeOfAction: 'free' | 'pro';
}): Promise<{ logId: string; allowed: boolean; gatingResponse: GatingResponse }>
// Checks limit FIRST, logs if allowed, returns result
// Beta mode: limit check passes for all users (METER-10)
```

### Pattern 3: PostHog Provider (App Router)

**What:** A `'use client'` component that initializes posthog-js and wraps children with `PostHogProvider`. Inserted into `app/layout.tsx` alongside the existing `ThemeProvider`.

**Critical detail for Next.js 16:** `PostHogPageView` uses `useSearchParams()` which requires a Suspense boundary. The project already fixed this in Phase 1 (commit `39f403d`). The same Suspense-wrap pattern applies here.

```typescript
// app/providers.tsx
// Source: Verified pattern (posthog.com/docs/libraries/next-js, Vercel KB)
'use client'
import posthog from 'posthog-js'
import { PostHogProvider } from 'posthog-js/react'
import { useEffect } from 'react'

export function PHProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      capture_pageview: false, // manual pageview via PostHogPageView
      disable_session_recording: false, // enabled for beta (D-32)
    })
  }, [])
  return <PostHogProvider client={posthog}>{children}</PostHogProvider>
}
```

```typescript
// app/posthog-pageview.tsx
// Source: Verified pattern (reetesh.in/blog/posthog-integration-in-next.js-app-router)
'use client'
import { usePathname, useSearchParams } from 'next/navigation'
import { useEffect } from 'react'
import { usePostHog } from 'posthog-js/react'
import { Suspense } from 'react'

function PageViewInner() {
  const pathname = usePathname()
  const searchParams = useSearchParams() // requires Suspense
  const posthog = usePostHog()
  useEffect(() => {
    if (pathname && posthog) {
      posthog.capture('$pageview', {
        $current_url: window.origin + pathname + (searchParams.toString() ? `?${searchParams}` : '')
      })
    }
  }, [pathname, searchParams, posthog])
  return null
}

export function PostHogPageView() {
  return <Suspense><PageViewInner /></Suspense>
}
```

### Pattern 4: Server-Side PostHog (posthog-node Singleton)

**What:** A singleton client used in API route handlers for server-side event capture. Uses `flushAt: 1` and `flushInterval: 0` because Next.js serverless functions are short-lived.

**When to use:** Stage 1 data pull started/completed events, Stage 2 data pull events, subscription change events — any event from a route handler.

```typescript
// lib/services/posthog-server.ts
// Source: posthog-node docs, Vercel KB guide (verified MEDIUM confidence)
import { PostHog } from 'posthog-node'

let posthogClient: PostHog | null = null

export function getPostHogServerClient(): PostHog {
  if (!posthogClient) {
    posthogClient = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
      host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
      flushAt: 1,        // flush immediately in serverless
      flushInterval: 0,  // no batching delay
    })
  }
  return posthogClient
}

// Usage in route handlers — always await shutdown after capture
export async function captureServerEvent(params: {
  distinctId: string
  event: string
  properties?: Record<string, unknown>
}) {
  const client = getPostHogServerClient()
  client.capture(params)
  await client.shutdown() // force immediate flush
}
```

**Known issue (MEDIUM confidence):** In high-throughput serverless environments, if a second capture fires before the first flush completes, the second event may be queued until the next shutdown call. For Phase 2A's low volume, this is acceptable. For high-frequency data pull events in Phase 5, use `captureImmediate` if available in posthog-node 5.x.

### Pattern 5: DataEnrichmentService Stub

**What:** A service with the permanent interface contract for Stage 1 and Stage 2 data. Stubs return realistic varied King County WA data derived from address input. Error paths are modeled explicitly.

```typescript
// lib/services/enrichment.ts
// Source: D-39 through D-48 (CONTEXT.md)

export type CacheSource = 'county_api' | 'gis_api' | 'openstreetmap' | 'rentcast' | 'attom' | 'internal'
export type CacheTTL = 180 | 30 | 2 | 0 // days; 0 = never cache

export type EnrichedField<T> = {
  value: T | null
  cache_source: CacheSource
  last_fetched_at: Date
  cache_ttl_days: CacheTTL
  stale_at: Date | null
  missing_reason?: 'NOT_IN_COUNTY' | 'API_ERROR' | 'PARSE_ERROR' | 'NOT_APPLICABLE'
}

export type Stage1EnrichmentResult = {
  success: boolean
  property_id: string
  address_normalized: string
  // static fields (180-day TTL)
  lot_size_sqft: EnrichedField<number>
  zoning_code: EnrichedField<string>
  beds: EnrichedField<number>
  baths: EnrichedField<number>
  sqft: EnrichedField<number>
  year_built: EnrichedField<number>
  owner_name: EnrichedField<string>
  parcel_number: EnrichedField<string>
  // semi-static fields (30-day TTL)
  last_sale_date: EnrichedField<Date>
  last_sale_price: EnrichedField<number>
  tax_assessed_value: EnrichedField<number>
  // GIS fields (180-day TTL)
  parcel_boundaries: EnrichedField<GeoJSON>
  frontage_street_ft: EnrichedField<number>
  frontage_alley_ft: EnrichedField<number>
  building_footprint_sqft: EnrichedField<number>
  // GIS extension fields (required by CLAUDE.md GIS architecture)
  planned_expansion_zone: EnrichedField<string | null>
  projected_timeline: EnrichedField<string | null>
  funding_status: EnrichedField<string | null>
  source_document: EnrichedField<string | null>
  confidence_level: EnrichedField<number | null>
  // enrichment metadata
  cache_hit: boolean
  county_quality_tier: 'excellent' | 'good' | 'moderate'
  error?: EnrichmentError
}

export type EnrichmentError = {
  code: 'ADDRESS_NOT_FOUND' | 'COUNTY_NOT_SUPPORTED' | 'API_TIMEOUT' | 'PARSE_ERROR' | 'PARTIAL'
  message: string
  partial_data: boolean // true = return what we have, flag what's missing
}

// Stage 2 result includes rent estimates, comps, DADU rules
export type Stage2Feature = 'rent_estimate' | 'comparable_sales' | 'dadu_rules' | 'skip_trace'

export class DataEnrichmentService {
  async stage1Enrich(address: string): Promise<Stage1EnrichmentResult>
  async stage2Enrich(propertyId: string, features: Stage2Feature[]): Promise<Stage2EnrichmentResult>
}
```

**Stub variation strategy:** Hash the normalized address to deterministically vary which King County property profile the stub returns (not just one static mock). Include at least 5 distinct property profiles in the stub data set.

### Anti-Patterns to Avoid

- **Plan check scatter:** Never write `if (user.plan === 'free')` in a UI component — always call GatingService.
- **Post-execution logging:** Never log usage after the action executes — log BEFORE (D-12). The point is to catch execution even if it crashes.
- **Blurring Tier 2 data:** Never CSS-blur or hide Tier 2 preview data. Gate the button/action, not the data display (D-10).
- **Missing Suspense on useSearchParams:** `PostHogPageView` must be wrapped in Suspense. This project already hit this in Phase 1 (commits `39f403d`, `e4f1883`).
- **posthog-node without shutdown:** In route handlers, always call `await client.shutdown()` after capture to force immediate flush in serverless environment.
- **drizzle-kit push on production:** Always use `db:generate` + `db:migrate`, never `push`, on real databases.

---

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Client-side analytics provider | Custom analytics context | posthog-js + `PostHogProvider` | PostHog handles session recording, feature flags, autocapture, and replay — reimplementing any of this is months of work |
| Session recording | Custom interaction recorder | PostHog session replay | Rage click detection, heatmap correlation, privacy masking all built-in |
| Server-side event batching | Custom event queue | posthog-node with flushAt/flushInterval | Batching, retry, and flush logic already solved |
| Feature flag evaluation | Custom flag store | PostHog feature flags | Rollout percentages, targeting rules, experiment stats are non-trivial |
| Background job scheduling | setInterval in route handler | Inngest | Route handlers die; background jobs need durable execution |
| Cache invalidation logic | Custom staleness tracking | Drizzle schema with `stale_at` + `has_stale_fields` | Hand-rolling cache invalidation is where bugs compound silently |

**Key insight:** PostHog's value is not just event capture — it's the analysis layer (funnels, cohorts, heatmaps, recordings) that would take months to build. The integration cost (2-3 tasks) unlocks weeks of product insight from day one.

---

## Common Pitfalls

### Pitfall 1: useSearchParams Without Suspense Boundary
**What goes wrong:** Build fails or hydration errors in production when `useSearchParams()` is called in a component that isn't wrapped in `<Suspense>`.
**Why it happens:** Next.js 16 App Router requires Suspense for components that opt into dynamic rendering via `useSearchParams`. This project already hit this twice (commits `39f403d`, `e4f1883`).
**How to avoid:** Always wrap any component using `useSearchParams` in `<Suspense fallback={null}>`. The `PostHogPageView` component requires this.
**Warning signs:** Build log contains "useSearchParams() should be wrapped in a suspense boundary".

### Pitfall 2: posthog-node Events Silently Dropped in Serverless
**What goes wrong:** Server-side events never appear in PostHog because the function terminates before the batch flushes.
**Why it happens:** posthog-node batches events by default (flushAt: 20, flushInterval: 10000ms). Serverless functions die before the batch threshold is reached.
**How to avoid:** Initialize with `flushAt: 1, flushInterval: 0`, and always call `await client.shutdown()` after each capture in route handlers.
**Warning signs:** Client-side events appear in PostHog but server-side events are missing.

### Pitfall 3: drizzle-kit push Overwrites Production Data
**What goes wrong:** Running `drizzle-kit push` instead of `generate` + `migrate` can drop columns or tables with existing data.
**Why it happens:** `push` is designed for rapid prototyping, not production migrations. It may destructively alter tables to match the schema.
**How to avoid:** Always use `npm run db:generate` to generate migration SQL, review the file, then `npm run db:migrate`.
**Warning signs:** Drizzle asks "Are you sure?" with a list of destructive operations.

### Pitfall 4: Scattered Plan Checks Bypassing GatingService
**What goes wrong:** Individual components check `user.plan === 'pro'` directly, making tier changes require touching dozens of files.
**Why it happens:** It feels easier to write inline checks than to call the gating service.
**How to avoid:** GatingService is the ONLY place that evaluates tier access. Enforce via code review. No `isPro`, `isFree`, or plan string comparisons anywhere outside `lib/services/gating.ts`.
**Warning signs:** Grep for `plan === ` or `isPro` in component files.

### Pitfall 5: Logging Usage After Execution (Not Before)
**What goes wrong:** If the API call throws or the process crashes, the usage event is never logged. This breaks cost tracking and limit enforcement.
**Why it happens:** It feels natural to log success/failure after the fact.
**How to avoid:** `logAndCheckUsage()` must be called FIRST, before any external API call. The returned `logId` is then used to update status to 'success' or 'failed'.
**Warning signs:** Any `try { externalCall(); logUsage() }` ordering is wrong.

### Pitfall 6: Cohorts and Funnels Require Manual PostHog UI Configuration
**What goes wrong:** The plan includes tasks like "configure cohorts programmatically" that can't be done via code.
**Why it happens:** Developers assume cohort configuration is in code.
**How to avoid:** PostHog cohorts and funnels are configured in the PostHog web UI — they are NOT code artifacts. The plan should include tasks for human PostHog UI configuration, not automated setup. Dynamic cohorts rely on events flowing in (which is code), but the cohort definitions themselves are UI work.
**Warning signs:** Any task describing "deploy cohort configuration" or "code the funnel."

### Pitfall 7: jsonb Column with Default Value Bug in drizzle-kit
**What goes wrong:** `drizzle-kit generate` may fail or produce incorrect SQL for jsonb columns with default values.
**Why it happens:** Known bug in some drizzle-kit versions (tracked in drizzle-team/drizzle-orm#4529).
**How to avoid:** For the `metadata` jsonb column on `feature_overrides`, define as nullable without a default (`jsonb('metadata')`). Use `.$type<Record<string, unknown>>()` for type inference.
**Warning signs:** `drizzle-kit generate` produces invalid SQL for jsonb columns.

---

## Code Examples

Verified patterns from official sources and project conventions:

### Expanded usage_log Schema
```typescript
// lib/schema/usage-log.ts (evolved)
// Source: D-12 through D-13 (CONTEXT.md), existing project pattern
import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const usageLog = pgTable("usage_log", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: text("user_id").notNull().references(() => user.id, { onDelete: "cascade" }),
  actionType: text("action_type").notNull(),   // replaces lookupType
  costEstimateCents: integer("cost_estimate_cents").notNull().default(0),
  apiProvider: text("api_provider").notNull().default("internal"),
  propertyId: uuid("property_id"),             // nullable
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  planAtTimeOfAction: text("plan_at_time_of_action").notNull().default("free"),
  status: text("status").notNull().default("pending"),
  propertyAddress: text("property_address"),   // keep for backward compat
  createdAt: timestamp("created_at").defaultNow().notNull(),
})
```

### Feature Overrides Schema
```typescript
// lib/schema/feature-overrides.ts
// Source: D-04 through D-05 (CONTEXT.md)
import { pgTable, text, timestamp, uuid, boolean, integer, jsonb, index } from "drizzle-orm/pg-core"
import { user } from "./auth"

export const featureOverrides = pgTable("feature_overrides", {
  id: uuid("id").defaultRandom().primaryKey(),
  scope: text("scope").notNull(),  // 'user' | 'global' | 'cohort'
  userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
  cohortId: uuid("cohort_id"),
  feature: text("feature").notNull(),  // validated against Feature enum on insert
  tierOverride: integer("tier_override").notNull(),  // 1, 2, or 3
  isActive: boolean("is_active").notNull().default(true),
  expiresAt: timestamp("expires_at"),  // null = permanent
  grantedBy: text("granted_by").notNull(),  // admin userId or 'system'
  reason: text("reason").notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  userFeatureActiveIdx: index("feature_overrides_user_feature_active_idx")
    .on(table.userId, table.feature, table.isActive),
  scopeFeatureActiveIdx: index("feature_overrides_scope_feature_active_idx")
    .on(table.scope, table.feature, table.isActive),
  expiresAtIdx: index("feature_overrides_expires_at_idx")
    .on(table.expiresAt),
}))
```

### PHProvider + Layout Integration
```typescript
// app/layout.tsx (evolved)
// Source: D-23, reetesh.in pattern (MEDIUM confidence)
import { PHProvider } from './providers'
import { PostHogPageView } from './posthog-pageview'

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning ...>
      <body className="min-h-full flex flex-col">
        <PHProvider>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
            <PostHogPageView />
            {children}
            <Toaster />
          </ThemeProvider>
        </PHProvider>
      </body>
    </html>
  )
}
```

### React Query Setup for Usage Dashboard
```typescript
// app/providers.tsx (add TanStack QueryClientProvider alongside PHProvider)
// Source: CLAUDE.md "React Query mandatory for all client-side fetching"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
const queryClient = new QueryClient()

export function AppProviders({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <PHProvider>{children}</PHProvider>
    </QueryClientProvider>
  )
}
```

### GatingService Check in Route Handler
```typescript
// Pattern for route handlers
// Source: D-08, D-11, existing gating.ts pattern
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  const gatingResult = await checkFeatureAccess(
    session.user.id,
    Feature.STAGE2_LOOKUP,
    userTier
  )
  if (!gatingResult.allowed) {
    return NextResponse.json({
      error: gatingResult.reason === 'LIMIT_REACHED' ? 'limit_reached' : 'upgrade_required',
      action: gatingResult.action,
      overageAvailable: gatingResult.overageAvailable,
      upgradeUrl: '/account/settings',
    }, { status: 402 })
  }

  const { logId } = await logAndCheckUsage({ ... })
  try {
    const result = await enrichmentService.stage1Enrich(address)
    await updateUsageStatus(logId, 'success')
    return NextResponse.json(result)
  } catch (err) {
    await updateUsageStatus(logId, 'failed')
    throw err
  }
}
```

---

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Binary free/pro gate (`requirePro()`) | Hybrid 3-tier GatingService with DB overrides | This phase | Enables rapid pricing iteration without deploys |
| Minimal usage log (5 columns) | Full METER-01 schema with cost, provider, plan context | This phase | Enables admin cost visibility and smart limits |
| No analytics | PostHog Cloud with session recording and cohorts | This phase | Product analytics from day one |
| No data enrichment | DataEnrichmentService stub (permanent interface) | This phase | Phase 5 real adapters drop in without refactoring |
| posthog-js v1 capture_pageview: true | capture_pageview: false + manual PostHogPageView | Best practice since App Router launch | Prevents double-counting page views in SPA navigation |

**Deprecated/outdated:**
- `requirePro()`: Replace with `checkFeatureAccess(userId, feature, tier)`. Keep `requirePro()` as a wrapper or thin adapter until all callers are migrated.
- `logUsage()` with `lookupType` string: Replace with expanded `logAndCheckUsage()` with `actionType`. The old `lookupType` column can be kept as an alias or migrated via backfill.

---

## Open Questions

1. **posthog-node flushAt: 1 vs captureImmediate**
   - What we know: `flushAt: 1` is the documented pattern for serverless Next.js
   - What's unclear: posthog-node 5.x may have a `captureImmediate` method that is more reliable; the documented issue (events queued if flush is in flight) could affect data pull events in Phase 5
   - Recommendation: Use `flushAt: 1, flushInterval: 0` + `await shutdown()` for Phase 2A. Evaluate `captureImmediate` when Phase 5 increases event volume.

2. **GatingService in-memory cache for 5-minute TTL**
   - What we know: D-06 specifies 5-minute session cache for gating results
   - What's unclear: The appropriate cache mechanism — Next.js `unstable_cache`, a simple Map with TTL, or Redis
   - Recommendation: Use Next.js `unstable_cache` with `revalidate: 300` for server-side gating results. This is consistent with existing project patterns and avoids adding Redis as a dependency in Phase 2A.

3. **React Query QueryClientProvider placement**
   - What we know: CLAUDE.md mandates React Query; it must be installed
   - What's unclear: Whether React Query's `QueryClientProvider` should wrap `PHProvider` or be wrapped by it
   - Recommendation: `QueryClientProvider` is the outer wrapper (no event tracking dependency); `PHProvider` wraps inside. Both are inside the same `app/providers.tsx` client component.

---

## Environment Availability

| Dependency | Required By | Available | Version | Fallback |
|------------|------------|-----------|---------|----------|
| Node.js | Runtime | ✓ | v24.14.1 | — |
| npm | Package install | ✓ | bundled with Node | — |
| Neon database | Schema migrations, gating, usage | ✓ (via .env.local) | — | — |
| posthog-js | Client analytics | ✗ (not installed) | needs 1.364.1 | None — required for ANLYT-01 |
| posthog-node | Server analytics | ✗ (not installed) | needs 5.28.8 | None — required for ANLYT-10 |
| @tanstack/react-query | Usage dashboard UI | ✗ (not installed) | needs 5.95.2 | None — CLAUDE.md mandates |
| inngest | Background job for override cleanup | ✗ (not installed) | needs 4.1.0 | Trigger.dev (equally valid) |
| PostHog Cloud account | Analytics receiving | ✓ (env vars present: NEXT_PUBLIC_POSTHOG_KEY, NEXT_PUBLIC_POSTHOG_HOST) | — | — |

**Missing dependencies with no fallback:**
- posthog-js — required for ANLYT-01 (PostHog provider)
- posthog-node — required for ANLYT-10 (server-side event capture)
- @tanstack/react-query — required by CLAUDE.md architectural rule

**Missing dependencies with fallback:**
- inngest — Trigger.dev is equally valid (Claude's Discretion per CONTEXT.md)

---

## Validation Architecture

### Test Framework
| Property | Value |
|----------|-------|
| Framework | Vitest 4.1.1 |
| Config file | `vitest.config.ts` |
| Quick run command | `npm run test:unit` |
| Full suite command | `npm run test` |

### Phase Requirements to Test Map
| Req ID | Behavior | Test Type | Automated Command | File Exists? |
|--------|----------|-----------|-------------------|-------------|
| TIER-01 | Central gating service rejects scattered plan checks | unit | `npm run test -- tests/unit/gating.test.ts` | ❌ Wave 0 |
| TIER-06 | All components use GatingService, not inline plan checks | unit | `npm run test -- tests/unit/gating.test.ts` | ❌ Wave 0 |
| METER-01 | Usage logged before execution, not after | unit | `npm run test -- tests/unit/metering.test.ts` | ❌ Wave 0 |
| METER-08 | 80% warning response, 100% block response, unlimited bypass | unit | `npm run test -- tests/unit/metering.test.ts` | ❌ Wave 0 |
| ANLYT-01 | PHProvider rendered in layout (smoke test) | smoke | `npm run test -- tests/unit/analytics.test.ts` | ❌ Wave 0 |
| DATA-01 | stage1Enrich and stage2Enrich are distinct methods | unit | `npm run test -- tests/unit/enrichment.test.ts` | ❌ Wave 0 |
| DATA-08 | stage1Enrich returns EnrichedField structure with cache metadata | unit | `npm run test -- tests/unit/enrichment.test.ts` | ❌ Wave 0 |
| DATA-09 | Graceful degradation: partial result returned on API error | unit | `npm run test -- tests/unit/enrichment.test.ts` | ❌ Wave 0 |
| SESS-03 | Payment screen URL excluded from recording (config check) | unit | `npm run test -- tests/unit/analytics.test.ts` | ❌ Wave 0 |

**Manual-only requirements (no automated test):**
- COHRT-01 through COHRT-05: PostHog cohort configuration is UI-only, not code-testable
- ANLYT-08: Funnel configuration is PostHog UI-only
- SESS-06: Heatmap configuration is PostHog UI-only
- SESS-07: Founder session review is a human activity

### Sampling Rate
- **Per task commit:** `npm run test:unit`
- **Per wave merge:** `npm run test`
- **Phase gate:** Full suite green before `/gsd:verify-work`

### Wave 0 Gaps
- [ ] `tests/unit/gating.test.ts` — covers TIER-01, TIER-06, TIER-07
- [ ] `tests/unit/metering.test.ts` — covers METER-01, METER-08, METER-10
- [ ] `tests/unit/analytics.test.ts` — covers ANLYT-01, ANLYT-03, SESS-03
- [ ] `tests/unit/enrichment.test.ts` — covers DATA-01, DATA-08, DATA-09
- [ ] Package installs: `npm install posthog-js posthog-node @tanstack/react-query inngest`

---

## Sources

### Primary (HIGH confidence)
- Project codebase (`lib/services/gating.ts`, `lib/schema/usage-log.ts`, `lib/schema/auth.ts`, `lib/db.ts`) — direct code inspection
- `.planning/phases/02A-infrastructure-services/02A-CONTEXT.md` — locked decisions D-01 through D-48
- npm registry (live queries 2026-03-27) — package version verification
- `node_modules/next/dist/docs/` — Next.js 16 framework conventions

### Secondary (MEDIUM confidence)
- [PostHog Next.js Docs](https://posthog.com/docs/libraries/next-js) — App Router integration pattern (confirmed by multiple sources)
- [Vercel KB: PostHog + Next.js](https://vercel.com/kb/guide/posthog-nextjs-vercel-feature-flags-analytics) — Provider setup code, server-side capture pattern
- [Reetesh Kumar: PostHog App Router](https://reetesh.in/blog/posthog-integration-in-next.js-app-router) — PostHogPageView pattern with Suspense
- [Drizzle ORM Migrations Docs](https://orm.drizzle.team/docs/migrations) — generate + migrate workflow
- [Drizzle PostgreSQL Column Types](https://orm.drizzle.team/docs/column-types/pg) — jsonb nullable pattern

### Tertiary (LOW confidence — flagged for validation)
- posthog-node `captureImmediate` existence in v5.x — mentioned in community issues, not verified against official docs; use `flushAt: 1` + `shutdown()` pattern instead until verified

---

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH — all versions verified via npm registry; PostHog integration pattern verified via multiple official sources
- Architecture patterns: HIGH — locked in CONTEXT.md decisions; implementation patterns verified against PostHog docs and existing codebase conventions
- Pitfalls: HIGH — Suspense issue verified from project git history (commits 39f403d, e4f1883); drizzle push warning from official docs; posthog-node flush issue from official docs + GitHub issues

**Research date:** 2026-03-27
**Valid until:** 2026-04-27 (posthog-js releases frequently; recheck version before installing)
