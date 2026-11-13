# Lighthouse (mobile)

Measured 13 Nov 2026 with Lighthouse 13.5 against a local production build (`next start`),
mobile form factor, Moto G Power emulation.

| Page | Performance | Accessibility | Best practices | SEO | LCP (simulated) | TBT | CLS | Perf / LCP with devtools throttling |
|---|---|---|---|---|---|---|---|---|
| Home (`/`) | 95 | 100 | 100 | 100 | 2.9 s | 10 ms | 0 | 100 / 0.9 s |
| Channel (Hoardings) (`/channels/hoardings-billboards`) | 97 | 100 | 100 | 100 | 2.5 s | 0 ms | 0 | 100 / 1.7 s |
| Planner (`/planner`) | 95 | 100 | 100 | 100 | 2.9 s | 0 ms | 0 | 100 / 0.9 s |

**Two throttling methods.** The default *simulated* run (Lantern) assumes a text LCP waits for its
web font, so the headline pages report 2.5 to 2.9 s. With *applied* devtools throttling (4× CPU,
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
