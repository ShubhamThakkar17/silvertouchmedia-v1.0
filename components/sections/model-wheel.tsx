"use client";

import Link from "next/link";
import { useState } from "react";

type Discipline = { slug: string; name: string; headline: string; bullets: string[]; outcome: string };

const SIZE = 520;
const C = SIZE / 2;
const R_OUT = 250;
const R_IN = 128;

function arc(i: number, n: number, rOut: number, rIn: number) {
  const gap = 0.012;
  const a0 = (i / n) * Math.PI * 2 - Math.PI / 2 + gap;
  const a1 = ((i + 1) / n) * Math.PI * 2 - Math.PI / 2 - gap;
  const p = (r: number, a: number) => `${C + r * Math.cos(a)} ${C + r * Math.sin(a)}`;
  return `M ${p(rOut, a0)} A ${rOut} ${rOut} 0 0 1 ${p(rOut, a1)} L ${p(rIn, a1)} A ${rIn} ${rIn} 0 0 0 ${p(rIn, a0)} Z`;
}

/** Home section D: the deck's six-segment 360° wheel. Hover or focus a segment to see its detail. */
export function ModelWheel({
  disciplines,
  centre,
  outcomeLabel,
  detailLabel,
}: {
  disciplines: Discipline[];
  centre: string;
  outcomeLabel: string;
  detailLabel: string;
}) {
  const [i, setI] = useState(0);
  const d = disciplines[i];
  const n = disciplines.length;

  return (
    <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="mx-auto w-full max-w-[520px]" role="group" aria-label={centre}>
        {disciplines.map((x, k) => {
          const mid = ((k + 0.5) / n) * Math.PI * 2 - Math.PI / 2;
          const lr = (R_OUT + R_IN) / 2;
          const on = k === i;
          return (
            <g
              key={x.slug}
              tabIndex={0}
              role="button"
              aria-pressed={on}
              aria-label={x.name}
              onPointerEnter={() => setI(k)}
              onFocus={() => setI(k)}
              onClick={() => setI(k)}
              className="cursor-pointer outline-none [&:focus-visible>path]:stroke-coral"
            >
              <path
                d={arc(k, n, on ? R_OUT + 6 : R_OUT, R_IN)}
                fill={on ? "var(--brand-coral)" : "color-mix(in oklab, var(--brand-paper) 7%, transparent)"}
                stroke="color-mix(in oklab, var(--brand-paper) 18%, transparent)"
                strokeWidth={1.5}
                style={{ transition: "fill .3s" }}
              />
              <text
                x={C + lr * Math.cos(mid)}
                y={C + lr * Math.sin(mid)}
                textAnchor="middle"
                dominantBaseline="middle"
                className="font-mono"
                fontSize={22}
                fill={on ? "var(--brand-ink)" : "var(--brand-paper)"}
              >
                {String(k + 1).padStart(2, "0")}
              </text>
            </g>
          );
        })}
        <circle cx={C} cy={C} r={R_IN - 14} fill="var(--brand-ink-2)" stroke="color-mix(in oklab, var(--brand-paper) 15%, transparent)" />
        <circle cx={C} cy={C} r={6} fill="var(--brand-coral)" />
        <text x={C} y={C + 34} textAnchor="middle" fontSize={15} fill="var(--brand-silver)" className="font-mono uppercase" letterSpacing="2">
          {centre}
        </text>
      </svg>

      <div aria-live="polite" className="min-h-[420px]">
        <p className="mono-label text-coral">
          {String(i + 1).padStart(2, "0")} · {d.name}
        </p>
        <h3 className="font-display mt-4 text-3xl font-semibold tracking-tight md:text-5xl">{d.headline}</h3>
        <ul className="mt-8 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {d.bullets.map((b) => (
            <li key={b} className="relative pl-5 text-silver before:absolute before:left-0 before:top-[0.55em] before:size-1.5 before:rounded-full before:bg-coral">
              {b}
            </li>
          ))}
        </ul>
        <div className="mt-8 rounded-[var(--brand-radius-card)] border border-paper/15 p-5">
          <p className="mono-label text-paper/55">{outcomeLabel}</p>
          <p className="mt-2 text-lg">{d.outcome}</p>
        </div>
        <Link href={`/services/${d.slug}`} className="mono-label mt-6 inline-block text-coral hover:underline">
          {detailLabel} →
        </Link>
      </div>
    </div>
  );
}
