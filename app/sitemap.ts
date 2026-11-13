import type { MetadataRoute } from "next";
import { brand } from "@/brand";
import { getChannels } from "@/lib/content/channels";
import { getIndustries, getInsights, getServices } from "@/lib/content/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = brand.seo.siteUrl.replace(/\/$/, "");
  const now = new Date();
  const page = (path: string, priority: number, changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"] = "monthly") => ({
    url: `${base}${path}`,
    lastModified: now,
    changeFrequency,
    priority,
  });
  return [
    page("/", 1, "weekly"),
    page("/planner", 0.9, "weekly"),
    page("/channels", 0.9),
    ...getChannels().map((c) => page(`/channels/${c.slug}`, 0.8)),
    page("/market", 0.8),
    page("/services", 0.7),
    ...getServices().map((s) => page(`/services/${s.slug}`, 0.6)),
    ...getIndustries().map((i) => page(`/industries/${i.slug}`, 0.7)),
    page("/insights", 0.6, "weekly"),
    ...getInsights().map((p) => page(`/insights/${p.slug}`, 0.5)),
    page("/about", 0.6),
    page("/work", 0.5),
    page("/contact", 0.7),
    page("/planner-methodology", 0.4),
    page("/privacy", 0.2, "yearly"),
    page("/terms", 0.2, "yearly"),
  ];
}
