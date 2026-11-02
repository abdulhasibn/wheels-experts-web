"use client";

import { useRef } from "react";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";
import { MessageCircle } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { site } from "@/data/site";
import { valuationMessage, whatsappLink } from "@/lib/whatsapp";

const STEPS = [
  {
    n: "01",
    title: "Tell us about it",
    body: "Make, model, year and kilometres. A photo or two helps. That's all we need to start.",
  },
  {
    n: "02",
    title: "We inspect & photograph",
    body: "A walk-around at our showroom or your place, papers checked, and a full set of listing photos.",
  },
  {
    n: "03",
    title: "Sold — your way",
    body: "Take a fair offer and we buy it outright, or let us sell it for you and handle every call and viewing.",
  },
];

const OPTIONS = [
  { title: "We buy it", body: "One offer, quick payment, paperwork handled. Done in days." },
  { title: "We sell it for you", body: "Your car on our floor and in front of our buyers. You set the price." },
];

export function Sell() {
  const section = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      // Each giant numeral drifts at its own speed — layered depth.
      gsap.utils.toArray<HTMLElement>("[data-depth]").forEach((el) => {
        const depth = Number(el.dataset.depth);
        gsap.fromTo(
          el,
          { yPercent: 40 * depth },
          {
            yPercent: -40 * depth,
            ease: "none",
            scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: true },
          },
        );
      });
      gsap.from("[data-step]", {
        opacity: 0,
        y: 60,
        duration: 1.2,
        ease: "expo.out",
        stagger: 0.15,
        scrollTrigger: { trigger: "[data-steps]", start: "top 75%", once: true },
      });
    },
    { scope: section },
  );

  return (
    <section ref={section} id="sell" className="relative overflow-hidden border-t border-edge/[0.05] px-5 py-16 sm:px-10 md:py-32 lg:px-16">
      <div className="pointer-events-none absolute -right-40 top-20 size-[600px] rounded-full bg-teal-deep/10 blur-[120px]" />
      <div className="relative mx-auto max-w-7xl">
        <div className="max-w-3xl">
          <p className="eyebrow mb-4">Sell your car</p>
          <Reveal as="h2" words className="text-[clamp(2.2rem,5.5vw,4.5rem)] font-semibold leading-[1.02] tracking-[-0.035em]">
            Selling? We&apos;ll do the heavy lifting.
          </Reveal>
        </div>

        <ol data-steps className="mt-10 grid gap-4 md:mt-20 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, i) => (
            <li
              data-step
              key={step.n}
              className="relative min-h-[190px] overflow-hidden rounded-[28px] border border-edge/[0.06] bg-ink-2/70 p-6 md:min-h-[320px] md:p-8"
            >
              <span
                data-depth={1 + i * 0.6}
                aria-hidden
                className="pointer-events-none absolute -right-3 -top-4 select-none text-[7rem] font-bold md:-right-4 md:-top-6 md:text-[11rem] leading-none tracking-tighter text-transparent [-webkit-text-stroke:1px_rgb(45_212_191/0.25)]"
              >
                {step.n}
              </span>
              <div className="relative flex h-full flex-col justify-end">
                <h3 className="text-2xl font-semibold tracking-tight">{step.title}</h3>
                <p className="mt-3 leading-relaxed text-muted">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

        <div className={site.contactReady ? "mt-4 grid gap-4 md:mt-6 md:grid-cols-[1fr_1fr_auto] md:gap-6" : "mt-4 grid gap-4 md:mt-6 md:grid-cols-2 md:gap-6"}>
          {OPTIONS.map((option) => (
            <div key={option.title} className="rounded-[28px] border border-edge/[0.06] p-6 md:p-8">
              <h3 className="text-lg font-semibold">{option.title}</h3>
              <p className="mt-2 text-muted">{option.body}</p>
            </div>
          ))}
          {site.contactReady && (
            <a
              href={whatsappLink(valuationMessage)}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center justify-center gap-3 rounded-[28px] bg-teal px-10 py-8 font-semibold text-ink transition hover:bg-teal-soft"
            >
              <MessageCircle className="size-5" />
              Get a valuation
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
