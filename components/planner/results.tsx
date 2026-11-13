"use client";

import Link from "next/link";
import { copy } from "@/brand/copy";
import { SCENARIOS, type ScenarioId } from "@/data/planner-weights";
import { Donut, sliceColor } from "@/components/ui/donut";
import { formatCountRange, formatINR, formatINRCompact, formatINRRange } from "@/lib/format-inr";
import { describeAssumption, describeReason } from "@/lib/planner/describe";
import type { Assumption, BudgetPlan, ChannelLine, ChannelsPlan, RoiSummary, Suggestion, Totals } from "@/lib/planner/plan";
import type { PlannerState } from "@/lib/planner/state";

const t = copy.planner;
const role = copy.channelPage.funnel;

function Stat({ k, v, note }: { k: string; v: string; note?: string }) {
  return (
    <div className="rounded-2xl bg-ink-2 p-4">
      <p className="mono-label text-paper/55">{k}</p>
      <p className="font-display mt-2 text-xl font-semibold tracking-tight">{v}</p>
      {note ? <p className="mt-1 text-sm text-silver">{note}</p> : null}
    </div>
  );
}

function TotalsBlock({ totals, roi }: { totals: Totals; roi: RoiSummary }) {
  const showLeads = roi.kpi === "leads" && totals.leads;
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <Stat k={t.results.impressions} v={formatCountRange(totals.impressions.low, totals.impressions.high)} />
      <Stat k={t.results.reach} v={`${formatCountRange(totals.reach.low, totals.reach.high)} ${t.results.people}`} />
      {showLeads ? (
        <>
          <Stat k={t.results.leads} v={formatCountRange(totals.leads!.low, totals.leads!.high)} />
          {totals.cpl ? <Stat k={t.results.cpl} v={formatINRRange(totals.cpl.low, totals.cpl.high)} /> : null}
        </>
      ) : null}
      <div className={`rounded-2xl p-4 ${roi.band === "High" ? "bg-coral text-ink" : "bg-paper/10"} sm:col-span-2`}>
        <p className="mono-label opacity-70">{t.results.roiTitle}</p>
        <p className="font-display mt-1 text-2xl font-semibold">{copy.channelPage.roiBands[roi.band]}</p>
        <p className="mt-1 text-sm opacity-80">
          {t.results.kpi[roi.kpi]} {roi.newBrand ? t.results.newBrandNote : null}
        </p>
      </div>
    </div>
  );
}

