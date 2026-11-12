import { z } from "zod";

export const SourceRef = z.object({
  label: z.string(),
  url: z.string(),
  year: z.number().int(),
  verified: z.boolean().default(false),
});
export type SourceRef = z.infer<typeof SourceRef>;

export const ChannelCategory = z.enum(["ATL", "OOH", "Transit", "Digital", "Sports", "Influence", "BTL"]);
export type ChannelCategory = z.infer<typeof ChannelCategory>;

/**
 * Core channel fields used by the hero ribbon, nav and channel index.
 * The full ChannelData (funnel, affinity, costs, ROI, FAQs…) extends this in M3.
 */
export const ChannelCore = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int().positive(),
  name: z.string(),
  shortName: z.string(),
  category: ChannelCategory,
  tagline: z.string(),
  bestFor: z.string(),
  heroImage: z.string().startsWith("/"),
  cardImage: z.string().startsWith("/"),
  imageIsConcept: z.boolean().default(false),
  ribbonStat: z.string(),
  ribbonStatSource: SourceRef.optional(),
});
export type ChannelCore = z.infer<typeof ChannelCore>;
