"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { CarCard } from "@/components/cars/car-card";
import { Reveal } from "@/components/ui/reveal";
import type { PublicCar } from "@/lib/api";

export function Collection({ cars, total }: { cars: PublicCar[]; total: number }) {
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
        {cars.map((car) => (
          <CarCard key={car.id} car={car} className="w-[min(82vw,400px)] shrink-0 snap-center" />
        ))}
        <div className="flex w-[min(82vw,400px)] shrink-0 snap-center flex-col justify-center rounded-[28px] border border-dashed border-edge/10 p-8">
          <p className="text-2xl font-semibold tracking-tight">
            {total > cars.length ? `See all ${total} cars` : cars.length === 0 ? "Fresh stock is on its way." : "Looking for something specific?"}
          </p>
          <p className="mt-3 text-muted">
            Filter by make, budget, fuel and gearbox, then pick a car to see where to test drive it.
          </p>
          <Link href="/cars" className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-teal hover:text-teal-soft">
            Browse all cars <ArrowUpRight className="size-4" />
          </Link>
          <a href="#match" className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-muted hover:text-fg">
            Or find your match <ArrowUpRight className="size-4" />
          </a>
        </div>
      </div>
    </section>
  );
}
