"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import Link from "next/link";
import { LayoutGroup, motion } from "motion/react";
import { Reveal } from "@/components/ui/reveal";
import { CarPhoto } from "@/components/cars/car-card";
import type { PublicCar } from "@/lib/api";
import { formatKm, formatPrice, label } from "@/lib/format";
import { priceLakh, scoreCar, type PricedCar } from "@/lib/match";

const SHOWN = 4;

function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Record<T, string>;
  value: T | null;
  onChange: (next: T | null) => void;
}) {
  const entries = [[null, "Any"], ...Object.entries(options)] as [T | null, string][];
  return (
    <fieldset>
      <legend className="mb-3 text-sm text-muted">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {entries.map(([key, text]) => {
          const selected = value === key;
          return (
            <button
              key={text}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(key)}
              className={clsx(
                "relative rounded-full px-4 py-2 text-sm transition-colors",
                selected ? "text-ink" : "text-muted hover:text-fg",
              )}
            >
              {selected && (
                <motion.span
                  layoutId={`seg-${label}`}
                  className="absolute inset-0 rounded-full bg-teal"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              )}
              {!selected && <span className="absolute inset-0 rounded-full border border-edge/10" />}
              <span className="relative">{text}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

function ScoreRing({ score }: { score: number }) {
  const r = 25;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative grid size-16 shrink-0 place-items-center">
      <svg viewBox="0 0 60 60" className="absolute inset-0 -rotate-90">
        <circle cx="30" cy="30" r={r} fill="none" className="stroke-line" strokeWidth="3" />
        <motion.circle
          cx="30"
          cy="30"
          r={r}
          fill="none"
          className="stroke-teal"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={c}
          animate={{ strokeDashoffset: c * (1 - score / 100) }}
          transition={{ type: "spring", stiffness: 120, damping: 20 }}
        />
      </svg>
      <span className="text-[13px] font-semibold tabular-nums">{score}%</span>
    </div>
  );
}

/** Choices offered are the ones actually in stock. */
function optionsOf(values: (string | null)[]): Record<string, string> {
  return Object.fromEntries(
    [...new Set(values.filter((v): v is string => v !== null))].sort().map((v) => [v, label(v)]),
  );
}

export function Match({ cars }: { cars: PublicCar[] }) {
  const priced = useMemo(() => cars.filter((car): car is PricedCar => car.listedPrice !== null), [cars]);
  const [budgetLakh, setBudget] = useState(15);
  const [bodyType, setBodyType] = useState<string | null>(null);
  const [fuel, setFuel] = useState<string | null>(null);
  const [transmission, setTransmission] = useState<string | null>(null);
  const options = useMemo(
    () => ({
      body: optionsOf(priced.map((car) => car.bodyType)),
      fuel: optionsOf(priced.map((car) => car.fuelType)),
      transmission: optionsOf(priced.map((car) => car.transmission)),
    }),
    [priced],
  );

  const ranked = useMemo(() => {
    const preference = { budgetLakh, bodyType, fuel, transmission };
    return priced
      .map((car) => ({ car, score: scoreCar(preference, car) }))
      // Equal scores: the car that makes best use of the budget first.
      .sort((a, b) => b.score - a.score || Math.abs(budgetLakh - priceLakh(a.car)) - Math.abs(budgetLakh - priceLakh(b.car)))
      .slice(0, SHOWN);
  }, [priced, budgetLakh, bodyType, fuel, transmission]);

  if (priced.length === 0) return null;

  return (
    <section id="match" className="relative px-5 py-16 sm:px-10 md:py-32 lg:px-16">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_20%_30%,rgb(13_148_136/0.12),transparent)]" />
      <div className="relative mx-auto grid max-w-7xl gap-10 md:gap-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div>
          <p className="eyebrow mb-4">Find your match</p>
          <Reveal as="h2" words className="text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Tell us what matters.
          </Reveal>
          <p className="mt-5 max-w-md text-muted">
            The same matching our sales team uses on the showroom floor — budget first, then the details.
          </p>

          <div className="mt-8 space-y-7 md:mt-12 md:space-y-9">
            <div>
              <div className="mb-3 flex items-baseline justify-between">
                <label htmlFor="budget" className="text-sm text-muted">
                  Budget
                </label>
                <span className="text-2xl font-semibold tabular-nums">up to {formatPrice(budgetLakh * 1e5)}</span>
              </div>
              <input
                id="budget"
                type="range"
                min={4}
                max={25}
                step={0.5}
                value={budgetLakh}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <Segmented label="Body type" options={options.body} value={bodyType} onChange={setBodyType} />
            <Segmented label="Fuel" options={options.fuel} value={fuel} onChange={setFuel} />
            <Segmented label="Gearbox" options={options.transmission} value={transmission} onChange={setTransmission} />
          </div>
        </div>

        <LayoutGroup>
          <ol className="flex flex-col gap-3" aria-live="polite">
            {ranked.map(({ car, score }, i) => (
              <motion.li
                layout
                key={car.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 30 }}
                className={clsx(
                  "flex items-center gap-5 rounded-3xl border p-4 pr-5 sm:p-5",
                  i === 0 ? "border-teal/30 bg-teal/[0.06]" : "border-edge/[0.06] bg-ink-2/60",
                )}
              >
                <div className="relative hidden aspect-[4/3] w-28 shrink-0 overflow-hidden rounded-2xl sm:block">
                  <CarPhoto src={car.coverImageUrl} alt="" className="absolute inset-0 size-full" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">
                    {car.make} {car.model}
                  </p>
                  <p className="mt-1 truncate text-sm text-muted">
                    {car.year} · {formatKm(car.kmDriven)} · {formatPrice(car.listedPrice)}
                  </p>
                  <Link
                    href={`/cars/${car.id}`}
                    className="mt-2 inline-block text-sm font-medium text-teal hover:text-teal-soft"
                  >
                    {i === 0 ? "See it & book a test drive →" : "View car →"}
                  </Link>
                </div>
                <ScoreRing score={score} />
              </motion.li>
            ))}
          </ol>
        </LayoutGroup>
      </div>
    </section>
  );
}
