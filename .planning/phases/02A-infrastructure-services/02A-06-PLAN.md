---
phase: 02A-infrastructure-services
plan: 06
type: execute
wave: 4
depends_on: [02A-02, 02A-03, 02A-04, 02A-05]
files_modified:
  - lib/services/posthog-events.ts
  - app/api/v1/webhooks/stripe/route.ts
  - app/api/v1/enrichment/stage1/route.ts
  - tests/unit/integration-wiring.test.ts
autonomous: false
requirements: [TIER-04, TIER-06, ANLYT-08, ANLYT-10, ANLYT-11, SESS-05, SESS-07, COHRT-01, COHRT-02, COHRT-03, COHRT-04, COHRT-05, DATA-03, DATA-10, METER-01]

must_haves:
  truths:
    - "Stripe webhook fires PostHog subscription events on plan changes"
    - "Stage 1 enrichment endpoint exists, calls DataEnrichmentService, logs usage before execution"
    - "Gated route returns 403 with session property set for paywall-hit-without-upgrade flagging (SESS-05)"
    - "Feature flags are documented for manual PostHog dashboard creation and SDK usage patterns are commented in code (ANLYT-11/D-27)"
    - "PostHog cohorts and funnels are documented for manual configuration (COHRT-01-05, ANLYT-08)"
  artifacts:
    - path: "app/api/v1/enrichment/stage1/route.ts"
      provides: "POST endpoint for Stage 1 data enrichment with gating + metering"
      exports: ["POST"]
    - path: "tests/unit/integration-wiring.test.ts"
      provides: "Integration tests verifying gating -> metering -> enrichment flow and Stripe webhook PostHog wiring"
  key_links:
    - from: "app/api/v1/enrichment/stage1/route.ts"
      to: "lib/services/gating.ts"
      via: "checkFeatureAccess import"
      pattern: "import.*checkFeatureAccess.*from.*gating"
    - from: "app/api/v1/enrichment/stage1/route.ts"
      to: "lib/services/usage.ts"
      via: "logAndCheckUsage import"
      pattern: "import.*logAndCheckUsage.*from.*usage"
    - from: "app/api/v1/enrichment/stage1/route.ts"
      to: "lib/services/enrichment.ts"
      via: "DataEnrichmentService import"
      pattern: "import.*DataEnrichmentService.*from.*enrichment"
    - from: "app/api/v1/enrichment/stage1/route.ts"
      to: "lib/services/posthog-server.ts"
      via: "captureServerEvent for stage1_data_pull events"
      pattern: "captureServerEvent"
---

<objective>
Wire all Phase 2A services together in the enrichment endpoint (the canonical example of gating + metering + enrichment + analytics working together), add PostHog events to the Stripe webhook, add SESS-05 paywall-without-upgrade session flagging, and create the PostHog dashboard configuration checklist for manual setup.

Purpose: This plan proves the entire Phase 2A infrastructure works end-to-end: a request flows through gating check -> usage metering -> data enrichment -> analytics event capture. It also connects PostHog to subscription lifecycle and ensures paywall interactions are tracked for session flagging.
Output: Stage 1 enrichment route, Stripe webhook PostHog wiring, SESS-05 session property, integration tests, PostHog dashboard config checklist.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
@$HOME/.claude/get-shit-done/templates/summary.md
</execution_context>

<context>
@.planning/PROJECT.md
@.planning/ROADMAP.md
@.planning/STATE.md
@.planning/phases/02A-infrastructure-services/02A-CONTEXT.md
@.planning/phases/02A-infrastructure-services/02A-RESEARCH.md
@.planning/phases/02A-infrastructure-services/02A-02-SUMMARY.md
@.planning/phases/02A-infrastructure-services/02A-03-SUMMARY.md
@.planning/phases/02A-infrastructure-services/02A-04-SUMMARY.md
@.planning/phases/02A-infrastructure-services/02A-05-SUMMARY.md

<interfaces>
<!-- From Plans 02-05 — all service exports needed for wiring -->

From lib/services/gating.ts:
```typescript
export async function authenticateAndCheckTier(): Promise<GatingResult>;
export async function checkFeatureAccess(userId: string, feature: Feature, userTier: 'free' | 'pro'): Promise<GatingResponse>;
export async function getUserTier(userId: string): Promise<'free' | 'pro'>;
```

