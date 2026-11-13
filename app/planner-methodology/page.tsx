import type { Metadata } from "next";
import Link from "next/link";
import { brand, copy } from "@/brand";
import { CPL_BY_INDUSTRY } from "@/data/benchmarks";
import { INDUSTRIES } from "@/data/industries";
import {
  ACTIVE_MONTHS,
  ALLOCATION,
  CHANNEL_COUNT_BY_BUDGET,
  PLANNER_LAST_REVIEWED,
  SCENARIOS,
  SCORE_WEIGHTS,
  TOTAL_REACH_DEDUP,
} from "@/data/planner-weights";
import { TIERS } from "@/data/regions";
import { PillLink } from "@/components/ui/pill-link";
import { Section } from "@/components/ui/section";
import { getChannels } from "@/lib/content/channels";
import { formatINRCompact, formatINRRange } from "@/lib/format-inr";

const t = copy.methodology;

export const metadata: Metadata = {
  title: `Planner methodology | ${brand.name}`,
  description: t.body,
  alternates: { canonical: "/planner-methodology" },
};

function Table({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[420px] text-left">
        <caption className="mono-label pb-3 text-left text-ink/60">{caption}</caption>
        <thead>
          <tr className="mono-label text-ink/50">
            {head.map((h) => (
              <th key={h} scope="col" className="pb-2 pr-4 font-normal">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={String(r[0])} className="border-t border-ink/10">
              {r.map((v, i) =>
                i === 0 ? (
                  <th key={i} scope="row" className="py-2.5 pr-4 font-medium">
                    {v}
                  </th>
                ) : (
                  <td key={i} className="py-2.5 pr-4 tabular-nums text-ink/75">
                    {v}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function MethodologyPage() {
  const channels = getChannels();
  const tb = t.tables;
  const sections = Object.values(t.sections);
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-20 pt-36 md:px-8 md:pt-44">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-xl mt-5 max-w-[14ch]">{t.title}</h1>
          <p className="mt-6 max-w-2xl text-lg text-silver">{t.body}</p>
          <p className="mono-label mt-8 text-paper/55">
            {t.lastReviewed}: {PLANNER_LAST_REVIEWED}
          </p>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-16 lg:grid-cols-[1.1fr_1fr]">
          <div className="space-y-10">
            {sections.map((sec) => (
              <div key={sec.title}>
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{sec.title}</h2>
                <p className="mt-3 max-w-2xl text-lg leading-relaxed text-ink/75">{sec.body}</p>
              </div>
            ))}
            <PillLink href="/planner">{copy.planner.eyebrow} →</PillLink>
          </div>
          <div className="space-y-12 lg:sticky lg:top-24 lg:self-start">
            <Table
              caption={tb.weights}
              head={["", "%"]}
              rows={(Object.keys(SCORE_WEIGHTS) as (keyof typeof SCORE_WEIGHTS)[]).map((k) => [t.weightLabels[k], `${Math.round(SCORE_WEIGHTS[k] * 100)}%`])}
            />
            <Table caption={tb.tiers} head={["", "×"]} rows={TIERS.map((x) => [x.label, `${x.cpmMultiplier}×`])} />
            <Table
              caption={tb.count}
              head={["", tb.channelsCol]}
              rows={CHANNEL_COUNT_BY_BUDGET.map((b, i) => [
                Number.isFinite(b.maxINR) ? `${tb.upTo} ${formatINRCompact(b.maxINR)}` : `${tb.above} ${formatINRCompact(CHANNEL_COUNT_BY_BUDGET[i - 1].maxINR)}`,
                `${b.min} to ${b.max}`,
              ])}
            />
            <Table caption={tb.scenarios} head={["", "×"]} rows={SCENARIOS.map((x) => [copy.planner.scenarios[x.id].label, `${x.multiplier}×`])} />
            <Table
              caption={tb.other}
              head={["", ""]}
              rows={[
                [tb.exponent, ALLOCATION.scoreExponent],
                [tb.cap, `${ALLOCATION.maxShare * 100}%`],
                [tb.floor, `${ALLOCATION.measurementFloorShare * 100}%`],
                [tb.dedup, `${TOTAL_REACH_DEDUP * 100}%`],
                [tb.active, Object.values(ACTIVE_MONTHS).join(", ")],
              ]}
            />
          </div>
        </div>
      </Section>

      <Section tone="paper2">
        <Table
          caption={tb.channels}
          head={[tb.cols.channel, tb.cols.cpm, tb.cols.min, tb.cols.freq, tb.cols.band, tb.cols.source]}
          rows={channels.map((c) => [
            c.name,
            formatINRRange(c.costs.cpmEquivalent.low, c.costs.cpmEquivalent.high),
            formatINRCompact(c.costs.minEffectiveBudgetINR),
            `${c.frequency}×`,
            copy.channelPage.roiBands[c.roi.band],
            c.costs.verified ? t.rateCard : t.placeholder,
          ])}
        />
        <div className="mt-14">
          <Table caption={tb.cpl} head={["", ""]} rows={INDUSTRIES.map((i) => [i.label, formatINRRange(CPL_BY_INDUSTRY[i.id].low, CPL_BY_INDUSTRY[i.id].high)])} />
        </div>
        <p className="mt-10 max-w-3xl text-ink/65">
          {copy.disclaimers.indicative}{" "}
          <Link href="/market" className="text-coral underline underline-offset-4">
            {copy.marketSnapshot.cta}
          </Link>
          .
        </p>
      </Section>
    </>
  );
}
