import { auth } from "@/lib/auth";

/**
 * Get the subscription status for display in account settings.
 * Wraps the gating service for the billing context.
 */
export { getSubscriptionStatus } from "./gating";

/**
 * Cancel the active subscription for a user.
 * Uses Better Auth's Stripe plugin to cancel at period end.
 */
export async function cancelSubscription(userId: string): Promise<{
  success: boolean;
  periodEnd: string | null;
}> {
  try {
    const subscriptions = await auth.api.listActiveSubscriptions({
      query: { referenceId: userId },
    });
    const activeSub = subscriptions.find(
      (sub: { status: string }) =>
        sub.status === "active" || sub.status === "trialing"
    );
    if (!activeSub) {
      return { success: false, periodEnd: null };
    }
    await auth.api.cancelSubscription({
      body: { returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/settings` },
      query: { subscriptionId: activeSub.id },
    });
    return {
      success: true,
      periodEnd: activeSub.periodEnd
        ? new Date(activeSub.periodEnd).toISOString()
        : null,
    };
  } catch {
    return { success: false, periodEnd: null };
  }
}