From lib/services/usage.ts:
```typescript
export async function logAndCheckUsage(params: { userId, actionType, costEstimateCents?, apiProvider?, propertyId?, metadata?, planAtTimeOfAction }): Promise<UsageCheckResult>;
export async function updateUsageStatus(logId: string, status: 'success' | 'failed'): Promise<void>;
```

From lib/services/enrichment.ts:
```typescript
export class DataEnrichmentService {
  async stage1Enrich(address: string): Promise<Stage1EnrichmentResult>;
}
```

From lib/services/posthog-server.ts:
```typescript
export async function captureServerEvent(params: { distinctId, event, properties? }): Promise<void>;
export async function setPersonProperties(distinctId: string, properties: Record<string, unknown>): Promise<void>;
```

From lib/services/posthog-events.ts:
```typescript
export async function trackSubscriptionStarted(userId: string, plan: string, priceMonthly: number): Promise<void>;
export async function trackSubscriptionCancelled(userId: string): Promise<void>;
```

From lib/config/feature-tiers.ts:
```typescript
export enum Feature { STAGE1_LOOKUP = 'stage1_lookup', ... }
export enum ActionType { address_lookup_stage1 = 'address_lookup_stage1', ... }
```
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create Stage 1 enrichment endpoint with full gating + metering + analytics wiring and SESS-05 paywall flagging</name>
  <files>app/api/v1/enrichment/stage1/route.ts, tests/unit/integration-wiring.test.ts</files>
  <read_first>
    - lib/services/gating.ts (checkFeatureAccess — from Plan 03)
    - lib/services/usage.ts (logAndCheckUsage, updateUsageStatus — from Plan 03)
    - lib/services/enrichment.ts (DataEnrichmentService — from Plan 04)
    - lib/services/posthog-server.ts (captureServerEvent — from Plan 02)
    - lib/config/feature-tiers.ts (Feature.STAGE1_LOOKUP, ActionType.address_lookup_stage1)
    - app/api/v1/billing/checkout/route.ts (existing route handler pattern — follow same style)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-12: log before execution, D-25: server-side events, D-36: flag paywall-without-upgrade sessions)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pitfall 5: logging before execution)
    - node_modules/next/dist/docs/ (check for Route Handler changes per AGENTS.md)
  </read_first>
  <action>
Create `app/api/v1/enrichment/stage1/route.ts` — the canonical Phase 2A endpoint demonstrating the full flow:

```typescript
import { NextRequest, NextResponse } from "next/server"
import { authenticateAndCheckTier, checkFeatureAccess, getUserTier } from "@/lib/services/gating"
import { logAndCheckUsage, updateUsageStatus } from "@/lib/services/usage"
import { DataEnrichmentService } from "@/lib/services/enrichment"
import { captureServerEvent } from "@/lib/services/posthog-server"
import { Feature, ActionType } from "@/lib/config/feature-tiers"

const enrichmentService = new DataEnrichmentService()

export async function POST(request: NextRequest) {
  // Step 1: Authenticate
  const auth = await authenticateAndCheckTier()
  if (!auth.authorized) return auth.response

  // Step 2: Parse request
  const body = await request.json()
  const { address } = body
  if (!address || typeof address !== 'string') {
    return NextResponse.json({ error: "address is required" }, { status: 400 })
  }

  // Step 3: Check feature access (per TIER-06: all components call gating service)
  const userTier = await getUserTier(auth.userId)
  const gateResult = await checkFeatureAccess(auth.userId, Feature.STAGE1_LOOKUP, userTier)
  if (!gateResult.allowed) {
    // SESS-05: Flag this session as "paywall hit without upgrade" for PostHog session analysis
    // This fires a server-side event with a session property that PostHog can filter on.
    await captureServerEvent({
      distinctId: auth.userId,
      event: 'paywall_hit',
      properties: {
        feature: Feature.STAGE1_LOOKUP,
        reason: gateResult.reason,
        user_tier: userTier,
        $set: { last_paywall_hit_at: new Date().toISOString() }, // person property for cohort filtering
      },
    })
    return NextResponse.json({
      error: "feature_gated",
      reason: gateResult.reason,
      action: gateResult.action,
      overageAvailable: gateResult.overageAvailable,
    }, { status: 403 })
  }

  // Step 4: Log usage BEFORE execution (D-12, Pitfall 5)
  const usageResult = await logAndCheckUsage({
    userId: auth.userId,
    actionType: ActionType.address_lookup_stage1,
    apiProvider: 'county_api',
    metadata: { address_hash: address.substring(0, 10) }, // no PII per ANLYT-03/D-24
    planAtTimeOfAction: userTier,
  })
  if (!usageResult.allowed) {
    // SESS-05: Also flag limit-reached as paywall hit
    await captureServerEvent({
      distinctId: auth.userId,
      event: 'paywall_hit',
      properties: {
        feature: Feature.STAGE1_LOOKUP,
        reason: 'LIMIT_REACHED',
        user_tier: userTier,
      },
    })
    return NextResponse.json({
      error: "limit_reached",
      reason: usageResult.gatingResponse.reason,
      action: usageResult.gatingResponse.action,
    }, { status: 429 })
  }

  // Step 5: Fire server-side event BEFORE execution (D-25/ANLYT-10)
  await captureServerEvent({
    distinctId: auth.userId,
    event: 'stage1_data_pull_started',
    properties: { action_type: 'address_lookup_stage1' }, // no PII
  })

  // Step 6: Execute enrichment
  try {
    const result = await enrichmentService.stage1Enrich(address)

    // Step 7: Update usage status
    if (usageResult.logId) {
      await updateUsageStatus(usageResult.logId, result.success ? 'success' : 'failed')
    }

    // Step 8: Fire completion event (D-25/ANLYT-10)
    await captureServerEvent({
      distinctId: auth.userId,
      event: 'stage1_data_pull_completed',
      properties: {
        success: result.success,
        cache_hit: result.cache_hit,
        county_quality_tier: result.county_quality_tier,
        fields_populated: result.success ? Object.keys(result).filter(k => !['success', 'property_id', 'address_normalized', 'cache_hit', 'county_quality_tier', 'error'].includes(k)).length : 0,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    // Update usage as failed
    if (usageResult.logId) {
      await updateUsageStatus(usageResult.logId, 'failed')
    }
    return NextResponse.json({ error: "enrichment_failed" }, { status: 500 })
  }
}
```

