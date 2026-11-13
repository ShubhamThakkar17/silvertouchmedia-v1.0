/**
 * Admin review pages (data audit, scene sheet) are available in local dev and on Vercel
 * preview deployments (behind Vercel login), never on production.
 */
export const adminAllowed = () => process.env.NODE_ENV !== "production" || process.env.VERCEL_ENV === "preview";
