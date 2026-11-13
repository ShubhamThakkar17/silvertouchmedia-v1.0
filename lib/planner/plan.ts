import { CPL_BY_INDUSTRY } from "@/data/benchmarks";
import {
  activeMonths,
  RATE_VARIANCE,
  ROI_BAND_VALUE,
  ROI_STAGE_SHIFT,
  ROI_THRESHOLDS,
  SCALE_PER_EXTRA_REGION,
  SCENARIOS,
  SUGGESTION_COUNT,
  TOTAL_REACH_DEDUP,
  type FunnelStage,
  type ScenarioId,
} from "@/data/planner-weights";
import { TIERS, ZONE_IDS, type TierId } from "@/data/regions";
import type { RoiBand } from "@/data/benchmarks";
import { recommendMix, scoreChannel } from "./mix";
import type { MixInput, PlannerChannel, ScoreInput } from "./types";

export type Range = { low: number; high: number };

/** Why a channel made the mix. Codes, not prose: the UI and PDF format them from copy. */
export type Reason =
  | { code: "industry"; industry: string; fit: number }
  | { code: "audience"; audience: string; affinity: number }
  | { code: "region"; strength: number }
  | { code: "stage" }
  | { code: "measurement" }
  | { code: "required" };

export type ChannelLine = {
  slug: string;
  name: string;
  category: string;
  amountINR: number;
  share: number;
  score: number;
  role: FunnelStage;
  impressions: Range;
  reach: Range;
  leads?: Range;
  cpl?: Range;
  roiBand: RoiBand;
  reasons: Reason[];
};

export type Assumption =
  | { id: "cpmMultiplier"; value: number }
  | { id: "frequency" }
  | { id: "reachDedup"; value: number }
  | { id: "cpl"; industry: string; low: number; high: number }
  | { id: "minBudget" }
  | { id: "gst" }
  | { id: "rateVariance"; value: number }
  | { id: "regionScale"; value: number };

export type Totals = { budgetINR: number; impressions: Range; reach: Range; leads?: Range; cpl?: Range };

export type RoiSummary = { band: RoiBand; score: number; kpi: "leads" | "reach"; newBrand: boolean };

export type Suggestion = { slug: string; name: string; addINR: number };

export type BudgetPlan = {
  mode: "budget";
  lines: ChannelLine[];
  totals: Totals;
  roi: RoiSummary;
  suggestions: Suggestion[];
  assumptions: Assumption[];
};

export type Scenario = { id: ScenarioId; multiplier: number; totalINR: number; totalRange: Range; lines: ChannelLine[]; totals: Totals; roi: RoiSummary };

export type ChannelsPlan = {
  mode: "channels";
  scenarios: Scenario[];
  assumptions: Assumption[];
  suggestions: Suggestion[];
};

const round = (n: number) => Math.round(n);
const sumR = (rs: Range[]): Range => ({ low: rs.reduce((a, r) => a + r.low, 0), high: rs.reduce((a, r) => a + r.high, 0) });

/** Average CPM multiplier for the selected city tiers (all tiers when none selected). */
export function tierMultiplier(tiers: TierId[]): number {
  const list: readonly { cpmMultiplier: number }[] = tiers.length ? TIERS.filter((t) => tiers.includes(t.id)) : TIERS;
  return Math.round((list.reduce((a, t) => a + t.cpmMultiplier, 0) / list.length) * 1000) / 1000;
}

/** Mode B: more zones means more cities to cover. PAN-India counts as all six. Diminishing. */
export function regionScale(zones: ScoreInput["zones"]): number {
  const n = zones.length || ZONE_IDS.length;
  return Math.round((1 + SCALE_PER_EXTRA_REGION * Math.pow(n - 1, 0.8)) * 1000) / 1000;
}

function topStage(ch: PlannerChannel): FunnelStage {
  const order: FunnelStage[] = ["awareness", "consideration", "conversion", "loyalty"];
  return order.reduce((best, k) => (ch.funnel[k] > ch.funnel[best] ? k : best), order[0]);
}

