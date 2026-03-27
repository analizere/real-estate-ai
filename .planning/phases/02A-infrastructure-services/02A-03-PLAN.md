---
phase: 02A-infrastructure-services
plan: 03
type: execute
wave: 2
depends_on: [02A-01]
files_modified:
  - lib/services/gating.ts
  - lib/services/usage.ts
  - tests/unit/gating.test.ts
  - tests/unit/metering.test.ts
autonomous: true
requirements: [TIER-04, TIER-06, METER-01, METER-02, METER-04, METER-05, METER-08, METER-10]

must_haves:
  truths:
    - "checkFeatureAccess() resolves tier via precedence: user override > global override > config"
    - "logAndCheckUsage() logs BEFORE execution and returns whether action is allowed"
    - "Beta mode (BETA_MODE=true) makes all limit checks pass while still logging"
    - "Each action type has independent limit tracking — one exhausted limit does not block others"
    - "GatingService response includes overageAvailable=false"
  artifacts:
    - path: "lib/services/gating.ts"
      provides: "Hybrid 3-tier GatingService with override lookup and caching"
      exports: ["authenticateAndCheckTier", "requirePro", "getSubscriptionStatus", "checkFeatureAccess", "getUserTier"]
    - path: "lib/services/usage.ts"
      provides: "Full METER-01 metering with per-action limits"
      exports: ["logAndCheckUsage", "updateUsageStatus", "getUserUsageSummary", "getActionUsageCount"]
  key_links:
    - from: "lib/services/gating.ts"
      to: "lib/config/feature-tiers.ts"
      via: "Feature enum + FEATURE_TIER_CONFIG import"
      pattern: "import.*Feature.*FEATURE_TIER_CONFIG.*from.*feature-tiers"
    - from: "lib/services/gating.ts"
      to: "lib/schema/feature-overrides.ts"
      via: "featureOverrides table query"
      pattern: "featureOverrides"
    - from: "lib/services/usage.ts"
      to: "lib/config/feature-tiers.ts"
      via: "ActionType + TIER_LIMITS + BETA_MODE import"
      pattern: "import.*ActionType.*TIER_LIMITS.*BETA_MODE.*from.*feature-tiers"
    - from: "lib/services/usage.ts"
      to: "lib/schema/usage-log.ts"
      via: "usageLog table insert/query"
      pattern: "usageLog"
---

<objective>
Evolve the existing binary gating service into a hybrid 3-tier GatingService with database override support, and evolve the usage service into the full METER-01 spec with per-action-type independent limit tracking and beta mode.

Purpose: Every API route in 2B/2C calls these services to check access and log usage before executing. Without these, no feature can be properly gated or metered.
Output: Evolved `lib/services/gating.ts`, evolved `lib/services/usage.ts`, comprehensive tests for both.
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
@.planning/phases/02A-infrastructure-services/02A-01-SUMMARY.md

<interfaces>
<!-- From Plan 01 — feature-tiers.ts exports -->
From lib/config/feature-tiers.ts:
```typescript
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
export const FEATURE_TIER_CONFIG: Record<Feature, 1 | 2 | 3>;
export const TIER_LIMITS: Record<'free' | 'pro', Record<string, number | 'unlimited'>>;
export enum ActionType { ... }
export const ACTION_COST_ESTIMATES: Record<ActionType, number>;
export const BETA_MODE: boolean;
export type GatingResponse = {
  allowed: boolean;
  reason: 'LIMIT_REACHED' | 'TIER_REQUIRED' | 'OVERRIDE' | null;
  action: string;
  overageAvailable: boolean;
};
```

From lib/schema/feature-overrides.ts:
```typescript
export const featureOverrides = pgTable("feature_overrides", { ... });
// Columns: id, scope, userId, cohortId, feature, tierOverride, isActive, expiresAt, grantedBy, reason, metadata, createdAt, updatedAt
```

From lib/schema/usage-log.ts (evolved):
```typescript
export const usageLog = pgTable("usage_log", {
  id, userId, actionType, costEstimateCents, apiProvider, propertyId, metadata, planAtTimeOfAction, status, propertyAddress, createdAt
});
```

From lib/services/gating.ts (current — to evolve):
```typescript
export async function authenticateAndCheckTier(): Promise<GatingResult>;
export async function requirePro(): Promise<...>;
export async function getSubscriptionStatus(userId: string): Promise<...>;
```

