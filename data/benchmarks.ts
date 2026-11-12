import type { IndustryId } from "./industries";
import type { SourceId } from "./sources";

/**
 * Per-channel cost and ROI benchmarks used by channel pages and the planner.
 * All amounts in ₹, before 18% GST.
 *
 * Rule of thumb for `verified`: true only when the range comes straight from a rate card
 * or a cited source. Everything else is a planning placeholder for the media team to
 * replace (listed on /admin/data-audit).
 */
export type CostUnit =
  | "CPM"
  | "CPT"
  | "CPC"
  | "CPL"
  | "per-insertion"
  | "per-month-site"
  | "per-spot"
  | "per-post"
  | "per-campaign";

export type RoiBand = "Low" | "Medium" | "High";

export type Benchmark = {
  costs: {
    unit: CostUnit;
    /** What one unit buys, in plain words (shown next to the range). */
    unitLabel: string;
    lowINR: number;
    highINR: number;
    /** Effective CPM used by the planner to estimate impressions. */
    cpmEquivalent: { low: number; high: number };
    /** Per campaign month. Below this the planner drops the channel. */
    minEffectiveBudgetINR: number;
    minDurationMonths?: number;
    leadTimeDays: number;
    verified: boolean;
    source: SourceId;
    /** Separate source for the CPM equivalent when it differs. */
    cpmVerified: boolean;
    note?: string;
  };
  /** Average frequency assumed when converting impressions to reach. */
  frequency: number;
  /** Performance channels produce a leads estimate from the industry CPL table. */
  performance?: { cplMultiplier: number };
  roi: {
    band: RoiBand;
    kpi: string;
    rangeNote: string;
    verified: boolean;
    source: SourceId;
  };
};

