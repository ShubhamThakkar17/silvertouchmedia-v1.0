import type { MetadataRoute } from "next";
import { brand } from "@/brand";
import { isIndexable } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const base = brand.seo.siteUrl.replace(/\/$/, "");
  if (!isIndexable()) return { rules: [{ userAgent: "*", disallow: "/" }] };
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/api/"] }],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
