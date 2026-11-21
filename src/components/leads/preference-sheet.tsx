"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Loader2, X } from "lucide-react";
import clsx from "clsx";
import { ApiError, requestPreferences } from "@/lib/api";
import { getAttribution, track } from "@/lib/analytics";
import { formatPrice, label, parseMobile } from "@/lib/format";

const field =
  "w-full rounded-2xl border border-edge/10 bg-ink/60 px-4 py-3.5 text-base text-fg placeholder:text-subtle outline-none transition focus:border-teal/60 focus:ring-4 focus:ring-teal/10 aria-[invalid=true]:border-red-400/60";

/** Same range as the home-page match slider. */
const BUDGET_MIN = 4;
const BUDGET_MAX = 25;
const BUDGET_DEFAULT = 15;

/** Used when the caller has no live stock options to offer. */
const DEFAULT_OPTIONS = {
  bodyTypes: ["hatchback", "sedan", "suv", "muv"],
  fuelTypes: ["petrol", "diesel", "cng", "electric"],
  transmissions: ["manual", "automatic"],
};

export interface PreferenceOptions {
  bodyTypes: string[];
  fuelTypes: string[];
  transmissions: string[];
}

export interface PreferencePrefill {
  /** Rupees. */
  budgetMax?: number;
  bodyTypes?: string[];
  fuelTypes?: string[];
  transmissions?: string[];
  make?: string;
  model?: string;
  referenceVehicleId?: string;
}

interface PreferenceSheetProps {
  open: boolean;
  onClose: () => void;
  prefill?: PreferencePrefill;
  options?: PreferenceOptions;
  /** Heading copy under "Who should we call?" — e.g. the sold-car message. */
  intro?: string;
}

type Phase = "contact" | "sending-contact" | "details" | "sending-details" | "done";

/**
 * Two-step "find me a car" lead. Step 1 (name + mobile) files the lead at
 * once; step 2 (all optional) tops it up. A dialog on desktop, a bottom sheet on phones.
 */
