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
    tiles: [
      { label: "Metro platform", image: "coral-metro-platform-advertising-concept", channel: "inside-metro" },
      { label: "Rail", image: "coral-intercity-train-at-dawn", channel: "railways-train-branding" },
      { label: "BRTS", image: "coral-wrapped-gujarat-brts-bus", channel: "bus-brts-auto" },
      { label: "Auto", image: "coral-canopy-on-a-gujarati-auto-rickshaw", channel: "bus-brts-auto" },
      { label: "Airport", image: "coral-lit-airport-advertising-display", channel: "airport-branding" },
      { label: "Cinema", image: "coral-and-silver-multiplex-atmosphere", channel: "cinema" },
      { label: "Metro", image: "coral-wrapped-ahmedabad-metro-at-blue-hour", channel: "metro-train-wraps" },
      { label: "TV", image: "coral-sculpture-on-the-big-screen", channel: "television" },
    ],
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
    cta: "See how we work in",
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
    breadcrumb: "Channels",
    quickStats: { market: "Market", cost: "Typical rate", minBudget: "Min. effective budget" },
    perMonth: "/ month",
    sections: {
      formats: "What it is & formats",
      impact: "Impact",
      market: "The market",
      reach: "Who it reaches",
      bestFor: "Best for",
      costs: "Indicative costs & ROI",
      execution: "How we execute it, PAN-India",
      wild: "In the wild",
      faqs: "Questions brands ask",
      related: "Related channels",
    },
    impactBody: "Where this channel does its best work in the funnel, from first awareness to repeat business.",
    funnel: { awareness: "Awareness", consideration: "Consideration", conversion: "Conversion", loyalty: "Loyalty" },
    reachBody: "Audience affinity on a 1 to 5 scale. These are planning assumptions we refine with every campaign.",
    zonesTitle: "Strength by zone",
    tiersTitle: "Strength by city tier",
    industriesTitle: "Industries it suits",
    stagesTitle: "Brand stages",
    costLabels: {
      range: "Rate range",
      cpm: "Effective cost per 1,000 views",
      minBudget: "Minimum effective budget",
      leadTime: "Typical lead time",
      minDuration: "Minimum booking",
      roi: "Indicative ROI band",
      kpi: "What we report",
    },
    days: "days",
    months: "months",
    gstNote: "All amounts before 18% GST.",
    planningEstimate: "Planning estimate",
    fromRateCard: "From current rate cards",
    methodology: "How we calculate",
    noMarket: "No published figure isolates this channel yet. We plan it from rate cards and audience data.",
    marketGrowth: "2026 forecast vs 2025",
    marketShare: "Share",
    executionBody: "One team handles the whole job, wherever in India it runs.",
    wildNote: "Coverage of other brands' work, linked to the publisher. We do not host their images.",
    ctaTitle: "Plan a campaign with {channel}.",
    ctaBody: "Open the planner with this channel selected and see an instant, indicative mix for your budget.",
    roiBands: { Low: "Low", Medium: "Medium", High: "High" },
    panIndia: "PAN-India",
    year: "Year",
    readOn: "Read on",
  },

  sources: {
    label: "Source",
    unverified: "Unverified, being checked",
    internal: "Our rate cards and past plans",
    derived: "Derived from the same report",
  },

  channelsList: {
    eyebrow: "The channels",
    title: "Eighteen ways to be seen.",
    viewAll: "View all channels",
    filterAll: "All",
    filterLabel: "Filter channels by type",
    count: "channels",
  },

  marketSnapshot: {
    eyebrow: "The market",
    title: "Where India's ad money goes.",
    cta: "Explore the market",
  },

  plannerTeaser: {
    eyebrow: "Media planner",
    title: "See a mix for your budget.",
    body: "Pick your industry and budget. The full planner adds goals, regions, audiences and duration.",
    industryLabel: "Industry",
    budgetLabel: "Monthly budget",
    assumptions: "Assumes a growing brand, lead generation, PAN-India, 3 months.",
    cta: "Open the full planner",
    empty: "Raise the budget to see a mix.",
    months: "months",
  },

  servicesPage: {
    eyebrow: "Services",
    title: "Six disciplines. One team.",
    body: "Take one service or the full circle. One team plans it, one calendar runs it, one report tracks it.",
    detailCta: "See the discipline",
    whatWeDo: "What we do",
    channelsTitle: "Channels we buy",
    next: "Next",
  },

  industryPage: {
    eyebrow: "Industries",
    challengesTitle: "What makes it hard",
    approachTitle: "How we approach it",
    channelsTitle: "Channels that fit",
    channelsBody: "Ranked by our industry fit scores. Planning assumptions, refined with every campaign.",
    plannerCta: "Plan media for {industry}",
  },

  marketPage: {
    eyebrow: "India media market",
    title: "Where the money goes, and why.",
    body: "A short, sourced look at India's advertising market: how big each medium is, who each channel reaches and what to expect from it.",
    adexTitle: "Adex by medium",
    adexBody: "₹ crore, 2025 and 2026 forecast.",
    mediumCol: "Medium",
    y2025: "2025",
    y2026: "2026F",
    digitalTitle: "Digital vs traditional",
    digital: "Digital",
    traditional: "Traditional",
    growthTitle: "Growth by medium, 2026F vs 2025",
    heatmapTitle: "Audience × channel",
    heatmapBody: "Affinity from 1 (weak) to 5 (strongest). Planning assumptions. Select a cell to open the channel.",
    regionTitle: "Strength by zone",
    regionBody: "How strong each channel is in each part of India. Choose a channel.",
    roiTitle: "Role and indicative ROI",
    roiCols: { channel: "Channel", role: "Funnel role", kpi: "What we report", band: "ROI band" },
    contextTitle: "Also worth knowing",
    sourcesTitle: "Sources",
    sourcesBody: "Every figure on this page, with publisher, report and year.",
    lastReviewed: "Last reviewed",
  },

  aboutPage: {
    eyebrow: "Studio",
    title: "A 360° media agency from Ahmedabad.",
    storyTitle: "Our story",
    story: [
      "We began as an in-house brand and media team, so we think in sales cycles, dealer networks, launch dates and numbers, not just likes.",
      "Today we plan, create, produce, publish and place for brands across sectors, from the first brand idea to the last hoarding on the highway.",
    ],
    teamTitle: "The team",
    teamBody: "Strategists, writers, designers, media buyers and performance specialists in one room.",
    team: ["Strategy lead", "Creative director", "Media buying", "Performance marketing", "Content & social", "Client partner"],
  },

  workPage: {
    eyebrow: "Work",
    title: "Concept work.",
    body: "Our case studies are on their way. Meanwhile, these concept visuals show how one look carries across media. They are not live campaigns.",
    conceptBadge: "Concept",
    emptyTitle: "Case studies coming soon",
    emptyBody: "Want to see relevant work for your sector? Ask us on a discovery call.",
  },

  contactPage: {
    eyebrow: "Contact",
    title: "Let’s talk about your next campaign.",
    body: "Tell us a little about your brand. We reply within one working day, usually much sooner.",
    discoveryTitle: "Free 30-minute discovery call",
    discoveryBody: "We listen, ask about your numbers and come back with the right 360 mix for your goals and budget.",
    whatsappCta: "Chat on WhatsApp",
    callCta: "Call us",
    emailCta: "Email us",
    mapCta: "Open in Maps",
    hq: "HQ",
    form: {
      name: "Your name",
      company: "Company",
      phone: "Phone (WhatsApp)",
      email: "Email",
      city: "City",
      industry: "Industry",
      industryPlaceholder: "Choose your industry",
      budget: "Monthly budget",
      budgetPlaceholder: "Choose a range",
      message: "What are you planning?",
      submit: "Send",
      sending: "Sending…",
      required: "Required",
      invalidPhone: "Enter a 10-digit mobile number",
      invalidEmail: "Enter a valid email",
      success: "Thank you. We have your details and will be in touch shortly.",
      error: "Something went wrong. Please try WhatsApp or call us.",
      privacy: "We use your details only to reply to you. See our privacy policy.",
    },
    budgetBands: ["Under ₹1 L", "₹1 L to ₹5 L", "₹5 L to ₹25 L", "₹25 L to ₹1 Cr", "Over ₹1 Cr", "Not sure yet"],
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
