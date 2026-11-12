/**
 * CI guard: brand identity must live only in /brand, /content and /data.
 * Fails if any string from brand.forbiddenOutsideConfig (plus the brand name,
 * email and phone) appears in app/, components/, lib/ or other source folders.
 *
 *   pnpm check:brand
 */
import fs from "node:fs";
import path from "node:path";
import { brand } from "../brand/brand.config";

const ROOT = process.cwd();
const SCAN_DIRS = ["app", "components", "lib", "hooks", "emails", "integrations"];
const EXT = /\.(tsx?|jsx?|mdx?|css|json|gs)$/;

const needles = Array.from(
  new Set(
    [
      ...brand.forbiddenOutsideConfig,
      brand.name,
      brand.contact.email,
      brand.contact.phone,
      brand.contact.whatsappE164,
    ].filter(Boolean),
  ),
).map((s) => s.toLowerCase());

function walk(dir: string, out: string[] = []): string[] {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (EXT.test(entry.name)) out.push(p);
  }
  return out;
}

const hits: string[] = [];
for (const d of SCAN_DIRS) {
  for (const file of walk(path.join(ROOT, d))) {
    const lines = fs.readFileSync(file, "utf8").split("\n");
    lines.forEach((line, i) => {
      const l = line.toLowerCase();
      for (const n of needles) {
        if (l.includes(n)) hits.push(`${path.relative(ROOT, file)}:${i + 1}  "${n}"`);
      }
    });
  }
}

if (hits.length) {
  console.error(`✗ Hard-coded brand strings found outside /brand, /content, /data:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`✓ No hard-coded brand strings (${needles.length} patterns, dirs: ${SCAN_DIRS.join(", ")})`);
