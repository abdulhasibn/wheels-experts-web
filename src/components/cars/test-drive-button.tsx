"use client";

import { useCallback, useState } from "react";
import { MapPin } from "lucide-react";
import clsx from "clsx";
import { TestDriveSheet } from "./test-drive-sheet";

export function TestDriveButton({
  vehicleId,
  carName,
  className,
}: {
  vehicleId: string;
  carName: string;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={clsx(
          "inline-flex h-13 items-center justify-center gap-2 rounded-full bg-teal px-6 text-base font-semibold text-ink transition hover:bg-teal-soft",
          className,
        )}
      >
        <MapPin aria-hidden className="size-4" /> Location for test drive
      </button>
      <TestDriveSheet vehicleId={vehicleId} carName={carName} open={open} onClose={close} />
    </>
  );
}
