import { brand, copy, theme } from "@/brand";
import { getChannels } from "@/lib/content/channels";
import { HeroShell } from "./hero-shell";

export function Hero() {
  const cards = getChannels().map(({ slug, order, name, ribbonStat, cardImage, heroImage }) => ({
    slug,
    order,
    name,
    ribbonStat,
    cardImage,
    heroImage,
  }));
  return (
    <HeroShell
      cards={cards}
      copy={copy.hero}
      colors={{ coral: theme.colors.coral, label: theme.colors.paper, silver: theme.colors.silver, ink: theme.colors.ink }}
      monogramUrl={brand.logo.monogram}
    />
  );
}
