import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const dismissConsent = async (page: Page) => {
  const btn = page.getByRole("button", { name: "Essential only" });
  if (await btn.isVisible().catch(() => false)) await btn.click();
};

async function axe(page: Page) {
  const r = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa"]).exclude("canvas").analyze();
  const serious = r.violations.filter((v) => v.impact === "serious" || v.impact === "critical");
  expect(serious.map((v) => `${v.id}: ${v.nodes.length} × ${v.help}`)).toEqual([]);
}

test("home renders hero, sections and passes axe", async ({ page }) => {
  await page.goto("/?ribbon=css");
  await dismissConsent(page);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("#channels-list")).toBeVisible();
  await axe(page);
});

test("mobile gets the CSS fallback, not WebGL, and no sideways scroll", async ({ page, isMobile }) => {
  test.skip(!isMobile, "mobile only");
  await page.goto("/");
  await page.waitForTimeout(1500);
  const webgl = await page.evaluate(() => [...document.querySelectorAll("canvas")].some((c) => !!(c as HTMLCanvasElement).getContext("webgl2")));
  expect(webgl).toBe(false);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});

test("channel page renders all sections and passes axe", async ({ page }) => {
  await page.goto("/channels/hoardings-billboards");
  await dismissConsent(page);
  await expect(page.getByRole("heading", { level: 1, name: /Hoardings/ })).toBeVisible();
  for (const id of ["formats", "impact", "reach", "costs", "wild", "faqs"]) await expect(page.locator(`#${id}`)).toBeAttached();
  await expect(page.getByText("Indicative ranges for planning").first()).toBeVisible();
  await axe(page);
});

test("planner budget mode produces a mix", async ({ page }) => {
  await page.goto("/planner?mode=budget&industry=real-estate&stage=launching&objective=awareness&budget=4000000&months=3");
  await dismissConsent(page);
  await expect(page.getByText("Your indicative plan").first()).toBeAttached();
  await expect(page.locator("table").first()).toContainText("Hoardings");
  await axe(page);
});

test("planner channels mode produces three scenarios", async ({ page, isMobile }) => {
  await page.goto("/planner?mode=channels&industry=fmcg-d2c&channels=television,social-media&months=6");
  await dismissConsent(page);
  if (isMobile) await page.getByRole("button", { name: /View plan/ }).click();
  for (const s of ["Launch", "Elevate", "Dominate"]) await expect(page.getByRole("radio", { name: new RegExp(s) }).first()).toBeAttached();
});

test("lead API accepts a valid lead and rejects a bad phone", async ({ request }) => {
  const ok = await request.post("/api/lead", { data: { name: "Smoke Test", phone: "9876543210", message: "e2e" } });
  expect(ok.ok()).toBe(true);
  expect((await ok.json()).ok).toBe(true);
  const bad = await request.post("/api/lead", { data: { name: "Smoke Test", phone: "123" } });
  expect(bad.status()).toBe(422);
});

test("plan API returns a PDF", async ({ request }) => {
  const r = await request.post("/api/plan", { data: { query: "mode=budget&industry=solar&budget=800000", name: "Smoke Test", phone: "9876543210" } });
  expect(r.ok()).toBe(true);
  const j = await r.json();
  expect(Buffer.from(j.pdfBase64, "base64").subarray(0, 4).toString()).toBe("%PDF");
});

test("contact, market and methodology pages pass axe", async ({ page }) => {
  for (const path of ["/contact", "/market", "/planner-methodology", "/about"]) {
    await page.goto(path);
    await dismissConsent(page);
    await axe(page);
  }
});
