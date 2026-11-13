import { z } from "zod";
import { AUDIENCE_IDS, type AudienceId } from "@/data/audiences";
import { INDUSTRY_IDS, type IndustryId } from "@/data/industries";
import { ALLOCATION, DURATIONS, OBJECTIVE_IDS, SCENARIOS, STAGE_IDS, type ObjectiveId, type ScenarioId, type StageId } from "@/data/planner-weights";
import { TIER_IDS, ZONE_IDS, type TierId, type ZoneId } from "@/data/regions";
import { planBudget, planChannels } from "./plan";
import type { PlannerChannel } from "./types";

const enumOf = <T extends string>(xs: readonly T[]) => z.enum(xs as unknown as [T, ...T[]]);

/** Everything the planner needs, kept in the URL so plans can be shared. */
export const PlannerState = z.object({
  mode: z.enum(["budget", "channels"]),
  industry: enumOf<IndustryId>(INDUSTRY_IDS),
  stage: enumOf<StageId>(STAGE_IDS),
  objective: enumOf<ObjectiveId>(OBJECTIVE_IDS),
  zones: z.array(enumOf<ZoneId>(ZONE_IDS)),
  tiers: z.array(enumOf<TierId>(TIER_IDS)),
  audiences: z.array(enumOf<AudienceId>(AUDIENCE_IDS)),
  months: z.union([z.literal(1), z.literal(3), z.literal(6), z.literal(12)]),
  budgetINR: z.number().int().min(ALLOCATION.budgetMinINR).max(ALLOCATION.budgetMaxINR),
  include: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  exclude: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  channels: z.array(z.string().regex(/^[a-z0-9-]+$/)),
  intensity: enumOf<ScenarioId>(SCENARIOS.map((s) => s.id)),
});
export type PlannerState = z.infer<typeof PlannerState>;

export const DEFAULT_STATE: PlannerState = {
  mode: "budget",
  industry: "real-estate",
  stage: "growing",
  objective: "leads",
  zones: [],
  tiers: [],
  audiences: [],
  months: 3,
  budgetINR: 15_00_000,
  include: [],
  exclude: [],
  channels: [],
  intensity: "elevate",
};

type Params = Record<string, string | string[] | undefined> | URLSearchParams;

const get = (p: Params, k: string): string | undefined => {
  if (p instanceof URLSearchParams) return p.get(k) ?? undefined;
  const v = p[k];
  return Array.isArray(v) ? v[0] : v;
};
const list = (p: Params, k: string) =>
  (get(p, k) ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

/**
 * Lenient parse: every field falls back to its default on its own, so a bad or old link
 * still opens a usable planner. Unknown channel slugs are dropped.
 */
export function parseState(p: Params, validSlugs: string[]): PlannerState {
  const slugs = new Set(validSlugs);
  const pick = <K extends keyof PlannerState>(key: K, raw: unknown): PlannerState[K] => {
    const r = PlannerState.shape[key].safeParse(raw);
    return (r.success ? r.data : DEFAULT_STATE[key]) as PlannerState[K];
  };
  const months = Number(get(p, "months"));
  const budget = Number(get(p, "budget"));
  const channelsParam = list(p, "channels").filter((s) => slugs.has(s));
  const mode = pick("mode", get(p, "mode"));
  return {
    mode,
    industry: pick("industry", get(p, "industry")),
    stage: pick("stage", get(p, "stage")),
    objective: pick("objective", get(p, "objective")),
    zones: pick("zones", list(p, "zones")),
    tiers: pick("tiers", list(p, "tiers")),
    audiences: pick("audiences", list(p, "aud")),
    months: pick("months", (DURATIONS as readonly number[]).includes(months) ? months : undefined),
    budgetINR: pick("budgetINR", Number.isFinite(budget) ? Math.round(budget) : undefined),
    // Channel pages link with ?mode=budget&channels=slug: treat as must-include in budget mode.
    include: pick("include", [...list(p, "include"), ...(mode === "budget" ? channelsParam : [])].filter((s) => slugs.has(s))),
    exclude: pick("exclude", list(p, "exclude").filter((s) => slugs.has(s))),
    channels: pick("channels", mode === "channels" ? channelsParam : list(p, "pick").filter((s) => slugs.has(s))),
    intensity: pick("intensity", get(p, "intensity")),
  };
}

/** Compact query string; defaults are omitted so links stay short. */
export function toQuery(s: PlannerState): string {
  const q = new URLSearchParams();
  const set = (k: string, v: string, d: string) => v !== d && q.set(k, v);
  q.set("mode", s.mode);
  set("industry", s.industry, "");
  set("stage", s.stage, DEFAULT_STATE.stage);
  set("objective", s.objective, DEFAULT_STATE.objective);
  set("zones", s.zones.join(","), "");
  set("tiers", s.tiers.join(","), "");
  set("aud", s.audiences.join(","), "");
  set("months", String(s.months), String(DEFAULT_STATE.months));
  if (s.mode === "budget") {
    q.set("budget", String(s.budgetINR));
    set("include", s.include.join(","), "");
    set("exclude", s.exclude.join(","), "");
  } else {
    set("channels", s.channels.join(","), "");
    set("intensity", s.intensity, DEFAULT_STATE.intensity);
  }
  return q.toString();
}

/** Runs the right engine for the state. Shared by the UI, /api/plan and the PDF. */
export function runPlan(channels: PlannerChannel[], s: PlannerState) {
  const base = { industry: s.industry, stage: s.stage, objective: s.objective, zones: s.zones, tiers: s.tiers, audiences: s.audiences };
  return s.mode === "budget"
    ? planBudget(channels, { ...base, budgetINR: s.budgetINR, months: s.months, mustInclude: s.include, exclude: s.exclude })
    : planChannels(channels, { ...base, months: s.months, channels: s.channels });
}
export type PlanResult = ReturnType<typeof runPlan>;
