---
phase: 02A-infrastructure-services
verified: 2026-03-27T19:05:00Z
status: human_needed
score: 5/6 must-haves verified
human_verification:
  - test: "Configure PostHog cohorts: Week 1 Retention, Month 1 Retention, Feature Adoption - DADU Week 1, Acquisition Source - Founder Network, Market - King County, Deal Score High (COHRT-01 through COHRT-05)"
    expected: "6 cohorts exist in PostHog dashboard and are receiving data from signed_up, stage1_data_pull_completed, dadu_feasibility_checked events"
    why_human: "PostHog cohort configuration is done in the web UI, not in code. Cannot verify dashboard state programmatically."
  - test: "Configure PostHog funnels: Signup to Upgrade, Address to Analysis, Upgrade Flow, Viral Loop, Free to Paid (ANLYT-08)"
    expected: "5 funnel insights exist in PostHog dashboard configured with the correct event sequences"
    why_human: "PostHog funnel configuration is a UI-only operation. Cannot verify via code."
  - test: "Enable PostHog heatmaps on Property Intelligence page, Portfolio page, pricing/upgrade modal (SESS-06)"
    expected: "Heatmap recording is active on the 3 specified pages"
    why_human: "PostHog heatmap activation is done via the PostHog Toolbar in the browser UI. Cannot verify programmatically."
  - test: "Enable rage click detection and create paywall-without-upgrade session filter in PostHog Settings (SESS-04, SESS-05)"
    expected: "Session recording settings show rage click detection enabled; a saved filter named 'Paywall Without Upgrade' exists filtering sessions containing paywall_hit but not subscription_started"
    why_human: "PostHog session recording settings and saved filters are configured in the dashboard UI."
  - test: "Create PostHog feature flags: paywall_placement (multivariate, 50/50) and upgrade_prompt_copy (multivariate, 50/50) (ANLYT-11)"
    expected: "Both feature flags exist in PostHog Feature Flags UI, configured as multivariate with 50/50 splits"
    why_human: "PostHog feature flag creation requires the web UI. The code pattern is documented in lib/services/posthog-events.ts."
  - test: "Founder commitment to reviewing 10 recorded sessions per week during beta (SESS-07)"
    expected: "Founder has acknowledged and committed to this review cadence"
    why_human: "Non-technical commitment item. Cannot verify in code."
---

# Phase 02A: Infrastructure Services Verification Report

**Phase Goal:** The platform has a central gating service controlling feature access by tier, a usage metering pipeline that logs every cost-bearing action before it executes, PostHog analytics with session recording and cohort analysis configured, and a DataEnrichmentService skeleton defining the Stage 1/Stage 2 boundary — so every feature built in 2B and 2C ships already gated, metered, and instrumented.

**Verified:** 2026-03-27T19:05:00Z
**Status:** human_needed
**Re-verification:** No — initial verification

## Goal Achievement

### Observable Truths

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | A single configuration layer defines feature-to-tier assignments (Tier 1/2/3) — all components call this gating service, never individual plan checks | VERIFIED | `lib/config/feature-tiers.ts` exports `Feature` enum (10 values), `FEATURE_TIER_CONFIG` mapping all to tiers 1/2/3, `GatingResponse` type. `lib/services/gating.ts` exports `checkFeatureAccess()` calling the config. `app/api/v1/enrichment/stage1/route.ts` uses `checkFeatureAccess` not a raw plan check. |
| 2 | Every metered action is logged with user_id, cost estimate, and provider before execution — verified by integration test | VERIFIED | `lib/services/usage.ts` `logAndCheckUsage()` inserts with `status: 'pending'` before returning. `tests/unit/metering.test.ts` verifies pre-execution logging. 128 tests pass. |
| 3 | PostHog provider wraps the entire app, session recording is active, and user lifecycle events fire correctly | VERIFIED | `app/providers.tsx` wraps `PostHogProvider`. `app/layout.tsx` wraps all children in `PHProvider > QueryProvider > ThemeProvider`. `disable_session_recording: false` confirmed. `lib/services/posthog-events.ts` exports 6 lifecycle event functions. Stripe webhook wires `trackSubscriptionStarted` and `trackSubscriptionCancelled`. |
| 4 | PostHog cohorts (retention, feature adoption, acquisition source, market, deal score) are configured and receiving data | HUMAN NEEDED | Code infrastructure (server-side events, person properties, captureServerEvent) is fully wired and would feed these cohorts. PostHog dashboard cohort objects themselves require manual creation in the PostHog web UI — cannot be verified programmatically. |
| 5 | DataEnrichmentService exists with stage1Enrich() and stage2Enrich() method signatures, cache TTL definitions, and cache_source tracking | VERIFIED | `lib/services/enrichment.ts` exports `DataEnrichmentService` class with both methods, `CACHE_TTL` constants (180/30/2/0), `CacheSource` type, and `cache_source` on every `EnrichedField`. `lib/services/enrichment-stubs.ts` has 5 varied King County WA profiles. |
| 6 | Soft limits are enforced: 80% warning, 100% block with upgrade prompt, beta override sets all to unlimited | VERIFIED | `lib/services/usage.ts` `getUserUsageSummary()` sets `isWarning` at >=80% and `isExhausted` at >=100%. `logAndCheckUsage()` returns `allowed: false` + `LIMIT_REACHED` at 100% (skip when `BETA_MODE=true`). `components/ui/usage-indicator.tsx` shows "Limit reached — upgrade for more" at 100%. `BETA_MODE = true` in `lib/config/feature-tiers.ts`. |

