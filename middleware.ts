import { NextResponse, type NextRequest } from "next/server";
import { ATTR_COOKIE, ATTR_MAX_AGE, attributionFrom } from "@/lib/leads/attribution";


/**
 * Sets the first-party attribution cookie on the first page view (or whenever a new
 * UTM-tagged visit arrives), so leads carry their source.
 */
export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const hasUtm = req.nextUrl.searchParams.has("utm_source");
  if (req.cookies.has(ATTR_COOKIE) && !hasUtm) return res;
  const value = attributionFrom(new URL(req.url), req.headers.get("referer"));
  res.cookies.set(ATTR_COOKIE, JSON.stringify(value), {
    maxAge: ATTR_MAX_AGE,
    sameSite: "lax",
    secure: req.nextUrl.protocol === "https:",
    httpOnly: true,
    path: "/",
  });
  return res;
}

export const config = {
  // Pages only, and only when there is something to record: a first visit (no cookie yet)
  // or a campaign link. Returning visitors skip the middleware entirely.
  // Next.js requires literal values here; "attr" must match ATTR_COOKIE.
  matcher: [
    {
      source: "/((?!api|_next|images|favicon|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|txt|xml)$).*)",
      missing: [{ type: "cookie", key: "attr" }],
    },
    {
      source: "/((?!api|_next|images|favicon|.*\\.(?:png|jpg|jpeg|webp|avif|svg|ico|txt|xml)$).*)",
      has: [{ type: "query", key: "utm_source" }],
    },
  ],
};
