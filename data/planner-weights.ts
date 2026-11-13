import { rowsToRecord, type Score } from "./matrix";

/** Every planner knob lives here so a clone can retune without touching /lib/planner. */
export const PLANNER_LAST_REVIEWED = "2026-11-12";

export const STAGES = [
  { id: "pre-launch", label: "Pre-launch / new" },
  { id: "launching", label: "Launching now" },
  { id: "growing", label: "Growing (1–5 yrs)" },
  { id: "established", label: "Established (5+ yrs)" },
  { id: "relaunch", label: "Relaunch / repositioning" },
] as const;
export type StageId = (typeof STAGES)[number]["id"];
export const STAGE_IDS = STAGES.map((s) => s.id) as StageId[];

export const OBJECTIVES = [
  { id: "awareness", label: "Awareness" },
  { id: "consideration", label: "Consideration & trust" },
  { id: "leads", label: "Leads / enquiries" },
  { id: "sales", label: "Sales / footfall" },
  { id: "employer-investor", label: "Employer brand / investor visibility" },
] as const;
export type ObjectiveId = (typeof OBJECTIVES)[number]["id"];
export const OBJECTIVE_IDS = OBJECTIVES.map((o) => o.id) as ObjectiveId[];

export const DURATIONS = [1, 3, 6, 12] as const;
export type DurationMonths = (typeof DURATIONS)[number];

export type FunnelStage = "awareness" | "consideration" | "conversion" | "loyalty";

/** objectiveFit = Σ funnel[stage] × weight. Weights per objective sum to 1. */
export const OBJECTIVE_FUNNEL: Record<ObjectiveId, Partial<Record<FunnelStage, number>>> = {
  awareness: { awareness: 1 },
  consideration: { awareness: 0.3, consideration: 0.7 },
  leads: { consideration: 0.3, conversion: 0.7 },
  sales: { conversion: 0.7, loyalty: 0.3 },
  "employer-investor": { awareness: 0.5, consideration: 0.5 },
};

/** score(ch) = wI·industry + wS·stage + wO·objective + wR·region + wA·audience (each on 1–5). */
export const SCORE_WEIGHTS = { industry: 0.3, stage: 0.15, objective: 0.25, region: 0.15, audience: 0.15 };

/**
 * Stage rules (brief §9.2) as multipliers on a channel category's score.
 * Pre-launch / launching boost awareness channels; established tilts to performance;
 * relaunch boosts PR, OOH and social.
 */
export const STAGE_CATEGORY_BOOST: Record<StageId, Partial<Record<string, number>>> = {
  "pre-launch": { OOH: 1.15, ATL: 1.05, Influence: 1.1, Transit: 1.05 },
  launching: { OOH: 1.15, ATL: 1.1, Influence: 1.1, Transit: 1.05 },
  growing: {},
  established: { Digital: 1.1, Sports: 1.05 },
  relaunch: { OOH: 1.1, Influence: 1.05, Digital: 1.05 },
};
/** Extra per-channel boosts on top of the category rule (e.g. PR on relaunch). */
export const STAGE_CHANNEL_BOOST: Record<StageId, Partial<Record<string, number>>> = {
  "pre-launch": { "digital-articles-pr": 1.1, cinema: 1.05 },
  launching: { "digital-articles-pr": 1.1, cinema: 1.05 },
  growing: {},
  established: { "search-performance": 1.05 },
  relaunch: { "digital-articles-pr": 1.15, "social-media": 1.05 },
};

