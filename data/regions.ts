import { rowsToRecord, type Score } from "./matrix";

export const ZONES = [
  { id: "north", label: "North" },
  { id: "south", label: "South" },
  { id: "east", label: "East" },
  { id: "west", label: "West" },
  { id: "central", label: "Central" },
  { id: "north-east", label: "North-East" },
] as const;
export type ZoneId = (typeof ZONES)[number]["id"];
export const ZONE_IDS = ZONES.map((z) => z.id) as ZoneId[];

/** States and union territories by planning zone. Core states are where we execute most often. */
export const STATES: { id: string; label: string; zone: ZoneId; core?: boolean }[] = [
  { id: "gujarat", label: "Gujarat", zone: "west", core: true },
  { id: "maharashtra", label: "Maharashtra", zone: "west", core: true },
  { id: "rajasthan", label: "Rajasthan", zone: "west", core: true },
  { id: "goa", label: "Goa", zone: "west" },
  { id: "madhya-pradesh", label: "Madhya Pradesh", zone: "central", core: true },
  { id: "chhattisgarh", label: "Chhattisgarh", zone: "central" },
  { id: "delhi", label: "Delhi NCR", zone: "north" },
  { id: "uttar-pradesh", label: "Uttar Pradesh", zone: "north" },
  { id: "punjab", label: "Punjab", zone: "north" },
  { id: "haryana", label: "Haryana", zone: "north" },
  { id: "uttarakhand", label: "Uttarakhand", zone: "north" },
  { id: "himachal-pradesh", label: "Himachal Pradesh", zone: "north" },
  { id: "jammu-kashmir", label: "Jammu & Kashmir", zone: "north" },
  { id: "chandigarh", label: "Chandigarh", zone: "north" },
  { id: "karnataka", label: "Karnataka", zone: "south" },
  { id: "tamil-nadu", label: "Tamil Nadu", zone: "south" },
  { id: "kerala", label: "Kerala", zone: "south" },
  { id: "telangana", label: "Telangana", zone: "south" },
  { id: "andhra-pradesh", label: "Andhra Pradesh", zone: "south" },
  { id: "puducherry", label: "Puducherry", zone: "south" },
  { id: "west-bengal", label: "West Bengal", zone: "east" },
  { id: "odisha", label: "Odisha", zone: "east" },
  { id: "bihar", label: "Bihar", zone: "east" },
  { id: "jharkhand", label: "Jharkhand", zone: "east" },
  { id: "assam", label: "Assam", zone: "north-east" },
  { id: "meghalaya", label: "Meghalaya", zone: "north-east" },
  { id: "tripura", label: "Tripura", zone: "north-east" },
  { id: "manipur", label: "Manipur", zone: "north-east" },
  { id: "nagaland", label: "Nagaland", zone: "north-east" },
  { id: "mizoram", label: "Mizoram", zone: "north-east" },
  { id: "arunachal-pradesh", label: "Arunachal Pradesh", zone: "north-east" },
  { id: "sikkim", label: "Sikkim", zone: "north-east" },
];

/**
 * City tiers with CPM multipliers. PLANNING ASSUMPTIONS (verified: false): applied to a
 * channel's base CPM so the same rupee buys fewer impressions in a metro.
 */
export const TIERS = [
  { id: "metro", label: "Metro", cpmMultiplier: 1.3 },
  { id: "tier1", label: "Tier 1", cpmMultiplier: 1.0 },
  { id: "tier2", label: "Tier 2", cpmMultiplier: 0.75 },
  { id: "tier3", label: "Tier 3 / rural", cpmMultiplier: 0.6 },
] as const;
export type TierId = (typeof TIERS)[number]["id"];
export const TIER_IDS = TIERS.map((t) => t.id) as TierId[];
export const TIERS_VERIFIED = false;

/** Columns: North South East West Central NE. Planning assumptions. */
export const REGION_STRENGTH = rowsToRecord<ZoneId>(ZONE_IDS, {
  "print-media":             [4, 5, 4, 5, 4, 3],
  television:                [5, 5, 5, 5, 5, 4],
  radio:                     [4, 4, 3, 4, 3, 2],
  cinema:                    [4, 5, 3, 4, 3, 2],
  "hoardings-billboards":    [4, 4, 4, 5, 4, 3],
  "digital-ooh":             [4, 4, 3, 4, 3, 2],
  "bus-brts-auto":           [4, 4, 4, 5, 4, 3],
  "metro-train-wraps":       [4, 4, 3, 4, 2, 1],
  "inside-metro":            [4, 4, 3, 4, 2, 1],
  "railways-train-branding": [5, 4, 5, 4, 5, 3],
  "airport-branding":        [4, 4, 3, 4, 3, 3],
  "airline-inflight":        [4, 4, 3, 4, 3, 3],
  "cricket-stadiums-sports": [4, 4, 3, 4, 3, 2],
  "brand-ambassadors":       [5, 5, 5, 5, 5, 4],
  "influencers-creators":    [4, 5, 4, 5, 4, 4],
  "social-media":            [5, 5, 5, 5, 5, 4],
  "search-performance":      [5, 5, 5, 5, 5, 4],
  "digital-articles-pr":     [4, 4, 4, 4, 4, 3],
});

/** Columns: Metro Tier1 Tier2 Tier3/rural. Planning assumptions. */
export const TIER_STRENGTH = rowsToRecord<TierId>(TIER_IDS, {
  "print-media":             [4, 4, 5, 4],
  television:                [4, 5, 5, 5],
  radio:                     [5, 4, 3, 2],
  cinema:                    [5, 4, 3, 2],
  "hoardings-billboards":    [4, 5, 5, 4],
  "digital-ooh":             [5, 4, 2, 1],
  "bus-brts-auto":           [4, 5, 4, 3],
  "metro-train-wraps":       [5, 3, 1, 1],
  "inside-metro":            [5, 3, 1, 1],
  "railways-train-branding": [3, 4, 5, 5],
  "airport-branding":        [5, 4, 2, 1],
  "airline-inflight":        [5, 4, 2, 1],
  "cricket-stadiums-sports": [5, 4, 3, 3],
  "brand-ambassadors":       [5, 5, 5, 4],
  "influencers-creators":    [5, 5, 4, 4],
  "social-media":            [5, 5, 4, 4],
  "search-performance":      [5, 5, 4, 3],
  "digital-articles-pr":     [5, 4, 3, 2],
});
export const REGION_STRENGTH_VERIFIED = false;

export type RegionStrength = Record<ZoneId, Score>;
export type TierStrength = Record<TierId, Score>;
