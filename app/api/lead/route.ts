import { NextResponse } from "next/server";
import { ContactLead } from "@/lib/leads/schema";

/**
 * POST /api/lead (contact form).
 * M4: validates and accepts the lead. M5 adds Turnstile, rate limiting, UTM capture,
 * the Google Sheet webhook and Resend email. Until then `delivered` is false.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const parsed = ContactLead.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  // Honeypot filled: pretend success, drop silently.
  if (parsed.data.website) return NextResponse.json({ ok: true, delivered: false });

  if (process.env.NODE_ENV !== "production") console.info("[lead] contact form (not yet delivered, M5):", { ...parsed.data, phone: "***" });
  return NextResponse.json({ ok: true, delivered: false }, { status: 202 });
}
