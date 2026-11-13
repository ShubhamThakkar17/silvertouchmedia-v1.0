import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, copy } from "@/brand";
import { MdxBody } from "@/components/content/mdx-body";
import { PillLink } from "@/components/ui/pill-link";
import { getChannels } from "@/lib/content/channels";
import { getInsight, getInsights } from "@/lib/content/site";

const t = copy.insightsPage;

export function generateStaticParams() {
  return getInsights().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const p = getInsight((await params).slug);
  if (!p) return {};
  return {
    title: p.title,
    description: p.summary,
    alternates: { canonical: `/insights/${p.slug}` },
    openGraph: { type: "article", publishedTime: p.date, title: p.title, description: p.summary },
  };
}

export default async function InsightPage({ params }: { params: Promise<{ slug: string }> }) {
  const p = getInsight((await params).slug);
  if (!p) notFound();
  const channels = getChannels().filter((c) => p.channels.includes(c.slug));
  const ld = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: p.title,
    description: p.summary,
    datePublished: p.date,
    author: { "@type": "Organization", name: brand.name },
    publisher: { "@type": "Organization", name: brand.name },
    mainEntityOfPage: `${brand.seo.siteUrl}/insights/${p.slug}`,
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} />
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1100px] px-4 pb-16 pt-36 md:px-8 md:pt-44">
          <nav aria-label="Breadcrumb" className="mono-label text-paper/60">
            <Link href="/insights" className="hover:text-coral">
              {t.eyebrow}
            </Link>{" "}
            / {new Date(`${p.date}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {p.readMinutes} {t.minRead}
          </nav>
          <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.02] tracking-tight md:text-7xl">{p.title}</h1>
          <p className="mt-6 max-w-2xl text-xl text-silver">{p.summary}</p>
        </div>
      </section>
      <article className="bg-paper text-ink">
        <div className="mx-auto max-w-[1100px] px-4 py-16 md:px-8 md:py-24">
          <MdxBody source={p.body} />
          {p.sources.length ? (
            <div className="mt-14 max-w-3xl border-t border-ink/10 pt-6">
              <h2 className="mono-label text-ink/65">{copy.sources.label}</h2>
              <ul className="mt-3 space-y-2">
                {p.sources.map((s) => (
                  <li key={s.url}>
                    <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-coral underline-offset-4">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
          {channels.length ? (
            <ul className="mt-10 flex flex-wrap gap-2">
              {channels.map((c) => (
                <li key={c.slug}>
                  <Link href={`/channels/${c.slug}`} className="inline-flex rounded-full border border-ink/15 px-4 py-2 hover:border-coral hover:text-coral">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : null}
          <div className="mt-12 flex flex-wrap gap-3">
            <PillLink href="/planner">{copy.planner.eyebrow} →</PillLink>
            <PillLink href="/insights" variant="outline">
              ← {t.back}
            </PillLink>
          </div>
        </div>
      </article>
    </>
  );
}
