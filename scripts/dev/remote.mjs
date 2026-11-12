// Dev helper: node scripts/dev/remote.mjs <shareUrl> <outDir>
import { chromium } from "@playwright/test";
const [share, out] = process.argv.slice(2);
const origin = new URL(share).origin;
const b = await chromium.launch({ args: ["--ignore-gpu-blocklist"] });
const ctx = await b.newContext({ viewport: { width: 1440, height: 860 } });
const p = await ctx.newPage();
const errs = []; p.on("pageerror", (e) => errs.push(e.message));
await p.goto(share, { waitUntil: "networkidle" });
await p.goto(`${origin}/?ribbon=webgl`, { waitUntil: "networkidle" });
await p.waitForTimeout(6000);
console.log("home canvas:", await p.evaluate(() => !!document.querySelector("canvas")));
await p.screenshot({ path: `${out}/live-home.png` });
for (const path of ["/channels/hoardings-billboards", "/market", "/contact"]) {
  const r = await p.goto(`${origin}${path}`, { waitUntil: "networkidle" });
  console.log(path, r.status());
}
await p.screenshot({ path: `${out}/live-contact.png` });
const m = await (await b.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, storageState: await ctx.storageState() })).newPage();
await m.goto(`${origin}/`, { waitUntil: "networkidle" }); await m.waitForTimeout(1500);
console.log("mobile canvas:", await m.evaluate(() => !!document.querySelector("canvas")), "hscroll:", await m.evaluate(() => document.documentElement.scrollWidth > innerWidth));
await m.screenshot({ path: `${out}/live-mobile.png` });
console.log("errors:", errs.join(" | ") || "none");
await b.close();
