import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { CarGallery } from "@/components/cars/car-gallery";
import { TestDriveButton } from "@/components/cars/test-drive-button";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/sections/footer";
import { getCar } from "@/lib/api";
import { carTitle, formatKm, formatOwners, formatPrice, label } from "@/lib/format";

type Params = Promise<{ id: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const car = await getCar((await params).id);
  if (!car) return { title: "Car not found — Wheels Experts" };
  const title = `${carTitle(car)} ${car.variant}`;
  return {
    title: `${title} — Wheels Experts`,
    description: `${formatKm(car.kmDriven)} · ${label(car.fuelType)} · ${label(car.transmission)} · ${formatPrice(car.listedPrice)}`,
  };
}

export default async function CarPage({ params }: { params: Params }) {
  const car = await getCar((await params).id);
  if (!car) notFound();

  const title = carTitle(car);
  const specs: [string, string][] = [
    ["Year", String(car.year)],
    ["Kilometres", formatKm(car.kmDriven)],
    ["Fuel", label(car.fuelType)],
    ["Gearbox", label(car.transmission)],
    ["Ownership", formatOwners(car.previousOwners)],
    ...(car.bodyType ? [["Body", label(car.bodyType)] as [string, string]] : []),
    ...(car.colour ? [["Colour", car.colour] as [string, string]] : []),
  ];

  return (
    <>
      <Nav />
      <main className="mx-auto max-w-7xl px-4 pb-32 pt-24 sm:px-10 md:pb-20 md:pt-32 lg:px-16">
        <Link href="/cars" className="inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-fg">
          <ArrowLeft aria-hidden className="size-4" /> All cars
        </Link>

        <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-12">
          <CarGallery photos={car.photos} title={title} />

          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">{car.make}</p>
            <h1 className="mt-2 text-[clamp(2rem,4vw,3.2rem)] font-semibold leading-[1.05] tracking-[-0.03em]">
              {car.model}
            </h1>
            <p className="mt-2 text-muted">
              {car.variant} · {car.year}
            </p>
            <p className={car.listedPrice === null ? "mt-6 text-lg text-muted" : "mt-6 text-4xl font-semibold tabular-nums"}>
              {formatPrice(car.listedPrice)}
            </p>

            <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-edge/[0.06] bg-edge/[0.06]">
              {specs.map(([term, value]) => (
                <div key={term} className="bg-ink-2 px-5 py-4">
                  <dt className="text-xs text-subtle">{term}</dt>
                  <dd className="mt-1 font-medium">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-8 hidden md:block">
              <TestDriveButton vehicleId={car.id} carName={title} className="w-full" />
              <p className="mt-3 text-center text-xs text-subtle">Free, no obligation. We&apos;ll call to fix a time.</p>
            </div>
          </div>
        </div>

        {car.description && (
          <section className="mt-12 max-w-3xl">
            <h2 className="text-xl font-semibold">About this car</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted">{car.description}</p>
          </section>
        )}
      </main>

      {/* Phones: the action stays in reach while scrolling the photos and specs. */}
      <div className="fixed inset-x-0 bottom-0 z-40 bg-ink/90 backdrop-blur-xl flex items-center gap-3 border-t border-edge/[0.06] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
        <div className="min-w-0">
          <p className="truncate text-xs text-muted">{title}</p>
          <p className="font-semibold tabular-nums">{formatPrice(car.listedPrice)}</p>
        </div>
        <TestDriveButton vehicleId={car.id} carName={title} className="ml-auto h-12 shrink-0 px-5 text-sm" />
      </div>

      <Footer />
    </>
  );
}
