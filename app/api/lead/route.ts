import { NextResponse } from "next/server";
import { label } from "@/lib/planner/describe";
import { clientIp, rateLimit, verifyTurnstile } from "@/lib/leads/guard";
import { deliverLead } from "@/lib/leads/deliver";
import { ContactLead, normalisePhone } from "@/lib/leads/schema";
import { whatsappUrl } from "@/lib/whatsapp";

export const runtime = "nodejs";

/** POST /api/lead: contact form. Validate → bot check → rate limit → Sheet + email. */
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
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true }); // honeypot: drop silently

  const ip = clientIp(req);
  if (!(await rateLimit(`lead:${ip}`))) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  if (!(await verifyTurnstile(d.turnstileToken, ip)).ok) return NextResponse.json({ ok: false, error: "captcha" }, { status: 403 });

  const phone = `+91 ${normalisePhone(d.phone)}`;
  const report = await deliverLead(req, {
    source: "form",
    row: {
      mode: "contact",
      name: d.name,
      company: d.company,
      phone,
      email: d.email,
      city: d.city,
      industry: d.industry ? label.industry(d.industry) : "",
      budget_input: d.budget,
      message: d.message,
    },
    visitor: { name: d.name, email: d.email || undefined },
    whatsappUrl: `https://wa.me/91${normalisePhone(d.phone)}`,
  });
  return NextResponse.json({ ok: true, delivered: report.sheet !== "skipped" || report.notify === "sent", whatsappUrl: whatsappUrl() });
}
