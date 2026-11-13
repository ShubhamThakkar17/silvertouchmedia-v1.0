import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, copy } from "@/brand";
import { MdxBody } from "@/components/content/mdx-body";
import { PillLink } from "@/components/ui/pill-link";
import { ScoreBar } from "@/components/ui/score-bar";
import { Section } from "@/components/ui/section";
import { brandImage } from "@/lib/brand-images";
import { getChannels } from "@/lib/content/channels";
import { getIndustries, getIndustry } from "@/lib/content/site";

const t = copy.industryPage;

export function generateStaticParams() {
  return getIndustries().map((i) => ({ slug: i.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const i = getIndustry((await params).slug);
  if (!i) return {};
  return {
    title: `${i.name} marketing agency in ${brand.address.locality} | PAN-India`,
    description: `${i.headline} ${i.short}`,
    alternates: { canonical: `/industries/${i.slug}` },
  };
}

export default async function IndustryPage({ params }: { params: Promise<{ slug: string }> }) {
  const ind = getIndustry((await params).slug);
  if (!ind) notFound();
  const img = brandImage(ind.image);
  const top = [...getChannels()].sort((a, b) => b.industryFit[ind.slug] - a.industryFit[ind.slug] || a.order - b.order).slice(0, 8);
  const others = getIndustries().filter((i) => i.slug !== ind.slug);

  return (
    <>
      <section className="relative overflow-hidden bg-ink text-paper">
        <Image src={img.src} alt="" fill priority sizes="100vw" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} className="object-cover opacity-45" />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/20" />
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-20 pt-40 md:px-8 md:pt-56">
          <nav aria-label="Breadcrumb" className="mono-label text-paper/60">
            {t.eyebrow} / {ind.name}
          </nav>
          <h1 className="display-xl mt-5 max-w-[14ch]">{ind.headline}</h1>
          <p className="mt-6 max-w-xl text-xl text-silver">{ind.short}</p>
          <p className="mono-label mt-8 text-paper/60">{copy.disclaimers.concept}</p>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="eyebrow">{ind.name}</p>
            <MdxBody source={ind.body} />
          </div>
          <div>
            <h2 className="mono-label text-ink/65">{t.challengesTitle}</h2>
            <ul className="mt-4 space-y-3">
              {ind.challenges.map((c) => (
                <li key={c} className="rounded-[var(--brand-radius-card)] bg-paper-2 p-5 text-lg">
                  {c}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="forest">
        <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{t.approachTitle}</h2>
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {ind.approach.map((a, i) => (
            <li key={a} className="rounded-[var(--brand-radius-card)] border border-mint/20 p-6">
              <span className="mono-label text-mint">{String(i + 1).padStart(2, "0")}</span>
              <p className="mt-3 text-lg">{a}</p>
            </li>
          ))}
        </ol>
      </Section>

      <Section tone="light">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{t.channelsTitle}</h2>
            <p className="mt-4 max-w-md text-ink/65">{t.channelsBody}</p>
            <PillLink href={`/planner?mode=budget&industry=${ind.slug}`} className="mt-8">
              {t.plannerCta.replace("{industry}", ind.name.toLowerCase())} →
            </PillLink>
          </div>
          <div>
            {top.map((c) => (
              <ScoreBar key={c.slug} label={c.name} value={c.industryFit[ind.slug]} href={`/channels/${c.slug}`} />
            ))}
          </div>
        </div>
      </Section>

      <Section tone="dark">
        <p className="eyebrow">{copy.industries.eyebrow}</p>
        <ul className="mt-6 flex flex-wrap gap-2">
          {others.map((o) => (
            <li key={o.slug}>
              <Link href={`/industries/${o.slug}`} className="inline-flex rounded-full border border-paper/20 px-5 py-3 hover:border-coral hover:text-coral">
                {o.name}
              </Link>
            </li>
          ))}
        </ul>
      </Section>
    </>
  );
}
