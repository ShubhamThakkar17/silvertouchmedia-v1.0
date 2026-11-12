import fs from "node:fs";
import path from "node:path";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import brandManifest from "@/data/generated/brand-images.json";
import { loadChannels } from "@/lib/content/load-channels";
import { pickImage } from "./actions";

export const metadata: Metadata = { title: "Image picker", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Credit = { file: string; file1024: string; provider: string; photographer: string; photographerUrl: string; pageUrl: string; licence: string; alt: string };

function creditsFor(slug: string): Credit[] {
  const p = path.join(process.cwd(), "public/images/channels", slug, "credits.json");
  return fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, "utf8")) : [];
}

/** Dev-only page to choose each channel's image (brief §8). Returns 404 in production. */
export default function ImagePickerPage() {
  if (process.env.NODE_ENV === "production") notFound();

  // Read fresh from disk (not the cached loader) so a pick shows immediately.
  const channels = loadChannels();
  const brandImages = Object.values(brandManifest as Record<string, { file: string }>).map((e) => e.file);

  return (
    <div className="bg-ink pb-24 pt-28 text-paper">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8">
        <p className="eyebrow">Dev only</p>
        <h1 className="mt-3 font-display text-5xl font-medium tracking-tight">Image picker</h1>
        <p className="mt-4 max-w-2xl text-silver">
          Run <code className="font-mono text-sm text-paper">pnpm images:fetch</code> to download three stock options per channel, then choose one here. A choice
          rewrites only the image lines in that channel&apos;s MDX file and adds the photo credit. Never use photos of other brands&apos; campaigns.
        </p>

        <ol className="mt-12 space-y-10">
          {channels.map((c) => {
            const options = creditsFor(c.slug);
            return (
              <li key={c.slug} className="rounded-[var(--brand-radius-card)] border border-paper/10 bg-ink-2 p-5">
                <div className="flex flex-wrap items-baseline justify-between gap-3">
                  <h2 className="mono-label">
                    ({String(c.order).padStart(2, "0")}) {c.name}
                  </h2>
                  <p className="mono-label text-silver">
                    {c.imageIsConcept ? "Concept image" : c.imageCredit ? `${c.imageCredit.provider} · ${c.imageCredit.photographer}` : "Stock"}
                  </p>
                </div>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <figure>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={c.cardImage} alt="" className="aspect-[3/2] w-full rounded-lg object-cover ring-2 ring-coral" />
                    <figcaption className="mono-label mt-2 text-coral">Current</figcaption>
                  </figure>
                  {options.length === 0 ? (
                    <p className="text-sm text-silver sm:col-span-3">No stock options yet for this channel.</p>
                  ) : (
                    options.map((o) => (
                      <form key={o.file} action={pickImage}>
                        <input type="hidden" name="slug" value={c.slug} />
                        <input type="hidden" name="file" value={o.file} />
                        <input type="hidden" name="kind" value="stock" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={o.file1024} alt={o.alt} className="aspect-[3/2] w-full rounded-lg object-cover" />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <a href={o.pageUrl} target="_blank" rel="noreferrer" className="truncate text-xs text-silver underline">
                            {o.provider} · {o.photographer}
                          </a>
                          <button type="submit" className="mono-label shrink-0 rounded-full bg-coral px-3 py-1.5 text-ink">
                            Use this
                          </button>
                        </div>
                      </form>
                    ))
                  )}
                </div>
                <form action={pickImage} className="mt-4 flex flex-wrap items-center gap-2">
                  <input type="hidden" name="slug" value={c.slug} />
                  <input type="hidden" name="kind" value="brand" />
                  <label className="mono-label text-silver" htmlFor={`brand-${c.slug}`}>
                    Or a brand concept image
                  </label>
                  <select id={`brand-${c.slug}`} name="file" defaultValue={c.imageIsConcept ? c.heroImage : brandImages[0]} className="rounded bg-ink px-2 py-1 text-sm">
                    {brandImages.map((f) => (
                      <option key={f} value={f}>
                        {f.split("/").pop()}
                      </option>
                    ))}
                  </select>
                  <button type="submit" className="mono-label rounded-full border border-paper/20 px-3 py-1.5">
                    Use
                  </button>
                </form>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