Create `tests/unit/integration-wiring.test.ts` — tests that verify:
- POST /api/v1/enrichment/stage1 requires authentication (mock unauthenticated -> 401)
- Request without address returns 400
- The flow calls gating -> metering -> enrichment in correct order (mock all three services)
- Usage is logged BEFORE enrichment executes (verify logAndCheckUsage called before stage1Enrich)
- captureServerEvent is called with 'stage1_data_pull_started' event
- On success, updateUsageStatus called with 'success'
- On failure, updateUsageStatus called with 'failed'
- No PII in any captureServerEvent properties (no raw address)
- SESS-05: When gating returns allowed:false, captureServerEvent fires 'paywall_hit' event with feature and reason properties
- SESS-05: When usage limit reached (429), captureServerEvent fires 'paywall_hit' event with reason 'LIMIT_REACHED'
- Stripe webhook: trackSubscriptionStarted fires when customer.subscription.created event is processed (mock test)
- Stripe webhook: trackSubscriptionCancelled fires when subscription is cancelled/deleted (mock test)
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/integration-wiring.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - app/api/v1/enrichment/stage1/route.ts contains `export async function POST(`
    - app/api/v1/enrichment/stage1/route.ts contains `checkFeatureAccess`
    - app/api/v1/enrichment/stage1/route.ts contains `logAndCheckUsage`
    - app/api/v1/enrichment/stage1/route.ts contains `stage1Enrich`
    - app/api/v1/enrichment/stage1/route.ts contains `captureServerEvent`
    - app/api/v1/enrichment/stage1/route.ts contains `stage1_data_pull_started`
    - app/api/v1/enrichment/stage1/route.ts contains `stage1_data_pull_completed`
    - app/api/v1/enrichment/stage1/route.ts contains `updateUsageStatus`
    - app/api/v1/enrichment/stage1/route.ts contains `address_hash` (not raw address)
    - app/api/v1/enrichment/stage1/route.ts contains `paywall_hit` (SESS-05 event)
    - app/api/v1/enrichment/stage1/route.ts contains `last_paywall_hit_at` (SESS-05 person property)
    - tests/unit/integration-wiring.test.ts contains `paywall_hit` (SESS-05 test)
    - tests/unit/integration-wiring.test.ts contains `trackSubscriptionStarted` (Stripe webhook test)
    - tests/unit/integration-wiring.test.ts exits 0
  </acceptance_criteria>
  <done>Stage 1 enrichment endpoint demonstrates the full Phase 2A flow: auth -> gating -> metering -> server-side analytics -> enrichment -> status update. SESS-05 paywall_hit event fires on 403/429 responses. No PII in events. Tests verify ordering, SESS-05, and Stripe webhook PostHog wiring.</done>
