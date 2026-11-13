// Dev helper: node scripts/dev/axe-report.mjs <base> <path...>
import AxeBuilder from "@axe-core/playwright";
import { chromium } from "@playwright/test";
const [base, ...paths] = process.argv.slice(2);
const b = await chromium.launch();
for (const mobile of [false, true]) {
  const ctx = await b.newContext(mobile ? { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } : { viewport: { width: 1440, height: 900 } });
  const p = await ctx.newPage();
  for (const path of paths) {
    await p.goto(base + path, { waitUntil: "networkidle" });
    const btn = p.getByRole("button", { name: "Essential only" });
    if (await btn.isVisible().catch(() => false)) await btn.click();
    const r = await new AxeBuilder({ page: p }).withTags(["wcag2a", "wcag2aa"]).exclude("canvas").analyze();
    for (const v of r.violations.filter((v) => ["serious", "critical"].includes(v.impact))) {
      for (const n of v.nodes.slice(0, 6)) console.log(`${mobile ? "M" : "D"} ${path} ${v.id} | ${n.target.join(" ")} | ${(n.any[0]?.message ?? "").slice(0, 120)}`);
    }
  }
  await ctx.close();
}
await b.close();
