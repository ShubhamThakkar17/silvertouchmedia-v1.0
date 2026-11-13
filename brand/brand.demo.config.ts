import type { BrandConfig } from "./brand.config";
import type { ThemeConfig } from "./theme";

/**
 * DEMO BRAND — a fictional agency used to prove the template rebrands by editing /brand only.
 * Run with NEXT_PUBLIC_BRAND=demo (see CLONING.md → "Proving it"). Not used in production.
 */
export const demoBrand: BrandConfig = {
  name: "Kestrel Media",
  shortName: "Kestrel",
  descriptor: "Media",
  legalLine: "A Kestrel Group company",
  tagline: "Be seen where it counts.",
  category: "Integrated media agency",
  foundedYear: 2026,
  contact: {
    phone: "+91 90000 00000",
    phoneE164: "+919000000000",
    email: "hello@example.com",
    whatsappE164: "919000000000",
    whatsappDefaultText: "Hi, I'd like to plan a campaign.",
    discoveryCall: "Free 30-minute discovery call",
  },
  address: {
    locality: "Pune",
    region: "Maharashtra",
    country: "India",
    countryCode: "IN",
    display: "Pune, Maharashtra",
    mapImage: "/images/brand/ahmedabad-riverfront-signal-at-blue-hour.webp",
    geo: { lat: 18.5204, lng: 73.8567 },
  },
  socials: [
    { id: "instagram", label: "Instagram", url: "https://instagram.com/" },
    { id: "linkedin", label: "LinkedIn", url: "https://linkedin.com/" },
    { id: "youtube", label: "YouTube", url: "https://youtube.com/" },
  ],
  logo: {
    monogram: "/images/logo/demo-monogram.svg",
    wordmark: "/images/logo/demo-wordmark.svg",
    lockup: "/images/logo/demo-monogram.svg",
  },
  imagery: {
    intro: "ahmedabad-riverfront-signal-at-blue-hour",
    about: "behind-the-scenes-on-a-gujarat-set",
    contact: "campaign-proofs-and-coral-swatches",
  },
  seo: {
    siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
    titleTemplate: "%s | Kestrel Media",
    defaultTitle: "Kestrel Media · Integrated media agency, PAN-India",
    description: "A fictional demo agency showing how this template rebrands.",
    locale: "en_IN",
    areaServed: "India",
  },
  forbiddenOutsideConfig: ["Kestrel"],
};

export const demoTheme: ThemeConfig = {
  colors: {
    coral: "#3D7BFF",
    coralDeep: "#1F4FD1",
    ink: "#0D1220",
    ink2: "#151C2E",
    paper: "#F4F6FB",
    paper2: "#E5E9F3",
    forest: "#1A2F5C",
    mint: "#A9D1FF",
    silver: "#AEB6C8",
    indigo: "#4A2A7A",
  },
  radii: { card: "6px", pill: "999px" },
  shadows: { soft: "0 1px 2px rgba(13,18,32,.06), 0 12px 32px -12px rgba(13,18,32,.2)" },
  chart: ["#3D7BFF", "#A9D1FF", "#F2B84B", "#7A5CFF", "#3FB8A0", "#FF8A6B", "#AEB6C8", "#2453C7", "#4A2A7A"],
};
