# Decisions log

Choices made without asking, per the brief ("make a sensible decision and log it").
Items marked **OPEN** need a decision from you.

## Open questions

1. **OPEN · Contact email domain.** The deck and brief give `shubham@silvertouchgreen.com`.
   The domain names another group business, which conflicts with "do not name or link any
   other Silver Touch Group business". It is in `brand/brand.config.ts` as given; swap it for a
   media-specific address when one exists (one-line change).
2. **OPEN · Social URLs.** No Instagram / LinkedIn / YouTube handles were supplied, so the
   links point at the network home pages. Set them in `brand.config.ts` (empty string hides one).
3. **OPEN · Two market figures still unverified (now hidden publicly).** All §7 figures were checked against
   published coverage (PMAR 2026, FICCI-EY 2026, WPP Media Sporting Nation 2026, Kofluence
   2026) and linked in `data/sources.ts`. Two remain `verified: false` until we find the
   exact article: airports' share of transit media ("over 50%", Media4Growth) and real
   estate's ~25% share of OOH (PMAR). Since M4 they are kept out of every public page;
   send the exact article links and they reappear automatically.
4. **OPEN · Most cost ranges are placeholders.** Only hoardings (expressway and city rate
   card) and railways (train media rate card) are seeded from real rate cards. Every
   other range is a labelled planning placeholder for your media team to replace.

## M1 · Scaffold

- **Logo.** The supplied logo files carry a "GREEN" sub-brand line under the wordmark. The
  image script (`scripts/prepare-brand-images.ts`) keeps only the S monogram and the
  "SilverTouch" wordmark and drops that line. "MEDIA" is set in the mono typeface beside it
  (`brand.descriptor`), so no group-company name appears in any logo.
- **Logo colour.** Logos are single-colour SVGs used as CSS masks, so they take the text
  colour on any background, and a clone needs no recoloured files.
- **Theme plumbing.** `brand/theme.ts` → `--brand-*` CSS variables (injected in the root
  layout) → Tailwind v4 `@theme inline` utilities (`bg-coral`, `text-ink` …). Custom CSS
  reads `--brand-*` directly, because `@theme inline` does not emit `--color-*` variables.
- **Fonts** live in `brand/fonts.ts` (next/font needs static imports), exposed as `--nf-*`.
- **Channel data source.** Channel MDX frontmatter is the single source for ribbon, nav
  count, channel index and channel pages. M2 validates a core schema (`ChannelCore`); M3
  extends it to the full `ChannelData` from the brief.
- **Images.** Originals sit in `/assets-src` (git-ignored). The script outputs AVIF + WebP at
  up to 2000px, 1024px WebP textures for the ribbon, and blur placeholders in
  `data/generated/brand-images.json`.
- **Airline and stadium cards** had no concept image, so the script renders abstract
  placeholder art (no text, no logos) in the brand palette. Prompts for proper images are in
  `IMAGE_PROMPTS.md`.
- **Image choices per channel:** TV uses "Coral sculpture on the big screen"; DOOH uses the
  atrium totem; ambassadors use "Behind the scenes on a Gujarat set"; influencers use the
  studio product shoot; social uses the phone-and-laptop shot; search uses the landing page;
  PR uses the press briefing room. The auto-rickshaw, sampling counter, expo and campaign
  proofs images are kept for the "One idea. Every surface." grid and BTL sections.
- **Placeholder routes.** Nav targets that arrive in M4/M5 render a branded "in production"
  page (`noindex`), so the preview has no dead links.
- **`NEXT_DIST_DIR`.** `next.config.ts` reads it so a production build (`.next-prod`) can
  run beside `next dev` without the two overwriting each other.

## M2 · Hero ribbon

- **Custom shader instead of a postprocessing pass.** Bending, RGB split and motion blur
  are done per card in one shader (`components/hero/ribbon-shaders.ts`), driven by
  screen-space x and ribbon velocity. This avoids a full-screen postprocessing pass, keeps
  the 3D chunk smaller, and confines the effect to the cards (the glass cube stays sharp).
  `@react-three/postprocessing` was removed.
