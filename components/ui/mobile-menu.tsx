"use client";

import { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

type MobileMenuItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
};

type MobileMenuProps = {
  items: MobileMenuItem[];
  isOpen: boolean;
  onClose: () => void;
  className?: string;
};

export function MobileMenu({ items, isOpen, onClose, className }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className={cn("fixed inset-0 z-50 md:hidden", className)}>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-in panel */}
      <div className="fixed inset-y-0 left-0 w-72 bg-background shadow-xl animate-in slide-in-from-left duration-200">
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <span className="text-sm font-semibold">Menu</span>
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-md hover:bg-muted transition-colors"
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="py-2">
          {items.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={onClose}
              className="flex items-center gap-3 min-h-[44px] px-4 text-sm text-foreground hover:bg-muted transition-colors"
            >
              {item.icon && <span className="text-muted-foreground">{item.icon}</span>}
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </div>
  );
}
