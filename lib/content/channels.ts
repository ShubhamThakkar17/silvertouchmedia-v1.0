import "server-only";
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { cache } from "react";
import { ChannelCore } from "./schema";

const DIR = path.join(process.cwd(), "content/channels");

/** Reads and validates every channel MDX file. Throws at build time on bad frontmatter. */
export const getChannels = cache((): ChannelCore[] => {
  const files = fs.readdirSync(DIR).filter((f) => f.endsWith(".mdx"));
  const channels = files.map((file) => {
    const { data } = matter(fs.readFileSync(path.join(DIR, file), "utf8"));
    const parsed = ChannelCore.safeParse(data);
    if (!parsed.success) {
      throw new Error(`Invalid frontmatter in content/channels/${file}:\n${parsed.error.toString()}`);
    }
    return parsed.data;
  });
  const slugs = new Set<string>();
  for (const c of channels) {
    if (slugs.has(c.slug)) throw new Error(`Duplicate channel slug: ${c.slug}`);
    slugs.add(c.slug);
  }
  return channels.sort((a, b) => a.order - b.order);
});

export const getChannel = (slug: string) => getChannels().find((c) => c.slug === slug);
