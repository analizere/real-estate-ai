"use client";

import { cn } from "@/lib/utils";
import Link from "next/link";

type NavItem = {
  label: string;
  href: string;
  active?: boolean;
};

type TopNavProps = {
  logo: React.ReactNode;
  items: NavItem[];
  userMenu: React.ReactNode;
  className?: string;
};

export function TopNav({ logo, items, userMenu, className }: TopNavProps) {
  return (
    <nav
      className={cn(
        "hidden md:flex h-16 items-center justify-between border-b bg-background px-4 lg:px-8",
        className
      )}
    >
      <div className="flex items-center gap-6">
        <div className="shrink-0">{logo}</div>
        <div className="flex items-center gap-1">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "min-h-[44px] flex items-center px-3 rounded-md text-sm font-medium transition-colors hover:bg-muted",
                item.active
                  ? "text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>
      </div>
      <div className="flex items-center">{userMenu}</div>
    </nav>
  );
}
