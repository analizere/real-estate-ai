"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { SubscriptionStatusCard } from "@/components/account/subscription-status-card";
import { UsageMeterCard } from "@/components/ui/usage-meter";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

function AccountSettingsContent() {
  const { user, isLoading } = useAuth();
  const searchParams = useSearchParams();
  const [toastShown, setToastShown] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgraded") === "true" && !toastShown) {
      toast.success("Welcome to Pro! Automated data pulls are now active.");
      setToastShown(true);
    }
  }, [searchParams, toastShown]);

  const initials = user?.name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) ?? "";

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold leading-[1.2]">Account Settings</h1>
      <SubscriptionStatusCard />
      <UsageMeterCard />
      <Separator />
      <section className="space-y-4">
        <h2 className="text-base font-medium">Profile</h2>
        {isLoading ? (
          <div className="h-16 animate-pulse rounded-md bg-muted" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              {user.image && <AvatarImage src={user.image} alt={user.name} />}
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="space-y-1">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-sm text-muted-foreground">{user.email}</p>
              <Badge variant="secondary" className="text-xs">
                Signed in with Google
              </Badge>
            </div>
          </div>
        ) : null}
      </section>
      <Separator />
      <section className="space-y-3">
        <p className="text-sm text-muted-foreground/50">Notification preferences (coming soon)</p>
        <p className="text-sm text-muted-foreground/50">Delete account (coming soon)</p>
      </section>
    </div>
  );
}

export default function AccountSettingsPage() {
  return (
    <Suspense fallback={<div className="h-16 animate-pulse rounded-md bg-muted" />}>
      <AccountSettingsContent />
    </Suspense>
  );
}
