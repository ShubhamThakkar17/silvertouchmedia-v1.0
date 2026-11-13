// Dev helper: node scripts/dev/lcp.mjs <url> — reports LCP element and long tasks under 4x CPU throttle (mobile).
import { chromium } from "@playwright/test";
const url = process.argv[2];
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 412, height: 823 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2.6 });
const p = await ctx.newPage();
const cdp = await ctx.newCDPSession(p);
await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
await p.addInitScript(() => {
  window.__lcp = [];
  window.__lt = [];
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lcp.push({ t: Math.round(e.startTime), el: e.element?.outerHTML?.slice(0, 110), size: e.size }))).observe({ type: "largest-contentful-paint", buffered: true });
  new PerformanceObserver((l) => l.getEntries().forEach((e) => window.__lt.push([Math.round(e.startTime), Math.round(e.duration)]))).observe({ type: "longtask", buffered: true });
});
await p.goto(url, { waitUntil: "load" });
await p.waitForTimeout(5000);
const r = await p.evaluate(() => ({ lcp: window.__lcp, lt: window.__lt }));
console.log("LCP candidates:", r.lcp);
console.log("long tasks:", r.lt.length, "total over 50ms:", r.lt.reduce((a, [, d]) => a + Math.max(0, d - 50), 0), r.lt.slice(0, 12));
await b.close();
