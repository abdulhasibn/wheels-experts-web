import clsx from "clsx";

/** Wheel mark + wordmark, same artwork as the staff app's sidebar logo. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={clsx("inline-flex items-center gap-2.5", className)}>
      <span className="grid size-8 place-items-center rounded-lg bg-teal-deep text-white shadow-[0_0_24px_-4px_rgb(45_212_191/0.6)]">
        <WheelMark className="size-[1.1rem]" />
      </span>
      <span className="text-[15px] font-bold tracking-tight">
        Wheels <span className="text-emerald">Experts</span>
      </span>
    </span>
  );
}

export function WheelMark({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="3" />
      <line x1="12" y1="2" x2="12" y2="9" />
      <line x1="4.22" y1="6.22" x2="9.17" y2="9.17" />
      <line x1="19.78" y1="6.22" x2="14.83" y2="9.17" />
    </svg>
  );
}
