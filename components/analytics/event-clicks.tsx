"use client";

import { useEffect } from "react";
import { track, type AnalyticsEvent } from "@/lib/analytics";

/** Fires analytics for any element marked data-event="…" (CTAs in server components). */
export function EventClicks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const el = (e.target as HTMLElement | null)?.closest<HTMLElement>("[data-event]");
      if (!el) return;
      track(el.dataset.event as AnalyticsEvent, { href: el.getAttribute("href") ?? undefined, path: location.pathname });
    };
    document.addEventListener("click", onClick, { capture: true });
    return () => document.removeEventListener("click", onClick, { capture: true });
  }, []);
  return null;
}
