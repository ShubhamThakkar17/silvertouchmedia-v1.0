import { describe, expect, it } from "vitest";
import { loadChannels } from "@/lib/content/load-channels";
import { activeMonths } from "@/data/planner-weights";
import { recommendMix, scoreChannel } from "./mix";
import { toPlannerChannel, type MixInput } from "./types";

const channels = loadChannels().map(toPlannerChannel);
const base: MixInput = {
  industry: "real-estate",
  stage: "launching",
  objective: "leads",
  zones: ["west"],
  tiers: [],
  audiences: [],
  budgetINR: 40_00_000,
  months: 3,
};

describe("recommendMix", () => {
  it("returns shares that sum to 1 and respect the 50% cap", () => {
    const mix = recommendMix(channels, base);
    expect(mix.length).toBeGreaterThanOrEqual(2);
    expect(mix.reduce((a, l) => a + l.share, 0)).toBeCloseTo(1, 3);
    for (const l of mix) expect(l.share).toBeLessThanOrEqual(0.5 + 1e-6);
  });

  it("keeps a trackable digital channel at ≥10% for leads", () => {
    const mix = recommendMix(channels, { ...base, budgetINR: 3_00_000, months: 1 });
    const digital = mix.filter((l) => ["search-performance", "social-media"].includes(l.slug));
    expect(digital.reduce((a, l) => a + l.share, 0)).toBeGreaterThanOrEqual(0.1 - 1e-6);
  });

  it("never allocates below a channel's minimum effective budget", () => {
    for (const budgetINR of [1_00_000, 8_00_000, 25_00_000, 2_00_00_000]) {
      const mix = recommendMix(channels, { ...base, budgetINR });
      for (const l of mix) {
        const c = channels.find((x) => x.slug === l.slug)!;
        expect(l.amountINR, `${l.slug} @ ${budgetINR}`).toBeGreaterThanOrEqual(c.costs.minEffectiveBudgetINR * activeMonths(base.months, c.costs.minDurationMonths) - 1);
      }
    }
  });

  it("ranks hoardings above airline for a real-estate launch", () => {
    const s = (slug: string) => scoreChannel(channels.find((c) => c.slug === slug)!, base);
    expect(s("hoardings-billboards")).toBeGreaterThan(s("airline-inflight"));
  });
});

describe("recommendMix widths", () => {
  it("narrows the mix so an awareness launch can afford hoardings", () => {
    const mix = recommendMix(channels, { ...base, objective: "awareness", budgetINR: 18_00_000 });
    expect(mix.map((l) => l.slug)).toContain("hoardings-billboards");
  });
});
