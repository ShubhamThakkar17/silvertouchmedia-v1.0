import type { MetadataRoute } from "next";
import { brand } from "@/brand";

export default function robots(): MetadataRoute.Robots {
  const base = brand.seo.siteUrl.replace(/\/$/, "");
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
