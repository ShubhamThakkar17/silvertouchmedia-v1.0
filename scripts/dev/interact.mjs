import { chromium } from "@playwright/test";
const [base, outDir] = process.argv.slice(2);
const b = await chromium.launch({ args: ["--ignore-gpu-blocklist"] });
const p = await b.newPage({ viewport: { width: 1440, height: 860 } });
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
await p.goto(`${base}/?ribbon=webgl`, { waitUntil: "load" });
await p.waitForTimeout(7000);
// wheel over the band moves the ribbon, page should not scroll
await p.mouse.move(300, 380);
for (let i = 0; i < 6; i++) { await p.mouse.wheel(0, 120); await p.waitForTimeout(60); }
await p.waitForTimeout(400);
console.log("scrollY after band wheel:", await p.evaluate(() => scrollY));
await p.screenshot({ path: `${outDir}/i1-wheel.png` });
await p.waitForTimeout(2500);
await p.mouse.move(1000, 380); await p.waitForTimeout(1200);
await p.screenshot({ path: `${outDir}/i2-hover.png` });
const hovered = await p.evaluate(() => window.__ribbon?.hovered);
console.log("hovered:", hovered);
await p.mouse.down(); await p.mouse.up();
await p.waitForTimeout(250);
await p.screenshot({ path: `${outDir}/i3-transition.png` });
await p.waitForURL(/\/channels\//, { timeout: 5000 }).catch(() => {});
await p.waitForTimeout(800);
console.log("url after click:", p.url());
await p.screenshot({ path: `${outDir}/i4-channel.png` });
// wheel over headline scrolls the page
await p.goto(`${base}/?ribbon=webgl`, { waitUntil: "load" }); await p.waitForTimeout(3000);
await p.mouse.move(300, 760); await p.mouse.wheel(0, 600); await p.waitForTimeout(1200);
console.log("scrollY after headline wheel:", await p.evaluate(() => scrollY));
// mobile fallback
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 });
await m.goto(`${base}/`, { waitUntil: "load" }); await m.waitForTimeout(2500);
console.log("mobile canvas:", await m.evaluate(() => !!document.querySelector("canvas")), "hscroll:", await m.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await m.screenshot({ path: `${outDir}/m1.png` });
await m.evaluate(() => scrollTo(0, innerHeight)); await m.waitForTimeout(800);
await m.screenshot({ path: `${outDir}/m2.png` });
console.log("errors:", errs.join(" | ") || "none");
await b.close();
