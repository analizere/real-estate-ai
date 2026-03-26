"use client";

import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

type UserMenuDropdownProps = {
  user: {
    name: string;
    email: string;
    image?: string | null;
  };
  onSignOut: () => void;
  onSettings: () => void;
  className?: string;
};

export function UserMenuDropdown({ user, onSignOut, onSettings, className }: UserMenuDropdownProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div ref={menuRef} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Avatar>
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 rounded-lg border bg-background shadow-lg z-50">
          <div className="px-4 py-3 border-b">
            <p className="text-sm font-medium">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onSettings();
                setOpen(false);
              }}
              className="w-full min-h-[44px] flex items-center px-4 text-sm text-foreground hover:bg-muted transition-colors"
            >
              Account settings
            </button>
            <button
              type="button"
              onClick={() => {
                onSignOut();
                setOpen(false);
              }}
              className="w-full min-h-[44px] flex items-center px-4 text-sm text-foreground hover:bg-muted transition-colors"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
