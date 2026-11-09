import type { CSSProperties } from "react";
import clsx from "clsx";

/*
 * Wheels Experts brand artwork, drawn as CSS masks over the monochrome logo
 * PNG in /public/brand (same file as the staff app). The fill comes from
 * `currentColor`, so one file serves every colour.
 */

function maskStyle(src: string, background: string): CSSProperties {
  return {
    background,
    WebkitMaskImage: `url(${src})`,
    maskImage: `url(${src})`,
    WebkitMaskRepeat: "no-repeat",
    maskRepeat: "no-repeat",
    WebkitMaskSize: "contain",
    maskSize: "contain",
    WebkitMaskPosition: "center",
    maskPosition: "center",
  };
}

/** Brand mark tile + name, same lockup as the staff app's sidebar. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-teal-deep text-white shadow-[0_0_24px_-4px_rgb(45_212_191/0.6)]">
        <BrandMark className="h-6" />
      </span>
      <span className="text-[15px] font-bold tracking-tight">
        Wheels <span className="text-emerald">Experts</span>
      </span>
    </span>
  );
}

/** Hexagon + car, without the name band. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={clsx("inline-block aspect-[512/546] shrink-0", className)}
      style={maskStyle("/brand/logo-mark.png", "currentColor")}
    />
  );
}
