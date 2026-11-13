import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/brand";
import { AUDIENCES } from "@/data/audiences";
import { ADEX, DEFINITIONS_NOTE, MARKET_LAST_REVIEWED, MEDIA, publicContext, type MarketFigure } from "@/data/market";
import { SOURCES, type SourceId } from "@/data/sources";
import { RegionExplorer } from "@/components/sections/region-explorer";
import { Section } from "@/components/ui/section";
import { SourceNote } from "@/components/ui/source-note";
import { getChannels } from "@/lib/content/channels";
import { formatCrore } from "@/lib/format-inr";

const t = copy.marketPage;

export const metadata: Metadata = {
  title: `India media market: adex, channels and ROI`,
  description: t.body,
  alternates: { canonical: "/market" },
};

const pct = (a: number, b: number) => Math.round((a / b) * 1000) / 10;
const growth = (a: number, b: number) => Math.round(((b - a) / a) * 1000) / 10;

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
      {children}
    </h2>
  );
}

function figure(f: MarketFigure) {
  if (f.unit === "crore") return f.valueHigh ? `₹${f.value.toLocaleString("en-IN")}–${f.valueHigh.toLocaleString("en-IN")} Cr` : formatCrore(f.value);
  if (f.unit === "trillion") return `₹${f.value} trillion`;
  return `${f.value}%`;
}

