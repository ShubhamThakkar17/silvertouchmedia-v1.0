import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { z } from "zod";
import { INDUSTRY_IDS, type IndustryId } from "@/data/industries";

/** Reads every MDX file in /content/{dir}, validates frontmatter and sorts by `order`. */
export function loadCollection<T extends z.ZodTypeAny>(dir: string, schema: T): (z.infer<T> & { body: string })[] {
  const abs = path.join(process.cwd(), "content", dir);
  if (!fs.existsSync(abs)) return [];
  const items = fs
    .readdirSync(abs)
    .filter((f) => f.endsWith(".mdx"))
    .map((file) => {
      const { data, content } = matter(fs.readFileSync(path.join(abs, file), "utf8"));
      const parsed = schema.safeParse(data);
      if (!parsed.success) throw new Error(`Invalid frontmatter in content/${dir}/${file}:\n${parsed.error.toString()}`);
      return { ...(parsed.data as z.infer<T>), body: content.trim() };
    });
  return items.sort((a, b) => (a as { order: number }).order - (b as { order: number }).order);
}

export const ServiceFrontmatter = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/),
  order: z.number().int(),
  name: z.string(),
  headline: z.string(),
  bullets: z.array(z.string()).min(3),
  outcome: z.string(),
  /** Key in data/generated/brand-images.json. */
  image: z.string(),
  channels: z.array(z.string()).default([]),
});
export type Service = z.infer<typeof ServiceFrontmatter> & { body: string };

export const IndustryFrontmatter = z.object({
  slug: z.enum(INDUSTRY_IDS as [IndustryId, ...IndustryId[]]),
  order: z.number().int(),
  name: z.string(),
  short: z.string(),
  headline: z.string(),
  image: z.string(),
  challenges: z.array(z.string()).min(2),
  approach: z.array(z.string()).min(3),
});
export type Industry = z.infer<typeof IndustryFrontmatter> & { body: string };

export const loadServices = (): Service[] => loadCollection("services", ServiceFrontmatter);
export const loadIndustries = (): Industry[] => loadCollection("industries", IndustryFrontmatter);