From lib/services/usage.ts (current — to evolve):
```typescript
export async function logUsage(params: { userId, lookupType, propertyAddress }): Promise<string>;
export async function updateUsageStatus(logId, status): Promise<void>;
export async function getUserUsage(userId, limit): Promise<...>;
```
</interfaces>
</context>

<tasks>

<task type="auto" tdd="true">
  <name>Task 1: Evolve GatingService to hybrid 3-tier with overrides</name>
  <files>lib/services/gating.ts, tests/unit/gating.test.ts</files>
  <read_first>
    - lib/services/gating.ts (current binary gating — must preserve authenticateAndCheckTier, requirePro, getSubscriptionStatus while adding checkFeatureAccess)
    - lib/config/feature-tiers.ts (Feature enum, FEATURE_TIER_CONFIG — created in Plan 01)
    - lib/schema/feature-overrides.ts (featureOverrides table — created in Plan 01)
    - lib/db.ts (database connection pattern)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-01 through D-11)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pattern 1: Hybrid GatingService, Pitfall 4)
  </read_first>
  <behavior>
    - Test: checkFeatureAccess returns { allowed: true, reason: null, action: feature, overageAvailable: false } for Tier 1 features regardless of user tier
    - Test: checkFeatureAccess returns { allowed: false, reason: 'TIER_REQUIRED', action: feature, overageAvailable: false } for Tier 3 features when user is free tier
    - Test: checkFeatureAccess returns { allowed: true } for Tier 3 features when user is pro tier
    - Test: Tier 2 features return allowed: true for both free and pro users (preview — gate the action, not visibility)
    - Test: User-level override (scope='user') upgrades a free user's feature to tier 1 (allowed)
    - Test: Global override (scope='global') applies when no user override exists
    - Test: User override takes precedence over global override (D-02)
    - Test: Expired overrides (expiresAt < now) are ignored
    - Test: Inactive overrides (isActive=false) are ignored
    - Test: overageAvailable is always false in response (D-08)
    - Test: getUserTier returns 'free' or 'pro' based on subscription status
  </behavior>
  <action>
Evolve `lib/services/gating.ts`:

KEEP existing functions unchanged: `authenticateAndCheckTier()`, `requirePro()`, `getSubscriptionStatus()` — these are used by existing Phase 1 routes.

ADD new function `checkFeatureAccess()`:
```typescript
import { Feature, FEATURE_TIER_CONFIG, GatingResponse } from '@/lib/config/feature-tiers'
import { featureOverrides } from '@/lib/schema/feature-overrides'
import { db } from '@/lib/db'
import { eq, and, gt, or, isNull } from 'drizzle-orm'

// In-memory cache: Map<string, { response: GatingResponse, expiresAt: number }>
// Key: `${userId}:${feature}`, TTL: 5 minutes per D-06
const gatingCache = new Map<string, { response: GatingResponse; expiresAt: number }>()
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 minutes per D-06

export async function checkFeatureAccess(
  userId: string,
  feature: Feature,
  userTier: 'free' | 'pro'
): Promise<GatingResponse> {
  // 1. Check cache first
  const cacheKey = `${userId}:${feature}`
  const cached = gatingCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) return cached.response

  // 2. Get base tier from config
  const baseTier = FEATURE_TIER_CONFIG[feature]

  // 3. Check for user-level override (highest priority per D-02)
  const now = new Date()
  const userOverride = await db.select()
    .from(featureOverrides)
    .where(and(
      eq(featureOverrides.userId, userId),
      eq(featureOverrides.feature, feature),
      eq(featureOverrides.isActive, true),
      eq(featureOverrides.scope, 'user'),
      or(isNull(featureOverrides.expiresAt), gt(featureOverrides.expiresAt, now))
    ))
    .limit(1)

  if (userOverride.length > 0) {
    const response: GatingResponse = {
      allowed: true,
      reason: 'OVERRIDE',
      action: feature,
      overageAvailable: false,
    }
    gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS })
    return response
  }

  // 4. Check for global override (second priority per D-02)
  const globalOverride = await db.select()
    .from(featureOverrides)
    .where(and(
      eq(featureOverrides.feature, feature),
      eq(featureOverrides.isActive, true),
      eq(featureOverrides.scope, 'global'),
      or(isNull(featureOverrides.expiresAt), gt(featureOverrides.expiresAt, now))
    ))
    .limit(1)

  if (globalOverride.length > 0) {
    const response: GatingResponse = {
      allowed: true,
      reason: 'OVERRIDE',
      action: feature,
      overageAvailable: false,
    }
    gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS })
    return response
  }

  // 5. Evaluate against base tier config (lowest priority per D-02)
  // Tier mapping: free user has tier 1 access, pro user has tier 3 access
  // Tier 2 features are visible to all (preview free per D-10) — allowed for display, gated at action level
  const userTierLevel = userTier === 'pro' ? 3 : 1
  // Tier 2 = preview free. checkFeatureAccess returns allowed: true for Tier 2 for ALL users.
  // The action-level gating (save, export, include in analysis) is separate per D-10 / TIER-04.
  const effectiveTier = baseTier <= 2 ? true : userTierLevel >= baseTier

  const response: GatingResponse = {
    allowed: effectiveTier,
    reason: effectiveTier ? null : 'TIER_REQUIRED',
    action: feature,
    overageAvailable: false, // always false in MVP per D-08
  }
  gatingCache.set(cacheKey, { response, expiresAt: Date.now() + CACHE_TTL_MS })
  return response
}

/**
 * Invalidate gating cache for a specific user.
 * Call this when an override is created/modified/expired.
 */
export function invalidateGatingCache(userId: string): void {
  for (const key of gatingCache.keys()) {
    if (key.startsWith(`${userId}:`)) {
      gatingCache.delete(key)
    }
  }
}

/**
 * Get user's current tier from subscription status.
 */
export async function getUserTier(userId: string): Promise<'free' | 'pro'> {
  const status = await getSubscriptionStatus(userId)
  return status.tier === 'pro' ? 'pro' : 'free'
}
```