**Score:** 5/6 truths verified (1 human-needed)

### Required Artifacts

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `lib/config/feature-tiers.ts` | Feature enum, tier config, action types, limits, BETA_MODE, GatingResponse | VERIFIED | All 7 exports present, substantive (189 lines), imported by gating.ts and usage.ts |
| `lib/schema/feature-overrides.ts` | Drizzle table with 3 indexes | VERIFIED | 12 columns, 3 composite indexes (userFeatureActiveIdx, scopeFeatureActiveIdx, expiresAtIdx) |
| `lib/schema/usage-log.ts` | Expanded schema with 5 new columns | VERIFIED | actionType, costEstimateCents, apiProvider, propertyId, metadata, planAtTimeOfAction all present |
| `lib/schema/index.ts` | Re-exports auth, usage-log, feature-overrides | VERIFIED | 3 re-export lines present |
| `lib/services/gating.ts` | Hybrid 3-tier with override lookup + existing functions preserved | VERIFIED | `checkFeatureAccess`, `getUserTier`, `invalidateGatingCache` added; `authenticateAndCheckTier`, `requirePro`, `getSubscriptionStatus` preserved |
| `lib/services/usage.ts` | Full METER-01 spec: logAndCheckUsage, beta mode, per-action limits | VERIFIED | All 4 exported functions present, `BETA_MODE` used in limit check, `status: 'pending'` before execution |
| `app/providers.tsx` | PHProvider wrapping PostHogProvider | VERIFIED | 'use client', exports PHProvider, `capture_pageview: false`, `disable_session_recording: false`, `password: true` |
| `app/posthog-pageview.tsx` | PostHogPageView with Suspense boundary | VERIFIED | Suspense wraps useSearchParams, fires $pageview on route changes |
| `app/layout.tsx` | PHProvider > QueryProvider > ThemeProvider hierarchy | VERIFIED | Exact nesting order confirmed |
| `lib/services/posthog-server.ts` | Server-side PostHog singleton, captureServerEvent, setPersonProperties | VERIFIED | `flushAt: 1`, `await client.shutdown()`, 3 exports present |
| `lib/services/posthog-events.ts` | 6 lifecycle events + feature flag documentation | VERIFIED | trackSignedUp/In/Out/UpgradeClicked (client), trackSubscriptionStarted/Cancelled (server), paywall_placement/upgrade_prompt_copy documented |
| `lib/services/enrichment.ts` | DataEnrichmentService with permanent interface contract | VERIFIED | stage1Enrich + stage2Enrich, all type exports, CACHE_TTL, COUNTY_QUALITY_TIERS, GIS extension fields, error codes |
| `lib/services/enrichment-stubs.ts` | 5 varied King County WA profiles | VERIFIED | 5 profiles confirmed by grep count |
| `components/ui/usage-meter.tsx` | UsageMeterCard with progress bars, all UI-SPEC copy | VERIFIED | "Usage This Month", "Property Lookups", "Skip Traces", "Saved Analyses", "PDF Exports", "Unlimited", "Resets in", "All limits are set to unlimited during beta.", h-2, text-yellow-600, text-destructive all present |
| `components/ui/usage-indicator.tsx` | Inline contextual usage indicator skeleton | VERIFIED | isWarning/isExhausted logic, "Limit reached — upgrade for more", 80% threshold |
| `hooks/use-usage.ts` | React Query hook for usage data | VERIFIED | useQuery, fetches /api/v1/usage, no raw fetch in component |
| `app/query-provider.tsx` | QueryClientProvider wrapping app | VERIFIED | 'use client', QueryClientProvider present, imported in layout.tsx |
| `app/api/v1/usage/route.ts` | GET endpoint for usage summary | VERIFIED | authenticates, calls getUserUsageSummary, returns daysUntilReset |
| `app/api/v1/enrichment/stage1/route.ts` | POST endpoint with gating + metering + analytics | VERIFIED | Full 8-step flow: auth -> gating -> metering -> analytics -> enrichment -> status update |
| `app/account/settings/page.tsx` | UsageMeterCard integrated below SubscriptionStatusCard | VERIFIED | Import and `<UsageMeterCard />` present in correct position |
| `tests/unit/feature-tiers.test.ts` | All 10 Feature enum values and config tested | VERIFIED | Part of 128 passing tests |
| `tests/unit/schema-validation.test.ts` | Schema column presence tested | VERIFIED | Part of 128 passing tests |
| `tests/unit/gating.test.ts` | Override precedence, cache, tier evaluation | VERIFIED | Part of 128 passing tests |
| `tests/unit/metering.test.ts` | Pre-execution logging, beta mode, limits | VERIFIED | Part of 128 passing tests |
| `tests/unit/enrichment.test.ts` | stage1/stage2 behavior, error paths, cache TTLs | VERIFIED | Part of 128 passing tests |
| `tests/unit/posthog-config.test.ts` | PostHog config flag regression tests | VERIFIED | Part of 128 passing tests |
| `tests/unit/integration-wiring.test.ts` | End-to-end flow ordering, SESS-05, Stripe webhook | VERIFIED | Part of 128 passing tests |

### Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `lib/services/gating.ts` | `lib/config/feature-tiers.ts` | Feature enum + FEATURE_TIER_CONFIG import | WIRED | `import { Feature, FEATURE_TIER_CONFIG, GatingResponse } from "@/lib/config/feature-tiers"` confirmed at line 6 |
| `lib/services/gating.ts` | `lib/schema/feature-overrides.ts` | featureOverrides table query | WIRED | `import { featureOverrides } from "@/lib/schema/feature-overrides"` and db queries present |
| `lib/services/usage.ts` | `lib/config/feature-tiers.ts` | ActionType, TIER_LIMITS, BETA_MODE import | WIRED | `import { ActionType, TIER_LIMITS, BETA_MODE, ACTION_COST_ESTIMATES, GatingResponse }` confirmed at lines 4-10 |
| `lib/services/usage.ts` | `lib/schema/usage-log.ts` | usageLog insert/query | WIRED | usageLog used in insert (line 103), update, and select operations |
| `app/layout.tsx` | `app/providers.tsx` | PHProvider import | WIRED | `import { PHProvider } from "./providers"` at line 5 |
| `app/layout.tsx` | `app/posthog-pageview.tsx` | PostHogPageView import | WIRED | `import { PostHogPageView } from "./posthog-pageview"` at line 6 |
| `lib/services/posthog-server.ts` | `posthog-node` | PostHog import | WIRED | `import { PostHog } from 'posthog-node'` at line 1 |
| `lib/services/enrichment.ts` | `lib/services/enrichment-stubs.ts` | MOCK_KING_COUNTY_PROFILES import | WIRED | `import { MOCK_KING_COUNTY_PROFILES } from './enrichment-stubs'` at line 21 |
| `components/ui/usage-meter.tsx` | `hooks/use-usage.ts` | useUsage hook | WIRED | `import { useUsage } from '@/hooks/use-usage'` at line 2 |
| `hooks/use-usage.ts` | `app/api/v1/usage/route.ts` | fetch /api/v1/usage | WIRED | `fetch('/api/v1/usage')` at line 32 |
| `app/account/settings/page.tsx` | `components/ui/usage-meter.tsx` | UsageMeterCard import | WIRED | `import { UsageMeterCard } from "@/components/ui/usage-meter"` at line 7 |
| `components/ui/usage-indicator.tsx` | `hooks/use-usage.ts` | useUsage hook | WIRED | `import { useUsage } from '@/hooks/use-usage'` at line 2 |
| `app/api/v1/enrichment/stage1/route.ts` | `lib/services/gating.ts` | checkFeatureAccess import | WIRED | `import { authenticateAndCheckTier, checkFeatureAccess, getUserTier } from "@/lib/services/gating"` at line 3 |
| `app/api/v1/enrichment/stage1/route.ts` | `lib/services/usage.ts` | logAndCheckUsage import | WIRED | `import { logAndCheckUsage, updateUsageStatus } from "@/lib/services/usage"` at line 4 |
| `app/api/v1/enrichment/stage1/route.ts` | `lib/services/enrichment.ts` | DataEnrichmentService import | WIRED | `import { DataEnrichmentService } from "@/lib/services/enrichment"` at line 5 |
| `app/api/v1/enrichment/stage1/route.ts` | `lib/services/posthog-server.ts` | captureServerEvent | WIRED | `import { captureServerEvent } from "@/lib/services/posthog-server"` at line 6 |
| `app/api/v1/webhooks/stripe/route.ts` | `lib/services/posthog-events.ts` | trackSubscriptionStarted/Cancelled | WIRED | Import at line 4, calls at lines 59 and 75 |

