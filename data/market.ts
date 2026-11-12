import type { SourceId } from "./sources";

/**
 * India media market figures. One primary source per chart (PMAR 2026 for adex by
 * medium). Values in ₹ crore unless stated. `derived: true` means we computed the
 * value from other figures in the same source (shown with a note, never as a quote).
 */
export type MarketFigure = {
  value: number;
  unit: "crore" | "percent" | "trillion";
  label: string;
  year: number;
  source: SourceId;
  derived?: boolean;
  note?: string;
};

export const MARKET_LAST_REVIEWED = "2026-11-12";

export const ADEX = {
  total2025: { value: 155105, unit: "crore", label: "India adex 2025", year: 2025, source: "pmar2026", note: "+12% over 2024, expanded definition" },
  total2026F: { value: 174605, unit: "crore", label: "India adex 2026 forecast", year: 2026, source: "pmar2026" },
  digitalShare2026F: { value: 64, unit: "percent", label: "Digital share of adex, 2026 forecast", year: 2026, source: "pmar2026Digital" },
  traditional2025: { value: 61948, unit: "crore", label: "Traditional media adex 2025", year: 2025, source: "pmar2026Media" },
  traditional2026F: { value: 62629, unit: "crore", label: "Traditional media adex 2026 forecast", year: 2026, source: "pmar2026Media" },
} satisfies Record<string, MarketFigure>;

export type MediumId = "tv" | "print" | "radio" | "cinema" | "outdoor" | "digital";

export type Medium = {
  id: MediumId;
  label: string;
  y2025: number;
  y2026F: number;
  source: SourceId;
  derived?: Partial<Record<"y2025" | "y2026F", true>>;
  note?: string;
};

/** PMAR 2026, ₹ crore. Sums: traditional 61,948 (2025) and 62,629 (2026F); total 1,55,105 and 1,74,605. */
export const MEDIA: Medium[] = [
  { id: "digital", label: "Digital", y2025: 93157, y2026F: 111976, source: "pmar2026Digital", derived: { y2025: true }, note: "2025 digital = total minus traditional." },
  { id: "tv", label: "Television (linear)", y2025: 32855, y2026F: 32855, source: "pmar2026Tv", derived: { y2026F: true }, note: "Forecast flat; 2026 value = traditional total minus the other four media." },
  { id: "print", label: "Print", y2025: 20866, y2026F: 21388, source: "pmar2026Print" },
  { id: "outdoor", label: "Outdoor (OOH)", y2025: 4835, y2026F: 5077, source: "pmar2026Media" },
  { id: "radio", label: "Radio", y2025: 2515, y2026F: 2388, source: "pmar2026Media" },
  { id: "cinema", label: "Cinema", y2025: 877, y2026F: 921, source: "pmar2026Media" },
];

/** Context figures from other reports. Each carries its own source. */
export const CONTEXT = {
  meSector2025: { value: 2.78, unit: "trillion", label: "Indian M&E sector, 2025", year: 2025, source: "ficciEy2026", note: "+9% year on year" },
  oohGrowth2025: { value: 13, unit: "percent", label: "OOH revenue growth, 2025 (FICCI-EY)", year: 2025, source: "ficciEy2026" },
  doohShareOfOoh: { value: 18, unit: "percent", label: "Digital OOH share of OOH revenue", year: 2025, source: "ficciEy2026" },
  transitShareOfOoh: { value: 28, unit: "percent", label: "Transit media share of OOH revenue, 2024", year: 2024, source: "ficciEy2025Transit" },
  airportShareOfTransit: { value: 50, unit: "percent", label: "Airports' share of transit media (over)", year: 2024, source: "m4gAirportTransit" },
  realEstateShareOfOoh: { value: 25, unit: "percent", label: "Real estate share of OOH spend (about)", year: 2025, source: "pmar2026RealEstateOoh" },
  sportsEconomy2025: { value: 18864, unit: "crore", label: "India sports economy, 2025", year: 2025, source: "wppSportingNation2026", note: "+13.4%; cricket 89%" },
  cricketShareOfSports: { value: 89, unit: "percent", label: "Cricket share of sports economy, 2025", year: 2025, source: "wppSportingNation2026" },
  influencer2025Low: { value: 3000, unit: "crore", label: "Influencer marketing, 2025 (low)", year: 2025, source: "kofluence2026" },
  influencer2025High: { value: 3500, unit: "crore", label: "Influencer marketing, 2025 (high)", year: 2025, source: "kofluence2026" },
} satisfies Record<string, MarketFigure>;

