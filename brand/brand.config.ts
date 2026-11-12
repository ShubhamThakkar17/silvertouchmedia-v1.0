/**
 * BRAND CONFIG — the single source of identity for this site.
 * Cloning for another agency? Replace this file (plus theme.ts, fonts.ts, copy.ts)
 * and the images in /public/images/brand. See CLONING.md.
 */
export const brand = {
  name: "Silver Touch Media",
  shortName: "Silver Touch",
  /** Word set in type next to the logo lockup (the logo file itself has no descriptor). */
  descriptor: "Media",
  /** The only group reference allowed anywhere on the site. */
  legalLine: "A Silver Touch Group company",
  tagline: "Make every touch count.",
  category: "360° media agency",
  foundedYear: 2026,

  contact: {
    phone: "+91 99261 83300",
    phoneE164: "+919926183300",
    email: "shubham@silvertouchgreen.com",
    whatsappE164: "919926183300",
    whatsappDefaultText: "Hi, I'd like to plan a campaign.",
    discoveryCall: "Free 30-minute discovery call",
  },

  address: {
    locality: "Ahmedabad",
    region: "Gujarat",
    country: "India",
    countryCode: "IN",
    display: "Ahmedabad, Gujarat",
    /** Static map image path (no API key). Replace with your own screenshot/tile. */
    mapImage: "/images/brand/ahmedabad-riverfront-signal-at-blue-hour.webp",
    geo: { lat: 23.0225, lng: 72.5714 },
  },

  /** Leave url empty to hide a network. */
  socials: [
    { id: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
    { id: "youtube", label: "YouTube", url: "https://youtube.com/" },
  ],

  logo: {
    monogram: "/images/logo/monogram.svg",
    wordmark: "/images/logo/wordmark.svg",
    lockup: "/images/logo/lockup.svg",
  },

  /** Keys from data/generated/brand-images.json used by fixed page sections. */
  imagery: {
    intro: "ahmedabad-riverfront-signal-at-blue-hour",
    about: "behind-the-scenes-on-a-gujarat-set",
    contact: "campaign-proofs-and-coral-swatches",
  },

  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    titleTemplate: "%s | Silver Touch Media",
    defaultTitle: "Silver Touch Media · 360° media agency in Ahmedabad, PAN-India execution",
    description:
      "A full-service 360° media agency from Ahmedabad. Strategy, creative, digital, media buying, on-ground and PR, executed across India.",
    locale: "en_IN",
    areaServed: "India",
  },

  /** Strings the CI check (scripts/check-hardcoded-brand.ts) forbids outside /brand, /content, /data. */
  forbiddenOutsideConfig: ["Silver Touch", "silvertouch", "99261"],
} as const;

export type Brand = typeof brand;
