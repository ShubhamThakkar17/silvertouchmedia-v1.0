/**
 * Stock image fetcher (brief §8, priority 2).
 *
 * For each channel it searches Unsplash and Pexels with the channel's `stockQueries`
 * (frontmatter), saves 3 options to public/images/channels/{slug}/ as WebP (2000px +
 * 1024px ribbon texture), writes credits.json beside them and updates
 * data/generated/stock-images.json (blur placeholders + credits). Pick the final image
 * per channel at /admin/image-picker (dev only).
 *
 *   pnpm images:fetch                      all channels without options yet
 *   pnpm images:fetch --channel=radio      one channel
 *   pnpm images:fetch --force              refetch even if options exist
 *   pnpm images:fetch --provider=pexels    one provider only
 *   pnpm images:fetch --dry-run            list what would be fetched
 *
 * Keys: UNSPLASH_ACCESS_KEY and/or PEXELS_API_KEY in .env.local.
 * Never use this for photos of other brands' campaigns (brief §8.4).
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import sharp from "sharp";

try {
  process.loadEnvFile(".env.local");
} catch {
  /* optional */
}

type Provider = "Unsplash" | "Pexels";
type Candidate = {
  provider: Provider;
  id: string;
  downloadUrl: string;
  pageUrl: string;
  photographer: string;
  photographerUrl: string;
  alt: string;
  /** Unsplash asks apps to ping this when a photo is downloaded. */
  trigger?: string;
};
export type StockCredit = {
  file: string;
  file1024: string;
  provider: Provider;
  id: string;
  photographer: string;
  photographerUrl: string;
  pageUrl: string;
  licence: string;
  alt: string;
  width: number;
  height: number;
  blurDataURL: string;
};

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content/channels");
const OUT = path.join(ROOT, "public/images/channels");
const MANIFEST = path.join(ROOT, "data/generated/stock-images.json");
const PER_CHANNEL = 3;
const UTM = `utm_source=${encodeURIComponent(process.env.UNSPLASH_APP_NAME ?? "agency_site_template")}&utm_medium=referral`;
const LICENCE: Record<Provider, string> = { Unsplash: "Unsplash License", Pexels: "Pexels License" };

const args = process.argv.slice(2);
const flag = (name: string) => args.find((a) => a.startsWith(`--${name}=`))?.split("=")[1];
const only = flag("channel");
const providerOnly = flag("provider")?.toLowerCase();
const force = args.includes("--force");
const dryRun = args.includes("--dry-run");

const keys = {
  Unsplash: providerOnly && providerOnly !== "unsplash" ? undefined : process.env.UNSPLASH_ACCESS_KEY,
  Pexels: providerOnly && providerOnly !== "pexels" ? undefined : process.env.PEXELS_API_KEY,
};

async function searchUnsplash(q: string): Promise<Candidate[]> {
  if (!keys.Unsplash) return [];
  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(q)}&orientation=landscape&per_page=6&content_filter=high`;
  const r = await fetch(url, { headers: { Authorization: `Client-ID ${keys.Unsplash}`, "Accept-Version": "v1" } });
  if (!r.ok) throw new Error(`Unsplash ${r.status} for "${q}"`);
  const j = (await r.json()) as {
    results: {
      id: string;
      alt_description: string | null;
      urls: { raw: string };
      links: { html: string; download_location: string };
      user: { name: string; links: { html: string } };
    }[];
  };
  return j.results.map((p) => ({
    provider: "Unsplash",
    id: p.id,
    downloadUrl: `${p.urls.raw}&w=2400&q=85&fm=jpg`,
    pageUrl: `${p.links.html}?${UTM}`,
    photographer: p.user.name,
    photographerUrl: `${p.user.links.html}?${UTM}`,
    alt: p.alt_description ?? "",
    trigger: p.links.download_location,
  }));
}

async function searchPexels(q: string): Promise<Candidate[]> {
  if (!keys.Pexels) return [];
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(q)}&orientation=landscape&per_page=6`;
  const r = await fetch(url, { headers: { Authorization: keys.Pexels } });
  if (!r.ok) throw new Error(`Pexels ${r.status} for "${q}"`);
  const j = (await r.json()) as {
    photos: { id: number; url: string; photographer: string; photographer_url: string; alt: string; src: { original: string } }[];
  };
  return j.photos.map((p) => ({
    provider: "Pexels",
    id: String(p.id),
    downloadUrl: `${p.src.original}?auto=compress&cs=tinysrgb&w=2400`,
    pageUrl: p.url,
    photographer: p.photographer,
    photographerUrl: p.photographer_url,
    alt: p.alt ?? "",
  }));
}

