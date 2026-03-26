import { cn } from "@/lib/utils";
import Link from "next/link";

type TabItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  active?: boolean;
};

type BottomTabBarProps = {
  items: TabItem[];
  className?: string;
};

export function BottomTabBar({ items, className }: BottomTabBarProps) {
  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 md:hidden border-t bg-background",
        className
      )}
    >
      <div className="flex items-center justify-around">
        {items.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-2 px-1 text-xs transition-colors",
              item.active
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <span className="mb-0.5">{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
