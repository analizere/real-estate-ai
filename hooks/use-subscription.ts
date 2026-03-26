"use client";

import { authClient } from "@/lib/auth-client";
import { useState, useEffect } from "react";

type SubscriptionStatus = "free" | "active" | "trialing" | "cancelled" | "loading";

export function useSubscription() {
  const [status, setStatus] = useState<SubscriptionStatus>("loading");
  const [periodEnd, setPeriodEnd] = useState<Date | null>(null);

  useEffect(() => {
    async function fetchSubscription() {
      try {
        const result = await authClient.subscription.list();
        const activeSub = result.data?.find(
          (sub: { status: string }) => sub.status === "active" || sub.status === "trialing"
        );
        if (activeSub) {
          setStatus(activeSub.status as SubscriptionStatus);
          setPeriodEnd(activeSub.periodEnd ? new Date(activeSub.periodEnd) : null);
        } else {
          const cancelledSub = result.data?.find(
            (sub: { status: string }) => sub.status === "canceled"
          );
          if (cancelledSub) {
            setStatus("cancelled");
            setPeriodEnd(cancelledSub.periodEnd ? new Date(cancelledSub.periodEnd) : null);
          } else {
            setStatus("free");
          }
        }
      } catch {
        setStatus("free");
      }
    }
    fetchSubscription();
  }, []);

  return {
    status,
    isPro: status === "active" || status === "trialing",
    isFree: status === "free",
    isCancelled: status === "cancelled",
    isLoading: status === "loading",
    periodEnd,
  };
}
