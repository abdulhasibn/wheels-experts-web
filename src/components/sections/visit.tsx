"use client";

import { useState } from "react";
import { Clock, MapPin, MessageCircle, Phone } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import type { PublicCar } from "@/lib/api";
import { site } from "@/data/site";
import { interestStore, useStore } from "@/lib/store";
import { track } from "@/lib/analytics";
import { testDriveMessage, whatsappLink } from "@/lib/whatsapp";

const field =
  "w-full rounded-2xl border border-edge/10 bg-ink/60 px-4 py-3.5 text-fg placeholder:text-subtle outline-none transition focus:border-teal/60 focus:ring-4 focus:ring-teal/10";

function todayISO(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export function Visit({ cars }: { cars: PublicCar[] }) {
  const interest = useStore(interestStore);
  const [error, setError] = useState("");

  function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    const name = String(data.get("name") ?? "").trim();
    const phone = String(data.get("phone") ?? "").replace(/\s+/g, "");
    if (!name) return setError("Please tell us your name.");
    if (!/^(\+91)?[6-9]\d{9}$/.test(phone)) return setError("Please enter a valid 10-digit mobile number.");
    setError("");
    const carId = String(data.get("car") ?? "");
    const car = cars.find((c) => c.id === carId);
    const message = testDriveMessage({
      name,
      phone,
      car: car ? `${car.year} ${car.make} ${car.model} ${car.variant}` : "",
      date: String(data.get("date") ?? ""),
    });
    track("whatsapp_click", { props: { from: "visit_form" } });
    window.open(whatsappLink(message), "_blank", "noopener,noreferrer");
  }

  return (
    <section id="visit" className="relative overflow-hidden px-5 py-32 sm:px-10 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(150deg,color-mix(in_srgb,var(--color-teal-deep)_10%,var(--color-ink))_0%,var(--color-ink)_45%,rgb(13_148_136/0.22)_100%)]" />
      <div className="relative mx-auto grid max-w-7xl gap-16 lg:grid-cols-2">
        <div className="flex flex-col">
          <p className="eyebrow mb-4">Visit & test drive</p>
          <Reveal as="h2" words className="text-[clamp(2.4rem,6vw,5rem)] font-semibold leading-[1] tracking-[-0.04em]">
            Come see it. Drive it.
          </Reveal>
          <p className="mt-6 max-w-md text-lg text-muted">
            Pick a car and a day. We&apos;ll have it washed, fuelled and waiting.
          </p>

          <ul className="mt-auto grid gap-6 pt-14 text-sm sm:grid-cols-2">
            <li className="flex gap-3">
              <MapPin className="mt-0.5 size-4 shrink-0 text-teal" />
              <div>
                {site.address.map((line) => (
                  <p key={line} className="text-muted first:text-fg first:font-medium">
                    {line}
                  </p>
                ))}
                <a href={site.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-teal hover:text-teal-soft">
                  Get directions →
                </a>
              </div>
            </li>
            <li className="flex gap-3">
              <Clock className="mt-0.5 size-4 shrink-0 text-teal" />
              <div>
                {site.hours.map((h) => (
                  <p key={h.days} className="text-muted">
                    <span className="text-fg">{h.days}</span> · {h.time}
                  </p>
                ))}
                <a href={site.phoneHref} className="mt-2 inline-flex items-center gap-1.5 text-teal hover:text-teal-soft">
                  <Phone className="size-3.5" /> {site.phoneDisplay}
                </a>
              </div>
            </li>
          </ul>
        </div>

        <form onSubmit={onSubmit} noValidate className="glass rounded-[32px] p-6 sm:p-10" aria-describedby="form-note">
          <h3 className="text-2xl font-semibold tracking-tight">Book a test drive</h3>
          <div className="mt-8 grid gap-4">
            <label className="grid gap-2 text-sm text-muted">
              Your name
              <input name="name" autoComplete="name" placeholder="Full name" className={field} />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Mobile number
              <input name="phone" type="tel" inputMode="tel" autoComplete="tel" placeholder="98765 43210" className={field} />
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Car you&apos;d like to drive
              <select key={interest} name="car" defaultValue={interest} className={field}>
                <option value="">Not sure yet — show me options</option>
                {cars.map((car) => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm text-muted">
              Preferred day
              <input name="date" type="date" min={todayISO()} className={field} />
            </label>
          </div>
          {error && (
            <p role="alert" className="mt-4 text-sm text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-teal py-4 font-semibold text-ink transition hover:bg-teal-soft"
          >
            <MessageCircle className="size-5" /> Send on WhatsApp
          </button>
          <p id="form-note" className="mt-4 text-center text-xs text-subtle">
            Opens WhatsApp with your request filled in. Prefer to talk?{" "}
            <a href={site.phoneHref} className="text-muted underline-offset-2 hover:underline">
              Call us
            </a>
            .
          </p>
        </form>
      </div>
    </section>
  );
}
