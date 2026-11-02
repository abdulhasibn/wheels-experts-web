import Link from "next/link";
import { ArrowUpRight, Camera } from "lucide-react";
import clsx from "clsx";
import type { PublicCar } from "@/lib/api";
import { carTitle, formatKm, formatOwners, formatPrice, label } from "@/lib/format";

/** Signed, expiring photo URL — rendered as a plain img so no cache holds a dead link. */
export function CarPhoto({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  if (src === null) {
    return (
      <div className={clsx("flex flex-col items-center justify-center gap-2 bg-ink-3 text-subtle", className)}>
        <Camera aria-hidden className="size-6" />
        <span className="text-xs">Photos coming soon</span>
      </div>
    );
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={src} alt={alt} loading="lazy" decoding="async" className={clsx("object-cover", className)} />;
}

export function CarCard({ car, className }: { car: PublicCar; className?: string }) {
  const title = carTitle(car);
  return (
    <Link
      href={`/cars/${car.id}`}
      className={clsx(
        "group relative flex flex-col overflow-hidden rounded-[28px] border border-edge/[0.06] bg-ink-2 outline-none transition hover:border-teal/25 focus-visible:ring-4 focus-visible:ring-teal/30",
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
        <CarPhoto
          src={car.coverImageUrl}
          alt={title}
          className="absolute inset-0 size-full transition duration-[1200ms] ease-out-expo group-hover:scale-[1.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgb(0 0 0 / 0.25) 0%, transparent 30%, transparent 60%, var(--color-ink-2) 100%)",
          }}
        />
        <span className="absolute left-4 top-4 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
          {formatOwners(car.previousOwners)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 sm:p-6">
        <div className="min-w-0">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">{car.make}</p>
          <h3 className="mt-1 truncate text-xl font-semibold tracking-tight sm:text-2xl">{car.model}</h3>
          <p className="mt-1 truncate text-sm text-muted">{car.variant}</p>
        </div>
        <p className="text-sm text-muted">
          {car.year} · {formatKm(car.kmDriven)} · {label(car.fuelType)} · {label(car.transmission)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 border-t border-edge/[0.06] pt-4">
          <span className={clsx("font-semibold tabular-nums", car.listedPrice === null ? "text-sm text-muted" : "text-xl")}>
            {formatPrice(car.listedPrice)}
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-teal">
            View <ArrowUpRight aria-hidden className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}
