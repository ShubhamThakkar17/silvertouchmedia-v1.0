// Dev helper: node scripts/dev/pages.mjs <base> <outDir> <w> <path...>
// Full-page screenshots, sliced into tiles of ~1.4 viewport heights for review.
import { chromium } from "@playwright/test";
import sharp from "sharp";
const [base, out, w, ...paths] = process.argv.slice(2);
const width = +w;
const mobile = width < 600;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width, height: mobile ? 844 : 900 }, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
const errs = [];
for (const p of paths) {
  const page = await ctx.newPage();
  page.on("pageerror", (e) => errs.push(`${p}: ${e.message}`));
  page.on("console", (m) => m.type() === "error" && errs.push(`${p}: ${m.text()}`));
  await page.goto(`${base}${p}${p === "/" ? "?ribbon=css" : ""}`, { waitUntil: "networkidle" });
  // trigger lazy images
  const h = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < h; y += 700) { await page.evaluate((yy) => scrollTo(0, yy), y); await page.waitForTimeout(60); }
  await page.evaluate(() => scrollTo(0, 0)); await page.waitForTimeout(400);
  const hs = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  const buf = await page.screenshot({ fullPage: true });
  const meta = await sharp(buf).metadata();
  const tile = Math.round((mobile ? 844 : 900) * 1.6);
  const name = p === "/" ? "home" : p.slice(1).replace(/\//g, "_");
  let i = 0;
  for (let y = 0; y < meta.height; y += tile) {
    const hh = Math.min(tile, meta.height - y);
    await sharp(buf).extract({ left: 0, top: y, width: meta.width, height: hh }).toFile(`${out}/${name}-${String(i++).padStart(2, "0")}.png`);
  }
  console.log(`${p}: ${meta.height}px, ${i} tiles, hscroll=${hs}`);
  await page.close();
}
console.log("errors:", errs.length ? errs.join("\n") : "none");
await b.close();
