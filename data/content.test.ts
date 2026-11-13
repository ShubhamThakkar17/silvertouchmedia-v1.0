import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { copy } from "@/brand/copy";
import { WITHHELD_NAMES } from "@/brand/withheld-names";
import { loadChannels } from "@/lib/content/load-channels";
import { AUDIENCE_AFFINITY } from "./audiences";
import { BENCHMARKS, CPL_BY_INDUSTRY } from "./benchmarks";
import { INDUSTRY_FIT, INDUSTRY_IDS } from "./industries";
import { ADEX, CHANNEL_MARKET, MEDIA } from "./market";
import { ALLOCATION, OBJECTIVE_FUNNEL, STAGE_FIT } from "./planner-weights";
import { REGION_STRENGTH, TIER_STRENGTH } from "./regions";
import { getSource, SOURCES } from "./sources";

const channels = loadChannels();
const slugs = channels.map((c) => c.slug).sort();

function filesIn(dir: string, ext: RegExp): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .flatMap((e) => (e.isDirectory() ? filesIn(path.join(dir, e.name), ext) : ext.test(e.name) ? [path.join(dir, e.name)] : []));
}

describe("channel content", () => {
  it("loads all 18 channels in order", () => {
    expect(channels).toHaveLength(18);
    expect(channels.map((c) => c.order)).toEqual(Array.from({ length: 18 }, (_, i) => i + 1));
  });

  it("has a row in every /data table for every channel, and no orphan rows", () => {
    const tables = { AUDIENCE_AFFINITY, REGION_STRENGTH, TIER_STRENGTH, INDUSTRY_FIT, STAGE_FIT, BENCHMARKS };
    for (const [name, table] of Object.entries(tables)) {
      expect(Object.keys(table).sort(), name).toEqual(slugs);
    }
    for (const key of Object.keys(CHANNEL_MARKET)) expect(slugs, `CHANNEL_MARKET.${key}`).toContain(key);
  });

  it("has a written guide body for every channel", () => {
    for (const c of channels) expect(c.body.split(/\s+/).length, c.slug).toBeGreaterThan(120);
  });

  it("links In the wild only to https articles, 2+ per channel", () => {
    for (const c of channels) {
      expect(c.inTheWild.length, c.slug).toBeGreaterThanOrEqual(2);
      for (const w of c.inTheWild) expect(w.url.startsWith("https://"), w.url).toBe(true);
    }
  });
});

describe("benchmarks", () => {
  it("has sane ranges", () => {
    for (const [slug, b] of Object.entries(BENCHMARKS)) {
      expect(b.costs.lowINR, slug).toBeLessThanOrEqual(b.costs.highINR);
      expect(b.costs.cpmEquivalent.low, slug).toBeLessThanOrEqual(b.costs.cpmEquivalent.high);
      expect(b.costs.minEffectiveBudgetINR, slug).toBeGreaterThan(0);
      expect(b.frequency, slug).toBeGreaterThanOrEqual(1);
    }
    for (const id of INDUSTRY_IDS) expect(CPL_BY_INDUSTRY[id].low).toBeLessThanOrEqual(CPL_BY_INDUSTRY[id].high);
  });

  it("marks only performance channels as measurement channels", () => {
    for (const id of ALLOCATION.measurementChannels) expect(BENCHMARKS[id]?.performance, id).toBeDefined();
  });

  it("uses objective weights that sum to 1", () => {
    for (const [id, w] of Object.entries(OBJECTIVE_FUNNEL)) {
      const sum = Object.values(w).reduce((a, b) => a + b, 0);
      expect(sum, id).toBeCloseTo(1, 5);
    }
  });
});

describe("market figures", () => {
  it("adds up within PMAR 2026", () => {
    const sum = (k: "y2025" | "y2026F") => MEDIA.reduce((a, m) => a + m[k], 0);
    expect(sum("y2025")).toBe(ADEX.total2025.value);
    expect(sum("y2026F")).toBe(ADEX.total2026F.value);
  });

  it("cites a real source for every market number", () => {
    for (const m of MEDIA) expect(getSource(m.source).url, m.id).toMatch(/^https:\/\//);
    for (const [slug, m] of Object.entries(CHANNEL_MARKET)) expect(SOURCES[m.source], slug).toBeDefined();
  });
});

describe("copy rules", () => {
  const publicText = [
    ...filesIn("content", /\.mdx?$/).map((f) => [f, fs.readFileSync(f, "utf8")] as const),
    ["brand/copy.ts", JSON.stringify(copy)] as const,
  ];

  it("contains no em dashes", () => {
    for (const [f, text] of publicText) expect(text.includes("—"), f).toBe(false);
  });

  it.skipIf(WITHHELD_NAMES.length === 0)("never names withheld clients or vendors", () => {
    const dataText = filesIn("data", /\.ts$/)
      .filter((f) => !f.endsWith(".test.ts"))
      .map((f) => [f, fs.readFileSync(f, "utf8")] as const);
    for (const [f, text] of [...publicText, ...dataText]) {
      for (const name of WITHHELD_NAMES) expect(text.toLowerCase().includes(name.toLowerCase()), `${f}: ${name}`).toBe(false);
    }
  });
});

describe("public claims", () => {
  it("only shows ribbon stats backed by a verified source", () => {
    for (const c of channels) {
      if (c.ribbonStatSource) expect(SOURCES[c.ribbonStatSource].verified, `${c.slug}: ${c.ribbonStat}`).toBe(true);
    }
  });
  it("never shows an unverified market block on a channel page", () => {
    for (const c of channels) if (c.market) expect(SOURCES[c.market.source].verified, c.slug).toBe(true);
  });
});
