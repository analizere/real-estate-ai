---
phase: 02A-infrastructure-services
plan: "06"
subsystem: integration-wiring
tags: [posthog, analytics, enrichment, gating, metering, stripe, webhooks]
dependency_graph:
  requires: [02A-02, 02A-03, 02A-04, 02A-05]
  provides: [stage1-enrichment-endpoint, posthog-stripe-wiring, sess05-paywall-flagging]
  affects: [phase-2B-features, phase-3-data-pipeline]
tech_stack:
  added: []
  patterns: [gating-metering-analytics-enrichment-flow, sess05-paywall-hit-event, server-side-posthog-events]
key_files:
  created:
    - app/api/v1/enrichment/stage1/route.ts
    - tests/unit/integration-wiring.test.ts
  modified:
    - app/api/v1/webhooks/stripe/route.ts
    - lib/services/posthog-events.ts
    - lib/services/enrichment.ts
decisions:
  - Stripe webhook PostHog calls wrapped fire-and-forget so analytics failures never break webhook response
  - Request cloned before auth.handler to allow raw body reading for Stripe event parsing without consuming original
  - makeField generic type params added explicitly when passing null to resolve TypeScript inference bug
metrics:
  duration: 15min
  completed_date: "2026-03-28"
  tasks_completed: 2
  files_modified: 5
---

# Phase 02A Plan 06: Integration Wiring Summary

**One-liner:** Stage 1 enrichment endpoint wiring full auth->gating->metering->analytics->enrichment flow with SESS-05 paywall_hit events and Stripe webhook PostHog subscription tracking.

## What Was Built

### Task 1: Stage 1 Enrichment Endpoint (Complete)

`app/api/v1/enrichment/stage1/route.ts` — the canonical Phase 2A endpoint demonstrating the full infrastructure flow:

1. **Auth** — `authenticateAndCheckTier()` returns 401 if unauthenticated
2. **Input validation** — returns 400 if address missing or non-string
3. **Gating** — `checkFeatureAccess()` checks Feature.STAGE1_LOOKUP against user tier and any DB overrides; returns 403 with `paywall_hit` PostHog event (SESS-05) if blocked
4. **Usage metering** — `logAndCheckUsage()` runs BEFORE enrichment per D-12/Pitfall 5; returns 429 with `paywall_hit` PostHog event (SESS-05) if limit exceeded
5. **Analytics** — `captureServerEvent('stage1_data_pull_started')` fires server-side before execution per ANLYT-10/D-25 (ad blocker safe)
6. **Enrichment** — `DataEnrichmentService.stage1Enrich(address)` executes
7. **Status update** — `updateUsageStatus()` called with 'success' or 'failed' after execution
8. **Completion analytics** — `captureServerEvent('stage1_data_pull_completed')` with cache_hit and county_quality_tier properties (no PII)

**SESS-05 paywall_hit events:**
- Fires when `checkFeatureAccess` returns `allowed: false` (403 response)
- Fires when `logAndCheckUsage` returns `allowed: false` (429 response)
- Sets `last_paywall_hit_at` person property via `$set` for PostHog cohort filtering
- PostHog dashboard: create saved filter for sessions with `paywall_hit` where `subscription_started` does NOT follow

**PII compliance (ANLYT-03/D-24):**
- Raw address never appears in any PostHog event property
- Only `address_hash: address.substring(0, 10)` in usage log metadata

**21 integration tests** verifying:
- 401 on unauthenticated requests
- 400 on missing/non-string address
- Gating -> metering -> enrichment call order
- Usage logged before enrichment (D-12)
- `stage1_data_pull_started` fires server-side
- No PII in any `captureServerEvent` call
- `updateUsageStatus('success')` on success, `('failed')` on throws
- `paywall_hit` fires on 403 with `feature`, `reason`, `user_tier`, `$set.last_paywall_hit_at`
- `paywall_hit` fires on 429 with `reason: 'LIMIT_REACHED'`
- Stripe webhook: `trackSubscriptionStarted` and `trackSubscriptionCancelled` callable

