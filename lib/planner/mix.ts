import {
  ALLOCATION,
  CHANNEL_COUNT_BY_BUDGET,
  OBJECTIVE_FUNNEL,
  SCORE_WEIGHTS,
  STAGE_CATEGORY_BOOST,
  STAGE_CHANNEL_BOOST,
  type FunnelStage,
} from "@/data/planner-weights";
import type { MixInput, MixLine, PlannerChannel, ScoreInput } from "./types";

const avg = (xs: number[]) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0);

/** Objective fit on the 0–5 funnel scale. */
export function objectiveFit(ch: PlannerChannel, objective: ScoreInput["objective"]): number {
  const w = OBJECTIVE_FUNNEL[objective];
  return (Object.keys(w) as FunnelStage[]).reduce((s, k) => s + (w[k] ?? 0) * ch.funnel[k], 0);
}

/**
 * score(ch) = wI·industry + wS·stage + wO·objective + wR·region + wA·audience,
 * then multiplied by the stage rules (category and channel boosts). Range ≈ 1–5.75.
 */
export function scoreChannel(ch: PlannerChannel, input: ScoreInput): number {
  const zones = input.zones.length ? input.zones : (Object.keys(ch.regionStrength) as ScoreInput["zones"]);
  const tiers = input.tiers.length ? input.tiers : (Object.keys(ch.tierStrength) as ScoreInput["tiers"]);
  const region = (avg(zones.map((z) => ch.regionStrength[z])) + avg(tiers.map((t) => ch.tierStrength[t]))) / 2;
  const audience = input.audiences.length ? avg(input.audiences.map((a) => ch.audienceAffinity[a])) : 3;

  const base =
    SCORE_WEIGHTS.industry * ch.industryFit[input.industry] +
    SCORE_WEIGHTS.stage * ch.stageFit[input.stage] +
    SCORE_WEIGHTS.objective * objectiveFit(ch, input.objective) +
    SCORE_WEIGHTS.region * region +
    SCORE_WEIGHTS.audience * audience;

  const boost = (STAGE_CATEGORY_BOOST[input.stage][ch.category] ?? 1) * (STAGE_CHANNEL_BOOST[input.stage][ch.slug] ?? 1);
  return Math.round(base * boost * 1000) / 1000;
}

export function channelCountFor(budgetINR: number) {
  return CHANNEL_COUNT_BY_BUDGET.find((b) => budgetINR <= b.maxINR) ?? CHANNEL_COUNT_BY_BUDGET[CHANNEL_COUNT_BY_BUDGET.length - 1];
}

/** Normalise weights to shares, capping any single share and spreading the excess. */
function capShares(weights: number[], cap: number): number[] {
  let shares = normalise(weights);
  if (shares.length <= 1) return shares;
  for (let i = 0; i < 10; i++) {
    const over = shares.map((s) => Math.max(0, s - cap));
    const excess = over.reduce((a, b) => a + b, 0);
    if (excess < 1e-9) break;
    const free = shares.map((s) => (s < cap ? s : 0));
    const freeSum = free.reduce((a, b) => a + b, 0);
    shares = shares.map((s, j) => (s >= cap ? cap : s + (freeSum ? (excess * free[j]) / freeSum : 0)));
  }
  return shares;
}

const normalise = (xs: number[]) => {
  const t = xs.reduce((a, b) => a + b, 0);
  return xs.map((x) => (t ? x / t : 0));
};

/**
 * Mode A core (brief §9.2): top-N by score, allocation ∝ score^k, 50% cap,
 * measurement floor for leads/sales, drop channels below their minimum effective
 * budget for the duration and redistribute. Pure and deterministic.
 */
export function recommendMix(channels: PlannerChannel[], input: MixInput): MixLine[] {
  const exclude = new Set(input.exclude ?? []);
  const must = new Set((input.mustInclude ?? []).filter((s) => !exclude.has(s)));
  const scored = channels
    .filter((c) => !exclude.has(c.slug))
    .map((c) => ({ c, score: scoreChannel(c, input) }))
    .sort((a, b) => b.score - a.score || a.c.order - b.c.order);

  const { min, max } = channelCountFor(input.budgetINR);
  const needsFloor = ALLOCATION.measurementObjectives.includes(input.objective);
  const isMeasure = (slug: string) => ALLOCATION.measurementChannels.includes(slug);
  const minFor = (c: PlannerChannel) => c.costs.minEffectiveBudgetINR * Math.max(input.months, c.costs.minDurationMonths ?? 1);
  const ordered = [...scored.filter((s) => must.has(s.c.slug)), ...scored.filter((s) => !must.has(s.c.slug))];
  type Picked = (typeof scored)[number];

  /** Top n by score (required channels first), swapping in the best measurement channel when needed. */
  const pickTop = (n: number): Picked[] => {
    let p = ordered.slice(0, Math.max(n, must.size));
    if (needsFloor && !p.some((x) => isMeasure(x.c.slug))) {
      const best = scored.find((s) => isMeasure(s.c.slug));
      if (best) p = [...p.slice(0, Math.max(must.size, p.length - 1)), best];
    }
    return p;
  };

  const allocate = (picked: Picked[]) => {
    let shares = capShares(
      picked.map((p) => Math.pow(p.score, ALLOCATION.scoreExponent)),
      picked.length === 1 ? 1 : ALLOCATION.maxShare,
    );
    if (needsFloor) {
      const i = picked.findIndex((p) => isMeasure(p.c.slug));
      if (i >= 0 && shares[i] < ALLOCATION.measurementFloorShare) {
        const deficit = ALLOCATION.measurementFloorShare - shares[i];
        const rest = 1 - shares[i];
        shares = shares.map((s, j) => (j === i ? ALLOCATION.measurementFloorShare : s - (deficit * s) / rest));
      }
    }
    return picked.map((p, i) => ({ p, share: shares[i], amount: shares[i] * input.budgetINR }));
  };
  type Line = ReturnType<typeof allocate>[number];
  const under = (lines: Line[]) => lines.filter((l) => l.amount < minFor(l.p.c) && !must.has(l.p.c.slug));
  const format = (lines: Line[]): MixLine[] =>
    lines
      .map((l) => ({ slug: l.p.c.slug, score: l.p.score, share: Math.round(l.share * 10000) / 10000, amountINR: Math.round(l.amount) }))
      .sort((a, b) => b.share - a.share);

  // 1. The widest mix in the budget's range where every channel clears its minimum effective budget.
  for (let n = max; n >= min; n--) {
    const lines = allocate(pickTop(n));
    if (!under(lines).length) return format(lines);
  }

  // 2. Otherwise drop under-minimum channels (lowest score first) and redistribute.
  let picked = pickTop(min);
  for (;;) {
    const lines = allocate(picked);
    const short = under(lines);
    if (short.length && picked.length > 1) {
      const worst = short.sort((a, b) => a.p.score - b.p.score)[0];
      picked = picked.filter((p) => p !== worst.p);
      continue;
    }
    return short.length ? [] : format(lines);
  }
}
