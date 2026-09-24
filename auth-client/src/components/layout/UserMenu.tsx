"use client";

import { useState } from "react";
import { LogOut } from "lucide-react";

import { useUser } from "@/hooks/useUser";
import { useAuth } from "@/hooks/useAuth";

export default function UserMenu() {
  const { user } = useUser();
  const { logout } = useAuth();

  const [open, setOpen] =
    useState(false);

  if (!user) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="glass flex items-center gap-2 rounded-full px-3 py-1.5"
      >
        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-xs font-semibold text-black">
          {user.username
            .charAt(0)
            .toUpperCase()}
        </div>

        <span className="hidden text-sm sm:block">
          {user.username}
        </span>
      </button>

      {open && (
        <div className="glass absolute right-0 top-12 z-50 w-44 rounded-xl p-2">
          <button
            onClick={logout}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-white/5"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      )}
    </div>
  );
}