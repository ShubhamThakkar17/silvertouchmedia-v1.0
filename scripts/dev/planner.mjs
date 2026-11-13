// Dev helper: node scripts/dev/planner.mjs <base> <outDir>
import { chromium } from "@playwright/test";
const [base, out] = process.argv.slice(2);
const b = await chromium.launch();
const errs = [];
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
p.on("pageerror", (e) => errs.push(e.message));
p.on("console", (m) => m.type() === "error" && errs.push(m.text()));
await p.goto(`${base}/planner?mode=budget&industry=real-estate&stage=launching&objective=leads&zones=west&tiers=tier1&budget=4000000&months=3`, { waitUntil: "networkidle" });
await p.waitForTimeout(600);
await p.screenshot({ path: `${out}/pl-budget.png`, fullPage: false });
await p.evaluate(() => scrollTo(0, 650)); await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/pl-budget-2.png` });
// type a budget
const bud = p.getByLabel("Total budget for the campaign").first();
await bud.fill("2 Cr"); await bud.press("Enter"); await p.waitForTimeout(500);
console.log("url after budget:", p.url().split("?")[1]);
// switch mode
await p.getByRole("radio", { name: /I know my channels/ }).click();
for (const n of ["Hoardings", "Search", "Social"]) await p.getByRole("button", { name: n, exact: true }).first().click();
await p.getByRole("button", { name: "Dominate", exact: true }).click();
await p.waitForTimeout(500);
await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
await p.screenshot({ path: `${out}/pl-channels.png` });
console.log("url channels:", p.url().split("?")[1]);
// unlock
await p.getByRole("button", { name: /Get my detailed media plan/ }).first().click();
await p.waitForTimeout(300);
await p.getByLabel(/Your name/).fill("Asha Patel");
await p.getByLabel(/Company/).fill("Riverfront Homes");
await p.getByLabel(/Phone/).fill("9876543210");
await p.screenshot({ path: `${out}/pl-modal.png` });
await p.getByRole("button", { name: "Send me the plan" }).click();
await p.getByText("Your plan is ready.").waitFor({ timeout: 15000 });
const dl = await p.getByRole("link", { name: /Download PDF/ }).getAttribute("download");
const wa = await p.getByRole("link", { name: /Continue on WhatsApp/ }).getAttribute("href");
console.log("done: download=", dl, "wa=", wa.slice(0, 60));
await p.screenshot({ path: `${out}/pl-done.png` });
// mobile
const m = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
m.on("pageerror", (e) => errs.push("m: " + e.message));
await m.goto(`${base}/planner?mode=budget&industry=education&budget=1500000`, { waitUntil: "networkidle" });
await m.screenshot({ path: `${out}/pl-m1.png` });
await m.getByRole("button", { name: /View plan/ }).click(); await m.waitForTimeout(300);
await m.screenshot({ path: `${out}/pl-m2.png` });
console.log("mobile hscroll:", await m.evaluate(() => document.documentElement.scrollWidth > innerWidth));
console.log("errors:", errs.join(" | ") || "none");
await b.close();
