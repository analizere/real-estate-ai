"use client";

import { cn } from "@/lib/utils";

type SidebarLayoutProps = {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};

export function SidebarLayout({ sidebar, children, className }: SidebarLayoutProps) {
  return (
    <div className={cn("flex flex-col md:flex-row gap-6", className)}>
      <aside className="w-full md:w-60 md:shrink-0">
        <div className="flex overflow-x-auto md:flex-col md:overflow-x-visible gap-1">
          {sidebar}
        </div>
      </aside>
      <div className="flex-1 min-w-0">
        {children}
      </div>
    </div>
  );
}
