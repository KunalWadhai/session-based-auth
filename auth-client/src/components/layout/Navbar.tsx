"use client";

import Link from "next/link";

import ThemeToggle from "@/components/theme/ThemeToggle";
import UserMenu from "./UserMenu";

export default function Navbar() {
  return (
    <header className="border-b border-black/5 dark:border-white/5">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link
          href="/dashboard"
          className="font-semibold tracking-tight"
        >
          Auth<span className="text-muted">.</span>
        </Link>

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}