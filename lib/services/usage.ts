import { db } from "@/lib/db";
import { usageLog } from "@/lib/schema/usage-log";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import {
  ActionType,
  TIER_LIMITS,
  BETA_MODE,
  ACTION_COST_ESTIMATES,
  GatingResponse,
} from "@/lib/config/feature-tiers";

type UsageCheckResult = {
  logId: string | null;
  allowed: boolean;
  gatingResponse: GatingResponse;
};

/**
 * Map ActionType enum values to TIER_LIMITS keys (Feature enum values).
 *
 * TIER_LIMITS uses Feature enum values (e.g. 'stage2_lookup') as keys.
 * ActionType enum values differ (e.g. 'address_lookup_stage2').
 * This map resolves the correct limit key for each action type.
 */
const ACTION_TO_LIMIT_KEY: Partial<Record<ActionType, string>> = {
  [ActionType.ADDRESS_LOOKUP_STAGE1]: "stage1_lookup",
  [ActionType.ADDRESS_LOOKUP_STAGE2]: "stage2_lookup",
  [ActionType.RENT_ESTIMATE_REQUESTED]: "rent_estimate",
  [ActionType.RENT_ESTIMATE_REQUESTED_ADU]: "rent_estimate",
  [ActionType.DADU_FEASIBILITY_CHECKED]: "dadu_feasibility",
  [ActionType.COMPARABLE_SALES_PULLED]: "stage2_lookup", // counted against stage2 lookup budget
  [ActionType.SKIP_TRACE_REQUESTED]: "skip_trace",
  [ActionType.ANALYSIS_SAVED]: "save_analysis",
  [ActionType.ANALYSIS_EXPORTED_PDF]: "export_pdf",
  [ActionType.ANALYSIS_SHARED_LINK]: "share_link",
  [ActionType.LIST_CREATED]: "list_created",
  [ActionType.LIST_EXPORTED]: "export_pdf",
  [ActionType.DEAL_REPORT_GENERATED]: "stage1_lookup", // free action
  [ActionType.DEAL_REPORT_VIEWED]: "stage1_lookup", // free action
};

/**
 * Find the usage limit for an action type on a given plan tier.
 * Returns 'unlimited' or a numeric limit.
 * Defaults to 0 (blocked) if no mapping found.
 */
function findLimit(
  tierLimits: Record<string, number | "unlimited">,
  actionType: ActionType
): number | "unlimited" {
  const limitKey = ACTION_TO_LIMIT_KEY[actionType];
  if (limitKey && limitKey in tierLimits) return tierLimits[limitKey];
  // Direct match as fallback (in case action type key matches directly)
  if (actionType in tierLimits) return tierLimits[actionType];
  // Default: 0 (blocked) if no mapping found
  return 0;
}

/**
 * Check limit, then log usage BEFORE execution (D-12).
 * Returns whether the action is allowed and the log ID for status update.
 *
 * Per METER-10 / D-16: beta mode makes all checks pass while still logging.
 * Per D-14: each action type has independent limit tracking.
 * Per D-12: log is written before the action executes — enables cost accounting
 *           even if the action fails.
 */
export async function logAndCheckUsage(params: {
  userId: string;
  actionType: ActionType;
  costEstimateCents?: number;
  apiProvider?: string;
  propertyId?: string;
  metadata?: Record<string, unknown>;
  planAtTimeOfAction: "free" | "pro";
}): Promise<UsageCheckResult> {
  const costEstimate =
    params.costEstimateCents ?? ACTION_COST_ESTIMATES[params.actionType] ?? 0;
  const apiProvider = params.apiProvider ?? "internal";

  // 1. Check limit for this action type (per D-14: per-action-type independent limits)
  const currentCount = await getActionUsageCount(params.userId, params.actionType);
  const tierLimits = TIER_LIMITS[params.planAtTimeOfAction] ?? TIER_LIMITS.free;
  const limit = findLimit(tierLimits, params.actionType);

  const isUnderLimit = limit === "unlimited" || currentCount < (limit as number);
  const allowed = BETA_MODE || isUnderLimit; // D-16: beta mode overrides all limits

  if (!allowed) {
    return {
      logId: null,
      allowed: false,
      gatingResponse: {
        allowed: false,
        reason: "LIMIT_REACHED",
        action: params.actionType,
        overageAvailable: false,
      },
    };
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
      status: "pending",
    })
    .returning({ id: usageLog.id });

  return {
    logId: result[0].id,
    allowed: true,
    gatingResponse: {
      allowed: true,
      reason: null,
      action: params.actionType,
      overageAvailable: false,
    },
  };
}

