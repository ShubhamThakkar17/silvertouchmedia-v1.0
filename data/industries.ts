import { rowsToRecord, type Score } from "./matrix";

/**
 * Industries (brief §6.2). `featured` ones get an /industries/[slug] page (deck's six).
 */
export const INDUSTRIES = [
  { id: "real-estate", label: "Real estate", featured: true },
  { id: "solar", label: "Renewable energy & solar", featured: true },
  { id: "manufacturing-b2b", label: "Manufacturing & industrial B2B", featured: true },
  { id: "healthcare", label: "Healthcare & hospitals", featured: true },
  { id: "education", label: "Education & edtech", featured: true },
  { id: "jewellery", label: "Jewellery", featured: true },
  { id: "retail-fashion", label: "Retail & fashion" },
  { id: "fmcg-d2c", label: "FMCG & D2C" },
  { id: "bfsi", label: "BFSI & fintech" },
  { id: "auto-ev", label: "Automobile & EV" },
  { id: "hospitality", label: "Hospitality, travel & F&B" },
  { id: "telecom-saas", label: "Telecom & tech/SaaS" },
  { id: "government", label: "Government & PSU" },
  { id: "media-events", label: "Media, entertainment & events" },
] as const;

export type IndustryId = (typeof INDUSTRIES)[number]["id"];
export const INDUSTRY_IDS = INDUSTRIES.map((i) => i.id) as IndustryId[];

/**
 * Channel × industry fit, 1–5. Planning assumptions (verified: false).
 * Columns: RE Solar Mfg Health Edu Jewel Retail FMCG BFSI Auto Hosp Telco Govt Media
 */
export const INDUSTRY_FIT_VERIFIED = false;
export const INDUSTRY_FIT = rowsToRecord<IndustryId>(INDUSTRY_IDS, {
  "print-media":             [5, 4, 4, 4, 5, 5, 4, 3, 4, 4, 3, 3, 5, 3],
  television:                [3, 2, 2, 3, 3, 4, 4, 5, 4, 5, 3, 4, 4, 4],
  radio:                     [4, 3, 2, 4, 4, 4, 4, 4, 3, 3, 3, 3, 4, 4],
  cinema:                    [3, 2, 1, 2, 3, 4, 4, 4, 3, 4, 4, 4, 2, 5],
  "hoardings-billboards":    [5, 5, 3, 4, 5, 5, 4, 4, 4, 4, 4, 3, 5, 4],
  "digital-ooh":             [4, 3, 2, 3, 3, 4, 5, 4, 4, 4, 4, 4, 3, 4],
  "bus-brts-auto":           [4, 4, 2, 4, 5, 3, 4, 4, 3, 3, 3, 3, 5, 3],
  "metro-train-wraps":       [4, 3, 2, 3, 4, 3, 4, 4, 4, 3, 3, 4, 4, 4],
  "inside-metro":            [4, 3, 2, 4, 5, 3, 4, 4, 4, 3, 3, 4, 4, 4],
  "railways-train-branding": [3, 3, 3, 3, 3, 3, 3, 4, 4, 3, 4, 3, 5, 3],
  "airport-branding":        [4, 3, 4, 3, 3, 4, 4, 3, 5, 4, 5, 4, 3, 3],
  "airline-inflight":        [3, 2, 3, 2, 2, 4, 3, 3, 4, 3, 5, 4, 2, 3],
  "cricket-stadiums-sports": [2, 2, 2, 2, 2, 2, 4, 5, 4, 4, 3, 5, 2, 4],
  "brand-ambassadors":       [3, 2, 1, 3, 3, 5, 5, 5, 4, 5, 3, 4, 3, 4],
  "influencers-creators":    [3, 3, 2, 3, 4, 4, 5, 5, 3, 4, 5, 4, 2, 5],
  "social-media":            [4, 4, 3, 4, 5, 4, 5, 5, 4, 4, 5, 5, 3, 5],
  "search-performance":      [5, 5, 5, 5, 5, 3, 4, 3, 5, 4, 4, 5, 2, 3],
  "digital-articles-pr":     [4, 4, 5, 4, 4, 3, 3, 3, 5, 4, 3, 5, 4, 4],
});

export type IndustryFit = Record<IndustryId, Score>;
