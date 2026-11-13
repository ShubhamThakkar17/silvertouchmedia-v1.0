import { NextResponse } from "next/server";
import { copy } from "@/brand";
import { getChannels } from "@/lib/content/channels";
import { formatCountRange, formatINR } from "@/lib/format-inr";
import { clientIp, rateLimit, verifyTurnstile } from "@/lib/leads/guard";
import { deliverLead } from "@/lib/leads/deliver";
import { normalisePhone, PlanLead } from "@/lib/leads/schema";
import { renderPlanPdf } from "@/lib/pdf/plan-pdf";
import { fill, label, monthsLabel, oneLiner } from "@/lib/planner/describe";
import { parseState, runPlan, toQuery } from "@/lib/planner/state";
import { toPlannerChannel } from "@/lib/planner/types";
import { whatsappUrl } from "@/lib/whatsapp";

export const runtime = "nodejs";
export const maxDuration = 30;

/**
 * POST /api/plan: planner unlock. The plan is recomputed here from the query string, so
 * the PDF, email and Sheet never trust numbers sent by the browser.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }
  const parsed = PlanLead.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "invalid", issues: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const d = parsed.data;
  if (d.website) return NextResponse.json({ ok: true });

  const ip = clientIp(req);
  if (!(await rateLimit(`plan:${ip}`))) return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  if (!(await verifyTurnstile(d.turnstileToken, ip)).ok) return NextResponse.json({ ok: false, error: "captcha" }, { status: 403 });

  const all = getChannels();
  const channels = all.map(toPlannerChannel);
  const state = parseState(new URLSearchParams(d.query), channels.map((c) => c.slug));
  const plan = runPlan(channels, state);
  const name = (slug: string) => all.find((c) => c.slug === slug)?.name ?? slug;

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? new URL(req.url).origin;
  const link = `${site}/planner?${toQuery(state)}`;
  const summary = oneLiner(state, plan, name);
  const wa = whatsappUrl(fill(copy.planner.whatsappText, { summary, link }));

  const pdf = await renderPlanPdf({
    state,
    plan,
    contact: { name: d.name, company: d.company || undefined, city: d.city || undefined },
    notes: all.map((c) => ({ slug: c.slug, name: c.name, tagline: c.tagline, unitLabel: c.costs.unitLabel, lowINR: c.costs.lowINR, highINR: c.costs.highINR, kpi: c.roi.kpi })),
    date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }),
  });

  const sel = plan.mode === "channels" ? (plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0]) : null;
  const lines = plan.mode === "budget" ? plan.lines : sel!.lines;
  const totals = plan.mode === "budget" ? plan.totals : sel!.totals;
  const roi = plan.mode === "budget" ? plan.roi : sel!.roi;
  const fileSlug = (d.company || d.name).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "plan";
  const filename = `media-plan-${fileSlug}.pdf`;

  const report = await deliverLead(req, {
    source: "planner",
    row: {
      mode: state.mode,
      name: d.name,
      company: d.company,
      phone: `+91 ${normalisePhone(d.phone)}`,
      email: d.email,
      city: d.city,
      industry: label.industry(state.industry),
      brand_stage: label.stage(state.stage),
      objective: label.objective(state.objective),
      regions: [state.zones.length ? state.zones.map(label.zone).join(", ") : copy.planner.fields.panIndia, state.tiers.map(label.tier).join(", ")].filter(Boolean).join(" · "),
      audiences: state.audiences.map(label.audience).join(", "),
      duration: monthsLabel(state.months),
      budget_input: state.mode === "budget" ? formatINR(state.budgetINR) : "",
      channels_selected: (state.mode === "budget" ? state.include : state.channels).map(name).join(", "),
      recommended_mix_json: JSON.stringify(lines.map((l) => ({ channel: l.slug, share: l.share, inr: l.amountINR }))),
      scenario_totals: plan.mode === "channels" ? plan.scenarios.map((x) => `${x.id}: ${formatINR(x.totalINR)}`).join(" | ") : "",
      est_impressions: formatCountRange(totals.impressions.low, totals.impressions.high),
      est_reach: formatCountRange(totals.reach.low, totals.reach.high),
      roi_band: roi.band,
      message: [d.message, `Plan: ${link}`].filter(Boolean).join("\n"),
    },
    visitor: { name: d.name, email: d.email || undefined },
    attachments: [{ filename, content: pdf }],
    whatsappUrl: `https://wa.me/91${normalisePhone(d.phone)}`,
  });

  return NextResponse.json({
    ok: true,
    emailed: report.visitor === "sent",
    filename,
    pdfBase64: pdf.toString("base64"),
    whatsappUrl: wa,
  });
}