### Task 2: Stripe Webhook PostHog Wiring (Complete)

`app/api/v1/webhooks/stripe/route.ts` — PostHog subscription events added after `auth.handler`:

- Request cloned before auth.handler delegation (body can only be read once)
- Stripe event parsed from raw body after auth.handler returns 200
- `trackSubscriptionStarted(userId, 'pro', 9900)` fires on `customer.subscription.created` and `.updated` with `status=active`
- `trackSubscriptionCancelled(userId)` fires on `customer.subscription.deleted` and `.updated` with `status=canceled`
- userId extracted from `subscription.metadata.referenceId` (Better Auth convention)
- All PostHog calls are fire-and-forget with `.catch()` — analytics failures never break webhook response

`lib/services/posthog-events.ts` — Feature Flags documentation block added (D-27/ANLYT-11):
- `paywall_placement` flag: A/B test for upgrade prompt placement
- `upgrade_prompt_copy` flag: A/B test for upgrade CTA wording
- Client-side SDK pattern: `useFeatureFlagEnabled` from posthog-js/react
- Server-side SDK pattern: `client.isFeatureEnabled()` from posthog-node

### Task 3: PostHog Dashboard Configuration (Checkpoint — Awaiting Human Action)

The following items require manual configuration in the PostHog web UI. See the plan for the full checklist (02A-06-PLAN.md Task 3).

### Rule 1 Auto-fix: enrichment.ts TypeScript Bug

Pre-existing type error in `lib/services/enrichment.ts` was blocking `npx next build`. `makeField(null, ...)` calls inferred `T = null` producing `EnrichedField<null>` which was not assignable to `EnrichedField<number>`. Fixed by adding explicit type parameters (`makeField<number>(null, ...)`) to all null calls in the PARTIAL error path and `_errorResult` method.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed makeField<T> null inference TypeScript error in enrichment.ts**
- **Found during:** Task 2 build verification (`npx next build`)
- **Issue:** `makeField(null, 'county_api', ...)` inferred `T = null` → `EnrichedField<null>` not assignable to `EnrichedField<number>` in `Stage1EnrichmentResult`
- **Fix:** Added explicit type parameters to all `makeField(null, ...)` calls in the error path (lines 342-361) and `_errorResult` method (lines 562-581)
- **Files modified:** `lib/services/enrichment.ts`
- **Commit:** 2caccab

**2. [Rule 3 - Blocking] Worktree lacked services from plans 02A-02 through 02A-05**
- **Found during:** Initial setup
- **Issue:** Worktree branch was behind main; posthog-server.ts, posthog-events.ts, enrichment.ts, feature-tiers.ts all missing
- **Fix:** Merged `worktree-agent-aa152d84` branch (which had all prior plan commits) into this worktree

## Known Stubs

None — the Stage 1 enrichment endpoint calls `DataEnrichmentService.stage1Enrich()` which is itself a stub (Phase 4 will wire real county APIs), but this is documented and intentional per D-40 (permanent interface contract).

## Test Results

```
Test Files  7 passed | 3 skipped (10)
Tests       128 passed | 25 todo (153)
```

All tests pass including the 21 new integration wiring tests.

## Build Status

TypeScript: passes (`✓ Compiled successfully`, `Finished TypeScript in 2.6s`)
Runtime: fails with DB connection error — expected without `.env.local` (Neon requires `DATABASE_URL` at module evaluation time; this is pre-existing behavior, not introduced by this plan)

## Self-Check: PASSED

- [x] `app/api/v1/enrichment/stage1/route.ts` — FOUND
- [x] `tests/unit/integration-wiring.test.ts` — FOUND
- [x] Commit `0218134` (Task 1) — FOUND
- [x] Commit `2caccab` (Task 2 + Rule 1 fix) — FOUND
- [x] All 21 integration tests pass
- [x] All acceptance criteria satisfied
