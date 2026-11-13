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

## Preview deploy (after M4)

- **Security upgrade.** Vercel refused to build Next.js 15.5.4 (CVE-2025-66478, the React Server
  Components vulnerability). Upgraded to Next.js 15.5.28 and React 19.1.10, the latest patched
  releases that are at least a few weeks old. Full verify passes on the new versions.
- **Vercel project** `stm-website-preview` under your personal team, deployed from the CLI as a
  **preview** (not production). `.vercelignore` keeps `/assets-src`, local builds and env files
  out of the upload. No environment variables are set yet, so lead delivery and analytics are
  off; `NEXT_PUBLIC_SITE_URL` falls back to localhost for canonical URLs until a domain exists.
- The very first CLI attempt defaulted to the production target and failed on the Next.js check,
  so nothing was ever live in production.

## M5 · Planner and leads

- **One engine, three consumers.** `lib/planner` is pure and runs in the browser for instant
  results; `/api/plan` re-runs it from the URL query so the PDF, emails and Sheet never trust
  numbers sent by the browser. `lib/planner/describe.ts` turns engine codes into copy, so the
  page, PDF, email and WhatsApp text always match.
- **Flighting assumption.** The brief's minimum-budget rule multiplies by duration. For 6 and
  12-month plans we assume channels run in bursts (4 and 6 active months), otherwise a 12-month
  national plan could never afford TV. Configurable in `data/planner-weights.ts` (`ACTIVE_MONTHS`).
- **Reach overlap.** Total reach is 65% of the sum of channel reach (`TOTAL_REACH_DEDUP`),
  a planning assumption. Leads are estimated only for search and social, from the industry
  CPL table (search about 25% dearer).
- **Mode B totals** are shown with a ±15% range for rates and inventory. Launch = minimum
  effective budget × active months × city-tier cost multiplier × zone scale.
- **ROI band thresholds:** allocation-weighted band value (Low 1, Medium 2, High 3) plus a stage
  shift; below 1.6 is Low, below 2.4 Medium, otherwise High.
- **Persona snapshots.** Ten personas from the brief are snapshot-tested. Changing data or weights
  changes snapshots on purpose: review the diff, then `pnpm test -u`.
- **URL state** is parsed leniently: each bad field falls back on its own, and unknown channel
  slugs are dropped, so old or hand-edited links still open. Channel-page links
  (`?mode=budget&channels=slug`) become a must-include.
- **Mobile results** use a bottom bar that opens a full-height sheet; desktop keeps a sticky
  panel that scrolls on its own.
- **PDF** is rendered with `@react-pdf/renderer` in the API route and returned to the browser
  for download as well as attached to the emails. The built-in PDF fonts have no ₹ glyph, so
  Inter and Space Grotesk TTFs (SIL OFL) are bundled in `brand/pdf-fonts/` and traced into the
  serverless function.
- **Emails** are plain React with inline styles rendered by `@react-email/render`, sent through
  Resend. `@react-email/components` is deprecated upstream, so it is not used.
- **Sheets:** Apps Script webhook (primary) with a shared secret and formula-injection guard, or
  an optional service account using the Sheets REST API with a JWT signed by `node:crypto`
  (no `googleapis` dependency).
- **Abuse protection:** Turnstile (skipped when keys are absent, for local work), a silent
  honeypot, and an IP rate limit of 5 submissions per 10 minutes (Upstash if configured,
  otherwise in-memory per instance).
- **Attribution:** `middleware.ts` sets a first-party, httpOnly `attr` cookie with UTM params,
  referrer and landing page on the first visit (refreshed on a new UTM visit). The device
  type is read from the user agent at submit time.
- **Analytics hooks** (`lib/analytics.ts`) fire the brief's events but are no-ops until GA4 or
  Meta Pixel scripts load, which M6 gates behind a consent banner.
- **Methodology page** reads every weight, multiplier and benchmark from `/data`, so it cannot
  drift from what the planner actually does.
- **Not live yet:** with no `RESEND_API_KEY`, `SHEETS_WEBHOOK_URL` or Turnstile keys set, leads
  are validated and the PDF is generated, but nothing is emailed or written to a Sheet.

## Hero motion graphics (after M5 review)

