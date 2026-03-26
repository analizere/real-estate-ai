import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

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
