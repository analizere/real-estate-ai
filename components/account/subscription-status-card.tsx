"use client";

import { useState } from "react";
import { useSubscription } from "@/hooks/use-subscription";
import { useAuth } from "@/hooks/use-auth";
import { authClient } from "@/lib/auth-client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CancelSubscriptionDialog } from "@/components/account/cancel-subscription-dialog";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export function SubscriptionStatusCard() {
  const { status, isPro, isFree, isCancelled, isLoading, periodEnd } = useSubscription();
  const { user } = useAuth();
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  const handleUpgrade = () => {
    authClient.subscription.upgrade({
      plan: "pro",
      successUrl: window.location.origin + "/account/settings?upgraded=true",
      cancelUrl: window.location.origin + "/account/settings",
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-9 w-32" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Your Plan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isFree && (
            <>
              <Badge variant="secondary">Free</Badge>
              <p className="text-base text-muted-foreground">
                Free plan — unlimited manual analyses
              </p>
              <div className="space-y-2">
                <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
                <p className="text-sm text-muted-foreground">
                  Unlock automated public records, DADU feasibility, and rent estimates.
                </p>
              </div>
            </>
          )}

          {isPro && (
            <>
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                Pro
              </Badge>
              <p className="text-base text-muted-foreground">
                Pro plan — automated data pulls active
              </p>
              {periodEnd && (
                <p className="text-sm text-muted-foreground">
                  Renews on {dateFmt.format(periodEnd)}
                </p>
              )}
              <Button
                variant="ghost"
                className="text-destructive"
                onClick={() => setCancelDialogOpen(true)}
              >
                Cancel subscription
              </Button>
            </>
          )}

          {isCancelled && (
            <>
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200">
                Pro (Cancelled)
              </Badge>
              <p className="text-base text-muted-foreground">
                Pro plan cancelled — access continues until{" "}
                {periodEnd ? dateFmt.format(periodEnd) : "the end of your billing period"}
              </p>
              <Button onClick={handleUpgrade}>Upgrade to Pro</Button>
            </>
          )}
        </CardContent>
      </Card>

      <CancelSubscriptionDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        periodEnd={periodEnd}
      />
    </>
  );
}
