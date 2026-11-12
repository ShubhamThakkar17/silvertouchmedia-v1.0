"use server";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { revalidatePath } from "next/cache";
import { setChannelImage, type ImagePick } from "@/lib/content/frontmatter-edit";

type Credit = { file: string; file1024: string; provider: "Unsplash" | "Pexels"; photographer: string; pageUrl: string; licence: string };

const ROOT = process.cwd();
const PUBLIC = path.join(ROOT, "public");

/** Dev-only: writes the chosen image into the channel's MDX frontmatter. */
export async function pickImage(formData: FormData) {
  if (process.env.NODE_ENV === "production") throw new Error("The image picker is disabled in production.");

  const slug = String(formData.get("slug") ?? "");
  const file = String(formData.get("file") ?? "");
  const kind = String(formData.get("kind") ?? "");
  if (!/^[a-z0-9-]+$/.test(slug)) throw new Error("Bad slug");
  if (!/^\/images\/(brand|channels)\/[a-z0-9/-]+\.webp$/.test(file) || !fs.existsSync(path.join(PUBLIC, file))) {
    throw new Error("Unknown image file");
  }

  let pick: ImagePick;
  if (kind === "stock") {
    const credits: Credit[] = JSON.parse(fs.readFileSync(path.join(PUBLIC, "images/channels", slug, "credits.json"), "utf8"));
    const c = credits.find((x) => x.file === file);
    if (!c) throw new Error("Image not in credits.json");
    pick = {
      heroImage: c.file,
      cardImage: c.file1024,
      imageIsConcept: false,
      credit: { photographer: c.photographer, url: c.pageUrl, provider: c.provider, licence: c.licence },
    };
  } else {
    const card = file.replace(/\.webp$/, "-1024.webp");
    pick = { heroImage: file, cardImage: fs.existsSync(path.join(PUBLIC, card)) ? card : file, imageIsConcept: true };
  }

  const dir = path.join(ROOT, "content/channels");
  const target = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".mdx"))
    .find((f) => matter(fs.readFileSync(path.join(dir, f), "utf8")).data.slug === slug);
  if (!target) throw new Error(`No channel file for ${slug}`);

  const p = path.join(dir, target);
  fs.writeFileSync(p, setChannelImage(fs.readFileSync(p, "utf8"), pick));
  revalidatePath("/admin/image-picker");
  revalidatePath(`/channels/${slug}`);
}