- **Geometry.** Viewer inside a cylinder (radius 5.6) with an extra cubic "curl" term, so
  centre cards read nearly flat and edge cards swing toward the viewer and stretch. All
  knobs are in `components/hero/ribbon-config.ts`.
- **Labels curve with the card** because they are drawn into the same canvas texture
  as the photo; the shader tints them coral on hover.
- **Hit testing** projects each card's bent outline (mirrored on the CPU in
  `bendPoint`) to screen space, rather than raycasting the undisplaced plane.
- **Wheel behaviour.** The page must still scroll to reach the sections below, so vertical
  wheel drives the ribbon only while the pointer is over the card band (roughly 10% to 76%
  of hero height) and the page is at the top. Horizontal wheel or trackpad swipes always
  drive the ribbon. Lenis skips the hero via its `prevent` hook while it is capturing.
- **Shared-element transition.** On click, the card's projected rectangle expands to the
  channel page's hero frame (full width, 78svh) and then the route changes. Reduced motion
  skips straight to navigation.
- **Fallback rules.** CSS carousel when: reduced motion, coarse pointer under 1024px, width
  under 768px, 4 or fewer CPU cores, Save-Data, or no WebGL2. Override with
  `?ribbon=webgl` or `?ribbon=css`. The CSS carousel also renders first as the static
  poster on desktop and cross-fades out once 8 textures are ready, so LCP never waits on
  Three.js (headline text is the LCP element).
- **Keyboard.** In WebGL mode a visually hidden list of card links sits in the hero. Tab
  focuses a card and centres it in the ribbon; arrow keys move between cards; Enter opens
  the channel.
- **Rendering pauses** when the hero leaves the viewport or the tab is hidden
  (`frameloop="never"`).
- **Glass cube.** drei `MeshTransmissionMaterial` around the monogram extruded from
  `/public/images/logo/monogram.svg`, lit by procedural `Lightformer`s (no HDR download).

## M2 tuning (after first review)

- Hover chip is clamped inside the hero, so it no longer hangs off the edge for cut-off cards.
- Colour split starts further out (`smoothstep(0.5, 1.15)`) and is about 15% weaker, so edge
  labels stay readable while still splitting.
- Monogram: smoother curves and bevel, lower emissive, more metal and env reflection, and a
  slightly smaller scale so it reads as a solid object inside the glass, not a glowing blob.
  Headless rendering cannot judge this; check on a real GPU.

## M3 · Content model

- **Editorial in MDX, numbers in /data.** Channel MDX frontmatter holds what a writer edits
  (names, formats, funnel role, execution, FAQs, In the wild, guide body). Everything the
  planner computes with (audience affinity, zones, tiers, industry and stage fit, costs,
  ROI bands, market figures) lives in `/data` tables keyed by slug. `loadChannels()` merges
  both into the brief's `ChannelData` and fails the build if a row is missing. One table per
  concern lets the media team review a whole column at once instead of 18 files.
- **Sources registry.** `data/sources.ts` holds every citation once (publisher, report, URL,
  year, verified, date checked); figures point at it by id. Our rate cards and proposals are
  `internal: true` with generic labels, so no vendor or client name can leak.
- **Market figures.** PMAR 2026 is the single source for adex by medium. TV 2026F and digital
  2025 are derived (traditional total minus the other media; total minus traditional) and
  marked `derived`. The test suite checks that the media add up to PMAR's totals.
- **Rates seeded from your files.** Expressway and city hoardings (₹25,000 to ₹1,75,000 a
  month, print and mount about ₹14 per sq ft) and train media (LED ₹1.25 to 3 lakh a month,
  headrest ₹8 lakh, magazine page ₹2 lakh, 3-month minimum) are `verified: true`. Proposals
  calibrated creators, city pages, digital releases and CPL targets, without naming clients.
  Upper bounds from trade press: IPL spot rates (exchange4media) and metro wraps up to ₹45
  lakh (Storyboard18).
- **Added `per-campaign` cost unit** for ambassadors, metro wraps and sports properties, which
  are not sold per month or per insertion. Ambassador CPM equivalent is set high on purpose
  so the planner never credits a fee with media impressions it does not buy.
