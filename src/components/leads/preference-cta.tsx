"use client";

import { useCallback, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import clsx from "clsx";
import { track } from "@/lib/analytics";
import {
  PreferenceSheet,
  type PreferenceOptions,
  type PreferencePrefill,
} from "./preference-sheet";

type Variant = "banner" | "link" | "nav" | "primary";

interface PreferenceCtaProps {
  variant: Variant;
  /** Where the trigger lives — recorded with the open event. */
  source: string;
  prefill?: PreferencePrefill;
  options?: PreferenceOptions;
  /** Overrides the default label (link / nav / primary). */
  children?: React.ReactNode;
  intro?: string;
  className?: string;
  /** Called after the sheet opens (e.g. to close the phone menu). */
  onOpen?: () => void;
}

/** Opens the "find me a car" sheet. One component, four looks. */
export function PreferenceCta({ variant, source, prefill, options, children, intro, className, onOpen }: PreferenceCtaProps) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const openSheet = () => {
    track("preference_open", { vehicleId: prefill?.referenceVehicleId, props: { source } });
    setOpen(true);
    onOpen?.();
  };

  // Sheet is keyed on open so each opening starts from the current prefill.
  const sheet = open ? (
    <PreferenceSheet open onClose={close} prefill={prefill} options={options} intro={intro} />
  ) : null;

  if (variant === "banner") {
    return (
      <>
        <div
          data-testid="preference-banner"
          className={clsx(
            "flex h-full flex-col justify-between gap-6 rounded-[28px] border border-teal/20 bg-teal/[0.05] p-6 sm:p-8",
            className,
          )}
        >
          <div>
            <Search aria-hidden className="size-7 text-teal" />
            <h3 className="mt-4 text-xl font-semibold tracking-tight sm:text-2xl">Can&apos;t find your car?</h3>
            <p className="mt-2 text-muted">Tell us what you want — we&apos;ll find it.</p>
          </div>
          <div>
            <button
              type="button"
              onClick={openSheet}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal px-6 text-sm font-semibold text-ink transition hover:bg-teal-soft"
            >
              {children ?? "Get a car found"} <ArrowRight aria-hidden className="size-4" />
            </button>
            <p className="mt-3 text-xs text-subtle">30 seconds, no spam.</p>
          </div>
        </div>
        {sheet}
      </>
    );
  }

  const styles: Record<Exclude<Variant, "banner">, string> = {
    link: "text-sm font-medium text-teal transition hover:text-teal-soft",
    nav: "transition-colors hover:text-fg",
    primary:
      "inline-flex h-13 items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-ink transition hover:bg-teal-soft",
  };

  return (
    <>
      <button type="button" onClick={openSheet} className={clsx(styles[variant], className)}>
        {children ?? "Get a car found"}
      </button>
      {sheet}
    </>
  );
}
