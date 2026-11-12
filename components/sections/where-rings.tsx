/**
 * "Where we work" radial diagram (deck page 16): HQ at the centre, rings for Tier 1,
 * Tier 2 & 3, PAN-India and globally planned. Rings draw in with CSS; static under
 * reduced motion (global rule).
 */
export function WhereRings({ rings }: { rings: readonly string[] }) {
  const n = rings.length;
  const size = 560;
  const c = size / 2;
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="where-rings mx-auto w-full max-w-[560px]" role="img" aria-label={rings.join(", ")}>
      {rings
        .map((label, i) => {
          const r = 74 + (i * (c - 84)) / (n - 1);
          return (
            <g key={label} style={{ animationDelay: `${(n - i) * 120}ms` }} className="where-ring">
              <circle cx={c} cy={c} r={r} fill={i === 0 ? "var(--brand-coral)" : "none"} stroke={i === 0 ? "none" : "var(--brand-mint)"} strokeOpacity={0.5 - i * 0.06} strokeWidth={1.5} />
              <text
                x={c}
                y={i === 0 ? c + 5 : c - r + 22}
                textAnchor="middle"
                fontSize={i === 0 ? 11 : 12}
                letterSpacing={2}
                className="font-mono uppercase"
                fill={i === 0 ? "var(--brand-ink)" : "var(--brand-mint)"}
              >
                {label}
              </text>
            </g>
          );
        })
        .reverse()}
      <circle cx={c} cy={c} r={74} fill="none" stroke="var(--brand-coral)" strokeOpacity={0.6} className="where-pulse" />
    </svg>
  );
}
