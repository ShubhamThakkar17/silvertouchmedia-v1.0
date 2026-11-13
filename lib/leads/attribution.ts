/**
 * First-party attribution cookie (brief §10): UTM params, referrer, landing page and
 * device, captured on the first page view and attached to every lead.
 * Set by middleware.ts; read by the lead APIs. No third-party calls.
 */
export const ATTR_COOKIE = "attr";
export const ATTR_MAX_AGE = 60 * 60 * 24 * 90; // 90 days

export type Attribution = {
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  referrer?: string;
  landing?: string;
  ts?: string;
};

const clip = (s: string | null | undefined, n = 200) => (s ? s.slice(0, n) : undefined);

export function attributionFrom(url: URL, referrer: string | null): Attribution {
  const sp = url.searchParams;
  const ref = referrer && !referrer.startsWith(url.origin) ? referrer : undefined;
  return {
    utm_source: clip(sp.get("utm_source")),
    utm_medium: clip(sp.get("utm_medium")),
    utm_campaign: clip(sp.get("utm_campaign")),
    referrer: clip(ref),
    landing: clip(url.pathname + url.search, 300),
    ts: new Date().toISOString(),
  };
}

export function readAttribution(cookieHeader: string | null): Attribution {
  const raw = cookieHeader
    ?.split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith(`${ATTR_COOKIE}=`))
    ?.slice(ATTR_COOKIE.length + 1);
  if (!raw) return {};
  try {
    const v = JSON.parse(decodeURIComponent(raw)) as Attribution;
    return typeof v === "object" && v ? v : {};
  } catch {
    return {};
  }
}

export function deviceFrom(ua: string | null): "mobile" | "tablet" | "desktop" {
  const s = (ua ?? "").toLowerCase();
  if (/ipad|tablet/.test(s)) return "tablet";
  if (/mobi|android|iphone/.test(s)) return "mobile";
  return "desktop";
}
