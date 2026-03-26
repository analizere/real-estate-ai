import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // Better Auth Stripe plugin provides billing portal via the API
  try {
    const result = await auth.api.createBillingPortal({
      body: {
        returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}/account/settings`,
      },
      headers: await headers(),
    });
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        error: "portal_failed",
        message: "Failed to create portal session.",
      },
      { status: 500 }
    );
  }
}
