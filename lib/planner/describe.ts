import { copy } from "@/brand/copy";
import { AUDIENCES } from "@/data/audiences";
import { INDUSTRIES } from "@/data/industries";
import { OBJECTIVES, STAGES } from "@/data/planner-weights";
import { TIERS, ZONES } from "@/data/regions";
import { formatCountRange, formatINR, formatINRCompact } from "@/lib/format-inr";
import type { Assumption, Reason } from "./plan";
import type { PlanResult, PlannerState } from "./state";

/**
 * Turns engine codes into display text from brand copy. Shared by the planner UI,
 * the PDF, the emails and the Sheet row, so all four always say the same thing.
 */
/** Lowercase a label for mid-sentence use, but keep acronyms and names ("FMCG & D2C", "Gen Z"). */
const softLower = (s: string) => (/^([A-Z]{2}|Gen Z|Bharat)/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1));

const fill = (tpl: string, vars: Record<string, string | number>) => tpl.replace(/\{(\w+)\}/g, (_, k) => String(vars[k] ?? ""));

export const label = {
  industry: (id: string) => INDUSTRIES.find((i) => i.id === id)?.label ?? id,
  stage: (id: string) => STAGES.find((s) => s.id === id)?.label ?? id,
  objective: (id: string) => OBJECTIVES.find((o) => o.id === id)?.label ?? id,
  audience: (id: string) => AUDIENCES.find((a) => a.id === id)?.label ?? id,
  zone: (id: string) => ZONES.find((z) => z.id === id)?.label ?? id,
  tier: (id: string) => TIERS.find((t) => t.id === id)?.label ?? id,
};

export function describeReason(r: Reason): string {
  const w = copy.planner.why;
  switch (r.code) {
    case "industry":
      return fill(w.industry, { industry: softLower(label.industry(r.industry)) });
    case "audience":
      return fill(w.audience, { audience: softLower(label.audience(r.audience)) });
    case "region":
      return w.region;
    case "stage":
      return w.stage;
    case "measurement":
      return w.measurement;
    case "required":
      return w.required;
  }
}

export function describeAssumption(a: Assumption): string {
  const t = copy.planner.assumptions;
  switch (a.id) {
    case "cpmMultiplier":
      return fill(t.cpmMultiplier, { value: a.value });
    case "frequency":
      return t.frequency;
    case "reachDedup":
      return fill(t.reachDedup, { pct: Math.round(a.value * 100) });
    case "cpl":
      return fill(t.cpl, { industry: softLower(label.industry(a.industry)), low: formatINR(a.low), high: formatINR(a.high) });
    case "minBudget":
      return t.minBudget;
    case "gst":
      return t.gst;
    case "rateVariance":
      return fill(t.rateVariance, { pct: Math.round(a.value * 100) });
    case "regionScale":
      return fill(t.regionScale, { value: a.value });
  }
}

export function monthsLabel(n: number) {
  return `${n} ${n === 1 ? copy.planner.fields.month : copy.planner.fields.months}`;
}

/** Inputs as label/value pairs (PDF, email, WhatsApp). */
export function describeInputs(s: PlannerState): { k: string; v: string }[] {
  const f = copy.planner.fields;
  const rows: { k: string; v: string }[] = [
    { k: copy.planner.modeLabel, v: copy.planner.modes[s.mode].label },
    { k: f.industry, v: label.industry(s.industry) },
    { k: f.stage, v: label.stage(s.stage) },
    { k: f.objective, v: label.objective(s.objective) },
    { k: f.zones, v: s.zones.length ? s.zones.map(label.zone).join(", ") : f.panIndia },
    { k: f.tiers, v: s.tiers.length ? s.tiers.map(label.tier).join(", ") : f.tiersAll },
    { k: f.audiences, v: s.audiences.length ? s.audiences.map(label.audience).join(", ") : f.any },
    { k: copy.planner.steps.duration, v: monthsLabel(s.months) },
  ];
  if (s.mode === "budget") rows.push({ k: f.budget, v: formatINR(s.budgetINR) });
  return rows;
}

/** One-line summary for WhatsApp and the lead email subject. */
export function oneLiner(s: PlannerState, r: PlanResult, names: (slug: string) => string): string {
  if (r.mode === "budget") {
    const mix = r.lines.map((l) => `${names(l.slug)} ${Math.round(l.share * 100)}%`).join(", ");
    return `${label.industry(s.industry)}, ${formatINRCompact(s.budgetINR)} over ${monthsLabel(s.months)}: ${mix || "no mix yet"}. Reach ${formatCountRange(r.totals.reach.low, r.totals.reach.high)}.`;
  }
  const sc = r.scenarios.find((x) => x.id === s.intensity) ?? r.scenarios[0];
  return `${label.industry(s.industry)}, ${s.channels.map(names).join(", ")} over ${monthsLabel(s.months)}: ${copy.planner.scenarios[sc.id].label} about ${formatINRCompact(sc.totalINR)}.`;
}

export { fill };
