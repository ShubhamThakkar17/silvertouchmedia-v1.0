// Dev helper: node scripts/dev/remote-check.mjs <shareUrl> <outDir> — checks a protected Vercel preview.
import { chromium } from "@playwright/test";
const [share, out] = process.argv.slice(2);
const origin = new URL(share).origin;
const b = await chromium.launch();
const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const errs = [];
p.on("pageerror", (e) => errs.push(e.message));
await p.goto(share, { waitUntil: "networkidle" });
for (const path of ["/", "/channels/cricket-stadiums-sports", "/market", "/planner", "/planner-methodology", "/insights", "/privacy", "/admin/data-audit", "/sitemap.xml", "/llms.txt", "/opengraph-image", "/channels/radio/opengraph-image"]) {
  const r = await p.request.get(origin + path);
  console.log(path, r.status(), r.headers()["content-type"]?.split(";")[0]);
}
const plan = await p.request.post(origin + "/api/plan", { data: { query: "mode=budget&industry=real-estate&budget=4000000&months=3", name: "Preview Check", phone: "9876543210" } });
const j = await plan.json().catch(() => ({}));
console.log("api/plan", plan.status(), j.pdfBase64 ? Buffer.from(j.pdfBase64, "base64").subarray(0, 4).toString() + " " + Math.round(j.pdfBase64.length * 0.75 / 1024) + " KB" : JSON.stringify(j).slice(0, 200));
const lead = await p.request.post(origin + "/api/lead", { data: { name: "Preview Check", phone: "9876543210" } });
console.log("api/lead", lead.status(), JSON.stringify(await lead.json()).slice(0, 80));
await p.goto(origin + "/?ribbon=webgl", { waitUntil: "networkidle" });
await p.mouse.move(700, 380);
await p.waitForTimeout(6000);
await p.screenshot({ path: `${out}/live-m6.png` });
console.log("errors:", errs.join(" | ") || "none");
await b.close();