function reasonsFor(ch: PlannerChannel, input: ScoreInput, flags: { measurement?: boolean; required?: boolean }): Reason[] {
  const out: Reason[] = [];
  if (flags.required) out.push({ code: "required" });
  const fit = ch.industryFit[input.industry];
  if (fit >= 4) out.push({ code: "industry", industry: input.industry, fit });
  const aud = [...input.audiences].sort((a, b) => ch.audienceAffinity[b] - ch.audienceAffinity[a])[0];
  if (aud && ch.audienceAffinity[aud] >= 4) out.push({ code: "audience", audience: aud, affinity: ch.audienceAffinity[aud] });
  if (ch.stageFit[input.stage] >= 5) out.push({ code: "stage" });
  if (flags.measurement) out.push({ code: "measurement" });
  if (out.length < 2) {
    const zones = input.zones.length ? input.zones : ZONE_IDS;
    const strength = Math.round((zones.reduce((a, z) => a + ch.regionStrength[z], 0) / zones.length) * 10) / 10;
    if (strength >= 4) out.push({ code: "region", strength });
  }
  return out.slice(0, 3);
}

/** Impressions, reach and (for performance channels) leads for one allocation. */
export function estimateLine(
  ch: PlannerChannel,
  amountINR: number,
  input: ScoreInput,
  meta: { share: number; score: number; measurement?: boolean; required?: boolean },
): ChannelLine {
  const m = tierMultiplier(input.tiers);
  const impressions: Range = {
    low: round((amountINR / (ch.costs.cpmEquivalent.high * m)) * 1000),
    high: round((amountINR / (ch.costs.cpmEquivalent.low * m)) * 1000),
  };
  const reach: Range = { low: round(impressions.low / ch.frequency), high: round(impressions.high / ch.frequency) };
  let leads: Range | undefined;
  let cpl: Range | undefined;
  if (ch.performance) {
    const base = CPL_BY_INDUSTRY[input.industry];
    cpl = { low: round(base.low * ch.performance.cplMultiplier), high: round(base.high * ch.performance.cplMultiplier) };
    leads = { low: Math.floor(amountINR / cpl.high), high: Math.floor(amountINR / cpl.low) };
  }
  return {
    slug: ch.slug,
    name: ch.name,
    category: ch.category,
    amountINR: round(amountINR),
    share: meta.share,
    score: meta.score,
    role: topStage(ch),
    impressions,
    reach,
    leads,
    cpl,
    roiBand: ch.roi.band,
    reasons: reasonsFor(ch, input, meta),
  };
}

export function totalsFor(lines: ChannelLine[]): Totals {
  const impressions = sumR(lines.map((l) => l.impressions));
  const reachSum = sumR(lines.map((l) => l.reach));
  const reach = { low: round(reachSum.low * TOTAL_REACH_DEDUP), high: round(reachSum.high * TOTAL_REACH_DEDUP) };
  const withLeads = lines.filter((l) => l.leads);
  const leads = withLeads.length ? sumR(withLeads.map((l) => l.leads!)) : undefined;
  const leadSpend = withLeads.reduce((a, l) => a + l.amountINR, 0);
  const cpl = leads && leads.low > 0 ? { low: round(leadSpend / leads.high), high: round(leadSpend / leads.low) } : undefined;
  return { budgetINR: lines.reduce((a, l) => a + l.amountINR, 0), impressions, reach, leads, cpl };
}

/** Allocation-weighted ROI band, shifted by brand stage. */
export function roiFor(lines: ChannelLine[], input: ScoreInput): RoiSummary {
  const total = lines.reduce((a, l) => a + l.amountINR, 0) || 1;
  const weighted = lines.reduce((a, l) => a + ROI_BAND_VALUE[l.roiBand] * (l.amountINR / total), 0);
  const score = Math.round((weighted + ROI_STAGE_SHIFT[input.stage]) * 100) / 100;
  const band: RoiBand = score < ROI_THRESHOLDS.low ? "Low" : score < ROI_THRESHOLDS.high ? "Medium" : "High";
  const kpi = input.objective === "leads" || input.objective === "sales" ? "leads" : "reach";
  return { band, score, kpi, newBrand: input.stage === "pre-launch" || input.stage === "launching" };
}

