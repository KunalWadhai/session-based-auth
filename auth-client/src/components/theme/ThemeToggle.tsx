"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  if (!mounted) {
    return (
      <div className="h-9 w-9 rounded-full" />
    );
  }

  const isDark = theme === "dark";

  return (
    <button
      onClick={() =>
        setTheme(isDark ? "light" : "dark")
      }
      className="
        glass
        flex
        h-9
        w-9
        items-center
        justify-center
        rounded-full
        transition
        hover:scale-105
      "
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun size={17} />
      ) : (
        <Moon size={17} />
      )}
    </button>
  );
}