function LinesTable({ lines, name }: { lines: ChannelLine[]; name: (s: string) => string }) {
  const c = t.results.cols;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[560px] text-left text-sm">
        <thead>
          <tr className="mono-label text-paper/50">
            <th scope="col" className="pb-2 pr-3 font-normal">{c.channel}</th>
            <th scope="col" className="pb-2 pr-3 font-normal">{c.amount}</th>
            <th scope="col" className="pb-2 pr-3 font-normal">{c.impressions}</th>
            <th scope="col" className="pb-2 pr-3 font-normal">{c.reach}</th>
            <th scope="col" className="pb-2 font-normal">{c.role}</th>
          </tr>
        </thead>
        <tbody>
          {lines.map((l, i) => (
            <tr key={l.slug} className="border-t border-paper/10 align-top">
              <th scope="row" className="py-3 pr-3 font-medium">
                <span className="flex items-start gap-2">
                  <span className="mt-1.5 size-2.5 shrink-0 rounded-full" style={{ background: sliceColor(i) }} aria-hidden />
                  <span>
                    <Link href={`/channels/${l.slug}`} className="hover:text-coral">
                      {name(l.slug)}
                    </Link>
                    {l.reasons.length ? <span className="mt-1 block text-xs font-normal text-silver">{l.reasons.map(describeReason).join(" · ")}</span> : null}
                  </span>
                </span>
              </th>
              <td className="py-3 pr-3 tabular-nums">
                {formatINRCompact(l.amountINR)}
                <span className="block text-xs text-silver">{Math.round(l.share * 100)}%</span>
              </td>
              <td className="py-3 pr-3 tabular-nums">{formatCountRange(l.impressions.low, l.impressions.high)}</td>
              <td className="py-3 pr-3 tabular-nums">{formatCountRange(l.reach.low, l.reach.high)}</td>
              <td className="py-3 text-silver">{role[l.role]}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Suggestions({ items }: { items: Suggestion[] }) {
  if (!items.length) return null;
  return (
    <div>
      <h3 className="mono-label text-paper/55">{t.results.addTitle}</h3>
      <ul className="mt-3 flex flex-wrap gap-2">
        {items.map((x) => (
          <li key={x.slug}>
            <Link href={`/channels/${x.slug}`} className="inline-flex rounded-full border border-paper/20 px-3 py-1.5 text-sm hover:border-coral hover:text-coral">
              {x.name} <span className="ml-2 text-silver">{t.results.addFor} {formatINRCompact(x.addINR)}</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Assumptions({ items }: { items: Assumption[] }) {
  return (
    <details className="group rounded-2xl border border-paper/10 p-4">
      <summary className="mono-label cursor-pointer list-none text-paper/60 [&::-webkit-details-marker]:hidden">
        {t.results.assumptionsTitle} <span className="inline-block transition-transform group-open:rotate-45">+</span>
      </summary>
      <ul className="mt-3 space-y-1.5 text-sm text-silver">
        {items.map((a) => (
          <li key={a.id}>{describeAssumption(a)}</li>
        ))}
        <li>{copy.disclaimers.indicative}</li>
      </ul>
    </details>
  );
}

export function BudgetResults({ plan, name }: { plan: BudgetPlan; name: (s: string) => string }) {
  if (!plan.lines.length) {
    return <p className="rounded-2xl bg-ink-2 p-6 text-silver">{t.results.empty}</p>;
  }
  return (
    <div className="space-y-6">
      <div className="grid items-center gap-6 sm:grid-cols-[auto_1fr]">
        <Donut size={190} thickness={22} title={t.results.mixTitle} slices={plan.lines.map((l) => ({ key: l.slug, label: name(l.slug), value: l.share }))}>
          <div>
            <p className="font-display text-xl font-semibold">{formatINRCompact(plan.totals.budgetINR)}</p>
            <p className="mono-label mt-1 text-paper/55">{t.results.mixTitle}</p>
          </div>
        </Donut>
        <TotalsBlock totals={plan.totals} roi={plan.roi} />
      </div>
      <LinesTable lines={plan.lines} name={name} />
      <Suggestions items={plan.suggestions} />
      <Assumptions items={plan.assumptions} />
    </div>
  );
}

export function ChannelsResults({
  plan,
  state,
  onIntensity,
  name,
}: {
  plan: ChannelsPlan;
  state: PlannerState;
  onIntensity: (id: ScenarioId) => void;
  name: (s: string) => string;
}) {
  if (!state.channels.length) return <p className="rounded-2xl bg-ink-2 p-6 text-silver">{t.results.pickEmpty}</p>;
  const sel = plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0];
  return (
    <div className="space-y-6">
      <div role="radiogroup" aria-label={t.fields.intensity} className="grid gap-3 sm:grid-cols-3">
        {plan.scenarios.map((sc) => {
          const on = sc.id === sel.id;
          const meta = copy.planner.scenarios[sc.id];
          return (
            <button
              key={sc.id}
              type="button"
              role="radio"
              aria-checked={on}
              onClick={() => onIntensity(sc.id)}
              className={`rounded-2xl p-4 text-left transition-colors ${on ? "bg-coral text-ink" : "bg-ink-2 hover:bg-paper/10"}`}
            >
              <span className="mono-label block opacity-70">
                {meta.label} · {SCENARIOS.find((x) => x.id === sc.id)?.multiplier}×
              </span>
              <span className="font-display mt-2 block text-2xl font-semibold tracking-tight">{formatINRCompact(sc.totalINR)}</span>
              <span className="mt-1 block text-xs opacity-75">
                {t.scenarios.totalRange}: {formatINRRange(sc.totalRange.low, sc.totalRange.high)}
              </span>
              <span className="mt-2 block text-sm opacity-80">{meta.body}</span>
            </button>
          );
        })}
      </div>
      <TotalsBlock totals={sel.totals} roi={sel.roi} />
      <h3 className="mono-label text-paper/55">
        {t.scenarios.split} {copy.planner.scenarios[sel.id].label} · {formatINR(sel.totalINR)}
      </h3>
      <LinesTable lines={sel.lines} name={name} />
      <Suggestions items={plan.suggestions} />
      <Assumptions items={plan.assumptions} />
    </div>
  );
}