### Data-Flow Trace (Level 4)

| Artifact | Data Variable | Source | Produces Real Data | Status |
|----------|---------------|--------|--------------------|--------|
| `components/ui/usage-meter.tsx` | `data.usage` | `useUsage()` hook -> GET /api/v1/usage -> `getUserUsageSummary()` -> db query | Yes — batch SELECT with groupBy from usage_log table | FLOWING |
| `components/ui/usage-indicator.tsx` | `data.usage` | Same `useUsage()` hook | Yes — same flow | FLOWING |
| `app/api/v1/enrichment/stage1/route.ts` | `result` (enrichment) | `DataEnrichmentService.stage1Enrich()` | Yes — returns varied data based on address hash (stub with 5 profiles); Phase 5 replaces with real APIs | FLOWING (stub with real variation) |

### Behavioral Spot-Checks

| Behavior | Command | Result | Status |
|----------|---------|--------|--------|
| All 128 unit tests pass | `npx vitest run tests/unit/*.test.ts --reporter=verbose` | 128 passed, 0 failed | PASS |
| TypeScript compiles clean | `npx tsc --noEmit` | No output (zero errors) | PASS |
| posthog-js, posthog-node, @tanstack/react-query in package.json | grep package.json | All 3 present at declared versions | PASS |
| Feature enum has 10 values | `grep "export enum Feature" + value count` | 10 enum values confirmed | PASS |
| enrichment-stubs has 5 profiles | grep count on rent_estimate_primary | 5 occurrences in profiles array | PASS |
| Stripe webhook fires PostHog events | grep trackSubscriptionStarted in webhook route | Found at lines 4, 59, 75 | PASS |

### Requirements Coverage

