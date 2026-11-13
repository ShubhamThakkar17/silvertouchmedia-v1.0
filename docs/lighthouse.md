# Lighthouse (mobile)

Measured 13 Nov 2026 with Lighthouse 13.5 against a local production build (`next start`),
mobile form factor, Moto G Power emulation.

| Page | Performance | Accessibility | Best practices | SEO | LCP (simulated) | TBT | CLS | Perf / LCP with devtools throttling |
|---|---|---|---|---|---|---|---|---|
| Home (`/`) | 91 | 100 | 100 | 100 | 3.3 s | 10 ms | 0 | 100 / 0.9 s |
| Channel (Hoardings) (`/channels/hoardings-billboards`) | 93 | 100 | 100 | 100 | 3.0 s | 0 ms | 0.001 | 100 / 1.7 s |
| Planner (`/planner`) | 92 | 100 | 100 | 100 | 3.3 s | 0 ms | 0.001 | 100 / 0.9 s |

**Two throttling methods.** The default *simulated* run (Lantern) assumes a text LCP waits for its
web font, so pages report 3.0 to 3.3 s. With *applied* devtools throttling (4× CPU,
slow 4G), which measures what the browser actually paints, the headline appears with its
size-matched fallback font at first paint (`display: swap`) and LCP is 0.9 to 1.7 s. Field data
(Chrome UX Report) follows the real paint.

## What moved the numbers

- **Hero animation starts on first interaction** (or 7 s after load) instead of on load, and the
  CSS fallback draws at most two cards per frame. Total blocking time on Home fell from 3.9 s to 10 ms.
- **Symbols font.** ₹ and arrows used to pull Google's 85 KB latin-ext files; a 2 KB subset listed
  first in each font stack covers them.
- **Only the display font is preloaded;** body and mono fonts load with `swap`.
- **Cookie banner copy shortened** so it never becomes the largest paint.
- **CSS inlined** (`experimental.inlineCss`), removing the render-blocking stylesheet request.

Re-run: `pnpm build && pnpm start -p 3000`, then
`npx lighthouse@13.5.0 http://localhost:3000/ --only-categories=performance,accessibility,best-practices,seo`.

## Desktop (after the performance pass)

| Page | Performance | TBT | Page weight |
|---|---|---|---|
| Home (`/`), before | 70 | 910 ms | 1.97 MB |
| Home (`/`), after | 100 (4 of 5 runs; one run 73 when the 3D setup fell inside the measurement window) | 20 ms | 865 KB |
| Channel, Market | 100 | 0 ms | 0.5 to 0.65 MB |

Headless Lighthouse renders WebGL in software, so the 3D hero's one-off setup cost is
exaggerated here; on a real GPU it is a fraction of that.

What changed:

- The channel list's hover preview no longer downloads all 18 card images up front (1.1 MB);
  an image loads the first time its row is hovered.
- The 3D ribbon starts after the page has loaded and the browser is idle (or on first
  interaction). The poster carousel shows the same animated cards until then.
- Card textures are built one per frame instead of all at once (removes a 1.4 s freeze), at
  800 px instead of 1024 px.
- The glass cube mounts after the ribbon, with a lighter glass pass (512 px, 4 samples) and a
  smaller environment bake, and the canvas pixel ratio is capped at 1.5.
- Serverless functions (planner page, lead APIs) run in Mumbai (`bom1`) via `vercel.json`;
  images get a one-year immutable cache header; the attribution middleware only runs on a first
  visit or a campaign link.
