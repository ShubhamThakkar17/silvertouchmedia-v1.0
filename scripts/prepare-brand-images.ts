/**
 * Converts the original brand concept images in /assets-src/brand (git-ignored)
 * into web-ready AVIF + WebP files in /public/images/brand, plus 1024px WebP
 * textures for the hero ribbon and a blur-placeholder manifest.
 *
 *   pnpm images:brand
 *
 * Also builds the logo SVGs (monogram + wordmark) from /assets-src/logo/source-logo.svg
 * and renders branded placeholder art for channels that have no concept image yet.
 */
import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const ROOT = process.cwd();
const SRC = path.join(ROOT, "assets-src/brand");
const OUT = path.join(ROOT, "public/images/brand");
const MANIFEST = path.join(ROOT, "data/generated/brand-images.json");

const kebab = (s: string) =>
  s
    .replace(/\.[a-z]+$/i, "")
    .replace(/-\d+$/, "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

type Entry = { file: string; width: number; height: number; blurDataURL: string };

async function convertPhotos(manifest: Record<string, Entry>) {
  const files = (await fs.readdir(SRC)).filter((f) => /\.(png|jpe?g)$/i.test(f));
  for (const f of files) {
    const name = kebab(f);
    const input = sharp(path.join(SRC, f));
    const meta = await input.metadata();
    const w = Math.min(meta.width ?? 2000, 2000);
    await input.clone().resize({ width: w }).avif({ quality: 55 }).toFile(path.join(OUT, `${name}.avif`));
    await input.clone().resize({ width: w }).webp({ quality: 78 }).toFile(path.join(OUT, `${name}.webp`));
    await input.clone().resize({ width: 1024 }).webp({ quality: 74 }).toFile(path.join(OUT, `${name}-1024.webp`));
    const blur = await input.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    const h = Math.round(((meta.height ?? w) / (meta.width ?? w)) * w);
    manifest[name] = {
      file: `/images/brand/${name}.webp`,
      width: w,
      height: h,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    console.log("✓", name);
  }
}

/** Abstract placeholder art (no text, no logos) in the deck palette. */
function placeholderSVG(kind: "stadium" | "airline") {
  const W = 1536;
  const H = 1024;
  const base = `
    <defs>
      <radialGradient id="g1" cx="20%" cy="90%" r="70%"><stop offset="0" stop-color="#FF5B3A" stop-opacity=".55"/><stop offset="1" stop-color="#121316" stop-opacity="0"/></radialGradient>
      <radialGradient id="g2" cx="85%" cy="85%" r="60%"><stop offset="0" stop-color="#0F4D3A" stop-opacity=".8"/><stop offset="1" stop-color="#121316" stop-opacity="0"/></radialGradient>
      <radialGradient id="g3" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="#2B2F6B" stop-opacity=".7"/><stop offset="1" stop-color="#121316" stop-opacity="0"/></radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="#121316"/>
    <rect width="${W}" height="${H}" fill="url(#g3)"/>
    <rect width="${W}" height="${H}" fill="url(#g2)"/>
    <rect width="${W}" height="${H}" fill="url(#g1)"/>`;
  if (kind === "stadium") {
    const rings = Array.from({ length: 9 }, (_, i) => {
      const rx = 260 + i * 95;
      const ry = 90 + i * 34;
      return `<ellipse cx="768" cy="640" rx="${rx}" ry="${ry}" fill="none" stroke="${i % 3 === 0 ? "#FF5B3A" : "#B9BCC2"}" stroke-opacity="${0.75 - i * 0.06}" stroke-width="${i % 3 === 0 ? 5 : 2}"/>`;
    }).join("");
    const lights = [220, 520, 1016, 1316]
      .map(
        (x) =>
          `<rect x="${x - 6}" y="120" width="12" height="300" fill="#B9BCC2" opacity=".5"/><rect x="${x - 50}" y="96" width="100" height="40" rx="6" fill="#F5F5F3"/><circle cx="${x}" cy="116" r="160" fill="#F5F5F3" opacity=".06"/>`,
      )
      .join("");
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${base}${lights}<ellipse cx="768" cy="640" rx="230" ry="80" fill="#0F4D3A" opacity=".9"/>${rings}</svg>`;
  }
  // airline: an aircraft window looking onto a coral horizon
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${base}
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2B2F6B"/><stop offset=".62" stop-color="#FF5B3A"/><stop offset="1" stop-color="#1B1D21"/></linearGradient>
      <clipPath id="win"><rect x="548" y="170" width="440" height="640" rx="220"/></clipPath>
    </defs>
    <rect x="508" y="130" width="520" height="720" rx="260" fill="#ECECE8" opacity=".9"/>
    <rect x="530" y="152" width="476" height="676" rx="238" fill="#B9BCC2"/>
    <g clip-path="url(#win)"><rect x="548" y="170" width="440" height="640" fill="url(#sky)"/>
    <ellipse cx="768" cy="640" rx="420" ry="40" fill="#F5F5F3" opacity=".25"/>
    <path d="M548 700 Q768 660 988 700 L988 810 L548 810Z" fill="#121316" opacity=".85"/></g>
    <rect x="1180" y="0" width="356" height="${H}" fill="#1B1D21" opacity=".75"/>
    <rect x="1220" y="120" width="276" height="180" rx="18" fill="#FF5B3A" opacity=".85"/>
  </svg>`;
}

async function renderPlaceholders(manifest: Record<string, Entry>) {
  for (const kind of ["stadium", "airline"] as const) {
    const name = `placeholder-${kind}`;
    const img = sharp(Buffer.from(placeholderSVG(kind)));
    await img.clone().avif({ quality: 55 }).toFile(path.join(OUT, `${name}.avif`));
    await img.clone().webp({ quality: 80 }).toFile(path.join(OUT, `${name}.webp`));
    await img.clone().resize({ width: 1024 }).webp({ quality: 76 }).toFile(path.join(OUT, `${name}-1024.webp`));
    const blur = await img.clone().resize({ width: 16 }).webp({ quality: 40 }).toBuffer();
    manifest[name] = {
      file: `/images/brand/${name}.webp`,
      width: 1536,
      height: 1024,
      blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
    };
    console.log("✓", name);
  }
}

/** Splits the source logo into monogram / wordmark SVGs (solid fill; used as CSS masks, so colour comes from the text).
 *  Paths 13+ in the source are a sub-brand line that must not appear on this site. */
async function buildLogos() {
  const srcPath = path.join(ROOT, "assets-src/logo/source-logo.svg");
  const svg = await fs.readFile(srcPath, "utf8").catch(() => null);
  if (!svg) return console.warn("! no source logo, skipping");
  const paths = [...svg.matchAll(/<path[^>]*d="([^"]+)"/g)].map((m) => m[1].replace(/\s+/g, " "));
  const monogram = paths.slice(0, 1);
  const lockup = paths.slice(0, 13);
  const wordmark = paths.slice(1, 13);
  const out = path.join(ROOT, "public/images/logo");
  const write = (file: string, vb: string, ds: string[]) =>
    fs.writeFile(
      path.join(out, file),
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" fill="#000">${ds.map((d) => `<path d="${d}"/>`).join("")}</svg>\n`,
    );
  await write("monogram.svg", "796 648 440 482", monogram);
  await write("wordmark.svg", "355 1168 1330 205", wordmark);
  await write("lockup.svg", "355 648 1330 725", lockup);
  console.log("✓ logos");
}

async function main() {
  await fs.mkdir(OUT, { recursive: true });
  await fs.mkdir(path.dirname(MANIFEST), { recursive: true });
  await fs.mkdir(path.join(ROOT, "public/images/logo"), { recursive: true });
  const manifest: Record<string, Entry> = {};
  await convertPhotos(manifest);
  await renderPlaceholders(manifest);
  await buildLogos();
  await fs.writeFile(MANIFEST, JSON.stringify(manifest, null, 2));
  console.log(`Wrote ${Object.keys(manifest).length} entries to ${path.relative(ROOT, MANIFEST)}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
