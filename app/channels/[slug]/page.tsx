import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, copy } from "@/brand";
import { AUDIENCES } from "@/data/audiences";
import { INDUSTRIES } from "@/data/industries";
import { STAGES } from "@/data/planner-weights";
import { TIERS } from "@/data/regions";
import { MdxBody } from "@/components/content/mdx-body";
import { PillLink } from "@/components/ui/pill-link";
import { ScoreBar } from "@/components/ui/score-bar";
import { Section } from "@/components/ui/section";
import { SourceNote } from "@/components/ui/source-note";
import { ZoneMap } from "@/components/ui/zone-map";
import { brandImage } from "@/lib/brand-images";
import { getChannel, getChannels } from "@/lib/content/channels";
import { getIndustries } from "@/lib/content/site";
import { formatCrore, formatINRCompact, formatINRRange } from "@/lib/format-inr";

const t = copy.channelPage;

export function generateStaticParams() {
  return getChannels().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = getChannel(slug);
  if (!c) return {};
  return {
    title: `${c.name} advertising agency in ${brand.address.locality} | PAN-India`,
    description: c.summary,
    alternates: { canonical: `/channels/${c.slug}` },
  };
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="font-display text-3xl font-semibold tracking-tight md:text-5xl">
      {children}
    </h2>
  );
}

