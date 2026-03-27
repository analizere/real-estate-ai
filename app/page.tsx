"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth-client";
import { TopNav } from "@/components/ui/top-nav";
import { BottomTabBar } from "@/components/ui/bottom-tab-bar";
import { PageWrapper } from "@/components/ui/page-wrapper";
import { UserMenuDropdown } from "@/components/ui/user-menu-dropdown";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    router.push("/sign-in");
  };

  const handleSettings = () => {
    router.push("/account/settings");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopNav
        logo={
          <Link href="/" className="text-xl font-bold tracking-tight text-[#006aff]">
            REvested
          </Link>
        }
        items={[{ label: "Home", href: "/", active: true }]}
        userMenu={
          isAuthenticated && user ? (
            <UserMenuDropdown
              user={{ name: user.name, email: user.email, image: user.image }}
              onSignOut={handleSignOut}
              onSettings={handleSettings}
            />
          ) : (
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
          )
        }
      />

      <PageWrapper className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-muted border-t-foreground" />
          </div>
        ) : isAuthenticated && user ? (
          <div className="space-y-4 py-8">
            <h1 className="text-2xl font-semibold leading-[1.2]">
              Welcome back, {user.name}
            </h1>
            <p className="text-base text-muted-foreground">
              Your dashboard is coming in Phase 2.
            </p>
            <Button variant="outline" asChild>
              <Link href="/account/settings">Account Settings</Link>
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <h1 className="text-[28px] font-semibold leading-[1.15]">
              Analyze any deal in 60 seconds.
            </h1>
            <p className="mt-4 max-w-md text-base text-muted-foreground">
              Enter any address and get a complete investment analysis — public records,
              DADU/ADU feasibility, and rent estimates — without manual research.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild>
                <Link href="/sign-up">Create account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/sign-in">Sign in</Link>
              </Button>
            </div>
          </div>
        )}
      </PageWrapper>

      <BottomTabBar
        items={[
          {
            label: "Home",
            href: "/",
            icon: <Home className="size-5" />,
            active: true,
          },
        ]}
      />
    </div>
  );
}