Add clear code comment at the top of `checkFeatureAccess`: "// Precedence: user-level override > global override > config file (D-02)"

Create `tests/unit/gating.test.ts` that mocks db queries and tests all behaviors. Use vitest mocking to mock `@/lib/db` and test the logic of override precedence, cache behavior, tier evaluation.
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/gating.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - lib/services/gating.ts contains `export async function checkFeatureAccess(`
    - lib/services/gating.ts contains `export function invalidateGatingCache(`
    - lib/services/gating.ts contains `export async function getUserTier(`
    - lib/services/gating.ts contains `// Precedence: user-level override > global override > config file`
    - lib/services/gating.ts contains `overageAvailable: false`
    - lib/services/gating.ts contains `CACHE_TTL_MS = 5 * 60 * 1000`
    - lib/services/gating.ts still contains `export async function authenticateAndCheckTier(` (preserved)
    - lib/services/gating.ts still contains `export async function requirePro(` (preserved)
    - lib/services/gating.ts still contains `export async function getSubscriptionStatus(` (preserved)
    - tests/unit/gating.test.ts exits 0
  </acceptance_criteria>
  <done>GatingService evolved to hybrid 3-tier with user/global override lookup, 5-minute cache with invalidation, and backward-compatible existing functions. All tests pass.</done>
</task>

<task type="auto" tdd="true">
  <name>Task 2: Evolve usage service to full METER-01 spec with per-action limits</name>
  <files>lib/services/usage.ts, tests/unit/metering.test.ts</files>
  <read_first>
    - lib/services/usage.ts (current usage service — must preserve updateUsageStatus while evolving logUsage and getUserUsage)
    - lib/schema/usage-log.ts (evolved schema from Plan 01)
    - lib/config/feature-tiers.ts (ActionType, TIER_LIMITS, BETA_MODE, ACTION_COST_ESTIMATES — from Plan 01)
    - lib/db.ts (database connection)
    - .planning/phases/02A-infrastructure-services/02A-CONTEXT.md (D-12 through D-17)
    - .planning/phases/02A-infrastructure-services/02A-RESEARCH.md (Pattern 2: Pre-execution Metering)
  </read_first>
  <behavior>
    - Test: logAndCheckUsage logs to usage_log table BEFORE returning
    - Test: logAndCheckUsage returns { logId, allowed: true, gatingResponse } when under limit
    - Test: logAndCheckUsage returns { logId: null, allowed: false, gatingResponse.reason: 'LIMIT_REACHED' } when at 100% limit
    - Test: When BETA_MODE is true, logAndCheckUsage always returns allowed: true even when over limit
    - Test: getActionUsageCount returns count of successful actions for a specific actionType in current billing period
    - Test: getUserUsageSummary returns per-action-type breakdown with used/limit/percentage
    - Test: Per-action-type independence: exhausting 'skip_trace' limit does not affect 'stage2_lookup' allowed status
    - Test: 'unlimited' limit always returns allowed: true
    - Test: updateUsageStatus updates the status column to 'success' or 'failed'
  </behavior>
  <action>
