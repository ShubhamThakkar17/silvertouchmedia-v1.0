/**
 * Every figure on the site points at one of these sources by id.
 *
 * verified: true  → the figure was checked against the publisher's own release or a
 *                   trade-press report of it (see `checked`).
 * verified: false → planning placeholder or unconfirmed; listed on /admin/data-audit.
 * internal: true  → our own rate cards and past proposals. Never shown with vendor or
 *                   client names; the public label stays generic.
 */
export type Source = {
  publisher: string;
  report: string;
  url?: string;
  year: number;
  verified: boolean;
  internal?: boolean;
  /** Date we last checked the figure against the source (YYYY-MM-DD). */
  checked?: string;
  note?: string;
};

export const SOURCES = {
  pmar2026: {
    publisher: "Pitch Madison (via exchange4media)",
    report: "Pitch Madison Advertising Report 2026",
    url: "https://www.exchange4media.com/marketing-news/indias-total-adex-poised-to-cross-rs-175-lakh-crore-in-2026-pmar-152312.html",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
    note: "Expanded ADEX definition. Medium split and 2026 forecast as reported by exchange4media and Social Samosa.",
  },
  pmar2026Print: {
    publisher: "Pitch Madison (via exchange4media)",
    report: "Pitch Madison Advertising Report 2026: print",
    url: "https://www.exchange4media.com/media-print-news/print-adex-rose-to-rs-20866-crore-in-2025-pmar-2026-152310.html",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  pmar2026Tv: {
    publisher: "Pitch Madison (via exchange4media)",
    report: "Pitch Madison Advertising Report 2026: television",
    url: "https://www.exchange4media.com/advertising-news/tv-advertising-contracts-5-in-2025-152317.html",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  pmar2026Media: {
    publisher: "Pitch Madison (via Social Samosa)",
    report: "Pitch Madison Advertising Report 2026: medium forecast",
    url: "https://www.socialsamosa.com/report/ad-market-projected-to-grow-flat-volumes-digital-formats-11151322",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  pmar2026Digital: {
    publisher: "Pitch Madison (via exchange4media)",
    report: "Pitch Madison Advertising Report 2026: digital",
    url: "https://www.exchange4media.com/digital-news/indias-ad-economy-crosses-digital-milestone-64-share-projected-for-2026-pmar-152319.html",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  pmar2026RealEstateOoh: {
    publisher: "Pitch Madison",
    report: "Pitch Madison Advertising Report 2026: OOH by category",
    url: "https://www.exchange4media.com/tags/pitch-madison-advertising-report-2026.html",
    year: 2026,
    verified: false,
    note: "Real estate share of OOH (~25%, ₹1,206 Cr) is from the brief. Not yet matched to a published article.",
  },
  ficciEy2026: {
    publisher: "FICCI-EY",
    report: "FICCI-EY Media & Entertainment Report 2026",
    url: "https://www.ey.com/en_in/newsroom/2026/03/india-s-media-and-entertainment-sector-grew-9-percent-to-inr-2-point-78-trillion-in-2025-driven-by-digital-and-live-experiences-ficci-ey-report",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  ficciEy2025Transit: {
    publisher: "FICCI-EY (via exchange4media)",
    report: "FICCI-EY M&E Report 2025: OOH and transit share",
    url: "https://www.exchange4media.com/out-of-home-news/theres-a-renewed-energy-around-outdoor-advertising-rohit-chopra-times-ooh-142480.html",
    year: 2025,
    verified: true,
    checked: "2026-11-12",
    note: "Transit was 28% of OOH revenue in 2024.",
  },
  m4gAirportTransit: {
    publisher: "Media4Growth",
    report: "FICCI-EY data: airports' share of transit media",
    url: "https://www.media4growth.com/",
    year: 2025,
    verified: false,
    note: "Airports contribute over 50% of transit revenue. Find and link the exact Media4Growth article before publishing as verified.",
  },
  wppSportingNation2026: {
    publisher: "WPP Media",
    report: "Sporting Nation 2026 (13th edition)",
    url: "https://indiantelevision.com/television/indias-sports-economy-crosses-2bn-cricket-leads-the-charge/",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  kofluence2026: {
    publisher: "Kofluence",
    report: "Decoding Influence 2026",
    url: "https://www.campaignindia.in/article/kofluence-report-tracks-creator-economy-s-formal-shift/4xrn0g9cve1s8tcd4m0revck5k",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
    note: "Industry estimate from a platform company, not an audited measurement.",
  },
  e4mIplRates2025: {
    publisher: "exchange4media",
    report: "IPL 2025 ad slot rates",
    url: "https://www.exchange4media.com/ipl-2025-news/as-ipl-2025-comes-to-a-close-ad-slots-go-premium-rates-up-10-15-143924.html",
    year: 2025,
    verified: true,
    checked: "2026-11-12",
    note: "10-second SD spot around ₹15–18 lakh late in the season.",
  },
  sb18MetroWraps: {
    publisher: "Storyboard18",
    report: "Metro wraps can cost up to Rs 45 lakh upfront",
    url: "https://www.storyboard18.com/media-and-entertainment/inside-the-high-cost-high-visibility-world-of-metro-train-wraps-ws-l-113099.htm",
    year: 2026,
    verified: true,
    checked: "2026-11-12",
  },
  e4mNative: {
    publisher: "exchange4media",
    report: "Do native ads help brands get extra mileage?",
    url: "https://www.exchange4media.com/advertising-news/decoding-native-advertising-99353.html",
    year: 2019,
    verified: true,
    checked: "2026-11-12",
    note: "Older report: sponsored article around ₹1.5 lakh on a standalone site; native links ₹7–12 per click.",
  },
  rateCardTrain: {
    publisher: "Vendor rate card",
    report: "Train media, Ahmedabad–Mumbai corridor",
    year: 2026,
    verified: true,
    internal: true,
    checked: "2026-11-12",
    note: "Tejas LED ₹1.25 L/month, Vande Bharat LED ₹2–3 L/month, headrest ₹8 L/month, in-train magazine full page ₹2 L. 18% GST extra, 3-month minimum.",
  },
  rateCardExpressway: {
    publisher: "Vendor rate card",
    report: "Gujarat expressway and city hoardings",
    year: 2026,
    verified: true,
    internal: true,
    checked: "2026-11-12",
    note: "40×41 ft ₹80,000–85,000/month, 81×41 ft ₹1,75,000/month, 40×20 ft ₹35,000–80,000/month, 20×20 ft ₹25,000/month. Print and mount assumed ₹14 per sq ft.",
  },
  pastProposals: {
    publisher: "Our past proposals",
    report: "Campaign proposals and launch plans, 2026 (clients withheld)",
    year: 2026,
    verified: true,
    internal: true,
    checked: "2026-11-12",
    note: "City page posts ₹1,500–18,000; digital media release ₹48,000; creator amplification and paid-social line items.",
  },
  assumption: {
    publisher: "Planning assumption",
    report: "Agency estimate pending vendor rate cards",
    year: 2026,
    verified: false,
  },
} satisfies Record<string, Source>;

export type SourceId = keyof typeof SOURCES;
export const sourceIds = Object.keys(SOURCES) as SourceId[];
export const getSource = (id: SourceId): Source => SOURCES[id];
