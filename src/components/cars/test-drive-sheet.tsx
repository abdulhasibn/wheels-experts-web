"use client";

import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { CheckCircle2, Clock, Loader2, MapPin, Navigation, Phone, X } from "lucide-react";
import clsx from "clsx";
import { ApiError, requestTestDrive, type Showroom } from "@/lib/api";
import { getAttribution } from "@/lib/analytics";
import { parseMobile } from "@/lib/format";

const field =
  "w-full rounded-2xl border border-edge/10 bg-ink/60 px-4 py-3.5 text-base text-fg placeholder:text-subtle outline-none transition focus:border-teal/60 focus:ring-4 focus:ring-teal/10 aria-[invalid=true]:border-red-400/60";

type State =
  | { step: "form"; error: string | null }
  | { step: "sending" }
  | { step: "done"; showroom: Showroom | null; vehicleAvailable: boolean };

interface TestDriveSheetProps {
  vehicleId: string;
  carName: string;
  open: boolean;
  onClose: () => void;
}

/**
 * Asks for name + mobile, files a website lead, and only then reveals where
 * the showroom is. A dialog on desktop, a bottom sheet on phones.
 */
export function TestDriveSheet({ vehicleId, carName, open, onClose }: TestDriveSheetProps) {
  const titleId = useId();
  const nameRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<State>({ step: "form", error: null });
  const [errors, setErrors] = useState<{ name?: string; phone?: string }>({});

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    nameRef.current?.focus();
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
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

    setState({ step: "sending" });
    try {
      const receipt = await requestTestDrive({
        vehicleId,
        fullName,
        phone,
        fax: String(data.get("fax") ?? ""),
        attribution: getAttribution(),
      });
      setState({ step: "done", showroom: receipt.showroom, vehicleAvailable: receipt.vehicleAvailable });
    } catch (err) {
      setState({ step: "form", error: errorMessage(err) });
    }
  }

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-6">
      <button type="button" aria-label="Close" onClick={onClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
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

        {state.step === "done" ? (
          <LocationCard id={titleId} carName={carName} showroom={state.showroom} vehicleAvailable={state.vehicleAvailable} />
        ) : (
          <form onSubmit={onSubmit} noValidate>
            <p className="eyebrow mb-3">Test drive</p>
            <h2 id={titleId} className="pr-10 text-2xl font-semibold tracking-tight">
              Where to see the {carName}
            </h2>
            <p className="mt-2 text-sm text-muted">
              Leave your name and mobile and we&apos;ll show you where the car is. Our team will call to fix a time.
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

            {state.step === "form" && state.error && (
              <p role="alert" className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={state.step === "sending"}
              className="mt-6 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-ink transition hover:bg-teal-soft disabled:opacity-70"
            >
              {state.step === "sending" ? (
                <>
                  <Loader2 aria-hidden className="size-4 animate-spin" /> Sending…
                </>
              ) : (
                <>
                  <MapPin aria-hidden className="size-4" /> Show me the location
                </>
              )}
            </button>
            <p className="mt-3 text-center text-xs text-subtle">We only use your number to arrange this test drive.</p>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

function LocationCard({
  id,
  carName,
  showroom,
  vehicleAvailable,
}: {
  id: string;
  carName: string;
  showroom: Showroom | null;
  vehicleAvailable: boolean;
}) {
  const mapUrl =
    showroom &&
    (showroom.googleMapsUrl ??
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${showroom.address}, ${showroom.city}`)}`);
  const hours = showroom ? openingHours(showroom.openingHours) : [];

  return (
    <div>
      <CheckCircle2 aria-hidden className="size-9 text-teal" />
      <h2 id={id} className="mt-4 pr-10 text-2xl font-semibold tracking-tight">
        {vehicleAvailable ? "You're on the list." : "That car just sold."}
      </h2>
      <p className="mt-2 text-sm text-muted">
        {vehicleAvailable
          ? `We'll call you shortly to set up your ${carName} test drive.`
          : "We've saved your request and will call with similar cars you can drive."}
      </p>

      {showroom && (
        <div className="mt-6 rounded-3xl border border-teal/20 bg-teal/[0.05] p-5">
          <div className="flex gap-3">
            <MapPin aria-hidden className="mt-0.5 size-5 shrink-0 text-teal" />
            <div>
              <p className="font-semibold">{showroom.name}</p>
              <p className="mt-1 text-sm text-muted">{showroom.address}</p>
              <p className="text-sm text-muted">{showroom.city}</p>
            </div>
          </div>
          {hours.length > 0 && (
            <div className="mt-4 flex gap-3">
              <Clock aria-hidden className="mt-0.5 size-5 shrink-0 text-teal" />
              <ul className="text-sm text-muted">
                {hours.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-5 grid gap-2 sm:grid-cols-2">
            <a
              href={mapUrl ?? "#"}
              data-track="directions_click"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-teal px-5 text-sm font-semibold text-ink transition hover:bg-teal-soft"
            >
              <Navigation aria-hidden className="size-4" /> Directions
            </a>
            <a
              href={`tel:${showroom.phone}`}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-full border border-edge/15 px-5 text-sm font-semibold transition hover:border-teal/50"
            >
              <Phone aria-hidden className="size-4" /> Call showroom
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

/** `opening_hours` is free-form JSON: `{ "Mon – Sat": "10–8" }` or `["Mon–Sat 10–8"]`. */
function openingHours(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((item) =>
      typeof item === "string"
        ? item
        : typeof item === "object" && item !== null
          ? Object.values(item).map(String).join(" · ")
          : String(item),
    );
  }
  if (typeof value === "object" && value !== null) {
    return Object.entries(value).map(([days, time]) => `${days}: ${String(time)}`);
  }
  return typeof value === "string" ? [value] : [];
}

function errorMessage(err: unknown): string {
  if (err instanceof ApiError) {
    if (err.status === 429) return "We've received several requests from you already. Please call us instead.";
    if (err.code === "INVALID_PHONE") return "Enter a valid 10-digit Indian mobile number.";
    if (err.status === 422) return "Please check your name and number.";
  }
  return "We couldn't send that just now. Please try again in a moment.";
}
