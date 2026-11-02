"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/ui/reveal";
import { FUEL_LABEL, TRANSMISSION_LABEL, formatKm, formatLakh, inventory, type Car } from "@/data/inventory";
import { site } from "@/data/site";
import { interestStore } from "@/lib/store";

export function CarCard({ car }: { car: Car }) {
  return (
    <article className="group relative flex h-full w-[min(82vw,400px)] shrink-0 snap-center flex-col overflow-hidden rounded-[28px] border border-edge/[0.06] bg-ink-2">
      <div className="relative aspect-[4/3] overflow-hidden bg-ink-3">
        <Image
          src={car.photo.src}
          alt={`${car.year} ${car.make} ${car.model}`}
          fill
          sizes="(max-width: 768px) 82vw, 400px"
          className="object-cover transition duration-[1200ms] ease-out-expo group-hover:scale-[1.06]"
        />
        {/* Melt the photo into the card so it reads as one surface. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `linear-gradient(180deg, rgb(0 0 0 / 0.25) 0%, transparent 30%, transparent 60%, var(--color-ink-2) 100%), radial-gradient(120% 60% at 50% 120%, ${car.paint}33, transparent 70%)`,
          }}
        />
        <span className="absolute left-5 top-5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur">
          {car.owners === 1 ? "1st owner" : `${car.owners} owners`}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-5 p-6">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-subtle">{car.make}</p>
          <h3 className="mt-1 text-2xl font-semibold tracking-tight">{car.model}</h3>
          <p className="mt-1 text-sm text-muted">{car.variant}</p>
        </div>
        <p className="text-sm text-muted">
          {car.year} · {formatKm(car.km)} · {FUEL_LABEL[car.fuel]} · {TRANSMISSION_LABEL[car.transmission]}
        </p>
        <div className="mt-auto flex items-center justify-between border-t border-edge/[0.06] pt-5">
          <span className="text-xl font-semibold tabular-nums">{formatLakh(car.priceLakh)}</span>
          {site.contactReady && (
            <a
              href="#visit"
              onClick={() => interestStore.set(car.id)}
              className="inline-flex items-center gap-1 text-sm font-medium text-teal transition hover:text-teal-soft"
            >
              Test drive <ArrowUpRight className="size-4 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

export function Collection() {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      // Desktop: pin and turn vertical scroll into a horizontal glide.
      mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
        const el = track.current;
        if (!el) return;
        const distance = () => el.scrollWidth - window.innerWidth;
        gsap.to(el, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: section.current,
            start: "top top",
            end: () => `+=${distance()}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
          },
        });
      });
      return () => mm.revert();
    },
    { scope: section },
  );

  return (
    <section ref={section} id="buy" className="relative flex flex-col justify-center gap-8 overflow-hidden py-16 md:min-h-svh md:gap-12 md:py-24">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 sm:px-10 md:flex-row md:items-end md:justify-between lg:px-16">
        <div>
          <p className="eyebrow mb-4">The collection</p>
          <Reveal as="h2" words className="text-[clamp(2.2rem,5vw,4rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            On the floor this week.
          </Reveal>
        </div>
        <p className="max-w-sm text-muted">
          A short list, on purpose. Every car below has cleared our checks — come see any of them in person.
        </p>
      </div>
      <div
        ref={track}
        className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-[max(var(--g),calc((100vw-80rem)/2+var(--g)))] pb-4 [--g:1.25rem] [scrollbar-width:none] sm:[--g:2.5rem] md:snap-none md:overflow-visible lg:[--g:4rem]"
      >
        {inventory.map((car) => (
          <CarCard key={car.id} car={car} />
        ))}
        <div className="flex w-[min(82vw,400px)] shrink-0 snap-center flex-col justify-center rounded-[28px] border border-dashed border-edge/10 p-8">
          <p className="text-2xl font-semibold tracking-tight">Looking for something specific?</p>
          <p className="mt-3 text-muted">
            {site.contactReady
              ? "Tell us what you want. We'll call when it comes in."
              : "Tell us what matters and we'll show you the closest fit."}
          </p>
          <a href="#match" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-soft">
            Find your match <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
