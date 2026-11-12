import { rowsToRecord, type Score } from "./matrix";

/** Audience segments (brief §6.2). */
export const AUDIENCES = [
  { id: "gen-z", label: "Gen Z (18–24)" },
  { id: "young-professionals", label: "Urban young professionals" },
  { id: "families", label: "Families & homemakers" },
  { id: "bharat", label: "Bharat / tier 3 & rural" },
  { id: "b2b", label: "Business decision-makers (B2B)" },
  { id: "affluent", label: "Affluent / HNI" },
  { id: "commuters", label: "Daily commuters" },
  { id: "students-parents", label: "Students & parents" },
  { id: "sports-fans", label: "Sports fans" },
] as const;

export type AudienceId = (typeof AUDIENCES)[number]["id"];
export const AUDIENCE_IDS = AUDIENCES.map((a) => a.id) as AudienceId[];

/**
 * Channel × audience affinity, 1 (weak) to 5 (strongest). Planning assumptions seeded
 * from brief §6.3 and refined by judgement; verified: false until checked against
 * audience research (IRS, BARC, platform data).
 *
 * Columns:          GenZ YPro Fam Bharat B2B Affl Comm Stud Sport
 */
export const AUDIENCE_AFFINITY_VERIFIED = false;
export const AUDIENCE_AFFINITY = rowsToRecord<AudienceId>(AUDIENCE_IDS, {
  "print-media":             [1, 3, 4, 4, 5, 4, 2, 3, 2],
  television:                [2, 3, 5, 5, 3, 3, 2, 4, 4],
  radio:                     [2, 3, 3, 3, 2, 2, 5, 2, 2],
  cinema:                    [5, 4, 4, 2, 2, 3, 1, 3, 2],
  "hoardings-billboards":    [3, 3, 4, 3, 3, 3, 5, 3, 2],
  "digital-ooh":             [3, 4, 3, 1, 3, 4, 4, 2, 2],
  "bus-brts-auto":           [3, 3, 3, 3, 2, 1, 5, 3, 2],
  "metro-train-wraps":       [4, 5, 3, 1, 3, 2, 5, 4, 2],
  "inside-metro":            [4, 5, 3, 1, 3, 2, 5, 4, 2],
  "railways-train-branding": [2, 3, 4, 5, 3, 2, 4, 3, 2],
  "airport-branding":        [2, 4, 2, 1, 5, 5, 2, 1, 2],
  "airline-inflight":        [2, 4, 2, 1, 5, 5, 1, 1, 2],
  "cricket-stadiums-sports": [4, 3, 3, 3, 2, 3, 1, 2, 5],
  "brand-ambassadors":       [4, 3, 4, 4, 2, 3, 2, 3, 3],
  "influencers-creators":    [5, 4, 3, 3, 2, 3, 2, 3, 3],
  "social-media":            [5, 5, 3, 3, 3, 3, 3, 4, 3],
  "search-performance":      [3, 4, 3, 3, 4, 3, 3, 4, 2],
  "digital-articles-pr":     [2, 3, 2, 2, 5, 4, 2, 2, 2],
});

export type AudienceAffinity = Record<AudienceId, Score>;