/**
 * Update usage log entry status after execution completes.
 * Call with 'success' on completion, 'failed' on error.
 */
export async function updateUsageStatus(
  logId: string,
  status: "success" | "failed"
): Promise<void> {
  await db
    .update(usageLog)
    .set({ status })
    .where(eq(usageLog.id, logId));
}

/**
 * Get count of successful actions for a specific actionType in the current billing period.
 * Billing period = current calendar month (day 1 00:00:00 UTC to now).
 */
export async function getActionUsageCount(
  userId: string,
  actionType: ActionType
): Promise<number> {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const result = await db
    .select({ count: sql<number>`count(*)` })
    .from(usageLog)
    .where(
      and(
        eq(usageLog.userId, userId),
        eq(usageLog.actionType, actionType),
        eq(usageLog.status, "success"),
        gte(usageLog.createdAt, startOfMonth)
      )
    );

  return Number(result[0]?.count ?? 0);
}

type UsageSummaryItem = {
  actionType: string;
  used: number;
  limit: number | "unlimited";
  percentage: number; // 0-100, or 0 for unlimited
  isWarning: boolean; // >= 80%
  isExhausted: boolean; // >= 100%
};

/**
 * Get per-action-type usage summary for the current billing period.
 * Returns one entry per limit key in the tier config.
 * Used by the UsageMeter UI component and account settings page.
 */
export async function getUserUsageSummary(
  userId: string,
  plan: "free" | "pro"
): Promise<UsageSummaryItem[]> {
  const tierLimits = TIER_LIMITS[plan] ?? TIER_LIMITS.free;
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  // Batch query: get all action counts for this user in current month
  const counts = await db
    .select({
      actionType: usageLog.actionType,
      count: sql<number>`count(*)`,
    })
    .from(usageLog)
    .where(
      and(
        eq(usageLog.userId, userId),
        eq(usageLog.status, "success"),
        gte(usageLog.createdAt, startOfMonth)
      )
    )
    .groupBy(usageLog.actionType);

  // Aggregate counts by limit key (multiple action types may map to same limit)
  const limitKeyCountMap = new Map<string, number>();
  for (const row of counts) {
    const limitKey =
      ACTION_TO_LIMIT_KEY[row.actionType as ActionType] ?? row.actionType;
    const existing = limitKeyCountMap.get(limitKey) ?? 0;
    limitKeyCountMap.set(limitKey, existing + Number(row.count));
  }

  return Object.entries(tierLimits).map(([key, limit]) => {
    const used = limitKeyCountMap.get(key) ?? 0;
    const percentage =
      limit === "unlimited"
        ? 0
        : Math.min(100, Math.round((used / (limit as number)) * 100));
    return {
      actionType: key,
      used,
      limit,
      percentage,
      isWarning: limit !== "unlimited" && percentage >= 80,
      isExhausted: limit !== "unlimited" && percentage >= 100,
    };
  });
}

/**
 * Get recent usage log entries for a user (for usage history dashboard).
 * @deprecated Use getUserUsageSummary for summary data, this is for raw history only.
 */
export async function getUserUsage(userId: string, limit = 50) {
  return db
    .select()
    .from(usageLog)
    .where(eq(usageLog.userId, userId))
    .orderBy(desc(usageLog.createdAt))
    .limit(limit);
}
