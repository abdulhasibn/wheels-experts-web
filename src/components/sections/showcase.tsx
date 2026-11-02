"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import clsx from "clsx";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { ArrowDown } from "lucide-react";
import Image from "next/image";
import { Constellation } from "@/components/ui/constellation";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { PAINTS, modelReadyStore, paintStore, stage, useStore } from "@/lib/store";
import { useIsMobile, useReducedMotion, useWebGL, webglFallbackReason } from "@/lib/use-media";

const Scene = dynamic(() => import("@/components/three/scene"), { ssr: false });

/** One full-screen panel per camera shot in lib/showcase.ts, same order. */
const STORY = [
  {
    eyebrow: "",
    title: "Every car has a story.",
    body: "We read all of it before it ever reaches our floor.",
    align: "left",
  },
  {
    eyebrow: "01 — Papers",
    title: "RC, insurance and loan clearance. Verified.",
    body: "Hypothecation closed and transfer-ready before a car is listed.",
    align: "left",
  },
  {
    eyebrow: "02 — Service history",
    title: "Every service. Every stamp.",
    body: "We match the service book to the odometer, so the kilometres add up.",
    align: "right",
  },
  {
    eyebrow: "03 — Disclosure",
    title: "Accidents and repairs, told up front.",
    body: "If a panel has been repainted, you'll hear it from us first.",
    align: "left",
  },
  {
    eyebrow: "04 — Photographed",
    title: "Front, rear, cabin, engine, tyres.",
    body: "Every listing is shot from the same angles, so you can compare like for like.",
    align: "right",
  },
] as const;

/** Shown when there is no usable GPU (no WebGL, or software rendering) or the 3D fails to load. */
function Poster() {
  return (
    <div className="absolute inset-0">
      <Image src="/cars/city-22.jpg" alt="" fill priority sizes="100vw" className="object-cover object-center opacity-70" />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,var(--color-ink)_0%,rgb(var(--ink-rgb)/0.7)_45%,rgb(var(--ink-rgb)/0.2)_100%)]" />
    </div>
  );
}

function Swatches() {
  const current = useStore(paintStore);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-subtle">Try a finish</span>
      <div className="flex gap-2" role="radiogroup" aria-label="Paint finish">
        {PAINTS.map((paint) => (
          <button
            key={paint.id}
            type="button"
            role="radio"
            aria-checked={current === paint.id}
            aria-label={paint.name}
            title={paint.name}
            onClick={() => paintStore.set(paint.id)}
            className={clsx(
              "size-6 rounded-full border transition duration-300",
              current === paint.id ? "scale-110 border-fg ring-2 ring-teal/40 ring-offset-2 ring-offset-ink" : "border-edge/20 hover:scale-110",
            )}
            style={{ background: `radial-gradient(circle at 30% 30%, #ffffff55, ${paint.hex} 55%)` }}
          />
        ))}
      </div>
    </div>
  );
}