function suggestionsFor(channels: PlannerChannel[], input: ScoreInput & { months: number }, used: Set<string>): Suggestion[] {
  return channels
    .filter((c) => !used.has(c.slug))
    .map((c) => ({ c, s: scoreChannel(c, input) }))
    .sort((a, b) => b.s - a.s || a.c.order - b.c.order)
    .slice(0, SUGGESTION_COUNT)
    .map(({ c }) => ({
      slug: c.slug,
      name: c.name,
      addINR: c.costs.minEffectiveBudgetINR * activeMonths(input.months, c.costs.minDurationMonths),
    }));
}

function baseAssumptions(input: ScoreInput): Assumption[] {
  const a: Assumption[] = [
    { id: "cpmMultiplier", value: tierMultiplier(input.tiers) },
    { id: "frequency" },
    { id: "reachDedup", value: TOTAL_REACH_DEDUP },
    { id: "minBudget" },
    { id: "gst" },
  ];
  if (input.objective === "leads" || input.objective === "sales") {
    const c = CPL_BY_INDUSTRY[input.industry];
    a.splice(3, 0, { id: "cpl", industry: input.industry, low: c.low, high: c.high });
  }
  return a;
}

/** Mode A: "I have ₹X, which channels should I use?" */
export function planBudget(channels: PlannerChannel[], input: MixInput): BudgetPlan {
  const mix = recommendMix(channels, input);
  const must = new Set(input.mustInclude ?? []);
  const lines = mix.map((m) => {
    const ch = channels.find((c) => c.slug === m.slug)!;
    return estimateLine(ch, m.amountINR, input, {
      share: m.share,
      score: m.score,
      required: must.has(m.slug),
      measurement: !!ch.performance && (input.objective === "leads" || input.objective === "sales"),
    });
  });
  const used = new Set([...lines.map((l) => l.slug), ...(input.exclude ?? [])]);
  return {
    mode: "budget",
    lines,
    totals: totalsFor(lines),
    roi: roiFor(lines, input),
    suggestions: suggestionsFor(channels, input, used),
    assumptions: baseAssumptions(input),
  };
}

/**
 * Mode B: "I want these channels, how much should I spend?"
 * Launch = minimum effective budget × months; Elevate and Dominate scale it. Adjusted for
 * city-tier CPM and the number of zones covered.
 */
export function planChannels(channels: PlannerChannel[], input: ScoreInput & { months: number; channels: string[] }): ChannelsPlan {
  const picked = input.channels.map((s) => channels.find((c) => c.slug === s)).filter((c): c is PlannerChannel => !!c);
  const tierM = tierMultiplier(input.tiers);
  const scale = regionScale(input.zones);
  const scenarios: Scenario[] = SCENARIOS.map((sc) => {
    const amounts = picked.map((c) => c.costs.minEffectiveBudgetINR * activeMonths(input.months, c.costs.minDurationMonths) * sc.multiplier * tierM * scale);
    const total = amounts.reduce((a, b) => a + b, 0);
    const lines = picked.map((c, i) =>
      estimateLine(c, amounts[i], input, { share: total ? Math.round((amounts[i] / total) * 10000) / 10000 : 0, score: scoreChannel(c, input) }),
    );
    return {
      id: sc.id,
      multiplier: sc.multiplier,
      totalINR: round(total),
      totalRange: { low: round(total * (1 - RATE_VARIANCE)), high: round(total * (1 + RATE_VARIANCE)) },
      lines,
      totals: totalsFor(lines),
      roi: roiFor(lines, input),
    };
  });
  const assumptions = baseAssumptions(input);
  assumptions.push({ id: "regionScale", value: scale }, { id: "rateVariance", value: RATE_VARIANCE });
  return { mode: "channels", scenarios, assumptions, suggestions: suggestionsFor(channels, input, new Set(input.channels)) };
}
