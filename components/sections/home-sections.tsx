import Image from "next/image";
import Link from "next/link";
import { copy } from "@/brand";
import { SNAPSHOT, type MarketFigure } from "@/data/market";
import { PillLink } from "@/components/ui/pill-link";
import { Section, SectionHeader } from "@/components/ui/section";
import { SourceNote } from "@/components/ui/source-note";
import { brandImage } from "@/lib/brand-images";
import type { Industry } from "@/lib/content/collections";
import { formatCrore } from "@/lib/format-inr";

/** E · "One idea. Every surface." 8 concept tiles, each linking to its channel. */
export function Surfaces() {
  const c = copy.surfaces;
  return (
    <Section tone="light" labelledBy="surfaces">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="surfaces" body={c.caption} />
      <ul className="mt-12 grid grid-flow-dense auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[220px] md:grid-cols-4 md:gap-4 lg:auto-rows-[260px]">
        {c.tiles.map((tile, i) => {
          const img = brandImage(tile.image);
          return (
            <li key={tile.label} className={i === 0 ? "col-span-2 row-span-2" : i === 7 ? "col-span-2" : ""}>
              <Link href={`/channels/${tile.channel}`} className="group relative block h-full overflow-hidden rounded-[var(--brand-radius-card)] bg-paper-2">
                <Image
                  src={img.src}
                  alt=""
                  fill
                  sizes="(min-width: 768px) 25vw, 50vw"
                  placeholder={img.blurDataURL ? "blur" : "empty"}
                  blurDataURL={img.blurDataURL}
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                />
                <span className="absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-ink/80 to-transparent p-4 pt-12 text-paper">
                  <span className="mono-label">{tile.label}</span>
                  <span className="mono-label hidden opacity-60 sm:inline">{copy.disclaimers.concept}</span>
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </Section>
  );
}

function figureValue(f: MarketFigure) {
  if (f.unit === "crore") return formatCrore(f.value);
  if (f.unit === "trillion") return `₹${f.value} tn`;
  return `${f.value}%`;
}

/** F · Market snapshot: 4 sourced numbers and a link to /market. */
export function MarketSnapshot() {
  const c = copy.marketSnapshot;
  return (
    <Section tone="dark" labelledBy="snapshot">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeader eyebrow={c.eyebrow} title={c.title} id="snapshot" />
        <PillLink href="/market" variant="outline-dark">
          {c.cta} →
        </PillLink>
      </div>
      <dl className="mt-14 grid gap-px overflow-hidden rounded-[var(--brand-radius-card)] bg-paper/10 sm:grid-cols-2 lg:grid-cols-4">
        {SNAPSHOT.map((f) => (
          <div key={f.label} className="flex flex-col bg-ink p-6 md:p-8">
            <dt className="order-2 mt-3 text-lg">{f.label}</dt>
            <dd className="font-display order-1 text-4xl font-semibold tracking-tight text-coral md:text-5xl">{figureValue(f)}</dd>
            <dd className="order-3 mt-auto pt-6">
              <SourceNote id={f.source} />
            </dd>
          </div>
        ))}
      </dl>
    </Section>
  );
}

/** H1 · Six industry cards. */
export function IndustriesGrid({ industries }: { industries: Industry[] }) {
  const c = copy.industries;
  return (
    <Section tone="paper2" labelledBy="industries">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="industries" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {industries.map((ind, i) => (
          <li key={ind.slug}>
            <Link
              href={`/industries/${ind.slug}`}
              className="group flex h-full flex-col rounded-[var(--brand-radius-card)] border border-ink/10 bg-paper p-6 transition-colors hover:border-coral md:p-8"
            >
              <span className="mono-label text-coral">({String(i + 1).padStart(2, "0")})</span>
              <span className="font-display mt-6 text-2xl font-semibold tracking-tight md:text-3xl">{ind.name}</span>
              <span className="mt-3 flex-1 text-ink/65">{ind.short}</span>
              <span className="mono-label mt-8 group-hover:text-coral">
                {c.cta} {ind.name.toLowerCase()} →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

/** H2 · How we work: 5 steps on a wave. */
export function Process() {
  const c = copy.process;
  const pts = c.steps.map((_, i) => ({ x: 60 + i * 220, y: i % 2 ? 150 : 70 }));
  const d = pts.reduce((acc, p, i) => {
    if (!i) return `M 0 110 C 30 110, 30 ${p.y}, ${p.x} ${p.y}`;
    const prev = pts[i - 1];
    const mx = (prev.x + p.x) / 2;
    return `${acc} C ${mx} ${prev.y}, ${mx} ${p.y}, ${p.x} ${p.y}`;
  }, "");
  return (
    <Section tone="dark" labelledBy="process">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="process" />
      <svg viewBox="0 0 1000 220" className="mt-14 hidden w-full md:block" aria-hidden>
        <path d={`${d} C 960 ${pts[4].y}, 980 110, 1000 110`} fill="none" stroke="var(--brand-coral)" strokeWidth={2} strokeDasharray="6 8" />
        {pts.map((p, i) => (
          <g key={i}>
            <circle cx={p.x} cy={p.y} r={22} fill="var(--brand-ink)" stroke="var(--brand-coral)" strokeWidth={2} />
            <text x={p.x} y={p.y + 1} textAnchor="middle" dominantBaseline="middle" fill="var(--brand-paper)" fontSize={15} className="font-mono">
              {i + 1}
            </text>
          </g>
        ))}
      </svg>
      <ol className="mt-10 grid gap-8 md:mt-4 md:grid-cols-5">
        {c.steps.map((s, i) => (
          <li key={s.title} className="border-t border-paper/15 pt-5 md:border-0 md:pt-0">
            <span className="mono-label text-coral md:hidden">{String(i + 1).padStart(2, "0")}</span>
            <h3 className="font-display mt-2 text-2xl font-semibold tracking-tight md:mt-0">{s.title}</h3>
            <p className="mt-2 text-silver">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

const Arrow = () => (
  <span aria-hidden className="text-center text-2xl text-mint">
    <span className="lg:hidden">↓</span>
    <span className="hidden lg:inline">→</span>
  </span>
);

/** H3 · Clear reporting: activities → three tags → one report. */
export function Reporting() {
  const c = copy.reporting;
  return (
    <Section tone="forest" labelledBy="reporting">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="reporting" />
      <div className="mt-14 grid items-center gap-6 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
        <ul className="grid grid-cols-2 gap-2">
          {c.activities.map((a) => (
            <li key={a} className="rounded-full border border-mint/30 px-4 py-2.5 text-center text-sm">
              {a}
            </li>
          ))}
        </ul>
        <Arrow />
        <ul className="grid gap-3">
          {c.tags.map((tag) => (
            <li key={tag.title} className="rounded-[var(--brand-radius-card)] bg-paper/8 p-4">
              <p className="font-display text-xl font-semibold">{tag.title}</p>
              <p className="text-mint">{tag.body}</p>
            </li>
          ))}
        </ul>
        <Arrow />
        <div className="rounded-[var(--brand-radius-card)] bg-coral p-6 text-ink">
          <p className="font-display text-2xl font-semibold tracking-tight">{c.report.title}</p>
          <p className="mt-2">{c.report.body}</p>
        </div>
      </div>
      <p className="mono-label mt-10 max-w-2xl leading-relaxed text-mint/80">{c.footnote}</p>
    </Section>
  );
}

/** H4 · Why us: five points. */
export function WhyUs() {
  const c = copy.why;
  return (
    <Section tone="light" labelledBy="why">
      <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
        <SectionHeader eyebrow={c.eyebrow} title={c.title} id="why" className="self-start lg:sticky lg:top-28" />
        <ol className="divide-y divide-ink/10 border-y border-ink/10">
          {c.items.map((it, i) => (
            <li key={it.title} className="grid grid-cols-[3rem_1fr] gap-4 py-6">
              <span className="mono-label pt-1.5 text-coral">({String(i + 1).padStart(2, "0")})</span>
              <div>
                <h3 className="font-display text-2xl font-semibold tracking-tight">{it.title}</h3>
                <p className="mt-2 text-ink/65">{it.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </Section>
  );
}

/** H5 · Ways to work with us. */
export function Engagement() {
  const c = copy.engagement;
  return (
    <Section tone="paper2" labelledBy="engagement">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="engagement" />
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {c.models.map((m, i) => (
          <li
            key={m.name}
            className={`flex flex-col rounded-[var(--brand-radius-card)] p-7 md:p-8 ${i === 2 ? "bg-ink text-paper" : "border border-ink/10 bg-paper"}`}
          >
            <span aria-hidden className={`radar block w-20 ${i === 2 ? "text-paper" : "text-ink"}`} />
            <p className="mono-label mt-8 opacity-60">{m.kind}</p>
            <h3 className="font-display mt-2 text-3xl font-semibold tracking-tight">{m.name}</h3>
            <p className="mt-3 flex-1 opacity-75">{m.body}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 flex flex-wrap items-center gap-4 text-lg">
        {c.footnote}
        <PillLink href={copy.footerCta.primary.href}>{copy.footerCta.primary.label}</PillLink>
      </p>
    </Section>
  );
}

/** Four promises (About page). */
export function Promises({ tone = "light" }: { tone?: "light" | "dark" }) {
  const c = copy.promises;
  return (
    <Section tone={tone} labelledBy="promises">
      <SectionHeader eyebrow={c.eyebrow} title={c.title} id="promises" />
      <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {c.items.map((p, i) => (
          <li key={p.title} className="rounded-[var(--brand-radius-card)] border border-current/10 p-6">
            <span className="mono-label text-coral">({String(i + 1).padStart(2, "0")})</span>
            <h3 className="font-display mt-6 text-2xl font-semibold tracking-tight">{p.title}</h3>
            <p className="mt-2 opacity-70">{p.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
