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
  if (!address || typeof address !== "string") {
    return NextResponse.json({ error: "address is required" }, { status: 400 })
  }

  // Step 3: Check feature access (per TIER-06: all components call gating service)
  const userTier = await getUserTier(auth.userId)
  const gateResult = await checkFeatureAccess(auth.userId, Feature.STAGE1_LOOKUP, userTier)
  if (!gateResult.allowed) {
    // SESS-05: Flag this session as "paywall hit without upgrade" for PostHog session analysis.
    // Fires a server-side event with a person property that PostHog can filter on.
    // PostHog dashboard: create saved filter for sessions containing 'paywall_hit' where
    // 'subscription_started' does NOT fire in the same session.
    await captureServerEvent({
      distinctId: auth.userId,
      event: "paywall_hit",
      properties: {
        feature: Feature.STAGE1_LOOKUP,
        reason: gateResult.reason,
        user_tier: userTier,
        $set: { last_paywall_hit_at: new Date().toISOString() }, // person property for cohort filtering
      },
    })
    return NextResponse.json(
      {
        error: "feature_gated",
        reason: gateResult.reason,
        action: gateResult.action,
        overageAvailable: gateResult.overageAvailable,
      },
      { status: 403 }
    )
  }

  // Step 4: Log usage BEFORE execution (D-12, Pitfall 5 from RESEARCH.md)
  // Logging before execution ensures cost accounting even if the operation fails.
  const usageResult = await logAndCheckUsage({
    userId: auth.userId,
    actionType: ActionType.ADDRESS_LOOKUP_STAGE1,
    apiProvider: "county_api",
    metadata: { address_hash: address.substring(0, 10) }, // no PII per ANLYT-03/D-24
    planAtTimeOfAction: userTier,
  })
  if (!usageResult.allowed) {
    // SESS-05: Also flag limit-reached as a paywall hit for session analysis
    await captureServerEvent({
      distinctId: auth.userId,
      event: "paywall_hit",
      properties: {
        feature: Feature.STAGE1_LOOKUP,
        reason: "LIMIT_REACHED",
        user_tier: userTier,
      },
    })
    return NextResponse.json(
      {
        error: "limit_reached",
        reason: usageResult.gatingResponse.reason,
        action: usageResult.gatingResponse.action,
      },
      { status: 429 }
    )
  }

  // Step 5: Fire server-side analytics event BEFORE execution (D-25/ANLYT-10)
  // Server-side to prevent ad blocker suppression of cost-critical data pull events.
  await captureServerEvent({
    distinctId: auth.userId,
    event: "stage1_data_pull_started",
    properties: { action_type: ActionType.ADDRESS_LOOKUP_STAGE1 }, // no PII
  })

  // Step 6: Execute enrichment
  try {
    const result = await enrichmentService.stage1Enrich(address)

    // Step 7: Update usage status after execution (D-12)
    if (usageResult.logId) {
      await updateUsageStatus(usageResult.logId, result.success ? "success" : "failed")
    }

    // Step 8: Fire completion event (D-25/ANLYT-10)
    await captureServerEvent({
      distinctId: auth.userId,
      event: "stage1_data_pull_completed",
      properties: {
        success: result.success,
        cache_hit: result.cache_hit,
        county_quality_tier: result.county_quality_tier,
        // Count populated fields without including any PII values
        fields_populated: result.success
          ? Object.keys(result).filter(
              (k) =>
                !["success", "property_id", "address_normalized", "cache_hit", "county_quality_tier", "error"].includes(k)
            ).length
          : 0,
      },
    })

    return NextResponse.json(result)
  } catch (error) {
    // Update usage as failed so cost accounting reflects actual outcome
    if (usageResult.logId) {
      await updateUsageStatus(usageResult.logId, "failed")
    }
    console.error("Stage 1 enrichment error:", error)
    return NextResponse.json({ error: "enrichment_failed" }, { status: 500 })
  }
}
