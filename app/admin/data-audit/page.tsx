import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { AUDIENCE_AFFINITY_VERIFIED } from "@/data/audiences";
import { BENCHMARKS, CPL_VERIFIED } from "@/data/benchmarks";
import { INDUSTRY_FIT_VERIFIED } from "@/data/industries";
import { CHANNEL_MARKET, CONTEXT } from "@/data/market";
import { ACTIVE_MONTHS, PLANNER_LAST_REVIEWED, TOTAL_REACH_DEDUP } from "@/data/planner-weights";
import { REGION_STRENGTH_VERIFIED, TIERS_VERIFIED } from "@/data/regions";
import { SOURCES, type Source } from "@/data/sources";
import { adminAllowed } from "@/lib/admin";
import { formatINRCompact, formatINRRange } from "@/lib/format-inr";

export const metadata: Metadata = { title: "Data audit", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

type Row = { what: string; value: string; file: string; note?: string };

function Group({ title, rows, hint }: { title: string; rows: Row[]; hint?: string }) {
  return (
    <section className="mt-12">
      <h2 className="font-display text-2xl font-semibold tracking-tight">
        {title} <span className="mono-label ml-2 rounded-full bg-coral px-2 py-1 align-middle text-ink">{rows.length}</span>
      </h2>
      {hint ? <p className="mt-1 text-sm text-silver">{hint}</p> : null}
      {rows.length ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-sm">
            <thead>
              <tr className="mono-label text-paper/60">
                <th className="pb-2 pr-4 font-normal">Item</th>
                <th className="pb-2 pr-4 font-normal">Current value</th>
                <th className="pb-2 pr-4 font-normal">Edit in</th>
                <th className="pb-2 font-normal">Note</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.what + r.file} className="border-t border-paper/10 align-top">
                  <td className="py-2.5 pr-4 font-medium">{r.what}</td>
                  <td className="py-2.5 pr-4 tabular-nums">{r.value}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-mint">{r.file}</td>
                  <td className="py-2.5 text-silver">{r.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-3 text-mint">All verified.</p>
      )}
    </section>
  );
}

/** Every `verified: false` value, so the media team can replace placeholders with vendor rate cards (brief §6.4). */
export default function DataAuditPage() {
  if (!adminAllowed()) notFound();

  const sources: Row[] = Object.entries(SOURCES)
    .filter(([, s]) => !s.verified)
    .map(([id, s]) => ({ what: `${s.publisher}: ${s.report}`, value: id, file: "data/sources.ts", note: (s as Source).note }));

  const hiddenFigures: Row[] = [
    ...Object.entries(CONTEXT)
      .filter(([, f]) => !SOURCES[f.source].verified)
      .map(([k, f]) => ({ what: f.label, value: `${f.value}${f.unit === "percent" ? "%" : ""}`, file: "data/market.ts (CONTEXT)", note: `${k} · hidden on public pages` })),
    ...Object.entries(CHANNEL_MARKET)
      .filter(([, m]) => !SOURCES[m.source].verified)
      .map(([slug, m]) => ({ what: `${slug}: ${m.headline}`, value: m.sharePct !== undefined ? `${m.sharePct}%` : String(m.sizeINRcr), file: "data/market.ts (CHANNEL_MARKET)", note: "Hidden on the channel page" })),
  ];

  const costs: Row[] = Object.entries(BENCHMARKS).flatMap(([slug, b]) => {
    const rows: Row[] = [];
    if (!b.costs.verified)
      rows.push({
        what: `${slug}: rate range and minimum budget`,
        value: `${formatINRRange(b.costs.lowINR, b.costs.highINR)} (${b.costs.unit}) · min ${formatINRCompact(b.costs.minEffectiveBudgetINR)}/mo`,
        file: "data/benchmarks.ts",
        note: b.costs.note,
      });
    if (!b.costs.cpmVerified) rows.push({ what: `${slug}: effective CPM`, value: formatINRRange(b.costs.cpmEquivalent.low, b.costs.cpmEquivalent.high), file: "data/benchmarks.ts", note: `Frequency assumption ${b.frequency}×` });
    if (!b.roi.verified) rows.push({ what: `${slug}: ROI band`, value: b.roi.band, file: "data/benchmarks.ts", note: b.roi.kpi });
    return rows;
  });

  const matrices: Row[] = [
    ...(AUDIENCE_AFFINITY_VERIFIED ? [] : [{ what: "Audience affinity matrix (18 × 9)", value: "1–5 scores", file: "data/audiences.ts", note: "Check against IRS, BARC or platform audience data" }]),
    ...(REGION_STRENGTH_VERIFIED ? [] : [{ what: "Zone and city-tier strength (18 × 10)", value: "1–5 scores", file: "data/regions.ts" }]),
    ...(TIERS_VERIFIED ? [] : [{ what: "City-tier cost multipliers", value: "1.3 / 1.0 / 0.75 / 0.6", file: "data/regions.ts (TIERS)" }]),
    ...(INDUSTRY_FIT_VERIFIED ? [] : [{ what: "Industry fit matrix (18 × 14)", value: "1–5 scores", file: "data/industries.ts" }]),
    { what: "Stage fit matrix (18 × 5)", value: "1–5 scores", file: "data/planner-weights.ts (STAGE_FIT)" },
    ...(CPL_VERIFIED ? [] : [{ what: "Cost per lead by industry (14)", value: "₹ ranges", file: "data/benchmarks.ts (CPL_BY_INDUSTRY)", note: "Replace with actuals after the first campaigns" }]),
    { what: "Reach overlap factor", value: `${TOTAL_REACH_DEDUP}`, file: "data/planner-weights.ts", note: "Planning assumption" },
    { what: "Active months (flighting)", value: Object.entries(ACTIVE_MONTHS).map(([k, v]) => `${k}→${v}`).join(", "), file: "data/planner-weights.ts", note: "Planning assumption" },
  ];

  const total = sources.length + hiddenFigures.length + costs.length + matrices.length;
  return (
    <div className="bg-ink px-4 pb-24 pt-28 text-paper md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="eyebrow">Internal · not indexed</p>
        <h1 className="font-display mt-3 text-5xl font-semibold tracking-tight">Data audit</h1>
        <p className="mt-4 max-w-2xl text-silver">
          {total} values are planning placeholders or unverified. Replace them with vendor rate cards or a linked source, set
          <code className="mx-1 font-mono text-paper">verified: true</code>, and they leave this list. Planner last reviewed {PLANNER_LAST_REVIEWED}.
        </p>
        <Group title="Unverified sources" rows={sources} hint="Figures citing these are hidden from public pages until verified." />
        <Group title="Market figures held back" rows={hiddenFigures} />
        <Group title="Costs, CPMs and ROI bands" rows={costs} />
        <Group title="Scores and assumptions" rows={matrices} />
      </div>
    </div>
  );
}
