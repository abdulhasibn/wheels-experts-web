"use client";

import { Moon, Sun } from "lucide-react";
import clsx from "clsx";
import { setTheme, useTheme } from "@/lib/theme";

/**
 * `icon`: round icon button for the desktop nav.
 * `row`: full-width labelled row for the phone menu, where the top bar has no room.
 */
export function ThemeToggle({ variant = "icon", className }: { variant?: "icon" | "row"; className?: string }) {
  const theme = useTheme();
  const next = theme === "dark" ? "light" : "dark";
  const Icon = theme === "dark" ? Sun : Moon;

  if (variant === "row") {
    return (
      <button
        type="button"
        onClick={() => setTheme(next)}
        className={clsx(
          "flex h-12 w-full items-center justify-between rounded-xl px-4 text-left text-base text-muted transition hover:bg-edge/5 hover:text-fg",
          className,
        )}
      >
        {next === "light" ? "Light mode" : "Dark mode"}
        <Icon aria-hidden className="size-[1.1rem]" />
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className={clsx(
        "grid size-11 place-items-center rounded-full text-muted transition hover:bg-edge/5 hover:text-fg",
        className,
      )}
    >
      <Icon aria-hidden className="size-[1.1rem]" />
    </button>
  );
}
