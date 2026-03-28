import { auth } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { trackSubscriptionStarted, trackSubscriptionCancelled } from "@/lib/services/posthog-events";

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

    // Clone the request before passing to auth.handler — body can only be read once.
    // We read the raw body for PostHog event wiring; auth.handler reads from the clone.
    const [requestForAuth, requestForParsing] = [request.clone(), request.clone()];

    // Delegate to Better Auth's internal handler.
    // The @better-auth/stripe plugin processes checkout.session.completed,
    // customer.subscription.updated, and customer.subscription.deleted events
    // and syncs subscription state to the database.
    const response = await auth.handler(requestForAuth);

    // Wire PostHog subscription events AFTER auth.handler succeeds (D-26/ANLYT-08).
    // Parse the Stripe event to determine event type and extract userId.
    // Per D-25/ANLYT-11: subscription events fire server-side to prevent ad blocker suppression.
    // Only fire on 200 responses — avoid duplicate events on retries.
    if (response.status === 200) {
      try {
        const rawBody = await requestForParsing.text();
        const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!);
        const event = stripeClient.webhooks.constructEvent(
          rawBody,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET!
        );

        // Extract the subscription and customer from the event
        if (
          event.type === "customer.subscription.created" ||
          (event.type === "customer.subscription.updated" &&
            (event.data.object as Stripe.Subscription).status === "active")
        ) {
          const subscription = event.data.object as Stripe.Subscription;
          // Better Auth uses customerId as the referenceId to look up users.
          // The customer metadata or the subscription's metadata contains the userId.
          // Better Auth stores userId in subscription.metadata.referenceId per plugin source.
          const userId =
            (subscription.metadata?.referenceId as string) ??
            (subscription.metadata?.userId as string) ??
            null;

          if (userId) {
            // Fire-and-forget — PostHog failure must never break the webhook response
            void trackSubscriptionStarted(userId, "pro", 9900).catch((err) => {
              console.error("PostHog trackSubscriptionStarted error:", err);
            });
          }
        } else if (
          event.type === "customer.subscription.deleted" ||
          (event.type === "customer.subscription.updated" &&
            (event.data.object as Stripe.Subscription).status === "canceled")
        ) {
          const subscription = event.data.object as Stripe.Subscription;
          const userId =
            (subscription.metadata?.referenceId as string) ??
            (subscription.metadata?.userId as string) ??
            null;

          if (userId) {
            void trackSubscriptionCancelled(userId).catch((err) => {
              console.error("PostHog trackSubscriptionCancelled error:", err);
            });
          }
        }
      } catch (posthogErr) {
        // PostHog wiring errors must never break the Stripe webhook response.
        // Log for monitoring but return the auth handler response regardless.
        console.error("PostHog Stripe webhook wiring error:", posthogErr);
      }
    }

    return response;
  } catch (error) {
    console.error("Stripe webhook error:", error);
    return NextResponse.json(
      { error: "webhook_failed", message: "Webhook processing failed." },
      { status: 500 }
    );
  }
}
