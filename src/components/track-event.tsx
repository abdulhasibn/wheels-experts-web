"use client";

import { useEffect, useRef } from "react";
import { track, type EventProps, type EventType } from "@/lib/analytics";

/** Fires one analytics event when it mounts — lets server pages record what was shown. */
export function TrackEvent({ type, vehicleId, props }: { type: EventType; vehicleId?: string; props?: EventProps }) {
  const key = JSON.stringify([type, vehicleId, props]);
  // Survives StrictMode's double effect run, so dev doesn't record everything twice.
  const fired = useRef<string | null>(null);

  useEffect(() => {
    if (fired.current === key) return;
    fired.current = key;
    track(type, { vehicleId, props });
    // Re-fire only when what was shown changes, not on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return null;
}
