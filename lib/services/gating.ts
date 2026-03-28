import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { eq, and, gt, or, isNull } from "drizzle-orm";
import { Feature, FEATURE_TIER_CONFIG, GatingResponse } from "@/lib/config/feature-tiers";
import { featureOverrides } from "@/lib/schema/feature-overrides";

type GatingResult =
  | { authorized: true; userId: string; isPro: true }
  | { authorized: true; userId: string; isPro: false }
  | { authorized: false; response: NextResponse };

/**
 * Authenticate the request and check subscription status.
 * Returns the user ID and whether they are on the Pro tier.
 * If not authenticated, returns a 401 response.
 */
export async function authenticateAndCheckTier(): Promise<GatingResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: "unauthorized", message: "Authentication required." },
        { status: 401 }
      ),
    };
  }

  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: session.user.id },
  });
  const isPro = subscriptions.some(
    (sub: { status: string }) =>
      sub.status === "active" || sub.status === "trialing"
  );

  if (isPro) {
    return { authorized: true, userId: session.user.id, isPro: true };
  }
  return { authorized: true, userId: session.user.id, isPro: false };
}

/**
 * Require Pro tier. Returns 402 with structured upgrade prompt for free-tier users.
 * Returns the userId if authorized and on Pro tier.
 */
export async function requirePro(): Promise<
  | { authorized: true; userId: string }
  | { authorized: false; response: NextResponse }
> {
  const result = await authenticateAndCheckTier();
  if (!result.authorized) return result;
  if (!result.isPro) {
    return {
      authorized: false,
      response: NextResponse.json(
        {
          error: "upgrade_required",
          message: "This feature requires a Pro subscription.",
          upgradeUrl: "/account/settings",
        },
        { status: 402 }
      ),
    };
  }
  return { authorized: true, userId: result.userId };
}

/**
 * Get subscription status for a user. Returns tier info for display.
 */
export async function getSubscriptionStatus(userId: string): Promise<{
  tier: "free" | "pro" | "cancelled";
  periodEnd: string | null;
  cancelAtPeriodEnd: boolean;
}> {
  const subscriptions = await auth.api.listActiveSubscriptions({
    query: { referenceId: userId },
  });
  const activeSub = subscriptions.find(
    (sub: { status: string }) =>
      sub.status === "active" || sub.status === "trialing"
  );
  if (activeSub) {
    return {
      tier: "pro",
      periodEnd: activeSub.periodEnd
        ? new Date(activeSub.periodEnd).toISOString()
        : null,
      cancelAtPeriodEnd: activeSub.cancelAtPeriodEnd ?? false,
    };
  }
  // Check for cancelled but still active until period end
  const cancelledSub = subscriptions.find(
    (sub: { status: string }) => sub.status === "canceled"
  );
  if (cancelledSub) {
    return {
      tier: "cancelled",
      periodEnd: cancelledSub.periodEnd
        ? new Date(cancelledSub.periodEnd).toISOString()
        : null,
      cancelAtPeriodEnd: true,
    };
  }
  return { tier: "free", periodEnd: null, cancelAtPeriodEnd: false };
}

// ---------------------------------------------------------------------------
// Hybrid 3-tier GatingService with database override support
// ---------------------------------------------------------------------------

// In-memory cache: Map<`${userId}:${feature}`, { response: GatingResponse, expiresAt: number }>
// TTL: 5 minutes per D-06
const gatingCache = new Map<string, { response: GatingResponse; expiresAt: number }>();
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes per D-06

/**
 * Check whether a user can access a feature.
 * // Precedence: user-level override > global override > config file (D-02)
 *
 * Tier definitions (D-09):
 *   Tier 1 — always free: accessible to all users
 *   Tier 2 — preview free: data visible to all, actions gated at call site
 *   Tier 3 — Pro only: blocked for free-tier users without an override
 *
 * overageAvailable is always false in MVP (D-08).
 */
export async function checkFeatureAccess(
  userId: string,
  feature: Feature,
  userTier: "free" | "pro"
): Promise<GatingResponse> {
  // 1. Check cache first (D-06)
  const cacheKey = `${userId}:${feature}`;
  const cached = gatingCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) return cached.response;

  // 2. Get base tier from config
  const baseTier = FEATURE_TIER_CONFIG[feature];

  // 3. Check for user-level override (highest priority per D-02)
  const now = new Date();
  const userOverride = await db
    .select()
    .from(featureOverrides)
    .where(
      and(
        eq(featureOverrides.userId, userId),
        eq(featureOverrides.feature, feature),
        eq(featureOverrides.isActive, true),
        eq(featureOverrides.scope, "user"),
        or(isNull(featureOverrides.expiresAt), gt(featureOverrides.expiresAt, now))
      )
    )
    .limit(1);

  if (userOverride.length > 0) {
    const response: GatingResponse = {
      allowed: true,
      reason: "OVERRIDE",
      action: feature,
      overageAvailable: false,
    };
    gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS });
    return response;
  }

  // 4. Check for global override (second priority per D-02)
  const globalOverride = await db
    .select()
    .from(featureOverrides)
    .where(
      and(
        eq(featureOverrides.feature, feature),
        eq(featureOverrides.isActive, true),
        eq(featureOverrides.scope, "global"),
        or(isNull(featureOverrides.expiresAt), gt(featureOverrides.expiresAt, now))
      )
    )
    .limit(1);

  if (globalOverride.length > 0) {
    const response: GatingResponse = {
      allowed: true,
      reason: "OVERRIDE",
      action: feature,
      overageAvailable: false,
    };
    gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS });
    return response;
  }

  // 5. Evaluate against base tier config (lowest priority per D-02)
  // Tier 1 and Tier 2: always allowed (Tier 2 = preview free — show data, gate action at call site per D-10)
  // Tier 3: requires pro subscription
  const userTierLevel = userTier === "pro" ? 3 : 1;
  const effectiveAllowed = baseTier <= 2 ? true : userTierLevel >= baseTier;

  const response: GatingResponse = {
    allowed: effectiveAllowed,
    reason: effectiveAllowed ? null : "TIER_REQUIRED",
    action: feature,
    overageAvailable: false, // always false in MVP per D-08
  };
  gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS });
  return response;
}

/**
 * Invalidate gating cache for a specific user.
 * Call this when an override is created, modified, or expires.
 */
export function invalidateGatingCache(userId: string): void {
  for (const key of gatingCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      gatingCache.delete(key);
    }
  }
}

/**
 * Get user's current tier from subscription status.
 * Returns 'pro' for active/trialing subscriptions, 'free' otherwise.
 */
export async function getUserTier(userId: string): Promise<"free" | "pro"> {
  const status = await getSubscriptionStatus(userId);
  return status.tier === "pro" ? "pro" : "free";
}
