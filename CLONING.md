# Cloning this site for another agency or brand

Target: a rebranded, deployable site in under an hour. Components never contain brand
names, colours, copy or contacts; everything comes from four places.

| Folder | What lives there |
|---|---|
| `/brand` | Identity (`brand.config.ts`), colour tokens (`theme.ts`), typefaces (`fonts.ts`), all shared copy (`copy.ts`) |
| `/content` | Channel pages, services, industries, insights, case studies (MDX + frontmatter) |
| `/data` | Market figures, benchmarks, audiences, regions, planner weights (with sources) |
| `/public/images/brand`, `/public/images/logo` | Photography and logo files |

## Steps

1. **Copy the repo** and run `pnpm install`.
2. **Identity** – edit `brand/brand.config.ts`: name, descriptor, legal line, tagline,
   phone, email, WhatsApp number, address, socials, SEO defaults. Update
   `forbiddenOutsideConfig` with the new brand's name so the CI check guards it.
3. **Colours** – edit `brand/theme.ts`. Every Tailwind colour (`bg-coral`, `text-ink`, …)
   reads these values through CSS variables, so token *names* stay the same even if the
   new primary colour is not coral. Keep WCAG AA contrast for text on `ink` and `paper`.
4. **Fonts** – swap the three `next/font/google` imports in `brand/fonts.ts`. Keep the
   exported names and the `--nf-*` variable names.
5. **Copy** – rewrite `brand/copy.ts`. Keep the keys; change the strings.
6. **Logo** – put the new logo SVG at `assets-src/logo/source-logo.svg` and adjust the
   path slices and viewBoxes in `buildLogos()` in `scripts/prepare-brand-images.ts`,
   or simply drop hand-made `monogram.svg`, `wordmark.svg` and `lockup.svg` into
   `/public/images/logo` (single colour, any fill; the site masks them to the text colour).
   The hero's 3D monogram is extruded from `monogram.svg`.
7. **Images** – put originals in `assets-src/brand/` (git-ignored) and run
   `pnpm images:brand`. For stock photos, add Unsplash/Pexels keys to `.env.local`, run
   `pnpm images:fetch`, then choose per channel at `/admin/image-picker` (`pnpm dev`).
   The picker writes `heroImage`, `cardImage` and the photo credit into the channel MDX.
8. **Channels & data** – each channel is one MDX file in `/content/channels` (editorial:
   names, formats, funnel, FAQs, In the wild links, guide body; `order` controls the
   ribbon). Its numbers live in `/data`, keyed by the channel slug: audience affinity
   (`audiences.ts`), zones and tiers (`regions.ts`), industry fit (`industries.ts`), stage
   fit and every planner knob (`planner-weights.ts`), costs and ROI bands
   (`benchmarks.ts`), market figures (`market.ts`) and their citations (`sources.ts`).
   Adding or removing a channel means one MDX file plus one row in each table;
   `pnpm test` fails if a row is missing. Anything without a vendor rate card stays
   `verified: false` and shows on `/admin/data-audit`.
   List client and vendor names that must never appear publicly in
   `brand/withheld-names.ts`; the tests scan `/content`, `/data` and copy for them.
9. **Environment** – copy `.env.example` to `.env.local` and fill in the keys
   (Resend, Sheets webhook, Turnstile, analytics).
10. **Check & deploy** – `pnpm check:brand && pnpm build`, then deploy to Vercel.

## Proving it

`brand/brand.demo.config.ts` (added in M6) swaps in a fictional brand. Run
`BRAND=demo pnpm dev` to see the whole site rebrand without touching a component.
