import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const plan = body.plan ?? "pro";
  const annual = body.annual ?? false;

  // Better Auth Stripe plugin handles checkout session creation
  // Client should use authClient.subscription.upgrade() instead of calling this directly
  // This endpoint exists for API-first compatibility (mobile app, browser plugin per API-03)
  try {
    const result = await auth.api.upgradeSubscription({
      body: {
        plan,
        annual,
        successUrl:
          body.successUrl ??
          `${process.env.NEXT_PUBLIC_APP_URL}/account/settings?upgraded=true`,
        cancelUrl:
          body.cancelUrl ??
          `${process.env.NEXT_PUBLIC_APP_URL}/account/settings`,
      },
      headers: await headers(),
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "checkout_failed",
        message: "Failed to create checkout session.",
      },
      { status: 500 }
    );
  }
}
