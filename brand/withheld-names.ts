import fs from "node:fs";
import path from "node:path";

/**
 * Client and vendor names from proposals and rate cards. They calibrate rates in /data
 * but must never appear on the public site; data/content.test.ts fails if they do.
 *
 * The names themselves are NOT committed (the repository may be public). Provide them
 * either in `brand/withheld-names.local.json` (git-ignored, a JSON array of strings) or
 * in the WITHHELD_NAMES env var (comma-separated, e.g. as a CI secret). Without either,
 * the check is skipped.
 *
 * Import this file only from tests and scripts, never from app code.
 */
function load(): string[] {
  const env = process.env.WITHHELD_NAMES;
  if (env) return env.split(",").map((s) => s.trim()).filter(Boolean);
  const file = path.join(process.cwd(), "brand/withheld-names.local.json");
  if (!fs.existsSync(file)) return [];
  const parsed: unknown = JSON.parse(fs.readFileSync(file, "utf8"));
  return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
}

export const WITHHELD_NAMES = load();