export function PreferenceSheet({ open, onClose, prefill, options, intro }: PreferenceSheetProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("contact");
  const [error, setError] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});
  const [contact, setContact] = useState<{ fullName: string; phone: string; fax: string } | null>(null);

  const choices = options ?? DEFAULT_OPTIONS;
  const prefilledLakh =
    prefill?.budgetMax !== undefined
      ? Math.min(BUDGET_MAX, Math.max(BUDGET_MIN, Math.round((prefill.budgetMax / 1e5) * 2) / 2))
      : null;
  const [budget, setBudget] = useState<number | null>(prefilledLakh);
  const [bodyTypes, setBodyTypes] = useState<string[]>(prefill?.bodyTypes ?? []);
  const [fuelTypes, setFuelTypes] = useState<string[]>(prefill?.fuelTypes ?? []);
  const [transmissions, setTransmissions] = useState<string[]>(prefill?.transmissions ?? []);
  const prefilledCar = [prefill?.make, prefill?.model].filter(Boolean).join(" ");
  const [carText, setCarText] = useState(prefilledCar);

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open && phase === "contact") nameRef.current?.focus();
  }, [open, phase]);

  async function onContactSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const fullName = String(data.get("name") ?? "").trim();
    const phone = parseMobile(String(data.get("phone") ?? ""));

    const nextErrors: typeof errors = {};
    if (fullName.length < 2) nextErrors.name = "Please tell us your name.";
    else if (!/^[\p{L}\p{M}.' -]+$/u.test(fullName)) nextErrors.name = "Please use letters only.";
    if (phone === null) nextErrors.phone = "Enter a valid 10-digit mobile number.";
    setErrors(nextErrors);
    if (nextErrors.name || nextErrors.phone || phone === null) return;

    const next = { fullName, phone, fax: String(data.get("fax") ?? "") };
    setError(null);
    setPhase("sending-contact");
    try {
      await requestPreferences({
        ...next,
        attribution: getAttribution(),
        referenceVehicleId: prefill?.referenceVehicleId,
      });
      track("preference_contact_submit", { vehicleId: prefill?.referenceVehicleId });
      setContact(next);
      setPhase("details");
    } catch (err) {
      setError(errorMessage(err));
      setPhase("contact");
    }
  }

  async function onDetailsSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!contact) return;
    const text = carText.trim();
    let make = prefill?.make;
    let model = prefill?.model;
    if (text !== prefilledCar) {
      // Typed by the visitor: "Maruti Swift" → make + model, a single word → make only.
      const [first = "", ...rest] = text.split(/\s+/).filter(Boolean);
      make = first || undefined;
      model = rest.join(" ") || undefined;
    }
    setError(null);
    setPhase("sending-details");
    try {
      await requestPreferences({
        ...contact,
        attribution: getAttribution(),
        ...(budget !== null && { budgetMax: Math.round(budget * 1e5) }),
        ...(bodyTypes.length > 0 && { bodyTypes }),
        ...(fuelTypes.length > 0 && { fuelTypes }),
        ...(transmissions.length > 0 && { transmissions }),
        ...(make && { make }),
        ...(model && { model }),
        referenceVehicleId: prefill?.referenceVehicleId,
      });
      track("preference_details_submit", { vehicleId: prefill?.referenceVehicleId });
      setPhase("done");
    } catch (err) {
      setError(errorMessage(err));
      setPhase("details");
    }
  }

  if (!open) return null;

  const onContactStep = phase === "contact" || phase === "sending-contact";

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="preference-sheet"
        className="relative max-h-[92svh] w-full overflow-y-auto rounded-t-[28px] border border-edge/10 bg-ink-2 p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-[28px] sm:p-8"
      >
        <div aria-hidden className="mx-auto -mt-2 mb-4 h-1 w-10 rounded-full bg-edge/20 sm:hidden" />
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full text-muted transition hover:bg-edge/5 hover:text-fg"
        >
          <X className="size-5" />
        </button>

        {phase === "done" ? (
          <div role="status">
            <CheckCircle2 aria-hidden className="size-9 text-teal" />
            <h2 id={titleId} className="mt-4 pr-10 text-2xl font-semibold tracking-tight">
              Thank you.
            </h2>
            <p className="mt-2 text-sm text-muted">Done — we&apos;ll call or WhatsApp you within a day with matches.</p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex h-12 w-full items-center justify-center rounded-full border border-edge/15 px-6 text-sm font-semibold transition hover:border-teal/50"
            >
              Close
            </button>
          </div>
        ) : onContactStep ? (
          <form onSubmit={onContactSubmit} noValidate>
            <p className="eyebrow mb-3">Step 1 of 2</p>
            <h2 id={titleId} className="pr-10 text-2xl font-semibold tracking-tight">
              Who should we call?
            </h2>
            <p className="mt-2 text-sm text-muted">
              {intro ?? "Leave your name and mobile and we'll hunt down a car for you."}
            </p>

            <div className="mt-6 space-y-4">
              <div>
                <label htmlFor={`${titleId}-name`} className="mb-2 block text-sm text-muted">
                  Your name
                </label>
                <input
                  ref={nameRef}
                  id={`${titleId}-name`}
                  name="name"
                  autoComplete="name"
                  maxLength={80}
                  placeholder="Full name"
                  aria-invalid={Boolean(errors.name)}
                  aria-describedby={errors.name ? `${titleId}-name-error` : undefined}
                  className={field}
                />
                {errors.name && (
                  <p id={`${titleId}-name-error`} className="mt-1.5 text-sm text-red-300">
                    {errors.name}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor={`${titleId}-phone`} className="mb-2 block text-sm text-muted">
                  Mobile number
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-base text-subtle">+91</span>
                  <input
                    id={`${titleId}-phone`}
                    name="phone"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel-national"
                    maxLength={16}
                    placeholder="98765 43210"
                    aria-invalid={Boolean(errors.phone)}
                    aria-describedby={errors.phone ? `${titleId}-phone-error` : undefined}
                    className={clsx(field, "pl-14")}
                  />
                </div>
                {errors.phone && (
                  <p id={`${titleId}-phone-error`} className="mt-1.5 text-sm text-red-300">
                    {errors.phone}
                  </p>
                )}
              </div>
              {/* Honeypot: invisible to people, tempting to bots. */}
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <label>
                  Fax
                  <input name="fax" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <button
              type="submit"
              disabled={phase === "sending-contact"}
              className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-ink transition hover:bg-teal-soft disabled:opacity-70"
            >
              {phase === "sending-contact" ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                "Continue"
              )}
            </button>
            <p className="mt-3 text-center text-xs text-subtle">30 seconds, no spam. We only use your number to find you a car.</p>
          </form>
        ) : (
          <form onSubmit={onDetailsSubmit} noValidate>
            <p className="eyebrow mb-3">Step 2 of 2</p>
            <h2 id={titleId} className="pr-10 text-2xl font-semibold tracking-tight">
              What are you after?
            </h2>
            <p className="mt-2 text-sm text-muted">
              You&apos;re on our list already. Tap anything that matters — or skip, it&apos;s all optional.
            </p>

            <div className="mt-6 space-y-6">
              <div>
                <div className="mb-3 flex items-baseline justify-between gap-3">
                  <label htmlFor={`${titleId}-budget`} className="text-sm text-muted">
                    Budget
                  </label>
                  <span className="text-lg font-semibold tabular-nums">
                    {budget === null ? "Any budget" : `up to ${formatPrice(budget * 1e5)}`}
                  </span>
                </div>
                <input
                  id={`${titleId}-budget`}
                  type="range"
                  min={BUDGET_MIN}
                  max={BUDGET_MAX}
                  step={0.5}
                  value={budget ?? BUDGET_DEFAULT}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full"
                />
              </div>
              <Chips legend="Body type" values={choices.bodyTypes} selected={bodyTypes} onChange={setBodyTypes} />
              <Chips legend="Fuel" values={choices.fuelTypes} selected={fuelTypes} onChange={setFuelTypes} />
              <Chips legend="Gearbox" values={choices.transmissions} selected={transmissions} onChange={setTransmissions} />
              <div>
                <label htmlFor={`${titleId}-car`} className="mb-2 block text-sm text-muted">
                  Make or model <span className="text-subtle">(optional)</span>
                </label>
                <input
                  id={`${titleId}-car`}
                  value={carText}
                  onChange={(e) => setCarText(e.target.value)}
                  maxLength={80}
                  placeholder="e.g. Maruti Swift"
                  className={field}
                />
              </div>
            </div>

            {error && <ErrorNote>{error}</ErrorNote>}

            <div className="mt-6 grid grid-cols-[auto_1fr] gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={phase === "sending-details"}
                className="inline-flex h-13 items-center justify-center rounded-full border border-edge/15 px-6 text-base font-semibold transition hover:border-teal/50 disabled:opacity-70"
              >
                Skip
              </button>
              <button
                type="submit"
                disabled={phase === "sending-details"}
                className="inline-flex h-13 items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-ink transition hover:bg-teal-soft disabled:opacity-70"
              >
                {phase === "sending-details" ? (
                  <>
                    <Loader2 aria-hidden className="size-4 animate-spin" /> Sending…
                  </>
                ) : (
                  "Send"
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

function ErrorNote({ children }: { children: React.ReactNode }) {
  return (
    <p role="alert" className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
      {children}
    </p>
  );
}

/** Multi-select chips; nothing selected means "no preference". */
function Chips({
  legend,
  values,
  selected,
  onChange,
}: {
  legend: string;
  values: string[];
  selected: string[];
  onChange: (next: string[]) => void;
}) {
  // Keep prefilled values selectable even if stock options don't list them.
  const all = [...new Set([...values, ...selected])];
  if (all.length === 0) return null;
  return (
    <fieldset>
      <legend className="mb-3 text-sm text-muted">{legend}</legend>
      <div className="flex flex-wrap gap-2">
        {all.map((value) => {
          const on = selected.includes(value);
          return (
            <button
              key={value}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? selected.filter((v) => v !== value) : [...selected, value])}
              className={clsx(
                "rounded-full border px-4 py-2 text-sm transition-colors",
                on ? "border-teal bg-teal text-ink" : "border-edge/10 text-muted hover:text-fg",
              )}
            >
              {label(value)}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "We've received several requests from you already. Please call us instead.";
    if (err.code === "INVALID_PHONE") return "Enter a valid 10-digit Indian mobile number.";
    if (err.status === 422) return "Please check your name and number.";
  }
  return "We couldn't send that just now. Please try again in a moment.";
}