| Requirement | Source Plan | Description | Status | Evidence |
|-------------|------------|-------------|--------|---------|
| TIER-01 | 02A-01 | Central gating service controls all feature access | SATISFIED | Feature enum + FEATURE_TIER_CONFIG in feature-tiers.ts; checkFeatureAccess in gating.ts |
| TIER-02 | 02A-01 | Tier 1 (always free) definition | SATISFIED | FEATURE_TIER_CONFIG maps STAGE1_LOOKUP to tier 1; TIER_LIMITS.free.stage1_lookup = 'unlimited' |
| TIER-03 | 02A-01 | Tier 2 (preview free) definition | SATISFIED | FEATURE_TIER_CONFIG maps RENT_ESTIMATE, DADU_FEASIBILITY to tier 2; checkFeatureAccess allows tier 2 for all users |
| TIER-04 | 02A-03, 02A-06 | Show data, gate action not visibility | SATISFIED | Tier 2 features return `allowed: true` from checkFeatureAccess; action gating is caller's responsibility per D-10 |
| TIER-05 | 02A-01 | Tier 3 (Pro only) definition | SATISFIED | FEATURE_TIER_CONFIG maps 7 features to tier 3; free users blocked via checkFeatureAccess |
| TIER-06 | 02A-01, 02A-03, 02A-06 | All components call central gating service | SATISFIED | enrichment route calls checkFeatureAccess; no scattered plan checks found |
| TIER-07 | 02A-01 | Tier assignments configurable without code deployment | SATISFIED | FEATURE_TIER_CONFIG in single TS file; featureOverrides DB table supports runtime overrides |
| METER-01 | 02A-03 | Every action logged before execution with required fields | SATISFIED | logAndCheckUsage() inserts before returning; all required fields in usage_log schema |
| METER-02 | 02A-01, 02A-03 | Data pull actions in ActionType enum | SATISFIED | ADDRESS_LOOKUP_STAGE1/2, RENT_ESTIMATE_REQUESTED, RENT_ESTIMATE_REQUESTED_ADU, DADU_FEASIBILITY_CHECKED, COMPARABLE_SALES_PULLED all in enum |
| METER-04 | 02A-01, 02A-03 | Skip trace actions metered | SATISFIED | SKIP_TRACE_REQUESTED in ActionType enum; mapped to skip_trace limit key |
| METER-05 | 02A-01, 02A-03 | Report actions metered | SATISFIED | DEAL_REPORT_GENERATED, DEAL_REPORT_VIEWED in ActionType enum |
| METER-08 | 02A-03, 02A-05 | Soft limits: 80% warning, 100% block, upgrade prompt | SATISFIED | getUserUsageSummary sets isWarning/isExhausted; UsageIndicator shows "Limit reached — upgrade for more"; logAndCheckUsage blocks at 100% |
| METER-09 | 02A-01 | Specific limit values: free 0 lookups, pro 50 lookups, 10 skip traces | SATISFIED | TIER_LIMITS defines exact values; post-beta production limits in config |
| METER-10 | 02A-01, 02A-03 | Beta mode: unlimited enforcement, log everything | SATISFIED | BETA_MODE = true; usage.ts checks `BETA_MODE || isUnderLimit` |
| ANLYT-01 | 02A-02 | PostHog JS SDK integrated, provider wraps app | SATISFIED | PHProvider in layout.tsx wraps entire app |
| ANLYT-02 | 02A-02 | Session recording enabled for beta | SATISFIED | `disable_session_recording: false` in providers.tsx |
| ANLYT-03 | 02A-02, 02A-06 | No PII in events | SATISFIED | `maskInputOptions: { password: true }` in providers.tsx; enrichment route uses `address_hash` not raw address |
| ANLYT-04 | 02A-05 | User lifecycle events tracked | SATISFIED | 6 events in posthog-events.ts; Stripe webhook wires subscription events |
| ANLYT-08 | 02A-06 | Key funnels configured | NEEDS HUMAN | Funnels documented in Plan 06 Task 3 checklist; requires PostHog dashboard UI configuration |
| ANLYT-10 | 02A-06 | Data pull events fire server-side | SATISFIED | `captureServerEvent('stage1_data_pull_started')` and `stage1_data_pull_completed` in enrichment route |
| ANLYT-11 | 02A-05, 02A-06 | Person properties updated server-side; feature flags documented | PARTIALLY SATISFIED | setPersonProperties called on subscription changes; feature flag SDK pattern documented in posthog-events.ts; flag creation in PostHog dashboard needs human |
| SESS-01 | 02A-02 | Record all sessions for 90 days | SATISFIED | `disable_session_recording: false` in PHProvider |
| SESS-02 | 02A-02 | After 90 days: free tier + first 5 new paid | PARTIALLY SATISFIED | Infrastructure ready; session sampling logic post-90-days requires PostHog dashboard configuration or code change when beta ends |
| SESS-03 | 02A-02 | Never record payment screens | SATISFIED | Stripe Checkout is external — automatic compliance |
| SESS-04 | 02A-02, 02A-06 | Flag rage click sessions | PARTIALLY SATISFIED | `autocapture: true` enables rage click detection in SDK; PostHog dashboard filter for rage click sessions needs human |
| SESS-05 | 02A-06 | Flag paywall-without-upgrade sessions | PARTIALLY SATISFIED | `paywall_hit` event fires from enrichment route on 403/429; `last_paywall_hit_at` person property set; PostHog saved filter creation needs human |
| SESS-06 | 02A-06 | Heatmaps on 3 pages | NEEDS HUMAN | Requires PostHog Toolbar activation in browser UI |
| SESS-07 | 02A-06 | Founder reviews 10 sessions/week | NEEDS HUMAN | Non-technical commitment |
| COHRT-01 | 02A-06 | Week 1 / Month 1 retention cohorts | NEEDS HUMAN | Events flowing; cohort objects require PostHog dashboard UI |
| COHRT-02 | 02A-06 | Feature adoption cohorts | NEEDS HUMAN | Placeholder events ready; PostHog dashboard UI required |
| COHRT-03 | 02A-06 | Acquisition source cohorts | NEEDS HUMAN | PostHog dashboard UI required |
| COHRT-04 | 02A-06 | Market cohorts | NEEDS HUMAN | county_quality_tier in stage1_data_pull_completed events; PostHog dashboard UI required |
| COHRT-05 | 02A-06 | Deal score cohorts | NEEDS HUMAN | PostHog dashboard UI required |
| DATA-01 | 02A-04 | Two-stage architecture as distinct service methods | SATISFIED | stage1Enrich and stage2Enrich are distinct methods on DataEnrichmentService |
| DATA-02 | 02A-04 | Stage 1 field list | SATISFIED | All Stage 1 fields present in Stage1EnrichmentResult type and stub implementation |
| DATA-03 | 02A-04 | Stage 1 data cached in ReVested DB on first lookup | PARTIALLY SATISFIED | Interface and stub return `cache_hit: false` (simulates first fetch); actual DB caching layer is Phase 5 work |
| DATA-05 | 02A-04 | Cache TTLs per field type | SATISFIED | CACHE_TTL = { STATIC: 180, SEMI_STATIC: 30, DYNAMIC: 2, NEVER: 0 }; applied per field in makeField() |
| DATA-06 | 02A-04 | cache_source tracked per field | SATISFIED | Every EnrichedField has cache_source; values: county_api, gis_api, rentcast, attom, internal |
| DATA-07 | 02A-04 | County quality tiers for 4 markets | SATISFIED | COUNTY_QUALITY_TIERS maps all 4 counties with correct quality levels |
| DATA-08 | 02A-04 | DataEnrichmentService with stage1Enrich(address) and stage2Enrich(propertyId, features[]) | SATISFIED | Both methods exist with exact signatures |
| DATA-09 | 02A-04 | Graceful degradation | SATISFIED | Error paths: ADDRESS_NOT_FOUND, COUNTY_NOT_SUPPORTED, PARTIAL with partial_data flag |
| DATA-10 | 02A-04 | Cache hit rate tracked | SATISFIED | `cache_hit: boolean` on both Stage1 and Stage2 results; stub always returns false (simulates first fetch) |