- **All 18 hero cards are code-drawn motion graphics** (your call: the 16 concept photos plus 2
  vector placeholders looked uneven). One module, `components/hero/motion/scenes.ts`, draws every
  scene in the same style: ink panel, coral and indigo glow, dot grid, silver line art, coral
  media surface, mint as the only second accent. No text inside scenes.
- **One source, two renderers.** The WebGL ribbon draws scenes into each card's canvas texture and
  re-uploads at most two textures per frame (about 30fps per visible card, no mipmaps). The CSS
  fallback and the desktop poster draw the same scenes in a `<canvas>` that animates only while
  on screen and shows a still frame under reduced motion.
- **Channel pages, the channel list preview and the shared-element transition keep the concept
  photos.** Only the hero changed, as requested.
- **Phone cards are 4:3** (were 4:5) so scenes, designed at 3:2, crop cleanly.
- `/admin/scenes` (dev only) shows all 18 side by side for review. A channel a clone adds without
  a scene falls back to the radar-rings animation.

## M6 · Polish, SEO, accessibility, performance

- **Consent first.** GA4 and Meta Pixel load only after "Accept all" and only when their IDs are
  set; "Essential only" is the default action. The attribution cookie is first-party and
  essential (it records campaign tags for leads). "Cookie settings" in the footer reopens it.
- **Privacy policy and terms** are written for India's DPDP Act 2023 and this site's actual data
  flows, in `content/legal/*.mdx`. They are a sound starting point, not legal advice: please have
  them reviewed before launch. The contact block on both pages comes from the brand config.
- **SEO:** `metadataBase` from `NEXT_PUBLIC_SITE_URL`; Organization and ProfessionalService
  JSON-LD site-wide; Service, FAQPage and BreadcrumbList on channel pages; Article on insights;
  branded OG images (default plus one per channel); `sitemap.xml`, `robots.txt` (blocks `/admin`
  and `/api`) and `llms.txt`. Page titles no longer repeat the brand (the template adds it).
- **Insights:** three seed posts in `content/insights`, cited where they use market figures.
- **Data audit** at `/admin/data-audit` lists all 66 unverified values with the file to edit.
  Admin review pages are on in local dev and Vercel previews (behind Vercel login), never in
  production. The image picker stays local-only because it writes files.
- **Demo brand:** `NEXT_PUBLIC_BRAND=demo` swaps `brand.config.ts` and `theme.ts` to
  `brand.demo.config.ts` (Kestrel Media, blue palette, own monogram). Proof screenshots in
  `docs/demo-brand/`.
- **WCAG AA contrast.** Brand coral on paper is 2.8:1, so small coral text on light surfaces now
  uses `coralDeep` (#C4381A, 4.9:1). It is applied automatically through an inherited
  `--accent-text` variable set by the nearest light or dark surface. Faint greys were raised to
  at least 65% ink on light and 60% paper on dark. Scrollable tables are focusable regions.
  axe (WCAG 2 A/AA) reports no serious or critical issues on the pages tested.
- **Performance:** see `docs/lighthouse.md`. Mobile Lighthouse 91 to 93 (simulated) and 100 with
  applied throttling on Home, a channel page and the Planner; accessibility, best practices and
  SEO 100. Key changes: hero animation waits for the first interaction (or 7 s), a 2 KB symbols
  font avoids large latin-ext downloads for ₹ (its auto-generated Arial fallback face is disabled, or it would mask the brand fonts), only the display font is preloaded, CSS is inlined.
- **Smoke tests:** `pnpm test:e2e` runs Playwright on desktop and a Pixel 7: home, mobile fallback,
  channel page, both planner modes, lead and plan APIs (PDF bytes checked), and axe on key pages.

## Hero cube placement (after M6 review)

- The glass cube with the monogram moved from the centre of the ribbon to the bottom right,
  where it no longer covers the cards. Its position and size are computed from the visible area
  at its depth (`ANCHOR` in `components/hero/centre-object.tsx`: 7% from the right, 16% from the
  bottom, outer ring 27% of the hero height), so it stays clear of the card band, the headline
  and the help text on any desktop size. The phone carousel never shows the cube.
- Logo SVGs now use a solid fill instead of `currentColor`; they are only used as CSS masks, and
  the 3D loader warned on `currentColor`.