</task>

<task type="auto">
  <name>Task 2: Wire PostHog events into Stripe webhook and document feature flags</name>
  <files>app/api/v1/webhooks/stripe/route.ts, lib/services/posthog-events.ts</files>
  <read_first>
    - app/api/v1/webhooks/stripe/route.ts (existing Stripe webhook — add PostHog event capture)
    - lib/services/posthog-events.ts (trackSubscriptionStarted, trackSubscriptionCancelled)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-07: weekly background job, D-26: person properties on plan changes)
  </read_first>
  <action>
1. Update `app/api/v1/webhooks/stripe/route.ts`:
   After the existing webhook handling logic, add PostHog event capture:

   - On `customer.subscription.created` or `customer.subscription.updated` (status=active):
     ```typescript
     import { trackSubscriptionStarted, trackSubscriptionCancelled } from "@/lib/services/posthog-events"
     // After existing subscription handling...
     await trackSubscriptionStarted(userId, 'pro', 9900) // $99/month in cents
     ```

   - On `customer.subscription.deleted` or status=cancelled:
     ```typescript
     await trackSubscriptionCancelled(userId)
     ```

   IMPORTANT: The existing webhook delegates to Better Auth's handler. Add PostHog calls AFTER the existing handling, not replacing it. If the existing handler structure makes this difficult, add the calls in a wrapper around the handler.

2. Document PostHog feature flags setup per D-27/ANLYT-11:
   Add a comment block in `lib/services/posthog-events.ts`:
   ```typescript
   /**
    * PostHog Feature Flags (D-27/ANLYT-11):
    * Feature flags are configured in the PostHog dashboard, NOT in code.
    * Flags to create manually in PostHog UI:
    * - paywall_placement: A/B test where upgrade prompts appear
    * - upgrade_prompt_copy: A/B test upgrade prompt wording
    *
    * Client-side evaluation:
    *   import { useFeatureFlagEnabled } from 'posthog-js/react'
    *   const showVariantA = useFeatureFlagEnabled('paywall_placement')
    *
    * Server-side evaluation:
    *   const client = getPostHogServerClient()
    *   const enabled = await client.isFeatureEnabled('paywall_placement', userId)
    */
   ```
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx next build 2>&1 | tail -10</automated>
  </verify>
  <acceptance_criteria>
    - app/api/v1/webhooks/stripe/route.ts contains `trackSubscriptionStarted` or `captureServerEvent.*subscription_started`
    - app/api/v1/webhooks/stripe/route.ts contains `trackSubscriptionCancelled` or `captureServerEvent.*subscription_cancelled`
    - lib/services/posthog-events.ts contains `Feature Flags` comment block
    - lib/services/posthog-events.ts contains `paywall_placement`
    - lib/services/posthog-events.ts contains `useFeatureFlagEnabled`
    - `npx next build` completes without error
  </acceptance_criteria>
  <done>Stripe webhook fires PostHog subscription events on plan changes. Feature flags documentation added. Build succeeds.</done>
</task>

<task type="checkpoint:human-verify" gate="blocking">
  <name>Task 3: PostHog Dashboard Configuration</name>
  <files>N/A — PostHog web UI configuration only</files>
  <action>
User must manually configure PostHog dashboard items that cannot be done via code (Pitfall 6 from RESEARCH.md). All items are listed in the how-to-verify section below. This covers COHRT-01 through COHRT-05, ANLYT-08, SESS-04, SESS-05, SESS-06, ANLYT-11 feature flags, and SESS-07 founder commitment.
  </action>
  <what-built>
All Phase 2A code infrastructure is complete: PostHog SDK integrated, session recording configured, lifecycle events wired, gating/metering/enrichment services built and connected. SESS-05 paywall_hit events fire from code on 403/429 responses.

The following items require MANUAL configuration in the PostHog web UI (Pitfall 6 from RESEARCH.md — cohorts/funnels are UI work, not code).

IMPORTANT: Phase 2B is blocked until this task is complete. PostHog must be configured before any Phase 2B feature events can be analyzed.
  </what-built>
  <how-to-verify>
Log into PostHog Dashboard (posthog.com) and configure:

