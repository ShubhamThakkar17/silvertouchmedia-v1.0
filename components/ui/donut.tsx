import { theme } from "@/brand";

export type DonutSlice = { key: string; label: string; value: number };

/**
 * Lightweight SVG donut (no chart library). Segments use the brand chart palette in
 * order; the centre slot takes any content (e.g. a total).
 */
export function Donut({
  slices,
  size = 220,
  thickness = 26,
  title,
  children,
}: {
  slices: DonutSlice[];
  size?: number;
  thickness?: number;
  title: string;
  children?: React.ReactNode;
}) {
  const r = (size - thickness) / 2;
  const c = 2 * Math.PI * r;
  const total = slices.reduce((a, s) => a + s.value, 0) || 1;
  const gap = slices.length > 1 ? 3 : 0;
  let offset = 0;
  return (
    <div className="relative inline-grid place-items-center" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} role="img" aria-label={title} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeOpacity={0.1} strokeWidth={thickness} />
        {slices.map((s, i) => {
          const len = (s.value / total) * c;
          const dash = Math.max(0, len - gap);
          const el = (
            <circle
              key={s.key}
              cx={size / 2}
              cy={size / 2}
              r={r}
              fill="none"
              stroke={theme.chart[i % theme.chart.length]}
              strokeWidth={thickness}
              strokeDasharray={`${dash} ${c - dash}`}
              strokeDashoffset={-offset}
              style={{ transition: "stroke-dasharray .5s cubic-bezier(.22,1,.36,1), stroke-dashoffset .5s cubic-bezier(.22,1,.36,1)" }}
            />
          );
          offset += len;
          return el;
        })}
      </svg>
      <div className="absolute inset-0 grid place-items-center text-center">{children}</div>
    </div>
  );
}

export const sliceColor = (i: number) => theme.chart[i % theme.chart.length];