/** Columns: pre-launch launching growing established relaunch. Planning assumptions. */
export const STAGE_FIT = rowsToRecord<StageId>(STAGE_IDS, {
  "print-media":             [3, 4, 4, 4, 4],
  television:                [3, 4, 4, 5, 4],
  radio:                     [3, 4, 4, 4, 3],
  cinema:                    [4, 4, 3, 3, 3],
  "hoardings-billboards":    [5, 5, 4, 4, 5],
  "digital-ooh":             [4, 4, 4, 4, 4],
  "bus-brts-auto":           [4, 4, 4, 3, 3],
  "metro-train-wraps":       [5, 5, 4, 3, 4],
  "inside-metro":            [4, 4, 4, 4, 4],
  "railways-train-branding": [3, 3, 4, 4, 3],
  "airport-branding":        [4, 4, 4, 5, 4],
  "airline-inflight":        [3, 3, 3, 4, 3],
  "cricket-stadiums-sports": [3, 4, 3, 5, 4],
  "brand-ambassadors":       [3, 5, 4, 4, 5],
  "influencers-creators":    [5, 5, 5, 4, 5],
  "social-media":            [5, 5, 5, 5, 5],
  "search-performance":      [3, 4, 5, 5, 4],
  "digital-articles-pr":     [5, 5, 4, 4, 5],
});
export type StageFit = Record<StageId, Score>;

/** Mode A: how many channels to recommend for a given total budget (₹). */
export const CHANNEL_COUNT_BY_BUDGET: { maxINR: number; min: number; max: number }[] = [
  { maxINR: 5_00_000, min: 2, max: 3 },
  { maxINR: 25_00_000, min: 3, max: 5 },
  { maxINR: 1_00_00_000, min: 4, max: 7 },
  { maxINR: Number.POSITIVE_INFINITY, min: 5, max: 9 },
];

export const ALLOCATION = {
  /** Allocation ∝ score^k. */
  scoreExponent: 1.5,
  /** Max share for any one channel unless the user picked only one. */
  maxShare: 0.5,
  /** For leads/sales objectives, at least this share goes to a trackable digital channel. */
  measurementFloorShare: 0.1,
  measurementChannels: ["search-performance", "social-media"],
  measurementObjectives: ["leads", "sales"] as ObjectiveId[],
  /** Budget slider bounds (₹). */
  budgetMinINR: 1_00_000,
  budgetMaxINR: 10_00_00_000,
};

/** Mode B scenario multipliers on each channel's minimum effective budget. */
export const SCENARIOS = [
  { id: "launch", label: "Launch", multiplier: 1 },
  { id: "elevate", label: "Elevate", multiplier: 2.5 },
  { id: "dominate", label: "Dominate", multiplier: 6 },
] as const;
export type ScenarioId = (typeof SCENARIOS)[number]["id"];

/** Mode B: each extra state or city cluster adds this share of the base budget (diminishing). */
export const SCALE_PER_EXTRA_REGION = 0.35;

/**
 * ROI expectations. Bands are averaged by allocation (Low=1, Medium=2, High=3) and
 * shifted by stage: new brands get a lower short-term band and a payback note.
 */
export const ROI_BAND_VALUE = { Low: 1, Medium: 2, High: 3 } as const;
export const ROI_STAGE_SHIFT: Record<StageId, number> = {
  "pre-launch": -0.5,
  launching: -0.3,
  growing: 0,
  established: 0.15,
  relaunch: -0.15,
};
/* The new-brand ROI note lives in brand/copy.ts (planner.results.newBrandNote). */

/** Total reach across channels overlaps; sum of channel reach is multiplied by this. Assumption. */
export const TOTAL_REACH_DEDUP = 0.65;
/** Mode B totals are shown as a range of ± this share for rate and inventory variance. */
export const RATE_VARIANCE = 0.15;
/** How many "channels we'd add" to suggest. */
export const SUGGESTION_COUNT = 3;
/** Weighted ROI value thresholds: below `low` → Low, below `high` → Medium, else High. */
export const ROI_THRESHOLDS = { low: 1.6, high: 2.4 };

/**
 * Flighting: on longer plans a channel need not run every month. The minimum effective
 * budget applies to this many active months (assumption; brief §9.2 "duration factor").
 */
export const ACTIVE_MONTHS: Record<DurationMonths, number> = { 1: 1, 3: 3, 6: 4, 12: 6 };
export const activeMonths = (months: number, minDurationMonths = 1) =>
  Math.max(ACTIVE_MONTHS[months as DurationMonths] ?? months, minDurationMonths);
