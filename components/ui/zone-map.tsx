import { ZONES, type ZoneId } from "@/data/regions";

/**
 * Schematic tile map of India's six planning zones (not to scale, no map library).
 * Each zone's fill strength follows its 1–5 score.
 */
const AREAS: Record<ZoneId, string> = {
  north: "1 / 2 / 2 / 4",
  "north-east": "1 / 4 / 3 / 5",
  west: "2 / 1 / 4 / 2",
  central: "2 / 2 / 3 / 3",
  east: "2 / 3 / 3 / 4",
  south: "3 / 2 / 5 / 4",
};

export function ZoneMap({ scores, title, compact = false }: { scores: Record<ZoneId, number>; title: string; compact?: boolean }) {
  return (
    <figure className="w-full">
      <div
        role="img"
        aria-label={`${title}: ${ZONES.map((z) => `${z.label} ${scores[z.id]} of 5`).join(", ")}`}
        className={`grid grid-cols-4 grid-rows-4 gap-1.5 ${compact ? "aspect-[4/3.4] max-w-[300px]" : "aspect-[4/3.6] max-w-[440px]"}`}
      >
        {ZONES.map((z) => {
          const v = scores[z.id];
          return (
            <div
              key={z.id}
              style={{
                gridArea: AREAS[z.id],
                background: `color-mix(in oklab, var(--brand-coral) ${Math.round((v / 5) * 88)}%, transparent)`,
              }}
              className="flex flex-col justify-between rounded-xl border border-current/10 p-2.5"
            >
              <span className="mono-label">{z.label}</span>
              <span className="font-display text-2xl font-semibold leading-none" aria-hidden>
                {v}
              </span>
            </div>
          );
        })}
      </div>
    </figure>
  );
}
