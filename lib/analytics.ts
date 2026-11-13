/**
 * Analytics events (brief §10). Sends to GA4 and Meta Pixel only when their scripts are
 * loaded, which happens after consent (M6). Until then every call is a safe no-op.
 */
export type AnalyticsEvent =
  | "planner_start"
  | "planner_mode"
  | "planner_result"
  | "plan_unlock_submit"
  | "whatsapp_click"
  | "contact_submit"
  | "channel_cta_click";

type W = Window & { gtag?: (...a: unknown[]) => void; fbq?: (...a: unknown[]) => void; dataLayer?: unknown[] };

export function track(event: AnalyticsEvent, params: Record<string, string | number | boolean | undefined> = {}) {
  if (typeof window === "undefined") return;
  const w = window as W;
  try {
    w.gtag?.("event", event, params);
    w.fbq?.("trackCustom", event, params);
    if (process.env.NODE_ENV !== "production") console.debug("[track]", event, params);
  } catch {
    /* never let analytics break the page */
  }
}
