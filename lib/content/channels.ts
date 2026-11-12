import "server-only";
import { cache } from "react";
import { loadChannels } from "./load-channels";
import type { ChannelCore, ChannelData } from "./schema";

/** Every channel, validated and merged with /data. Throws at build time on bad content. */
export const getChannels = cache((): ChannelData[] => loadChannels());

export const getChannel = (slug: string): ChannelData | undefined => getChannels().find((c) => c.slug === slug);

/** Small projection for client components (ribbon, nav, index). */
export const toCore = (c: ChannelData): ChannelCore => ({
  slug: c.slug,
  order: c.order,
  name: c.name,
  shortName: c.shortName,
  category: c.category,
  tagline: c.tagline,
  bestFor: c.bestFor,
  heroImage: c.heroImage,
  cardImage: c.cardImage,
  imageIsConcept: c.imageIsConcept,
  ribbonStat: c.ribbonStat,
});