Evolve `lib/services/usage.ts`:

REPLACE `logUsage` with `logAndCheckUsage`. KEEP `updateUsageStatus`. REPLACE `getUserUsage` with `getUserUsageSummary` and `getActionUsageCount`.

```typescript
import { db } from "@/lib/db"
import { usageLog } from "@/lib/schema/usage-log"
import { eq, and, gte, sql, desc } from "drizzle-orm"
import { ActionType, TIER_LIMITS, BETA_MODE, ACTION_COST_ESTIMATES, GatingResponse } from "@/lib/config/feature-tiers"

type UsageCheckResult = {
  logId: string | null
  allowed: boolean
  gatingResponse: GatingResponse
}

/**
 * Check limit, then log usage BEFORE execution (D-12).
 * Returns whether the action is allowed and the log ID for status update.
 * Per METER-10 / D-16: beta mode makes all checks pass while still logging.
 */
export async function logAndCheckUsage(params: {
  userId: string
  actionType: ActionType
  costEstimateCents?: number
  apiProvider?: string
  propertyId?: string
  metadata?: Record<string, unknown>
  planAtTimeOfAction: 'free' | 'pro'
}): Promise<UsageCheckResult> {
  const costEstimate = params.costEstimateCents ?? ACTION_COST_ESTIMATES[params.actionType] ?? 0
  const apiProvider = params.apiProvider ?? 'internal'

  // 1. Check limit for this action type (per D-14: action-level independent limits)
  const currentCount = await getActionUsageCount(params.userId, params.actionType)
  const limitKey = params.actionType.replace('_requested', '').replace('_checked', '')
  const tierLimits = TIER_LIMITS[params.planAtTimeOfAction] ?? TIER_LIMITS.free
  // Find best matching limit key
  const limit = findLimit(tierLimits, params.actionType)

  const isUnderLimit = limit === 'unlimited' || currentCount < (limit as number)
  const allowed = BETA_MODE || isUnderLimit // D-16: beta mode overrides

  if (!allowed) {
    return {
      logId: null,
      allowed: false,
      gatingResponse: {
        allowed: false,
        reason: 'LIMIT_REACHED',
        action: params.actionType,
        overageAvailable: false,
      },
    }
  }

  // 2. Log BEFORE execution (D-12)
  const result = await db
    .insert(usageLog)
    .values({
      userId: params.userId,
      actionType: params.actionType,
      costEstimateCents: costEstimate,
      apiProvider: apiProvider,
      propertyId: params.propertyId ?? null,
      metadata: params.metadata ?? null,
      planAtTimeOfAction: params.planAtTimeOfAction,
      status: 'pending',
    })
    .returning({ id: usageLog.id })

  return {
    logId: result[0].id,
    allowed: true,
    gatingResponse: {
      allowed: true,
      reason: null,
      action: params.actionType,
      overageAvailable: false,
    },
  }
}

// Helper to find the limit for an action type from the tier limits config
function findLimit(
  tierLimits: Record<string, number | 'unlimited'>,
  actionType: ActionType
): number | 'unlimited' {
  // Direct match first
  if (actionType in tierLimits) return tierLimits[actionType]
  // Try without suffix
  const simplified = actionType.replace('_requested', '').replace('_checked', '').replace('_pulled', '')
  if (simplified in tierLimits) return tierLimits[simplified]
  // Default: 0 (blocked)
  return 0
}

/**
 * Update usage log entry status after execution completes.
 */
export async function updateUsageStatus(
  logId: string,
  status: "success" | "failed"
): Promise<void> {
  await db
    .update(usageLog)
    .set({ status })
    .where(eq(usageLog.id, logId))
}

/**
 * Get count of successful actions for a specific actionType in current billing period (current calendar month).
 */
export async function getActionUsageCount(
  userId: string,
  actionType: ActionType
): Promise<number> {
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(usageLog)
    .where(and(
      eq(usageLog.userId, userId),
      eq(usageLog.actionType, actionType),
      eq(usageLog.status, 'success'),
      gte(usageLog.createdAt, startOfMonth)
    ))

  return Number(result[0]?.count ?? 0)
}

type UsageSummaryItem = {
  actionType: string
  used: number
  limit: number | 'unlimited'
  percentage: number // 0-100, or 0 for unlimited
  isWarning: boolean // >= 80%
  isExhausted: boolean // >= 100%
}

/**
 * Get per-action-type usage summary for the current billing period.
 * Used by the UsageMeter UI component.
 */
export async function getUserUsageSummary(
  userId: string,
  plan: 'free' | 'pro'
): Promise<UsageSummaryItem[]> {
  const tierLimits = TIER_LIMITS[plan] ?? TIER_LIMITS.free
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)

  const counts = await db
    .select({
      actionType: usageLog.actionType,
      count: sql<number>`count(*)`,
    })
    .from(usageLog)
    .where(and(
      eq(usageLog.userId, userId),
      eq(usageLog.status, 'success'),
      gte(usageLog.createdAt, startOfMonth)
    ))
    .groupBy(usageLog.actionType)

  const countMap = new Map(counts.map(c => [c.actionType, Number(c.count)]))

  return Object.entries(tierLimits).map(([key, limit]) => {
    const used = countMap.get(key) ?? 0
    const percentage = limit === 'unlimited' ? 0 : Math.min(100, Math.round((used / (limit as number)) * 100))
    return {
      actionType: key,
      used,
      limit,
      percentage,
      isWarning: limit !== 'unlimited' && percentage >= 80,
      isExhausted: limit !== 'unlimited' && percentage >= 100,
    }
  })
}
```

