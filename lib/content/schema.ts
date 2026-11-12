import { z } from "zod";
import type { AudienceAffinity } from "@/data/audiences";
import type { Benchmark } from "@/data/benchmarks";
import type { IndustryFit } from "@/data/industries";
import type { ChannelMarket } from "@/data/market";
import type { StageFit } from "@/data/planner-weights";
import type { RegionStrength, TierStrength } from "@/data/regions";
import { sourceIds, type SourceId } from "@/data/sources";

export const ChannelCategory = z.enum(["ATL", "OOH", "Transit", "Digital", "Sports", "Influence", "BTL"]);
export type ChannelCategory = z.infer<typeof ChannelCategory>;

const SourceIdSchema = z.enum(sourceIds as [SourceId, ...SourceId[]]);
const level = z.number().int().min(0).max(5);

/**
 * Editorial fields that live in content/channels/*.mdx frontmatter. Numbers used for
 * planning (affinity, fit, costs, ROI, market) live in /data and are merged in by the
 * loader, so the media team edits one table instead of 18 files.
 */
export const ChannelFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().positive(),
  name: z.string(),
  shortName: z.string(),
  category: ChannelCategory,
  /** Mono label on the channel hero, e.g. "OUT-OF-HOME". */
  label: z.string(),
  tagline: z.string(),
  bestFor: z.string(),
  /** One-sentence summary used in meta descriptions and the channel index. */
  summary: z.string().max(200),
  heroImage: z.string().startsWith("/"),
  cardImage: z.string().startsWith("/"),
  imageIsConcept: z.boolean().default(false),
  imageCredit: z
    .object({ photographer: z.string(), url: z.string().url(), provider: z.enum(["Unsplash", "Pexels"]), licence: z.string() })
    .optional(),
  ribbonStat: z.string(),
  ribbonStatSource: SourceIdSchema.optional(),
  formats: z.array(z.object({ name: z.string(), note: z.string().optional() })).min(3),
  funnel: z.object({ awareness: level, consideration: level, conversion: level, loyalty: level }),
  /** What the agency handles for this channel, PAN-India. */
  execution: z.array(z.string()).min(4),
  inTheWild: z
    .array(
      z.object({
        brand: z.string(),
        title: z.string(),
        url: z.string().url(),
        publisher: z.string(),
        year: z.number().int().optional(),
        /** Our own one-line summary. Never copied from the article. */
        summary: z.string(),
        embed: z.enum(["youtube", "instagram"]).optional(),
        embedUrl: z.string().url().optional(),
      }),
    )
    .default([]),
  faqs: z.array(z.object({ q: z.string(), a: z.string() })).min(3),
  related: z.array(z.string()).min(2),
  /** Stock-photo search terms for scripts/fetch-images.ts. */
  stockQueries: z.array(z.string()).min(1),
});
export type ChannelFrontmatter = z.infer<typeof ChannelFrontmatter>;

/** Fields the hero ribbon, nav and index need. Kept small for client bundles. */
export type ChannelCore = Pick<
  ChannelFrontmatter,
  "slug" | "order" | "name" | "shortName" | "category" | "tagline" | "bestFor" | "heroImage" | "cardImage" | "imageIsConcept" | "ribbonStat"
>;

/** The full channel object (brief §6.1), assembled from frontmatter + /data. */
export type ChannelData = ChannelFrontmatter & {
  body: string;
  audienceAffinity: AudienceAffinity;
  regionStrength: RegionStrength;
  tierStrength: TierStrength;
  industryFit: IndustryFit;
  stageFit: StageFit;
  costs: Benchmark["costs"];
  frequency: Benchmark["frequency"];
  performance?: Benchmark["performance"];
  roi: Benchmark["roi"];
  market?: ChannelMarket;
};