### Anti-Patterns Found

| File | Line | Pattern | Severity | Impact |
|------|------|---------|----------|--------|
| `lib/services/enrichment.ts` | 363 | `county_quality_tier: 'excellent'` hardcoded in PARTIAL error path | Info | Error path always reports 'excellent' regardless of county — minor, only affects error responses not real lookups |
| `app/api/v1/enrichment/stage1/route.ts` | 73-78 | 429 response missing `upgradeUrl` field | Info | `requirePro()` returns upgradeUrl but logAndCheckUsage 429 does not — inconsistent but not blocking; UI handles it via UsageIndicator |

No blockers or warnings found. Both items are informational edge cases.

### Human Verification Required

Six items require manual action in the PostHog web dashboard. These are all documented in the Plan 06 Task 3 checklist. The code infrastructure (events flowing, person properties, SDK configuration) is fully wired and ready to feed these dashboard objects once created.

**Priority order for PostHog dashboard setup:**

1. **Feature flags** (ANLYT-11) — `paywall_placement` and `upgrade_prompt_copy`. Phase 2B A/B testing cannot begin without these.

2. **Rage click + paywall session filters** (SESS-04, SESS-05) — enables early identification of UX friction during beta. The `paywall_hit` events are already flowing.

3. **Retention cohorts** (COHRT-01, COHRT-02) — critical for measuring beta health. Configure as soon as first users sign up.

4. **Funnels** (ANLYT-08) — configure before analyzing signup conversion.

5. **Heatmaps** (SESS-06) — configure after Phase 2B pages are built (Property Intelligence, Portfolio pages don't exist yet).

6. **Founder session review commitment** (SESS-07) — non-blocking for code work.

### Gaps Summary

No code gaps. The automated infrastructure is complete and all 128 tests pass. The only items requiring action are PostHog dashboard configurations that are inherently manual (cohorts, funnels, heatmaps, feature flags, session filters). These are documented in the Plan 06 Task 3 checklist and cannot be automated.

One architectural note: DATA-03 (actual DB caching of Stage 1 data) is intentionally deferred to Phase 5 per D-40. The stub always returns `cache_hit: false` which correctly represents a "first fetch" simulation. This is by design, not a gap.

---

_Verified: 2026-03-27T19:05:00Z_
_Verifier: Claude (gsd-verifier)_