Create `tests/unit/metering.test.ts` that mocks db and tests all behaviors above.
  </action>
  <verify>
    <automated>cd /Users/sticky_iqqy_iqqy/real-estate-ai && npx vitest run tests/unit/metering.test.ts --reporter=verbose</automated>
  </verify>
  <acceptance_criteria>
    - lib/services/usage.ts contains `export async function logAndCheckUsage(`
    - lib/services/usage.ts contains `export async function updateUsageStatus(`
    - lib/services/usage.ts contains `export async function getActionUsageCount(`
    - lib/services/usage.ts contains `export async function getUserUsageSummary(`
    - lib/services/usage.ts contains `BETA_MODE` (imported and used)
    - lib/services/usage.ts contains `status: 'pending'` (logged before execution)
    - lib/services/usage.ts contains `reason: 'LIMIT_REACHED'`
    - lib/services/usage.ts contains `overageAvailable: false`
    - lib/services/usage.ts does NOT contain `export async function logUsage(` (replaced)
    - lib/services/usage.ts does NOT contain `lookupType` (renamed to actionType)
    - tests/unit/metering.test.ts exits 0
  </acceptance_criteria>
  <done>Usage service evolved to full METER-01 spec with logAndCheckUsage (pre-execution), per-action-type independent limits, beta mode override, and usage summary for UI. All tests pass.</done>
</task>

</tasks>

<verification>
- `npx vitest run tests/unit/gating.test.ts tests/unit/metering.test.ts --reporter=verbose` — all tests pass
- `grep -c "overageAvailable" lib/services/gating.ts lib/services/usage.ts` — present in both
- `grep "BETA_MODE" lib/services/usage.ts` — beta mode used in limit check
</verification>

<success_criteria>
- checkFeatureAccess evaluates tier with override precedence (user > global > config)
- 5-minute gating cache with invalidation on override change
- logAndCheckUsage checks limit and logs BEFORE execution, returns logId + allowed
- Beta mode makes all limit checks pass while still logging
- Per-action-type independent limits (exhausting one does not affect others)
- getUserUsageSummary returns per-action breakdown with used/limit/percentage/isWarning/isExhausted
- All existing Phase 1 gating functions preserved (authenticateAndCheckTier, requirePro, getSubscriptionStatus)
</success_criteria>

<output>
After completion, create `.planning/phases/02A-infrastructure-services/02A-03-SUMMARY.md`
</output>