/** Round-robin across queries and providers so the 3 options are varied. */
async function candidatesFor(queries: string[]): Promise<Candidate[]> {
  const lists: Candidate[][] = [];
  for (const q of queries) {
    lists.push(await searchUnsplash(q).catch((e) => (console.warn(`  ! ${e.message}`), [])));
    lists.push(await searchPexels(q).catch((e) => (console.warn(`  ! ${e.message}`), [])));
  }
  const out: Candidate[] = [];
  const seen = new Set<string>();
  for (let i = 0; out.length < PER_CHANNEL && lists.some((l) => l[i]); i++) {
    for (const l of lists) {
      const c = l[i];
      if (!c || seen.has(`${c.provider}:${c.id}`)) continue;
      seen.add(`${c.provider}:${c.id}`);
      out.push(c);
      if (out.length === PER_CHANNEL) break;
    }
  }
  return out;
}

async function save(slug: string, n: number, c: Candidate): Promise<StockCredit> {
  const r = await fetch(c.downloadUrl);
  if (!r.ok) throw new Error(`download ${r.status}`);
  const buf = Buffer.from(await r.arrayBuffer());
  if (c.trigger) await fetch(c.trigger, { headers: { Authorization: `Client-ID ${keys.Unsplash}` } }).catch(() => {});

  const dir = path.join(OUT, slug);
  fs.mkdirSync(dir, { recursive: true });
  const base = sharp(buf).rotate();
  const full = await base.clone().resize({ width: 2000, withoutEnlargement: true }).webp({ quality: 78 }).toBuffer({ resolveWithObject: true });
  fs.writeFileSync(path.join(dir, `${n}.webp`), full.data);
  const tex = await base.clone().resize({ width: 1024, height: 683, fit: "cover" }).webp({ quality: 72 }).toBuffer();
  fs.writeFileSync(path.join(dir, `${n}-1024.webp`), tex);
  const blur = await base.clone().resize(16).webp({ quality: 40 }).toBuffer();

  return {
    file: `/images/channels/${slug}/${n}.webp`,
    file1024: `/images/channels/${slug}/${n}-1024.webp`,
    provider: c.provider,
    id: c.id,
    photographer: c.photographer,
    photographerUrl: c.photographerUrl,
    pageUrl: c.pageUrl,
    licence: LICENCE[c.provider],
    alt: c.alt,
    width: full.info.width,
    height: full.info.height,
    blurDataURL: `data:image/webp;base64,${blur.toString("base64")}`,
  };
}

async function main() {
  if (!keys.Unsplash && !keys.Pexels) {
    console.log("No UNSPLASH_ACCESS_KEY or PEXELS_API_KEY set in .env.local. Nothing to fetch.");
    console.log("Get free keys at https://unsplash.com/developers and https://www.pexels.com/api/.");
    return;
  }
  const manifest: Record<string, StockCredit> = fs.existsSync(MANIFEST) ? JSON.parse(fs.readFileSync(MANIFEST, "utf8")) : {};

  for (const file of fs.readdirSync(CONTENT).filter((f) => f.endsWith(".mdx")).sort()) {
    const { data } = matter(fs.readFileSync(path.join(CONTENT, file), "utf8"));
    const slug = data.slug as string;
    const queries = (data.stockQueries as string[] | undefined) ?? [];
    if (only && slug !== only) continue;
    const creditsPath = path.join(OUT, slug, "credits.json");
    if (!force && fs.existsSync(creditsPath)) {
      console.log(`- ${slug}: options exist (use --force to refetch)`);
      continue;
    }
    console.log(`→ ${slug}: ${queries.join(" | ")}`);
    const picks = await candidatesFor(queries);
    if (dryRun) {
      picks.forEach((p) => console.log(`    ${p.provider} ${p.id} by ${p.photographer}`));
      continue;
    }
    const credits: StockCredit[] = [];
    for (const [i, c] of picks.entries()) {
      try {
        credits.push(await save(slug, i + 1, c));
        console.log(`    ✓ ${i + 1}: ${c.provider} by ${c.photographer}`);
      } catch (e) {
        console.warn(`    ! ${c.provider} ${c.id}: ${(e as Error).message}`);
      }
    }
    fs.mkdirSync(path.dirname(creditsPath), { recursive: true });
    fs.writeFileSync(creditsPath, JSON.stringify(credits, null, 2) + "\n");
    for (const k of Object.keys(manifest)) if (k.startsWith(`/images/channels/${slug}/`)) delete manifest[k];
    for (const c of credits) manifest[c.file] = manifest[c.file1024] = c;
  }

  if (!dryRun) {
    fs.mkdirSync(path.dirname(MANIFEST), { recursive: true });
    fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + "\n");
    console.log("Done. Choose images at /admin/image-picker (pnpm dev).");
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
