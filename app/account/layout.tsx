"use client";

import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { signOut } from "@/lib/auth-client";
import { TopNav } from "@/components/ui/top-nav";
import { BottomTabBar } from "@/components/ui/bottom-tab-bar";
import { SidebarLayout } from "@/components/ui/sidebar-layout";
import { UserMenuDropdown } from "@/components/ui/user-menu-dropdown";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Home, Settings } from "lucide-react";

type AccountLayoutProps = {
  children: React.ReactNode;
};

function SidebarNav() {
  const pathname = usePathname();

  const links = [
    { label: "Settings", href: "/account/settings", active: pathname === "/account/settings" },
    { label: "Deal History", href: "#", disabled: true },
    { label: "Usage", href: "#", disabled: true },
  ];

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.label}
          href={link.disabled ? "#" : link.href}
          aria-disabled={link.disabled}
          className={cn(
            "min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
            link.active
              ? "bg-muted text-foreground"
              : link.disabled
                ? "text-muted-foreground/50 pointer-events-none"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );
}

export default function AccountLayout({ children }: AccountLayoutProps) {
  const { user, isAuthenticated } = useAuth();
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
            Real Estate AI
          </Link>
        }
        items={[{ label: "Home", href: "/", active: false }]}
        userMenu={
          isAuthenticated && user ? (
            <UserMenuDropdown
              user={{ name: user.name, email: user.email, image: user.image }}
              onSignOut={handleSignOut}
              onSettings={handleSettings}
            />
          ) : null
        }
      />

      <div className="flex-1 px-4 py-8 md:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <SidebarLayout sidebar={<SidebarNav />}>
            <div className="max-w-[640px]">{children}</div>
          </SidebarLayout>
        </div>
      </div>

      <BottomTabBar
        items={[
          {
            label: "Home",
            href: "/",
            icon: <Home className="size-5" />,
            active: false,
          },
          {
            label: "Settings",
            href: "/account/settings",
            icon: <Settings className="size-5" />,
            active: true,
          },
        ]}
      />
    </div>
  );
}