export default function MarketPage() {
  const channels = getChannels();
  const max = Math.max(...MEDIA.map((m) => Math.max(m.y2025, m.y2026F)));
  const digital = MEDIA.find((m) => m.id === "digital")!;
  const split = [
    { year: t.y2025, digital: pct(digital.y2025, ADEX.total2025.value) },
    { year: t.y2026, digital: pct(digital.y2026F, ADEX.total2026F.value) },
  ];
  const funnelLabel = copy.channelPage.funnel;
  const usedSources = new Set<SourceId>([
    ...MEDIA.map((m) => m.source),
    ...Object.values(ADEX).map((f) => f.source),
    ...publicContext().map((f) => f.source),
  ]);

  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-20 pt-36 md:px-8 md:pt-44">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-xl mt-5 max-w-[14ch]">{t.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{t.body}</p>
          <dl className="mt-14 grid gap-8 border-t border-paper/15 pt-8 sm:grid-cols-3">
            {[ADEX.total2025, ADEX.total2026F, ADEX.digitalShare2026F].map((f) => (
              <div key={f.label} className="flex flex-col">
                <dt className="order-2 mt-2 text-silver">{f.label}</dt>
                <dd className="font-display order-1 text-4xl font-semibold tracking-tight text-coral md:text-6xl">{figure(f)}</dd>
              </div>
            ))}
          </dl>
          <SourceNote id="pmar2026" className="mt-6" />
        </div>
      </section>

      {/* Adex by medium */}
      <Section tone="light" labelledBy="adex">
        <H2 id="adex">{t.adexTitle}</H2>
        <p className="mt-3 text-ink/65">{t.adexBody}</p>
        <div className="mono-label mt-8 flex gap-6">
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-ink" aria-hidden /> {t.y2025}
          </span>
          <span className="flex items-center gap-2">
            <span className="size-3 rounded-sm bg-coral" aria-hidden /> {t.y2026}
          </span>
        </div>
        <table className="mt-6 w-full border-collapse">
          <caption className="sr-only">{t.adexTitle}</caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">{t.mediumCol}</th>
              <th scope="col">{t.y2025}</th>
              <th scope="col">{t.y2026}</th>
            </tr>
          </thead>
          <tbody>
            {MEDIA.map((m) => (
              <tr key={m.id} className="border-b border-ink/10">
                <th scope="row" className="w-36 py-4 pr-4 text-left align-top font-medium md:w-56">
                  {m.label}
                  {m.derived ? <span className="mono-label mt-1 block text-ink/65">{copy.sources.derived}</span> : null}
                </th>
                <td className="py-4" colSpan={2}>
                  {(["y2025", "y2026F"] as const).map((k) => (
                    <div key={k} className="flex items-center gap-3 py-0.5">
                      <span
                        className={`h-3.5 rounded-r-full ${k === "y2025" ? "bg-ink" : "bg-coral"}`}
                        style={{ width: `${Math.max(0.6, (m[k] / max) * 78)}%` }}
                        aria-hidden
                      />
                      <span className="whitespace-nowrap text-sm tabular-nums">
                        <span className="sr-only">{k === "y2025" ? t.y2025 : t.y2026}: </span>
                        {formatCrore(m[k])}
                      </span>
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-6 max-w-3xl text-sm text-ink/65">{DEFINITIONS_NOTE}</p>
        <SourceNote id="pmar2026Media" className="mt-3" />
      </Section>

      {/* Digital vs traditional + growth */}
      <Section tone="dark" labelledBy="split">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <H2 id="split">{t.digitalTitle}</H2>
            <div className="mt-10 space-y-6">
              {split.map((s) => (
                <div key={s.year}>
                  <p className="mono-label text-paper/60">{s.year}</p>
                  <div className="mt-2 flex h-12 overflow-hidden rounded-xl" role="img" aria-label={`${s.year}: ${t.digital} ${s.digital}%, ${t.traditional} ${Math.round((100 - s.digital) * 10) / 10}%`}>
                    <div className="flex items-center bg-coral px-3 text-ink" style={{ width: `${s.digital}%` }}>
                      <span className="mono-label">
                        {t.digital} {s.digital}%
                      </span>
                    </div>
                    <div className="flex flex-1 items-center justify-end bg-paper/15 px-3">
                      <span className="mono-label">
                        {t.traditional} {Math.round((100 - s.digital) * 10) / 10}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <SourceNote id="pmar2026Digital" className="mt-6" />
          </div>
          <div>
            <H2 id="growth">{t.growthTitle}</H2>
            <ul className="mt-10 divide-y divide-paper/10 border-y border-paper/10">
              {[...MEDIA]
                .sort((a, b) => growth(b.y2025, b.y2026F) - growth(a.y2025, a.y2026F))
                .map((m) => {
                  const g = growth(m.y2025, m.y2026F);
                  return (
                    <li key={m.id} className="flex items-center justify-between py-4">
                      <span>{m.label}</span>
                      <span className={`font-display text-2xl font-semibold tabular-nums ${g > 0 ? "text-mint" : g < 0 ? "text-coral" : "text-silver"}`}>
                        {g > 0 ? "+" : ""}
                        {g}%
                      </span>
                    </li>
                  );
                })}
            </ul>
            <SourceNote id="pmar2026Media" className="mt-4" />
          </div>
        </div>
      </Section>

      {/* Audience × channel heatmap */}
      <Section tone="light" labelledBy="heatmap">
        <H2 id="heatmap">{t.heatmapTitle}</H2>
        <p className="mt-3 max-w-2xl text-ink/65">{t.heatmapBody}</p>
        <div className="mt-10 overflow-x-auto pb-2" tabIndex={0} role="region" aria-label={t.heatmapTitle}>
          <table className="w-full min-w-[980px] border-separate border-spacing-1 text-sm">
            <caption className="sr-only">{t.heatmapTitle}</caption>
            <thead>
              <tr>
                <td />
                {channels.map((c) => (
                  <th key={c.slug} scope="col" className="h-36 w-10 align-bottom">
                    <Link href={`/channels/${c.slug}`} className="mono-label inline-block origin-bottom-left translate-x-1/2 -rotate-60 whitespace-nowrap hover:text-coral">
                      {c.shortName}
                    </Link>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AUDIENCES.map((a) => (
                <tr key={a.id}>
                  <th scope="row" className="whitespace-nowrap pr-3 text-left font-medium">
                    {a.label}
                  </th>
                  {channels.map((c) => {
                    const v = c.audienceAffinity[a.id];
                    return (
                      <td key={c.slug} className="p-0">
                        <Link
                          href={`/channels/${c.slug}`}
                          aria-label={`${c.name}, ${a.label}: ${v} of 5`}
                          className="grid h-9 place-items-center rounded-md text-xs font-medium transition-transform hover:scale-110"
                          style={{
                            background: `color-mix(in oklab, var(--brand-coral) ${(v - 1) * 24}%, var(--brand-paper-2))`,
                            color: v >= 4 ? "var(--brand-ink)" : "color-mix(in oklab, var(--brand-ink) 70%, transparent)",
                          }}
                        >
                          {v}
                        </Link>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      {/* Region × channel */}
      <Section tone="paper2" labelledBy="region">
        <H2 id="region">{t.regionTitle}</H2>
        <p className="mt-3 max-w-2xl text-ink/65">{t.regionBody}</p>
        <div className="mt-10">
          <RegionExplorer
            rows={channels.map((c) => ({ slug: c.slug, name: c.name, regionStrength: c.regionStrength }))}
            label={copy.channelsList.eyebrow}
            title={t.regionTitle}
          />
        </div>
      </Section>

      {/* ROI / role */}
      <Section tone="dark" labelledBy="roi">
        <H2 id="roi">{t.roiTitle}</H2>
        <div className="mt-10 overflow-x-auto" tabIndex={0} role="region" aria-label={t.roiTitle}>
          <table className="w-full min-w-[720px] text-left">
            <thead>
              <tr className="mono-label text-paper/55">
                <th scope="col" className="pb-3 pr-4 font-normal">{t.roiCols.channel}</th>
                <th scope="col" className="pb-3 pr-4 font-normal">{t.roiCols.role}</th>
                <th scope="col" className="pb-3 pr-4 font-normal">{t.roiCols.kpi}</th>
                <th scope="col" className="pb-3 font-normal">{t.roiCols.band}</th>
              </tr>
            </thead>
            <tbody>
              {channels.map((c) => {
                const top = Math.max(...Object.values(c.funnel));
                const role = (Object.keys(funnelLabel) as (keyof typeof funnelLabel)[]).filter((k) => c.funnel[k] === top).map((k) => funnelLabel[k]);
                return (
                  <tr key={c.slug} className="border-t border-paper/10">
                    <th scope="row" className="py-4 pr-4 font-medium">
                      <Link href={`/channels/${c.slug}`} className="hover:text-coral">
                        {c.name}
                      </Link>
                    </th>
                    <td className="py-4 pr-4 text-silver">{role.join(", ")}</td>
                    <td className="py-4 pr-4 text-silver">{c.roi.kpi}</td>
                    <td className="py-4">
                      <span
                        className={`mono-label rounded-full px-3 py-1 ${
                          c.roi.band === "High" ? "bg-coral text-ink" : c.roi.band === "Medium" ? "bg-paper/15" : "border border-paper/25"
                        }`}
                      >
                        {copy.channelPage.roiBands[c.roi.band]}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-6 max-w-3xl text-silver">
          {copy.disclaimers.indicative}{" "}
          <Link href="/planner-methodology" className="text-coral underline underline-offset-4">
            {copy.channelPage.methodology}
          </Link>
          .
        </p>
      </Section>

      {/* Context */}
      <Section tone="light" labelledBy="context">
        <H2 id="context">{t.contextTitle}</H2>
        <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {publicContext().map((f) => (
            <li key={f.label} className="flex flex-col rounded-[var(--brand-radius-card)] border border-ink/10 p-6">
              <p className="font-display text-4xl font-semibold tracking-tight text-coral">{figure(f)}</p>
              <p className="mt-2 flex-1 text-lg">{f.label}</p>
              {f.note ? <p className="mt-1 text-sm text-ink/65">{f.note}</p> : null}
              <SourceNote id={f.source} className="mt-5" />
            </li>
          ))}
        </ul>
      </Section>

      {/* Sources */}
      <Section tone="paper2" labelledBy="sources">
        <H2 id="sources">{t.sourcesTitle}</H2>
        <p className="mt-3 text-ink/65">
          {t.sourcesBody} {t.lastReviewed}: {MARKET_LAST_REVIEWED}.
        </p>
        <ol className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
          {[...usedSources].map((id) => {
            const s = SOURCES[id];
            return (
              <li key={id} className="grid gap-1 py-4 md:grid-cols-[1fr_2fr_auto] md:gap-6">
                <span className="font-medium">{s.publisher}</span>
                <span>
                  {"url" in s && s.url ? (
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-ink/30 underline-offset-2 hover:text-coral">
                      {s.report}
                    </a>
                  ) : (
                    s.report
                  )}
                </span>
                <span className="mono-label text-ink/65">
                  {s.year}
                  {!s.verified ? <span className="text-coral"> · {copy.sources.unverified}</span> : null}
                </span>
              </li>
            );
          })}
        </ol>
      </Section>
    </>
  );
}
