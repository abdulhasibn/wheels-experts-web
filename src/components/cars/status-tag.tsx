import clsx from "clsx";
import type { CarStatus } from "@/lib/api";

/** Available = teal dot; Sold = muted rose pill. Sits on photos, so it blurs what's behind. */
export function StatusTag({ status, className }: { status: CarStatus; className?: string }) {
  if (status === "sold") {
    return (
      <span
        className={clsx(
          "inline-flex items-center rounded-full bg-rose-950/70 px-3 py-1 text-[11px] font-medium text-rose-200 backdrop-blur",
          className,
        )}
      >
        Sold
      </span>
    );
  }
  return (
    <span
      className={clsx(
        "inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white/85 backdrop-blur",
        className,
      )}
    >
      <span aria-hidden className="size-1.5 rounded-full bg-teal" />
      Available
    </span>
  );
}