export const BENCHMARKS: Record<string, Benchmark> = {
  "print-media": {
    costs: {
      unit: "per-insertion",
      unitLabel: "per insertion, regional edition to magazine full page",
      lowINR: 50_000,
      highINR: 8_00_000,
      cpmEquivalent: { low: 150, high: 600 },
      minEffectiveBudgetINR: 2_00_000,
      leadTimeDays: 3,
      verified: false,
      source: "rateCardTrain",
      cpmVerified: false,
      note: "Anchor: in-train magazine full page ₹2,00,000 per edition (rate card). Newspaper rates vary by edition and day.",
    },
    frequency: 1.5,
    roi: { band: "Medium", kpi: "Readership reach, QR scans and phone enquiries", rangeNote: "Strongest for trust and local launches; track with a dedicated number or QR.", verified: false, source: "assumption" },
  },
  television: {
    costs: {
      unit: "per-spot",
      unitLabel: "per 10-second spot, regional channel to national sport",
      lowINR: 1_500,
      highINR: 18_00_000,
      cpmEquivalent: { low: 60, high: 250 },
      minEffectiveBudgetINR: 10_00_000,
      leadTimeDays: 10,
      verified: false,
      source: "e4mIplRates2025",
      cpmVerified: false,
      note: "Upper end is IPL 2025 SD late-season pricing (cited). Regional spot rates are placeholders.",
    },
    frequency: 4,
    roi: { band: "Medium", kpi: "Reach, GRPs and brand recall", rangeNote: "Awareness channel: report reach and frequency, not ROAS.", verified: false, source: "assumption" },
  },
  radio: {
    costs: {
      unit: "per-spot",
      unitLabel: "per 10-second spot, one city",
      lowINR: 300,
      highINR: 3_000,
      cpmEquivalent: { low: 40, high: 150 },
      minEffectiveBudgetINR: 1_50_000,
      leadTimeDays: 5,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 6,
    roi: { band: "Medium", kpi: "Reach, frequency and branded search lift", rangeNote: "Cheap frequency in drive time; pair with search to catch intent.", verified: false, source: "assumption" },
  },
  cinema: {
    costs: {
      unit: "per-spot",
      unitLabel: "per screen per week, 30-second spot",
      lowINR: 1_000,
      highINR: 6_000,
      cpmEquivalent: { low: 250, high: 700 },
      minEffectiveBudgetINR: 2_00_000,
      leadTimeDays: 7,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 1.3,
    roi: { band: "Medium", kpi: "Audience delivered and ad recall", rangeNote: "High attention, low frequency; best around big releases.", verified: false, source: "assumption" },
  },
  "hoardings-billboards": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per site per month, 20×20 ft city to 81×41 ft expressway",
      lowINR: 25_000,
      highINR: 1_75_000,
      cpmEquivalent: { low: 20, high: 120 },
      minEffectiveBudgetINR: 2_50_000,
      leadTimeDays: 7,
      verified: true,
      source: "rateCardExpressway",
      cpmVerified: false,
      note: "Rent only. Add printing and mounting (about ₹14 per sq ft). A 40×41 ft board is about ₹23,000 to print and mount.",
    },
    frequency: 8,
    roi: { band: "Medium", kpi: "Reach, frequency and footfall on the route", rangeNote: "Awareness channel: plan 3+ sites on one route for real frequency.", verified: false, source: "assumption" },
  },
  "digital-ooh": {
    costs: {
      unit: "CPM",
      unitLabel: "per 1,000 plays, programmatic or package",
      lowINR: 150,
      highINR: 600,
      cpmEquivalent: { low: 150, high: 600 },
      minEffectiveBudgetINR: 1_50_000,
      leadTimeDays: 3,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 6,
    roi: { band: "Medium", kpi: "Plays, audience delivered, QR scans", rangeNote: "Day-parting and quick creative swaps make it more flexible than static.", verified: false, source: "assumption" },
  },
  "bus-brts-auto": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per vehicle per month, auto hood to full bus wrap",
      lowINR: 1_500,
      highINR: 25_000,
      cpmEquivalent: { low: 15, high: 80 },
      minEffectiveBudgetINR: 1_50_000,
      leadTimeDays: 7,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 6,
    roi: { band: "Medium", kpi: "Route coverage and reach", rangeNote: "Low cost per impression; creative must read in three seconds.", verified: false, source: "assumption" },
  },
  "metro-train-wraps": {
    costs: {
      unit: "per-campaign",
      unitLabel: "per train wrap, outside and inside, typical campaign",
      lowINR: 8_00_000,
      highINR: 45_00_000,
      cpmEquivalent: { low: 80, high: 300 },
      minEffectiveBudgetINR: 5_00_000,
      leadTimeDays: 15,
      verified: false,
      source: "sb18MetroWraps",
      cpmVerified: false,
      note: "Upper bound reported by Storyboard18 (up to ₹45 lakh upfront). Lower bound is a placeholder.",
    },
    frequency: 8,
    roi: { band: "Medium", kpi: "Daily ridership exposure and social sharing", rangeNote: "Launch impact; hard to attribute directly, so pair with search and social.", verified: false, source: "assumption" },
  },
  "inside-metro": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per panel or station package per month",
      lowINR: 15_000,
      highINR: 1_50_000,
      cpmEquivalent: { low: 40, high: 180 },
      minEffectiveBudgetINR: 2_00_000,
      leadTimeDays: 10,
      verified: false,
      source: "assumption",
      cpmVerified: false,
      note: "Station naming rights are priced separately and usually run for years.",
    },
    frequency: 10,
    roi: { band: "Medium", kpi: "Dwell-time exposure, QR scans", rangeNote: "Long dwell time suits detailed messages and QR offers.", verified: false, source: "assumption" },
  },
  "railways-train-branding": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per train per month, LED screens to headrests",
      lowINR: 1_25_000,
      highINR: 8_00_000,
      cpmEquivalent: { low: 60, high: 250 },
      minEffectiveBudgetINR: 1_25_000,
      minDurationMonths: 3,
      leadTimeDays: 7,
      verified: true,
      source: "rateCardTrain",
      cpmVerified: false,
      note: "Tejas LED ₹1.25 L, Vande Bharat LED ₹2–3 L, headrest ₹8 L per month. Minimum 3 months; execution 7 days after railway artwork approval.",
    },
    frequency: 3,
    roi: { band: "Medium", kpi: "Seated passengers reached per month", rangeNote: "Captive, seated audience on fixed corridors.", verified: false, source: "assumption" },
  },
  "airport-branding": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per site per month, backlit panel to gate takeover",
      lowINR: 1_50_000,
      highINR: 15_00_000,
      cpmEquivalent: { low: 300, high: 900 },
      minEffectiveBudgetINR: 3_00_000,
      leadTimeDays: 15,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 2,
    roi: { band: "Medium", kpi: "Affluent reach and brand stature", rangeNote: "Premium audience at a premium CPM; judge on who you reach.", verified: false, source: "assumption" },
  },
  "airline-inflight": {
    costs: {
      unit: "per-month-site",
      unitLabel: "per fleet package per month, headrests, trays or magazine",
      lowINR: 2_00_000,
      highINR: 20_00_000,
      cpmEquivalent: { low: 400, high: 1_200 },
      minEffectiveBudgetINR: 4_00_000,
      leadTimeDays: 21,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 1.2,
    roi: { band: "Low", kpi: "Affluent reach and recall", rangeNote: "Niche, high-value audience; rarely a volume play.", verified: false, source: "assumption" },
  },
  "cricket-stadiums-sports": {
    costs: {
      unit: "per-campaign",
      unitLabel: "per match or tournament package, domestic to IPL",
      lowINR: 2_00_000,
      highINR: 50_00_000,
      cpmEquivalent: { low: 50, high: 250 },
      minEffectiveBudgetINR: 5_00_000,
      leadTimeDays: 21,
      verified: false,
      source: "assumption",
      cpmVerified: false,
      note: "Broadcast exposure of boundary LED and perimeter boards drives most of the value.",
    },
    frequency: 2,
    roi: { band: "Medium", kpi: "On-screen exposure seconds and reach", rangeNote: "Big reach in a short window; plan around fixtures.", verified: false, source: "assumption" },
  },
  "brand-ambassadors": {
    costs: {
      unit: "per-campaign",
      unitLabel: "per year, regional face to national celebrity",
      lowINR: 10_00_000,
      highINR: 5_00_00_000,
      cpmEquivalent: { low: 400, high: 1_200 },
      minEffectiveBudgetINR: 10_00_000,
      leadTimeDays: 30,
      verified: false,
      source: "assumption",
      cpmVerified: false,
      note: "Fee only; the ambassador needs paid media to carry them. The CPM equivalent is deliberately high so the planner stays conservative.",
    },
    frequency: 3,
    roi: { band: "Medium", kpi: "Recall, trust and conversion lift on other channels", rangeNote: "A multiplier on media, not a channel on its own.", verified: false, source: "assumption" },
  },
  "influencers-creators": {
    costs: {
      unit: "per-post",
      unitLabel: "per post or reel, nano to macro creator",
      lowINR: 2_000,
      highINR: 2_50_000,
      cpmEquivalent: { low: 100, high: 400 },
      minEffectiveBudgetINR: 75_000,
      leadTimeDays: 7,
      verified: false,
      source: "pastProposals",
      cpmVerified: false,
      note: "Kofluence 2026 reports average tier 3 campaign costs of ₹35,000–90,000. City pages in our proposals ranged ₹1,500–18,000 per post.",
    },
    frequency: 2,
    roi: { band: "Medium", kpi: "Reach, engagement and saves; leads when run as ads", rangeNote: "Best results come from long-term creators and boosting the best posts.", verified: false, source: "kofluence2026" },
  },
  "social-media": {
    costs: {
      unit: "CPM",
      unitLabel: "per 1,000 impressions on Meta, YouTube or LinkedIn",
      lowINR: 80,
      highINR: 250,
      cpmEquivalent: { low: 80, high: 250 },
      minEffectiveBudgetINR: 50_000,
      leadTimeDays: 2,
      verified: false,
      source: "assumption",
      cpmVerified: false,
      note: "LinkedIn runs several times higher than Meta.",
    },
    frequency: 3,
    performance: { cplMultiplier: 1 },
    roi: { band: "High", kpi: "Cost per lead and qualified enquiries", rangeNote: "Measurable to the rupee; quality depends on landing page and follow-up speed.", verified: false, source: "assumption" },
  },
  "search-performance": {
    costs: {
      unit: "CPC",
      unitLabel: "per click on Google Search",
      lowINR: 15,
      highINR: 150,
      cpmEquivalent: { low: 400, high: 1_500 },
      minEffectiveBudgetINR: 50_000,
      leadTimeDays: 2,
      verified: false,
      source: "assumption",
      cpmVerified: false,
    },
    frequency: 1.5,
    performance: { cplMultiplier: 1.25 },
    roi: { band: "High", kpi: "Cost per lead, conversion rate, ROAS", rangeNote: "Catches demand other channels create; highest intent per rupee.", verified: false, source: "assumption" },
  },
  "digital-articles-pr": {
    costs: {
      unit: "per-insertion",
      unitLabel: "per article or release, regional portal to national publisher",
      lowINR: 15_000,
      highINR: 3_00_000,
      cpmEquivalent: { low: 200, high: 800 },
      minEffectiveBudgetINR: 50_000,
      leadTimeDays: 5,
      verified: false,
      source: "e4mNative",
      cpmVerified: false,
      note: "A digital media release in our proposals was ₹48,000; a sponsored article was reported at about ₹1.5 lakh (older source).",
    },
    frequency: 1.3,
    roi: { band: "Medium", kpi: "Share of voice, branded search and backlinks", rangeNote: "Builds credibility that lifts every other channel's conversion.", verified: false, source: "assumption" },
  },
};

/**
 * Cost per lead by industry (₹), for performance channels. Planning assumptions,
 * verified: false. Solar and manufacturing anchor on targets from our past plans.
 */
export const CPL_BY_INDUSTRY: Record<IndustryId, { low: number; high: number }> = {
  "real-estate": { low: 800, high: 3_000 },
  solar: { low: 1_000, high: 2_500 },
  "manufacturing-b2b": { low: 3_000, high: 15_000 },
  healthcare: { low: 300, high: 1_500 },
  education: { low: 300, high: 1_200 },
  jewellery: { low: 500, high: 2_000 },
  "retail-fashion": { low: 200, high: 800 },
  "fmcg-d2c": { low: 100, high: 500 },
  bfsi: { low: 400, high: 2_000 },
  "auto-ev": { low: 600, high: 2_500 },
  hospitality: { low: 300, high: 1_200 },
  "telecom-saas": { low: 1_500, high: 6_000 },
  government: { low: 200, high: 1_000 },
  "media-events": { low: 100, high: 600 },
};
export const CPL_VERIFIED = false;

export const GST_RATE = 0.18;