**1. Cohorts (COHRT-01 through COHRT-05 / D-38):**
- Cohorts -> New Cohort -> "Week 1 Retention" — filter: signed_up in last 7 days AND had any event in last 2 days
- "Month 1 Retention" — filter: signed_up in last 30 days AND had any event in last 7 days
- "Feature Adoption - DADU Week 1" — filter: dadu_feasibility_checked AND signed_up in last 7 days (placeholder — events will flow in Phase 4)
- "Acquisition Source - Founder Network" — filter: signed_up with property source = 'founder_network' (placeholder — source tracking wires in Phase 3)
- "Market - King County" — filter: stage1_data_pull_completed with property county = 'king_county_wa' (placeholder — events will flow in Phase 5)
- "Deal Score High" — filter: deal_score_computed with property score > 66 (placeholder — events wire in Phase 2B)

**2. Funnels (ANLYT-08 / D-28):**
- Insights -> New Insight -> Funnel:
  - "Signup to Upgrade": signed_up -> first analysis_completed -> subscription_started
  - "Address to Analysis": analysis_address_entered -> stage1_data_pull_completed -> analysis_completed
  - "Upgrade Flow": upgrade_clicked -> subscription_started
  - "Viral Loop": analysis_shared -> shared_link_viewed -> signed_up (recipient)
  - "Free to Paid": signed_up -> upgrade_clicked -> subscription_started

**3. Heatmaps (SESS-06 / D-37):**
- Toolbar -> Enable Heatmaps on:
  - Property Intelligence page (will exist in Phase 2B)
  - Portfolio page (will exist in Phase 2C)
  - Pricing/upgrade modal (exists from Phase 1)

**4. Session Recording Flags (SESS-04, SESS-05 / D-35, D-36):**
- Settings -> Session Recording:
  - Enable rage click detection (SESS-04)
  - SESS-05: Create a saved filter/view for sessions containing the 'paywall_hit' event — label it "Paywall Without Upgrade". This uses the paywall_hit events fired by the enrichment endpoint on 403/429 responses. Sessions where paywall_hit fires but subscription_started does NOT fire within the same session are the target cohort.

**5. Feature Flags (ANLYT-11 / D-27):**
- Feature Flags -> New:
  - "paywall_placement" — multivariate, 50/50 split (placeholder for future A/B test)
  - "upgrade_prompt_copy" — multivariate, 50/50 split (placeholder for future A/B test)

**6. Founder task (SESS-07):**
- Commit to reviewing 10 recorded sessions per week during beta
  </how-to-verify>
  <verify>Manual verification in PostHog dashboard — see how-to-verify steps above</verify>
  <done>All PostHog dashboard items configured: 6 cohorts, 5 funnels, heatmaps on 3 pages, rage click detection enabled, paywall-without-upgrade session filter created (SESS-05), 2 feature flags created, founder committed to weekly session review.</done>
  <resume-signal>Type "posthog configured" when all items above are set up in the PostHog dashboard, or describe which items need help.</resume-signal>
</task>

</tasks>

<verification>
- `npx next build` — builds without errors
- `npx vitest run --reporter=verbose` — all tests pass
- `grep -r "captureServerEvent" app/api/` — server-side events in enrichment route and webhook
- `grep -r "logAndCheckUsage" app/api/` — usage logged before execution
- `grep -r "checkFeatureAccess" app/api/` — gating checks in routes
- `grep "paywall_hit" app/api/v1/enrichment/stage1/route.ts` — SESS-05 event fires
</verification>

<success_criteria>
- Stage 1 enrichment endpoint demonstrates full flow: auth -> gating -> metering -> analytics -> enrichment
- SESS-05: paywall_hit event fires server-side when gating returns 403 or usage returns 429
- Stripe webhook fires subscription_started/subscription_cancelled to PostHog
- Server-side events fire for data pull start/complete (ANLYT-10)
- No PII in any PostHog event properties
- PostHog cohorts configured in dashboard (COHRT-01-05)
- PostHog funnels configured in dashboard (ANLYT-08)
- Feature flags infrastructure documented and dashboard flags created (ANLYT-11)
- Session recording rage click detection enabled (SESS-04)
- Paywall-without-upgrade session filter created in PostHog (SESS-05)
- All tests pass, build succeeds
- Phase 2B is blocked until Task 3 (PostHog dashboard config) is complete
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-06-SUMMARY.md`
</output>
