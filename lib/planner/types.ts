import type { AudienceId } from "@/data/audiences";
import type { IndustryId } from "@/data/industries";
import type { ObjectiveId, StageId } from "@/data/planner-weights";
import type { TierId, ZoneId } from "@/data/regions";
import type { ChannelData } from "@/lib/content/schema";

/** The slice of ChannelData the planner needs. Small enough to ship to the browser. */
export type PlannerChannel = Pick<
  ChannelData,
  | "slug"
  | "order"
  | "name"
  | "shortName"
  | "category"
  | "funnel"
  | "industryFit"
  | "stageFit"
  | "regionStrength"
  | "tierStrength"
  | "audienceAffinity"
  | "costs"
  | "roi"
  | "frequency"
  | "performance"
>;

export const toPlannerChannel = (c: ChannelData): PlannerChannel => ({
  slug: c.slug,
  order: c.order,
  name: c.name,
  shortName: c.shortName,
  category: c.category,
  funnel: c.funnel,
  industryFit: c.industryFit,
  stageFit: c.stageFit,
  regionStrength: c.regionStrength,
  tierStrength: c.tierStrength,
  audienceAffinity: c.audienceAffinity,
  costs: c.costs,
  roi: c.roi,
  frequency: c.frequency,
  performance: c.performance,
});

export type ScoreInput = {
  industry: IndustryId;
  stage: StageId;
  objective: ObjectiveId;
  /** Empty = PAN-India. */
  zones: ZoneId[];
  /** Empty = all tiers. */
  tiers: TierId[];
  audiences: AudienceId[];
};

export type MixInput = ScoreInput & {
  budgetINR: number;
  months: number;
  mustInclude?: string[];
  exclude?: string[];
};

export type MixLine = { slug: string; score: number; share: number; amountINR: number };
