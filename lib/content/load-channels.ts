import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { AUDIENCE_AFFINITY } from "@/data/audiences";
import { BENCHMARKS } from "@/data/benchmarks";
import { INDUSTRY_FIT } from "@/data/industries";
import { publicChannelMarket } from "@/data/market";
import { STAGE_FIT } from "@/data/planner-weights";
import { REGION_STRENGTH, TIER_STRENGTH } from "@/data/regions";
import { ChannelFrontmatter, type ChannelData } from "./schema";

/**
 * Plain Node loader (no React, no server-only) so Vitest and scripts can use it.
 * App code should import from ./channels, which wraps this in React's cache().
 */
export function loadChannels(dir = path.join(process.cwd(), "content/channels")): ChannelData[] {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(".mdx"));
  const channels = files.map((file) => {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), "utf8"));
    const parsed = ChannelFrontmatter.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in content/channels/${file}:\n${parsed.error.toString()}`);
    }
    return merge(parsed.data, content.trim(), file);
  });

  const slugs = new Set<string>();
  for (const c of channels) {
    if (slugs.has(c.slug)) throw new Error(`Duplicate channel slug: ${c.slug}`);
    slugs.add(c.slug);
  }
  for (const c of channels) {
    for (const r of c.related) {
      if (!slugs.has(r)) throw new Error(`Channel ${c.slug} lists unknown related channel "${r}"`);
    }
  }
  return channels.sort((a, b) => a.order - b.order);
}

function merge(fm: ChannelFrontmatter, body: string, file: string): ChannelData {
  const need = <T,>(table: Record<string, T>, name: string): T => {
    const row = table[fm.slug];
    if (!row) throw new Error(`content/channels/${file}: no row for "${fm.slug}" in data/${name}`);
    return row;
  };
  const bench = need(BENCHMARKS, "benchmarks.ts");
  return {
    ...fm,
    body,
    audienceAffinity: need(AUDIENCE_AFFINITY, "audiences.ts"),
    regionStrength: need(REGION_STRENGTH, "regions.ts (REGION_STRENGTH)"),
    tierStrength: need(TIER_STRENGTH, "regions.ts (TIER_STRENGTH)"),
    industryFit: need(INDUSTRY_FIT, "industries.ts"),
    stageFit: need(STAGE_FIT, "planner-weights.ts (STAGE_FIT)"),
    costs: bench.costs,
    frequency: bench.frequency,
    performance: bench.performance,
    roi: bench.roi,
    market: publicChannelMarket(fm.slug),
  };
}