export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getChannel(slug);
  if (!c) notFound();
  const all = getChannels();
  const img = brandImage(c.heroImage);
  const pad = Math.max(2, String(all.length).length);
  const featured = new Set(getIndustries().map((i) => i.slug));
  const related = c.related.map((s) => all.find((x) => x.slug === s)!).filter(Boolean);
  const audiences = [...AUDIENCES].sort((a, b) => c.audienceAffinity[b.id] - c.audienceAffinity[a.id]);
  const industries = INDUSTRIES.filter((i) => c.industryFit[i.id] >= 4).sort((a, b) => c.industryFit[b.id] - c.industryFit[a.id]);
  const stages = STAGES.filter((s) => c.stageFit[s.id] >= 4);
  const m = c.market;
  const cardVerified = c.costs.verified;

  const quick = [
    {
      label: t.quickStats.market,
      value: m?.sizeINRcr ? formatCrore(m.sizeINRcr) : m?.sharePct ? `${m.sharePct}%` : t.panIndia,
      note: m ? `${m.headline}, ${m.year}` : undefined,
    },
    { label: t.quickStats.cost, value: formatINRRange(c.costs.lowINR, c.costs.highINR), note: c.costs.unitLabel },
    { label: t.quickStats.minBudget, value: `${formatINRCompact(c.costs.minEffectiveBudgetINR)} ${t.perMonth}`, note: t.gstNote },
  ];

  const costRows: { k: string; v: string; n?: string }[] = [
    { k: t.costLabels.range, v: formatINRRange(c.costs.lowINR, c.costs.highINR), n: c.costs.unitLabel },
    { k: t.costLabels.cpm, v: formatINRRange(c.costs.cpmEquivalent.low, c.costs.cpmEquivalent.high), n: t.planningEstimate },
    { k: t.costLabels.minBudget, v: `${formatINRCompact(c.costs.minEffectiveBudgetINR)} ${t.perMonth}` },
    { k: t.costLabels.leadTime, v: `${c.costs.leadTimeDays} ${t.days}` },
    ...(c.costs.minDurationMonths ? [{ k: t.costLabels.minDuration, v: `${c.costs.minDurationMonths} ${t.months}` }] : []),
    { k: t.costLabels.roi, v: t.roiBands[c.roi.band], n: c.roi.rangeNote },
    { k: t.costLabels.kpi, v: c.roi.kpi },
  ];
  // Let the last cell fill the row so the grid never shows an empty gap.
  const n = costRows.length;
  const lastSpan = `${n % 2 ? "sm:col-span-2" : ""} ${n % 3 === 1 ? "lg:col-span-3" : n % 3 === 2 ? "lg:col-span-2" : "lg:col-span-1"}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: c.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${c.name} advertising`,
      serviceType: c.name,
      description: c.summary,
      areaServed: { "@type": "Country", name: brand.address.country },
      provider: { "@type": "ProfessionalService", name: brand.name },
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* 1 · Hero (shared-element target for the ribbon) */}
      <section className="relative h-[78svh] min-h-[560px] overflow-hidden bg-ink text-paper">
        <Image
          src={img.src}
          alt=""
          fill
          priority
          sizes="100vw"
          placeholder={img.blurDataURL ? "blur" : "empty"}
          blurDataURL={img.blurDataURL}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-ink/10" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-10 md:px-8 md:pb-14">
          <nav aria-label="Breadcrumb" className="mono-label text-paper/70">
            <Link href="/channels" className="hover:text-coral">
              {t.breadcrumb}
            </Link>{" "}
            / ({String(c.order).padStart(pad, "0")}) {c.label}
          </nav>
          <h1 className="display-xl mt-4 max-w-[16ch]">{c.name}</h1>
          <p className="mt-5 max-w-xl text-xl text-silver md:text-2xl">{c.tagline}</p>
          <dl className="mt-10 grid gap-6 border-t border-paper/15 pt-6 sm:grid-cols-3">
            {quick.map((q) => (
              <div key={q.label}>
                <dt className="mono-label text-paper/60">{q.label}</dt>
                <dd className="font-display mt-2 text-2xl font-semibold tracking-tight text-coral md:text-3xl">{q.value}</dd>
                {q.note ? <dd className="mt-1 text-sm text-paper/60">{q.note}</dd> : null}
              </div>
            ))}
          </dl>
          {c.imageIsConcept ? (
            <p className="mono-label mt-6 text-paper/45">{copy.disclaimers.concept}</p>
          ) : c.imageCredit ? (
            <p className="mono-label mt-6 text-paper/50">
              {copy.disclaimers.photoBy}{" "}
              <a href={c.imageCredit.url} target="_blank" rel="noreferrer" className="underline">
                {c.imageCredit.photographer}
              </a>{" "}
              · {c.imageCredit.provider}
            </p>
          ) : null}
        </div>
      </section>

      {/* 2 · What it is & formats */}
      <Section tone="light" labelledBy="formats">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">{c.label}</p>
            <H2 id="formats">{t.sections.formats}</H2>
            <MdxBody source={c.body} />
          </div>
          <ol className="divide-y divide-ink/10 self-start border-y border-ink/10">
            {c.formats.map((f, i) => (
              <li key={f.name} className="grid grid-cols-[3rem_1fr] gap-3 py-5">
                <span className="mono-label pt-1 text-coral">({String(i + 1).padStart(2, "0")})</span>
                <span>
                  <span className="font-display block text-xl font-medium tracking-tight">{f.name}</span>
                  {f.note ? <span className="mt-1 block text-ink/60">{f.note}</span> : null}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 3 · Impact (funnel) + 4 · Market */}
      <Section tone="dark" labelledBy="impact">
        <div className="grid gap-16 lg:grid-cols-2">
          <div>
            <H2 id="impact">{t.sections.impact}</H2>
            <p className="mt-4 max-w-md text-silver">{t.impactBody}</p>
            <div className="mt-8 max-w-lg">
              {(Object.keys(t.funnel) as (keyof typeof t.funnel)[]).map((k) => (
                <ScoreBar key={k} label={t.funnel[k]} value={c.funnel[k]} />
              ))}
            </div>
          </div>
          <div>
            <H2 id="market">{t.sections.market}</H2>
            {m ? (
              <div className="mt-8">
                <p className="mono-label text-paper/60">{m.headline}</p>
                <p className="font-display mt-2 text-6xl font-semibold tracking-tight text-coral md:text-7xl">
                  {m.sizeINRcr ? formatCrore(m.sizeINRcr) : `${m.sharePct}%`}
                </p>
                <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4">
                  <div>
                    <dt className="mono-label text-paper/60">{t.year}</dt>
                    <dd className="mt-1 text-xl">{m.year}</dd>
                  </div>
                  {m.growthPct !== undefined ? (
                    <div>
                      <dt className="mono-label text-paper/60">{t.marketGrowth}</dt>
                      <dd className="mt-1 text-xl">
                        {m.growthPct > 0 ? "+" : ""}
                        {m.growthPct}%
                      </dd>
                    </div>
                  ) : null}
                  {m.sizeINRcr && m.sharePct !== undefined ? (
                    <div>
                      <dt className="mono-label text-paper/60">{t.marketShare}</dt>
                      <dd className="mt-1 text-xl">{m.sharePct}%</dd>
                    </div>
                  ) : null}
                </dl>
                {m.note ? <p className="mt-5 max-w-md text-sm text-silver">{m.note}</p> : null}
                <SourceNote id={m.source} className="mt-6" />
                <p className="mt-6">
                  <Link href="/market" className="mono-label text-coral hover:underline">
                    {copy.marketSnapshot.cta} →
                  </Link>
                </p>
              </div>
            ) : (
              <p className="mt-8 max-w-md text-lg text-silver">{t.noMarket}</p>
            )}
          </div>
        </div>
      </Section>

      {/* 5 · Who it reaches */}
      <Section tone="light" labelledBy="reach">
        <H2 id="reach">{t.sections.reach}</H2>
        <p className="mt-4 max-w-xl text-ink/65">{t.reachBody}</p>
        <div className="mt-10 grid gap-14 lg:grid-cols-[1.3fr_1fr]">
          <div>
            {audiences.map((a) => (
              <ScoreBar key={a.id} label={a.label} value={c.audienceAffinity[a.id]} />
            ))}
          </div>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-1">
            <div>
              <h3 className="mono-label mb-4 text-ink/60">{t.zonesTitle}</h3>
              <ZoneMap scores={c.regionStrength} title={t.zonesTitle} compact />
            </div>
            <div>
              <h3 className="mono-label mb-2 text-ink/60">{t.tiersTitle}</h3>
              {TIERS.map((tier) => (
                <ScoreBar key={tier.id} label={tier.label} value={c.tierStrength[tier.id]} />
              ))}
            </div>
          </div>
        </div>
      </Section>

      {/* 6 · Best for */}
      <Section tone="paper2" labelledBy="best-for">
        <H2 id="best-for">{t.sections.bestFor}</H2>
        <p className="mt-4 max-w-xl text-lg text-ink/70">{c.bestFor}.</p>
        <div className="mt-10 grid gap-10 md:grid-cols-2">
          <div>
            <h3 className="mono-label mb-4 text-ink/60">{t.industriesTitle}</h3>
            <ul className="flex flex-wrap gap-2">
              {industries.map((i) => (
                <li key={i.id}>
                  {featured.has(i.id) ? (
                    <Link href={`/industries/${i.id}`} className="inline-flex rounded-full bg-ink px-4 py-2 text-sm text-paper hover:bg-coral hover:text-ink">
                      {i.label}
                    </Link>
                  ) : (
                    <span className="inline-flex rounded-full border border-ink/15 px-4 py-2 text-sm">{i.label}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="mono-label mb-4 text-ink/60">{t.stagesTitle}</h3>
            <ul className="flex flex-wrap gap-2">
              {stages.map((s) => (
                <li key={s.id} className="inline-flex rounded-full border border-ink/15 px-4 py-2 text-sm">
                  {s.label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* 7 · Indicative costs & ROI */}
      <Section tone="dark" labelledBy="costs">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <H2 id="costs">{t.sections.costs}</H2>
          <span className={`mono-label rounded-full px-3 py-1.5 ${cardVerified ? "bg-mint text-ink" : "border border-coral text-coral"}`}>
            {cardVerified ? t.fromRateCard : t.planningEstimate}
          </span>
        </div>
        <dl className="mt-10 grid gap-px overflow-hidden rounded-[var(--brand-radius-card)] bg-paper/10 sm:grid-cols-2 lg:grid-cols-3">
          {costRows.map((row, i) => (
            <div
              key={row.k}
              className={`bg-ink-2 p-6 ${i === costRows.length - 1 ? lastSpan : ""}`}
            >
              <dt className="mono-label text-paper/55">{row.k}</dt>
              <dd className="font-display mt-3 text-2xl font-medium tracking-tight">{row.v}</dd>
              {row.n ? <dd className="mt-2 text-sm text-silver">{row.n}</dd> : null}
            </div>
          ))}
        </dl>
        {c.costs.note ? <p className="mt-6 max-w-3xl text-silver">{c.costs.note}</p> : null}
        <p className="mt-6 max-w-3xl text-paper/80">
          <em>{copy.disclaimers.indicative}</em> {t.gstNote}{" "}
          <Link href="/planner-methodology" className="text-coral underline underline-offset-4">
            {t.methodology}
          </Link>
          .
        </p>
        <SourceNote id={c.costs.source} className="mt-4" />
      </Section>

      {/* 8 · How we execute */}
      <Section tone="forest" labelledBy="execution">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <H2 id="execution">{t.sections.execution}</H2>
            <p className="mt-4 max-w-md text-mint">{t.executionBody}</p>
          </div>
          <ol className="grid gap-4 sm:grid-cols-2">
            {c.execution.map((e, i) => (
              <li key={e} className="rounded-[var(--brand-radius-card)] border border-mint/20 p-5">
                <span className="mono-label text-mint">{String(i + 1).padStart(2, "0")}</span>
                <p className="mt-3 text-lg leading-snug">{e}</p>
              </li>
            ))}
          </ol>
        </div>
      </Section>

      {/* 9 · In the wild */}
      <Section tone="light" labelledBy="wild">
        <H2 id="wild">{t.sections.wild}</H2>
        <p className="mt-4 max-w-xl text-ink/65">{t.wildNote}</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {c.inTheWild.map((w) => (
            <li key={w.url}>
              <a
                href={w.url}
                target="_blank"
                rel="noreferrer"
                className="group flex h-full flex-col rounded-[var(--brand-radius-card)] border border-ink/10 bg-paper-2 p-6 transition-colors hover:border-coral"
              >
                <span className="mono-label text-ink/55">
                  {w.publisher}
                  {w.year ? ` · ${w.year}` : ""}
                </span>
                <span className="font-display mt-4 text-sm font-semibold uppercase tracking-wide text-coral">{w.brand}</span>
                <span className="font-display mt-1 text-xl font-medium leading-snug tracking-tight">{w.title}</span>
                <span className="mt-3 flex-1 text-ink/65">{w.summary}</span>
                <span className="mono-label mt-6 group-hover:text-coral">{t.readOn} {w.publisher} ↗</span>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      {/* 10 · FAQs */}
      <Section tone="paper2" labelledBy="faqs">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.6fr]">
          <H2 id="faqs">{t.sections.faqs}</H2>
          <div className="divide-y divide-ink/10 border-y border-ink/10">
            {c.faqs.map((f) => (
              <details key={f.q} className="group py-5">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-6 text-xl font-medium [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span aria-hidden className="mt-1 text-coral transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink/70">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>

      {/* 11 · CTA + 12 · Related */}
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-24 md:px-8 md:py-32">
          <h2 className="display-xl max-w-[18ch]">{t.ctaTitle.replace("{channel}", c.shortName)}</h2>
          <p className="mt-6 max-w-xl text-lg text-silver">{t.ctaBody}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <PillLink href={`/planner?mode=budget&channels=${c.slug}`} data-event="channel_cta_click">
              {t.planCta} {c.shortName}
            </PillLink>
            <PillLink href="/channels" variant="outline-dark">
              ← {t.backToChannels}
            </PillLink>
          </div>
          <h2 className="mono-label mt-24 text-paper/60">{t.sections.related}</h2>
          <ul className="mt-6 grid gap-5 md:grid-cols-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/channels/${r.slug}`} className="group block">
                  <span className="relative block aspect-[3/2] overflow-hidden rounded-[var(--brand-radius-card)] bg-ink-2">
                    <Image src={r.cardImage} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
                  </span>
                  <span className="mono-label mt-3 flex justify-between gap-3 group-hover:text-coral">
                    <span>
                      ({String(r.order).padStart(pad, "0")}) {r.name}
                    </span>
                    <span className="opacity-60">{r.ribbonStat}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
