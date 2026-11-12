# 360° media agency website template

Next.js 15 (App Router) · TypeScript strict · Tailwind CSS v4 · React Three Fiber.
Currently configured for **Silver Touch Media**. To rebrand, see [CLONING.md](CLONING.md).

## Status

| Milestone | State |
|---|---|
| M1 Scaffold: tokens, fonts, brand config, layout, nav, footer, brand-hardcode check | ✅ |
| M2 Hero ribbon: WebGL curved ribbon, glass monogram, CSS fallback | ✅ (tuning welcome) |
| M3 Content model: full channel schema, 18 channel guides, `/data` seeds, image pipeline | ✅ |
| M4 Pages | next |
| M5 Planner · M6 Polish and deploy | planned |

## Run it

```bash
pnpm install
cp .env.example .env.local
pnpm dev            # http://localhost:3000
```

| Script | What it does |
|---|---|
| `pnpm dev` | Dev server (Turbopack) |
| `pnpm build` / `pnpm start` | Production build and server |
| `pnpm check:brand` | Fails if brand strings appear outside `/brand`, `/content`, `/data` |
| `pnpm images:brand` | Converts `/assets-src/brand` originals to AVIF/WebP + ribbon textures; rebuilds logo SVGs |
| `pnpm images:fetch` | Downloads 3 Unsplash/Pexels options per channel (keys in `.env.local`); choose at `/admin/image-picker` |
| `pnpm test` | Vitest: INR formatting, content ↔ `/data` integrity, copy rules, frontmatter edits |
| `pnpm verify` | Brand check, types, lint, tests, build |

Hero testing: append `?ribbon=webgl` or `?ribbon=css` to force a mode.

## Layout

```
/brand        identity, theme tokens, fonts, copy        ← edit to rebrand
/content      channels/*.mdx (and later services, industries, insights, work)
/data         market figures, benchmarks, planner data   (generated/ is script output)
/lib          pure helpers (content loaders, INR formatting, planner engine in M5)
/components   UI; never contains brand strings
/app          routes
/scripts      image pipeline, CI checks (dev/ holds local screenshot helpers)
```

Decisions and open questions: [DECISIONS.md](DECISIONS.md). Image prompts: [IMAGE_PROMPTS.md](IMAGE_PROMPTS.md).
