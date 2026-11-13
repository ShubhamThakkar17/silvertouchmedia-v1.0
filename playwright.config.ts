import { defineConfig, devices } from "@playwright/test";

/**
 * Smoke tests (brief §11). Runs against a production build:
 *   pnpm build && pnpm test:e2e
 * Set E2E_BASE_URL to test a running server or a deployment instead.
 */
const PORT = Number(process.env.E2E_PORT ?? 3400);
export default defineConfig({
  testDir: "tests",
  timeout: 45_000,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  use: { baseURL: process.env.E2E_BASE_URL ?? `http://localhost:${PORT}`, trace: "retain-on-failure" },
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : { command: `pnpm start -p ${PORT}`, port: PORT, reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
