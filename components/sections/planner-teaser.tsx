"use client";

import Link from "next/link";
import { useId, useMemo, useState } from "react";
import { ALLOCATION } from "@/data/planner-weights";
import type { IndustryId } from "@/data/industries";
import { Donut, sliceColor } from "@/components/ui/donut";
import { formatINRCompact } from "@/lib/format-inr";
import { recommendMix } from "@/lib/planner/mix";
import type { PlannerChannel } from "@/lib/planner/types";

type Labels = {
  industryLabel: string;
  budgetLabel: string;
  assumptions: string;
  cta: string;
  empty: string;
  months: string;
};

const MIN = Math.log10(ALLOCATION.budgetMinINR);
const MAX = Math.log10(ALLOCATION.budgetMaxINR / 10);
const STEPS = 200;

/** Snap to a friendly number: 1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5 × 10^n. */
function snap(v: number) {
  const e = Math.floor(Math.log10(v));
  const base = 10 ** e;
  const nice = [1, 1.5, 2, 2.5, 3, 4, 5, 6, 7.5, 10];
  const m = nice.reduce((best, x) => (Math.abs(x * base - v) < Math.abs(best * base - v) ? x : best), 1);
  return m * base;
}

/** Home section G: industry + monthly budget → live donut of the suggested mix. */
export function PlannerTeaser({
  channels,
  industries,
  labels,
}: {
  channels: PlannerChannel[];
  industries: { id: IndustryId; label: string }[];
  labels: Labels;
}) {
  const id = useId();
  const [industry, setIndustry] = useState<IndustryId>(industries[0].id);
  const [step, setStep] = useState(Math.round(STEPS * 0.38));
  const monthly = snap(10 ** (MIN + ((MAX - MIN) * step) / STEPS));
  const months = 3;

  const mix = useMemo(
    () =>
      recommendMix(channels, {
        industry,
        stage: "growing",
        objective: "leads",
        zones: [],
        tiers: [],
        audiences: [],
        budgetINR: monthly * months,
        months,
      }),
    [channels, industry, monthly],
  );
  const name = (slug: string) => channels.find((c) => c.slug === slug)?.name ?? slug;
  const href = `/planner?mode=budget&industry=${industry}&budget=${monthly * months}&months=${months}`;

  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-center">
      <div className="space-y-8">
        <div>
          <label htmlFor={`${id}-ind`} className="mono-label text-paper/60">
            {labels.industryLabel}
          </label>
          <select
            id={`${id}-ind`}
            value={industry}
            onChange={(e) => setIndustry(e.target.value as IndustryId)}
            className="mt-3 w-full rounded-xl border border-paper/20 bg-ink-2 px-4 py-3.5 text-lg"
          >
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <div className="flex items-baseline justify-between">
            <label htmlFor={`${id}-bud`} className="mono-label text-paper/60">
              {labels.budgetLabel}
            </label>
            <output htmlFor={`${id}-bud`} className="font-display text-3xl font-semibold tracking-tight text-coral">
              {formatINRCompact(monthly)}
            </output>
          </div>
          <input
            id={`${id}-bud`}
            type="range"
            min={0}
            max={STEPS}
            value={step}
            onChange={(e) => setStep(Number(e.target.value))}
            aria-valuetext={formatINRCompact(monthly)}
            className="mt-4 w-full accent-[var(--brand-coral)]"
          />
          <div className="mono-label mt-2 flex justify-between text-paper/60">
            <span>{formatINRCompact(ALLOCATION.budgetMinINR)}</span>
            <span>{formatINRCompact(ALLOCATION.budgetMaxINR / 10)}+</span>
          </div>
        </div>
        <p className="text-sm text-silver">{labels.assumptions}</p>
        <Link href={href} className="mono-label inline-flex rounded-full bg-coral px-6 py-4 text-ink transition-colors hover:bg-paper">
          {labels.cta} →
        </Link>
      </div>

      <div className="grid items-center gap-8 sm:grid-cols-[auto_1fr]">
        <Donut slices={mix.map((m) => ({ key: m.slug, label: name(m.slug), value: m.share }))} title={labels.budgetLabel}>
          <div>
            <p className="font-display text-2xl font-semibold">{formatINRCompact(monthly * months)}</p>
            <p className="mono-label mt-1 text-paper/55">{months} {labels.months}</p>
          </div>
        </Donut>
        {mix.length ? (
          <ul className="space-y-3" aria-live="polite">
            {mix.map((m, i) => (
              <li key={m.slug} className="grid grid-cols-[0.75rem_1fr_auto] items-center gap-3">
                <span className="size-3 rounded-full" style={{ background: sliceColor(i) }} aria-hidden />
                <span>{name(m.slug)}</span>
                <span className="mono-label text-paper/70">
                  {Math.round(m.share * 100)}% · {formatINRCompact(m.amountINR)}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-silver">{labels.empty}</p>
        )}
      </div>
    </div>
  );
}
