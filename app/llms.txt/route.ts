import { brand, copy } from "@/brand";
import { getChannels } from "@/lib/content/channels";
import { getIndustries, getServices } from "@/lib/content/site";

/** llms.txt: a plain-text map of the site for AI assistants (llmstxt.org). */
export const dynamic = "force-static";

export function GET() {
  const base = brand.seo.siteUrl.replace(/\/$/, "");
  const lines = [
    `# ${brand.name}`,
    "",
    `> ${brand.seo.description}`,
    "",
    `${copy.intro.body.join(" ")}`,
    "",
    `Contact: ${brand.contact.phone} · ${brand.contact.email} · ${brand.address.display}`,
    "",
    "## Media channels",
    ...getChannels().map((c) => `- [${c.name}](${base}/channels/${c.slug}): ${c.summary}`),
    "",
    "## Services",
    ...getServices().map((s) => `- [${s.name}](${base}/services/${s.slug}): ${s.headline} ${s.outcome}`),
    "",
    "## Industries",
    ...getIndustries().map((i) => `- [${i.name}](${base}/industries/${i.slug}): ${i.short}`),
    "",
    "## Tools and data",
    `- [Media planner](${base}/planner): indicative channel mix for a budget, or budgets for chosen channels.`,
    `- [How the planner calculates](${base}/planner-methodology)`,
    `- [India media market](${base}/market): adex by medium with sources.`,
    "",
    `Note: ${copy.disclaimers.indicative}`,
  ];
  return new Response(lines.join("\n"), { headers: { "content-type": "text/plain; charset=utf-8" } });
}
