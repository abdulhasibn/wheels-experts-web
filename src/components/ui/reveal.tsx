"use client";

import { useRef } from "react";
import clsx from "clsx";
import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

type Tag = "h1" | "h2" | "h3" | "p" | "div" | "span";

/**
 * Fades content up as it enters the viewport. With `words`, a string child is
 * split so each word rises from behind a mask — the Apple headline treatment.
 */
export function Reveal({
  as: Component = "div",
  children,
  className,
  words = false,
  delay = 0,
}: {
  as?: Tag;
  children: React.ReactNode;
  className?: string;
  words?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = ref.current;
      if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const targets = words ? el.querySelectorAll("[data-word]") : [el];
      gsap.from(targets, {
        yPercent: words ? 110 : 0,
        y: words ? 0 : 40,
        opacity: words ? 1 : 0,
        duration: 1.1,
        delay,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: el, start: "top 88%", once: true },
      });
    },
    { scope: ref },
  );

  const content =
    words && typeof children === "string"
      ? children.split(" ").map((word, i) => (
          <span key={i} className="inline-block overflow-hidden pb-[0.12em] -mb-[0.12em] align-bottom">
            <span data-word className="inline-block">
              {word}
              {" "}
            </span>
          </span>
        ))
      : children;

  return (
    <Component ref={ref as never} className={clsx(className)}>
      {content}
    </Component>
  );
}
