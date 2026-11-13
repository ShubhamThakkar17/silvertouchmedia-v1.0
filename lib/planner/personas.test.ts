import { describe, expect, it } from "vitest";
import { loadChannels } from "@/lib/content/load-channels";
import { DEFAULT_STATE, parseState, runPlan, toQuery, type PlannerState } from "./state";
import { toPlannerChannel } from "./types";

const channels = loadChannels().map(toPlannerChannel);
const slugs = channels.map((c) => c.slug);
const s = (over: Partial<PlannerState>): PlannerState => ({ ...DEFAULT_STATE, ...over });

/** Brief §9.2: deterministic snapshots for 10 personas. Update with `pnpm test -u` after an intentional data change. */
const PERSONAS: Record<string, PlannerState> = {
  "Ahmedabad real-estate launch ₹40 L, 3 months": s({ industry: "real-estate", stage: "launching", objective: "awareness", zones: ["west"], tiers: ["tier1"], budgetINR: 40_00_000, months: 3 }),
  "PAN-India D2C established ₹2 Cr, 6 months": s({ industry: "fmcg-d2c", stage: "established", objective: "sales", budgetINR: 2_00_00_000, months: 6, audiences: ["gen-z", "young-professionals"] }),
  "Gujarat solar EPC B2B ₹8 L leads": s({ industry: "solar", stage: "growing", objective: "leads", zones: ["west"], tiers: ["tier1", "tier2"], budgetINR: 8_00_000, months: 3, audiences: ["b2b"] }),
  "Indore hospital ₹6 L leads, 3 months": s({ industry: "healthcare", stage: "established", objective: "leads", zones: ["central"], tiers: ["tier1"], budgetINR: 6_00_000, months: 3, audiences: ["families"] }),
  "Pune college admissions ₹15 L": s({ industry: "education", stage: "growing", objective: "leads", zones: ["west"], tiers: ["metro"], budgetINR: 15_00_000, months: 3, audiences: ["students-parents", "gen-z"] }),
  "Surat jeweller festive ₹25 L, 1 month": s({ industry: "jewellery", stage: "established", objective: "sales", zones: ["west"], tiers: ["tier1"], budgetINR: 25_00_000, months: 1, audiences: ["families", "affluent"] }),
  "National bank awareness ₹5 Cr, 12 months": s({ industry: "bfsi", stage: "established", objective: "awareness", budgetINR: 5_00_00_000, months: 12 }),
  "Small manufacturer ₹3 L, 1 month": s({ industry: "manufacturing-b2b", stage: "pre-launch", objective: "leads", zones: ["west"], budgetINR: 3_00_000, months: 1, audiences: ["b2b"] }),
  "Mode B: developer picks hoardings, search, social": s({ mode: "channels", industry: "real-estate", stage: "launching", zones: ["west"], tiers: ["tier1"], months: 3, channels: ["hoardings-billboards", "search-performance", "social-media"] }),
  "Mode B: FMCG picks TV, creators, cricket": s({ mode: "channels", industry: "fmcg-d2c", stage: "relaunch", objective: "awareness", months: 6, channels: ["television", "influencers-creators", "cricket-stadiums-sports"] }),
};

/** Compact snapshot: what a reviewer needs to eyeball, not every field. */
function summary(state: PlannerState) {
  const r = runPlan(channels, state);
  if (r.mode === "budget") {
    return {
      mix: r.lines.map((l) => `${l.slug} ${Math.round(l.share * 100)}% ₹${l.amountINR}`),
      impressions: r.totals.impressions,
      reach: r.totals.reach,
      leads: r.totals.leads,
      roi: r.roi.band,
      add: r.suggestions.map((x) => x.slug),
    };
  }
  return { scenarios: r.scenarios.map((sc) => `${sc.id} ₹${sc.totalINR} reach ${sc.totals.reach.low}-${sc.totals.reach.high} roi ${sc.roi.band}`) };
}

describe("planner personas", () => {
  for (const [name, state] of Object.entries(PERSONAS)) {
    it(name, () => expect(summary(state)).toMatchSnapshot());
  }
});

describe("plan invariants", () => {
  it("budget mode spends exactly the budget (±₹ rounding)", () => {
    for (const st of Object.values(PERSONAS).filter((p) => p.mode === "budget")) {
      const r = runPlan(channels, st);
      if (r.mode !== "budget" || !r.lines.length) continue;
      expect(Math.abs(r.totals.budgetINR - st.budgetINR)).toBeLessThanOrEqual(r.lines.length);
    }
  });
  it("ranges are ordered low ≤ high", () => {
    for (const st of Object.values(PERSONAS)) {
      const r = runPlan(channels, st);
      const lines = r.mode === "budget" ? r.lines : r.scenarios.flatMap((x) => x.lines);
      for (const l of lines) {
        expect(l.impressions.low).toBeLessThanOrEqual(l.impressions.high);
        if (l.leads) expect(l.leads.low).toBeLessThanOrEqual(l.leads.high);
      }
    }
  });
  it("scenarios scale Launch < Elevate < Dominate", () => {
    const r = runPlan(channels, PERSONAS["Mode B: developer picks hoardings, search, social"]);
    if (r.mode !== "channels") throw new Error("mode");
    const t = r.scenarios.map((x) => x.totalINR);
    expect(t[0]).toBeLessThan(t[1]);
    expect(t[1]).toBeLessThan(t[2]);
  });
});

describe("URL state", () => {
  it("round-trips through the query string", () => {
    for (const st of Object.values(PERSONAS)) {
      expect(parseState(new URLSearchParams(toQuery(st)), slugs)).toEqual(st);
    }
  });
  it("falls back field by field on bad input and drops unknown channels", () => {
    const st = parseState(new URLSearchParams("mode=channels&industry=nope&months=7&channels=radio,bogus&zones=west,mars"), slugs);
    expect(st.industry).toBe(DEFAULT_STATE.industry);
    expect(st.months).toBe(DEFAULT_STATE.months);
    expect(st.channels).toEqual(["radio"]);
    expect(st.zones).toEqual(DEFAULT_STATE.zones);
  });
  it("treats a channel-page link as must-include in budget mode", () => {
    const st = parseState(new URLSearchParams("mode=budget&channels=radio"), slugs);
    expect(st.include).toEqual(["radio"]);
    const r = runPlan(channels, st);
    if (r.mode === "budget") expect(r.lines.map((l) => l.slug)).toContain("radio");
  });
});
