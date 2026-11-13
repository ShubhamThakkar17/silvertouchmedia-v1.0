import { brand } from "@/brand";
import { getChannel, getChannels } from "@/lib/content/channels";
import { OG_SIZE, ogImage } from "@/lib/og";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Channel guide";

export function generateStaticParams() {
  return getChannels().map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const c = getChannel((await params).slug);
  return ogImage({
    eyebrow: c ? `(${String(c.order).padStart(2, "0")}) ${c.label} · PAN-India` : brand.category,
    title: c ? `${c.name} advertising` : brand.name,
    footer: c?.tagline,
  });
}
