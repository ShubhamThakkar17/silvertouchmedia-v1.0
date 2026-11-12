// Dev helper: node scripts/dev/shot.mjs <url> <out.png> [waitMs] [w] [h] [js]
import { chromium } from "@playwright/test";
const [url, out, wait = "6000", w = "1440", h = "860", js = ""] = process.argv.slice(2);
const browser = await chromium.launch({ args: ["--use-angle=metal", "--enable-gpu", "--ignore-gpu-blocklist"] });
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 });
const logs = [];
page.on("console", (m) => (m.type() === "error" || m.type() === "warning") && logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(+wait);
if (js) console.log("eval:", JSON.stringify(await page.evaluate(js)));
await page.screenshot({ path: out });
console.log(logs.slice(0, 15).join("\n"));
await browser.close();