- **In the wild** links were researched on exchange4media, afaqs!, Social Samosa,
  Media4Growth, Storyboard18 and Campaign India: 2 to 3 per channel, our own one-line summary,
  no images. Where no clean brand case existed (search, native/PR), an industry article is
  used and labelled "Industry view" or as Google-reported.
- **Withheld names.** `brand/withheld-names.ts` lists proposal clients and rate-card vendors;
  tests fail if any appears in content, data or copy. The file is never imported by app code.
- **MDX rendering** uses `next-mdx-remote` 6 (RSC). Version 6 blocks JS expressions by default,
  which is what we want for content files. The channel page renders the guide now; the full
  12-section template is M4.
- **Image pipeline.** `pnpm images:fetch` searches Unsplash and Pexels with each channel's
  `stockQueries`, saves 3 WebP options (2000 px + 1024 px texture) and `credits.json`, and
  pings Unsplash's download endpoint as its guidelines ask. Unsplash's API guidelines prefer
  hotlinking; we store optimised local copies as the brief requires and credit the
  photographer. Use `--provider=pexels` if you want to avoid that question entirely.
- **Image picker** (`/admin/image-picker`) is dev only (404 in production). A pick rewrites
  only the image lines of the MDX (tested), adds `imageCredit`, and clears `imageIsConcept`.
  Channel pages show the credit; concept images keep the "Concept visual" caption.
- **IMAGE_PROMPTS.md** now covers all 18 channels: the two needed now (airline, stadium) and
  optional replacements for the rest.

## M4 · Pages

- **Disciplines and industries are content.** `/content/services/*.mdx` holds the deck's six
  disciplines word for word (headline, bullets, outcome); `/content/industries/*.mdx` holds the
  deck's six industries with challenges and approach. Industry slugs must match
  `data/industries.ts`, so channel fit scores drive each industry page's channel ranking.
- **Charts are hand-built SVG/CSS, not Recharts.** Donut, bars, heatmap and zone map are a few
  hundred lines with no chart library, so pages stay light for the Lighthouse target. They use
  the brand chart palette (now nine colours) and have text alternatives.
- **India map is a schematic zone tile map,** not a geographic map (brief: "simple SVG zones, no
  heavy map lib"). It is labelled by zone with the 1–5 score in each tile.
- **Unverified figures are not shown publicly.** The market page and channel pages filter out any
  figure whose source is `verified: false`, and a test enforces it. The airport ribbon stat
  changed from "50%+ of transit OOH" to "Premium flyers" for the same reason.
- **Format icons:** each format gets a numbered mono index `(01)` in the Gobo style instead of an
  icon set, which avoids a dependency and generic stock icons.
- **Planner core started early.** The home teaser needs a real mix, so `lib/planner/mix.ts` (score,
  top-N, score^1.5 allocation, 50% cap, 10% measurement floor, minimum-budget rule) is built
  now with tests; M5 adds impressions, reach, leads, ROI, scenarios and personas.
  One refinement to the brief's rule: before dropping channels that miss their minimum, it
  first tries narrower mixes within the budget's channel-count range, so an expensive top
  channel (hoardings) survives instead of being dropped in favour of cheap low-scoring ones.
- **Teaser defaults:** growing brand, leads, PAN-India, 3 months, shown under the slider. With a
  leads objective, search and social usually lead the mix; that is intended.
- **Contact form** validates on both sides with one zod schema (Indian mobile, optional email,
  honeypot). `/api/lead` accepts and validates but does not deliver yet: Sheets, Resend,
  Turnstile, rate limiting and UTM capture arrive in M5. The thank-you state offers WhatsApp.
- **Map on Contact:** a stylised location card that opens Google Maps, instead of an embedded
  map or a downloaded map tile (no API key, no third-party embed, no tile licensing).
- **Header over photos** now has a top gradient until you scroll, so nav stays readable over
  bright hero images. **Footer wordmark** was resized so it no longer clips at the right edge.
- **Eyebrows on forest sections use mint,** because coral on forest misses WCAG AA for small text.
- **Not built in M4 (by plan):** `/planner` and `/planner-methodology` (M5); `/insights`,
  `/privacy`, `/terms` (M6). They still show the branded "in production" page.

