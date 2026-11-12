/**
 * SITE COPY — every user-facing string for shared UI, home, about and services.
 * Source: company profile deck (2026). Indian English, no em dashes.
 * Channel copy lives in /content/channels/*.mdx.
 */
export const copy = {
  nav: {
    skipToContent: "Skip to content",
    links: [
      { href: "/channels", label: "Channels", countKey: "channels" as const },
      { href: "/planner", label: "Planner" },
      { href: "/market", label: "Market" },
      { href: "/about", label: "Studio" },
      { href: "/contact", label: "Contact" },
    ],
    cta: { href: "/planner", label: "Plan my media" },
    menuOpen: "Menu",
    menuClose: "Close",
  },

  hero: {
    eyebrow: "360° media agency · Ahmedabad · PAN-India execution",
    headline: "Every channel India watches. One agency.",
    subline: "Make every touch count.",
    exploreChip: "Explore channel →",
    ribbonLabel: "Media channels we plan, buy and execute",
    ribbonHelp: "Scroll, drag or use the arrow keys to move through the channels.",
    scrollHint: "Scroll",
    deckLines: {
      eyebrow: "A 360° media agency",
      disciplines: "Strategy. Creative. Digital. Media. On-ground. PR.",
    },
  },

  intro: {
    eyebrow: "Who we are",
    title: "One agency for every touchpoint.",
    body: [
      "A full-service 360° media agency based in Gujarat. We plan, create, produce, publish and place, from the first brand idea to the last hoarding on the highway.",
      "We began as an in-house brand and media team, so we think in sales cycles, dealer networks, launch dates and numbers, not just likes.",
    ],
    stats: [
      { value: 2026, label: "Launched in Ahmedabad", format: "year" as const },
      { value: 6, label: "Disciplines under one roof" },
      { value: 1, label: "Team, plan and report" },
      { value: 4, label: "Core states, pan-India reach" },
    ],
  },

  promises: {
    eyebrow: "What we stand for",
    title: "Four promises to every brand.",
    items: [
      { title: "Clarity over noise", body: "One sharp message, repeated everywhere it matters." },
      { title: "Accountable to numbers", body: "Every activity has a target, a budget and a report." },
      { title: "One team, end to end", body: "No hand-offs between five different agencies." },
      { title: "In it for the long run", body: "Brands that keep compounding, not one-off campaigns." },
    ],
  },

  model: {
    eyebrow: "Our 360° model",
    title: "Strategy at the centre. Every channel around it.",
    centre: "Strategy & Insight",
    footnote:
      "Take one service or the full circle. One team plans it, one calendar runs it, one report tracks it.",
    outcomeLabel: "Outcome",
  },

  surfaces: {
    eyebrow: "How one idea travels",
    title: "One idea. Every surface.",
    caption: "Concept visuals created for this profile, showing one look carried across media.",
  },

  process: {
    eyebrow: "How we work",
    title: "From first call to final report.",
    steps: [
      { title: "Listen", body: "The business, the customer and the numbers." },
      { title: "Shape", body: "Positioning, goals and the right 360 mix for the budget." },
      { title: "Create", body: "Concepts, design and production for every channel." },
      { title: "Launch", body: "Digital, ATL, OOH, BTL and PR on one calendar." },
      { title: "Measure", body: "Bi-weekly reports split by goal. Then we improve." },
    ],
  },

  reporting: {
    eyebrow: "Clear reporting",
    title: "Every activity, tagged and reported.",
    activities: ["Hoarding", "Press coverage", "Social reel", "Radio spot", "Search ads", "Landing page"],
    tags: [
      { title: "Awareness", body: "Reach and recall" },
      { title: "Advertising", body: "Campaign response" },
      { title: "Lead generation", body: "Enquiries that reach sales" },
    ],
    report: { title: "One bi-weekly report", body: "Targets, spend and results for each tag. Then we improve." },
    footnote:
      "Activities shown are examples. Every engagement gets its own targets per tag, agreed before launch.",
  },

  industries: {
    eyebrow: "Industries we understand",
    title: "We speak your sector’s language.",
  },

  where: {
    eyebrow: "Where we work",
    title: "Executed across India. Planned globally.",
    body: "From our Ahmedabad HQ, we run campaigns in tier 1, 2 and 3 cities, with pan-India execution capability and strategy planned to global standards.",
    rings: ["HQ Ahmedabad", "Tier 1", "Tier 2 & 3", "Pan-India", "Globally planned"],
    stats: [
      { value: 3, label: "City tiers, from metros to growing towns" },
      { value: 1, label: "Point of contact, wherever the campaign runs" },
    ],
  },

  why: {
    eyebrow: "Why us",
    title: "Why brands work with us.",
    items: [
      { title: "In-house mindset", body: "We work like part of your marketing team, with the accountability of an agency." },
      { title: "Truly 360", body: "Strategy, creative, digital, media, events and PR planned together, so every channel says the same thing." },
      { title: "Sector know-how", body: "Renewable energy, industrial B2B, healthcare, real estate, education and retail." },
      { title: "On-ground reach", body: "A vetted partner network for hoardings, transit, print, BTL and PR across our four core states." },
      { title: "Clear reporting", body: "Every activity tagged as awareness, advertising or lead generation, with a bi-weekly report." },
    ],
  },

  engagement: {
    eyebrow: "Ways to work with us",
    title: "Start small, or go full circle.",
    models: [
      { name: "First Touch", kind: "One-time project", body: "A brand identity, a website, an ad film or a launch campaign." },
      { name: "Growth Touch", kind: "Monthly retainer", body: "Social, content and performance marketing, run every month." },
      { name: "360 Touch", kind: "Full 360 retainer", body: "Strategy, creative, digital, media buying, BTL and PR, with a dedicated team and a single report." },
    ],
    footnote: "Every engagement starts with a free 30-minute discovery call.",
  },

  footerCta: {
    title: "Let’s make your next touch count.",
    body: "Book a free 30-minute discovery call. We will come back with the right 360 mix for your goals and budget.",
    primary: { href: "/contact", label: "Book a discovery call" },
    secondary: { href: "/planner", label: "Plan my media" },
    whatsappLabel: "Scan to chat on WhatsApp with our team.",
  },

  footer: {
    columns: [
      {
        title: "Explore",
        links: [
          { href: "/channels", label: "Channels" },
          { href: "/market", label: "India media market" },
          { href: "/planner", label: "Media planner" },
          { href: "/services", label: "Services" },
          { href: "/work", label: "Work" },
          { href: "/insights", label: "Insights" },
        ],
      },
      {
        title: "Studio",
        links: [
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
          { href: "/planner-methodology", label: "Planner methodology" },
          { href: "/privacy", label: "Privacy" },
          { href: "/terms", label: "Terms" },
        ],
      },
    ],
    rights: "All rights reserved.",
    imageCredits: "Imagery: concept visuals created for this brand unless credited.",
  },

  channelPage: {
    backToChannels: "All channels",
    planCta: "Plan a campaign with",
  },

  placeholder: {
    eyebrow: "In production",
    body: "This page is being built. Meanwhile, talk to us or explore the channels.",
    pages: {
      planner: "Media Planner",
      market: "India media market",
      about: "A 360° media agency from Ahmedabad.",
      contact: "Contact",
      services: "Services",
      work: "Work",
      insights: "Insights",
      privacy: "Privacy policy",
      terms: "Terms of use",
      "planner-methodology": "How the planner calculates",
    },
  },

  channelsIndex: {
    eyebrow: "Channels",
    title: "Every channel India watches.",
    body: "Pick a channel to see its formats, audiences, market size and indicative costs.",
  },

  disclaimers: {
    indicative:
      "Indicative ranges for planning. Final rates depend on city, inventory, season and negotiation.",
    concept: "Concept visual",
    photoBy: "Photo:",
  },
} as const;
