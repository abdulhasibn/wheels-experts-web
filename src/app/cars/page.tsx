import type { Metadata } from "next";
import { Fragment } from "react";
import Link from "next/link";
import { PreferenceCta } from "@/components/leads/preference-cta";
import { CarCard } from "@/components/cars/car-card";
import { CarFilters, type ActiveFilters } from "@/components/cars/car-filters";
import { StockUnavailable } from "@/components/cars/stock-unavailable";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { TrackEvent } from "@/components/track-event";
import { carStatus, getCars, getFilterOptions, type FilterOptions, type Page, type PublicCar } from "@/lib/api";

export const metadata: Metadata = {
  title: "Pre-owned cars in stock — Wheels Experts",
  description: "Every car on our floor today, with photos, kilometres and price. Pick one and see where to test drive it.",
};

const PAGE_SIZE = 24;
const FILTER_KEYS = ["makeId", "modelId", "bodyType", "fuelType", "transmission", "priceMax", "sort"] as const;

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function first(value: string | string[] | undefined): string | undefined {
  const v = Array.isArray(value) ? value[0] : value;
  return v === undefined || v === "" ? undefined : v;
}

export default async function CarsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const active: ActiveFilters = Object.fromEntries(FILTER_KEYS.map((key) => [key, first(params[key])]));
  const page = Math.max(1, Number.parseInt(first(params.page) ?? "1", 10) || 1);

  let cars: Page<PublicCar> | null = null;
  let options: FilterOptions | null = null;
  try {
    [cars, options] = await Promise.all([
      getCars({
        ...active,
        priceMax: active.priceMax ? Number(active.priceMax) : undefined,
        limit: PAGE_SIZE,
        offset: (page - 1) * PAGE_SIZE,
      }),
      getFilterOptions(),
    ]);
  } catch {
    // Shown below as a friendly fallback; ISR keeps serving the last good page.
  }

  const filtered = FILTER_KEYS.some((key) => key !== "sort" && active[key]);
  const pages = cars ? Math.max(1, Math.ceil(cars.total / PAGE_SIZE)) : 1;
  const pageHref = (n: number) => {
    const query = new URLSearchParams();
    for (const key of FILTER_KEYS) if (active[key]) query.set(key, active[key]!);
    if (n > 1) query.set("page", String(n));
    const qs = query.toString();
    return qs ? `/cars?${qs}` : "/cars";
  };

  // Available cars come first, so a page that reaches the sold ones has seen every available car.
  // Only state the available/sold split when this page proves it; otherwise just "N cars".
  const soldOnPage = cars?.items.filter((car) => carStatus(car) === "sold").length ?? 0;
  const countText =
    cars && soldOnPage > 0
      ? `${(page - 1) * PAGE_SIZE + cars.items.length - soldOnPage} available · ${
          cars.total - ((page - 1) * PAGE_SIZE + cars.items.length - soldOnPage)
        } recently sold`
      : cars && cars.total <= PAGE_SIZE && page === 1
        ? `${cars.total} available · 0 recently sold`
        : null;

  const make = options?.makes.find((m) => m.id === active.makeId);
  const prefill = {
    budgetMax: active.priceMax ? Number(active.priceMax) || undefined : undefined,
    bodyTypes: active.bodyType ? [active.bodyType] : undefined,
    fuelTypes: active.fuelType ? [active.fuelType] : undefined,
    transmissions: active.transmission ? [active.transmission] : undefined,
    make: make?.name,
    model: make?.models.find((m) => m.id === active.modelId)?.name,
  };
  const cta = (variant: "banner") =>
    options && (
      <PreferenceCta
        variant={variant}
        source="cars"
        prefill={prefill}
        options={{ bodyTypes: options.bodyTypes, fuelTypes: options.fuelTypes, transmissions: options.transmissions }}
      />
    );

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 pb-20 pt-28 sm:px-10 md:pt-36 lg:px-16">
        <p className="eyebrow mb-4">Our floor</p>
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <h1 className="text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Every car on our floor.
          </h1>
          {cars && (
            <p className="text-muted">
              {countText ?? `${cars.total} ${cars.total === 1 ? "car" : "cars"}`}
              {cars.total > 0 && " · tap one for photos and details"}
            </p>
          )}
        </div>

        {cars && options ? (
          <>
            <div className="mt-8 md:mt-10">
              <CarFilters options={options} active={active} />
            </div>
            {/* What buyers ask for — including searches we have no car for. */}
            {filtered && page === 1 && (
              <TrackEvent
                type="filter_apply"
                props={{
                  makeId: active.makeId ?? null,
                  modelId: active.modelId ?? null,
                  bodyType: active.bodyType ?? null,
                  fuelType: active.fuelType ?? null,
                  transmission: active.transmission ?? null,
                  priceMax: active.priceMax ? Number(active.priceMax) : null,
                  resultCount: cars.total,
                }}
              />
            )}

            {cars.items.length === 0 ? (
              <div className="mt-12 rounded-[28px] border border-dashed border-edge/10 p-10 text-center">
                <p className="text-xl font-semibold">No cars match those filters.</p>
                <p className="mt-2 text-muted">Try a wider budget or another body style.</p>
                <div className="mx-auto mt-8 max-w-md text-left">{cta("banner")}</div>
                <Link href="/cars" className="mt-6 inline-block text-sm font-medium text-teal hover:text-teal-soft">
                  See all cars →
                </Link>
              </div>
            ) : (
              <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {cars.items.map((car, i) => (
                  <Fragment key={car.id}>
                    <li>
                      <CarCard car={car} className="h-full" />
                    </li>
                    {i === 5 && <li>{cta("banner")}</li>}
                  </Fragment>
                ))}
                {cars.items.length < 6 && <li>{cta("banner")}</li>}
              </ul>
            )}

            {pages > 1 && (
              <nav aria-label="Pages" className="mt-12 flex items-center justify-center gap-3 text-sm">
                {page > 1 && (
                  <Link href={pageHref(page - 1)} className="rounded-full border border-edge/10 px-5 py-2.5 hover:border-teal/50">
                    ← Previous
                  </Link>
                )}
                <span className="text-muted tabular-nums">
                  Page {page} of {pages}
                </span>
                {page < pages && (
                  <Link href={pageHref(page + 1)} className="rounded-full border border-edge/10 px-5 py-2.5 hover:border-teal/50">
                    Next →
                  </Link>
                )}
              </nav>
            )}
          </>
        ) : (
          <StockUnavailable />
        )}
      </main>
      <Footer />
    </>
  );
}
