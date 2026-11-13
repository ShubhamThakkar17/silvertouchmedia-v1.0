import Link from "next/link";
import { SceneCanvas } from "./motion/scene-canvas";
import type { HeroCard } from "./ribbon-store";

/**
 * CSS curved carousel with the same motion-graphic scenes as the WebGL ribbon. Used as the static poster before WebGL hydrates,
 * and as the full experience on mobile, low-power and reduced-motion devices.
 */
export function FallbackCarousel({
  cards,
  interactive,
  label,
}: {
  cards: HeroCard[];
  interactive: boolean;
  label: string;
}) {
  const pad = Math.max(2, String(cards.length).length);
  return (
    <ul
      aria-label={label}
      aria-hidden={interactive ? undefined : true}
      className={`no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto px-[12vw] py-6 md:gap-6 md:px-[30vw] ${
        interactive ? "" : "pointer-events-none overflow-hidden"
      }`}
    >
      {cards.map((c, i) => (
        <li key={c.slug} className="curve-card w-[74vw] max-w-[440px] shrink-0 snap-center md:w-[30vw]">
          <Link
            href={`/channels/${c.slug}`}
            tabIndex={interactive ? 0 : -1}
            className="group block"
          >
            <span className="mono-label flex justify-between gap-3 pb-2 text-paper/80 transition-colors group-hover:text-coral group-focus-visible:text-coral">
              <span className="truncate">
                ({String(c.order).padStart(pad, "0")}) {c.name}
              </span>
              <span className="shrink-0 opacity-70">{c.ribbonStat}</span>
            </span>
            <span className="relative block aspect-[4/3] overflow-hidden rounded-[10px] bg-ink-2 sm:aspect-[3/2]">
              <SceneCanvas slug={c.slug} seed={i} className="transition-transform duration-500 group-hover:scale-[1.03]" />
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
