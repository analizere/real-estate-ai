import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Validate Stripe signature header is present before delegating
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "missing_signature", message: "Missing Stripe signature header." },
        { status: 400 }
      );
    }

    // Delegate to Better Auth's internal handler.
    // The @better-auth/stripe plugin processes checkout.session.completed,
    // customer.subscription.updated, and customer.subscription.deleted events
    // and syncs subscription state to the database.
    const response = await auth.handler(request);
    return response;
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "webhook_failed", message: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
