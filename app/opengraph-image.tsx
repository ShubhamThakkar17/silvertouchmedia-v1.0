import { brand, copy } from "@/brand";
import { OG_SIZE, ogImage } from "@/lib/og";

export const alt = brand.seo.defaultTitle;
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return ogImage({ eyebrow: copy.hero.deckLines.eyebrow, title: copy.hero.headline, footer: brand.tagline });
}
