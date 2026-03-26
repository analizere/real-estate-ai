import { db } from "@/lib/db";
import { usageLog } from "@/lib/schema/usage-log";
import { eq, desc } from "drizzle-orm";

type LookupType = "public_records" | "rent_estimate" | "dadu_feasibility";

/**
 * Log a usage event BEFORE executing the paid API operation.
 * Returns the log entry ID so it can be updated after the operation completes.
 * Per STATE.md: "Every automated data lookup is recorded in a usage log
 * tied to the user account before the lookup executes."
 */
export async function logUsage(params: {
  userId: string;
  lookupType: LookupType;
  propertyAddress?: string;
}): Promise<string> {
  const result = await db
    .insert(usageLog)
    .values({
      userId: params.userId,
      lookupType: params.lookupType,
      propertyAddress: params.propertyAddress ?? null,
      status: "pending",
    })
    .returning({ id: usageLog.id });
  return result[0].id;
}

/**
 * Update usage log entry status after the operation completes.
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
 * Get usage log entries for a user (for the usage dashboard).
 */
export async function getUserUsage(userId: string, limit = 50) {
  return db
    .select()
    .from(usageLog)
    .where(eq(usageLog.userId, userId))
    .orderBy(desc(usageLog.createdAt))
    .limit(limit);
}
