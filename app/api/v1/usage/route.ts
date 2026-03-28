import { authenticateAndCheckTier } from "@/lib/services/gating";
import { getUserUsageSummary } from "@/lib/services/usage";
import { getUserTier } from "@/lib/services/gating";
import { NextResponse } from "next/server";

/**
 * GET /api/v1/usage
 *
 * Returns per-action usage summary for the authenticated user's current billing period.
 * Includes daysUntilReset (resets on 1st of next month).
 *
 * Used by useUsage() hook to power the UsageMeter component in Account Settings.
 * Auth required — returns 401 if unauthenticated.
 */
export async function GET() {
  const auth = await authenticateAndCheckTier();
  if (!auth.authorized) return auth.response;

  const tier = await getUserTier(auth.userId);
  const summary = await getUserUsageSummary(auth.userId, tier);

  // Calculate days until reset (first of next month)
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil(
    (nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return NextResponse.json({
    usage: summary,
    plan: tier,
    daysUntilReset,
    resetsAt: nextMonth.toISOString(),
  });
}
