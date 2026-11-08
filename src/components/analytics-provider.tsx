"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { track, type EventType } from "@/lib/analytics";

/**
 * Records a page view on every route change, and contact clicks anywhere on
 * the page: WhatsApp and `tel:` links by their href, anything else that opts
 * in with `data-track="<event>"`.
 */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const search = useSearchParams().toString();
  const viewed = useRef<string | null>(null);

  useEffect(() => {
    const page = `${pathname}?${search}`;
    if (viewed.current === page) return;
    viewed.current = page;
    track("page_view");
  }, [pathname, search]);

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.("a");
      if (!link) return;
      const href = link.getAttribute("href") ?? "";
      const type = (link.dataset.track as EventType | undefined) ??
        (href.startsWith("https://wa.me/") ? "whatsapp_click" : href.startsWith("tel:") ? "call_click" : undefined);
      if (type) track(type, { vehicleId: link.dataset.vehicleId });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);

  return null;
}