export const DEFINITIONS_NOTE =
  "Reports define adex differently. For example, dentsu-e4m puts television at about 21% of adex (₹25,964 Cr) and print at 14%. We cite one primary source per chart.";

/** The market block shown on each channel page. Keys refer to MEDIA or CONTEXT. */
export type ChannelMarket = {
  headline: string;
  sizeINRcr?: number;
  year: number;
  growthPct?: number;
  sharePct?: number;
  source: SourceId;
  note?: string;
};

const share = (v: number) => Math.round((v / ADEX.total2025.value) * 1000) / 10;
const growth = (a: number, b: number) => Math.round(((b - a) / a) * 1000) / 10;
const medium = (id: MediumId) => MEDIA.find((m) => m.id === id)!;
const fromMedium = (id: MediumId, headline: string): ChannelMarket => {
  const m = medium(id);
  return {
    headline,
    sizeINRcr: m.y2025,
    year: 2025,
    growthPct: growth(m.y2025, m.y2026F),
    sharePct: share(m.y2025),
    source: m.source,
    note: "Growth is the 2026 forecast over 2025. Share is of total 2025 adex.",
  };
};

/** Channel slug → market block. Channels without a clean published figure are left out. */
export const CHANNEL_MARKET: Record<string, ChannelMarket> = {
  "print-media": fromMedium("print", "Print adex"),
  television: fromMedium("tv", "Linear TV adex"),
  radio: fromMedium("radio", "Radio adex"),
  cinema: fromMedium("cinema", "Cinema adex"),
  "hoardings-billboards": fromMedium("outdoor", "Outdoor (OOH) adex"),
  "digital-ooh": { headline: "Digital OOH share of OOH revenue", sharePct: 18, year: 2025, source: "ficciEy2026" },
  "bus-brts-auto": { headline: "Transit share of OOH revenue", sharePct: 28, year: 2024, source: "ficciEy2025Transit" },
  "metro-train-wraps": { headline: "Transit share of OOH revenue", sharePct: 28, year: 2024, source: "ficciEy2025Transit" },
  "inside-metro": { headline: "Transit share of OOH revenue", sharePct: 28, year: 2024, source: "ficciEy2025Transit" },
  "railways-train-branding": { headline: "Transit share of OOH revenue", sharePct: 28, year: 2024, source: "ficciEy2025Transit" },
  "airport-branding": { headline: "Airports' share of transit media", sharePct: 50, year: 2024, source: "m4gAirportTransit", note: "Reported as over 50%." },
  "cricket-stadiums-sports": { headline: "India sports economy", sizeINRcr: 18864, growthPct: 13.4, year: 2025, source: "wppSportingNation2026", note: "Cricket is 89% of it. Growth is 2025 over 2024." },
  "influencers-creators": { headline: "Influencer marketing (low end of ₹3,000–3,500 Cr range)", sizeINRcr: 3000, year: 2025, source: "kofluence2026" },
  "social-media": fromMedium("digital", "Digital adex (all formats)"),
  "search-performance": fromMedium("digital", "Digital adex (all formats)"),
  "digital-articles-pr": fromMedium("digital", "Digital adex (all formats)"),
};

/** Highlights for the home page market snapshot, in display order. */
export const SNAPSHOT: MarketFigure[] = [ADEX.total2025, ADEX.digitalShare2026F, CONTEXT.oohGrowth2025, CONTEXT.sportsEconomy2025];