export function Showcase() {
  const section = useRef<HTMLElement>(null);
  const webgl = useWebGL();
  const reduced = useReducedMotion();
  const mobile = useIsMobile();
  const ready = useStore(modelReadyStore);
  const [active, setActive] = useState(true);

  useEffect(() => {
    const el = section.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => setActive(Boolean(entry?.isIntersecting)), {
      rootMargin: "100px",
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useGSAP(
    () => {
      // Whole-section scroll → 0..1 for the camera rig.
      ScrollTrigger.create({
        trigger: section.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          stage.progress = self.progress;
        },
      });
      // Read the media query here, not from state: the first render only has the server default.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

      // Hero copy: rise in on load, drift away on scroll.
      gsap.from("[data-hero-in]", { y: 40, opacity: 0, duration: 1.4, ease: "expo.out", stagger: 0.12, delay: 0.2 });
      gsap.to("[data-hero]", {
        opacity: 0,
        y: -80,
        ease: "none",
        scrollTrigger: { trigger: "[data-hero]", start: "top top", end: "bottom 40%", scrub: true },
      });

      // Story panels: fade up into place, hold, fade away.
      gsap.utils.toArray<HTMLElement>("[data-panel]").forEach((panel) => {
        const copy = panel.querySelector("[data-copy]");
        gsap
          .timeline({ scrollTrigger: { trigger: panel, start: "top bottom", end: "bottom top", scrub: true } })
          .fromTo(copy, { opacity: 0, y: 80 }, { opacity: 1, y: 0, ease: "power2.out", duration: 0.35 })
          .to(copy, { opacity: 1, duration: 0.25 })
          .to(copy, { opacity: 0, y: -80, ease: "power2.in", duration: 0.35 });
      });

      gsap.fromTo(
        "[data-outro]",
        { opacity: 0, scale: 0.94 },
        {
          opacity: 1,
          scale: 1,
          ease: "power2.out",
          scrollTrigger: { trigger: "[data-outro]", start: "top 80%", end: "center center", scrub: true },
        },
      );
    },
    { scope: section },
  );

  // Reduced motion still gets the 3D car, just held on the hero shot (no camera flight).
  const show3D = webgl === true;

  // Record why the hero is (or isn't) 3D: <html data-hero="3d" | "poster:…">.
  useEffect(() => {
    if (webgl === null) return;
    document.documentElement.dataset.hero = show3D ? "3d" : `poster:${webglFallbackReason()}`;
  }, [webgl, show3D]);

  return (
    <section ref={section} id="top" aria-label="Why Wheels Experts" className="relative">
      {/* Sticky stage: the canvas stays put while the copy scrolls over it. */}
      <div className="sticky top-0 h-svh overflow-hidden">
        {webgl !== null && !show3D && <Poster />}
        {show3D && (
          <ErrorBoundary
            fallback={<Poster />}
            onError={(error) => {
              document.documentElement.dataset.hero = "poster:3d-error";
              console.error("[Wheels Experts] 3D showcase failed, showing the photo instead:", error);
            }}
          >
            <div className={clsx("absolute inset-0 transition-opacity duration-[1600ms]", ready ? "opacity-100" : "opacity-0")}>
              <Scene lite={mobile} still={reduced} active={active} />
            </div>
          </ErrorBoundary>
        )}
        {/* Vignettes keep copy legible over the car. */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_80%_at_50%_45%,transparent_40%,rgb(var(--ink-rgb)/0.85)_100%)]" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-ink to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-ink/80 to-transparent" />
      </div>

      <div className="relative -mt-[100svh]">
        {/* Hero */}
        <div data-hero className="relative flex min-h-svh flex-col justify-end px-5 pb-10 pt-24 sm:px-10 sm:pb-16 lg:px-16">
          <Constellation className="pointer-events-none absolute inset-0" />
          <Constellation side="right" className="pointer-events-none absolute inset-0 hidden md:block" />
          <div className="relative mx-auto flex w-full max-w-7xl flex-col gap-10 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p data-hero-in className="eyebrow mb-5">
                Pre-owned cars · Bengaluru
              </p>
              <h1 data-hero-in className="text-[clamp(2.4rem,min(9vw,13svh),7.5rem)] font-bold leading-[0.92] tracking-[-0.045em]">
                <span className="text-gradient">Pre-owned.</span>
                <br />
                <span className="text-gradient-teal">Perfected.</span>
              </h1>
              <p data-hero-in className="mt-6 max-w-md text-lg leading-relaxed text-muted [@media(max-height:560px)]:hidden">
                Hand-picked cars, honestly inspected, ready for the road.
              </p>
              <div data-hero-in className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#buy"
                  className="rounded-full bg-teal px-6 py-3 text-sm font-semibold text-ink transition hover:bg-teal-soft"
                >
                  Explore the collection
                </a>
                <a
                  href="#sell"
                  className="rounded-full border border-edge/15 px-6 py-3 text-sm font-semibold text-fg transition hover:border-edge/40"
                >
                  Sell your car
                </a>
              </div>
            </div>
            <div data-hero-in className="flex flex-col items-start gap-6 md:items-end">
              {show3D && <Swatches />}
              <span className="hidden items-center gap-2 text-xs text-subtle md:flex">
                Scroll to look closer <ArrowDown className="size-3.5 animate-bounce" />
              </span>
            </div>
          </div>
        </div>

        {/* Inspection story */}
        {STORY.map((item) => (
          <div
            key={item.title}
            data-panel
            className="flex h-svh items-end px-5 pb-[11svh] sm:px-10 md:items-center md:pb-0 lg:px-16"
          >
            <div
              data-copy
              className={clsx(
                "mx-auto w-full max-w-7xl",
                item.align === "right" && "md:flex md:justify-end md:text-right",
              )}
            >
              <div className="max-w-xl">
                {item.eyebrow && <p className="eyebrow mb-4">{item.eyebrow}</p>}
                <h2 className="text-[clamp(2.2rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em] text-gradient">
                  {item.title}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-muted md:mt-5 md:text-lg">{item.body}</p>
              </div>
            </div>
          </div>
        ))}

        {/* Outro */}
        <div className="flex h-svh items-start justify-center px-5 pt-[16svh] text-center md:pt-[14svh]">
          <div data-outro>
            <p className="text-[clamp(2.2rem,5.6vw,5.2rem)] font-bold leading-none tracking-[-0.045em]">
              <span className="text-gradient">No surprises on</span>
              <br />
              <span className="text-gradient-teal">delivery day.</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
