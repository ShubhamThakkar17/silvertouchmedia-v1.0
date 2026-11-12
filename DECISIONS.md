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
3. **OPEN · Ribbon stats need source checks.** The market figures on ribbon cards
   (₹20,866 Cr print, ₹32,855 Cr TV, etc.) come from your brief and are marked
   `verified: false` in frontmatter until M3 checks each one against the report.

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
