import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { copy } from "@/brand";
import { MdxBody } from "@/components/content/mdx-body";
import { PillLink } from "@/components/ui/pill-link";
import { Section } from "@/components/ui/section";
import { brandImage } from "@/lib/brand-images";
import { getChannels } from "@/lib/content/channels";
import { getService, getServices } from "@/lib/content/site";

const t = copy.servicesPage;

export function generateStaticParams() {
  return getServices().map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const s = getService((await params).slug);
  if (!s) return {};
  return { title: `${s.name}`, description: `${s.headline} ${s.outcome}`, alternates: { canonical: `/services/${s.slug}` } };
}

/** Discipline detail (brief: optional in v1.1, scaffolded now from the deck content). */
export default async function ServicePage({ params }: { params: Promise<{ slug: string }> }) {
  const s = getService((await params).slug);
  if (!s) notFound();
  const all = getServices();
  const idx = all.findIndex((x) => x.slug === s.slug);
  const next = all[(idx + 1) % all.length];
  const channels = getChannels().filter((c) => s.channels.includes(c.slug));
  const img = brandImage(s.image);

  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto grid max-w-[1600px] gap-12 px-4 pb-20 pt-36 md:px-8 md:pt-44 lg:grid-cols-[1.3fr_1fr] lg:items-end">
          <div>
            <nav aria-label="Breadcrumb" className="mono-label text-paper/60">
              <Link href="/services" className="hover:text-coral">
                {t.eyebrow}
              </Link>{" "}
              / {String(s.order).padStart(2, "0")}
            </nav>
            <h1 className="display-xl mt-5">{s.name}</h1>
            <p className="font-display mt-6 text-2xl text-silver md:text-3xl">{s.headline}</p>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--brand-radius-card)]">
            <Image src={img.src} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} className="object-cover" />
            <span className="mono-label absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1.5 text-paper/70">{copy.disclaimers.concept}</span>
          </div>
        </div>
      </section>

      <Section tone="light">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_1fr]">
          <MdxBody source={s.body} />
          <div>
            <h2 className="mono-label text-ink/65">{t.whatWeDo}</h2>
            <ol className="mt-4 divide-y divide-ink/10 border-y border-ink/10">
              {s.bullets.map((b, i) => (
                <li key={b} className="grid grid-cols-[3rem_1fr] py-4">
                  <span className="mono-label pt-1 text-coral">({String(i + 1).padStart(2, "0")})</span>
                  <span className="text-lg">{b}</span>
                </li>
              ))}
            </ol>
            <div className="mt-8 rounded-[var(--brand-radius-card)] bg-ink p-6 text-paper">
              <p className="mono-label text-paper/55">{copy.model.outcomeLabel}</p>
              <p className="font-display mt-2 text-2xl tracking-tight">{s.outcome}</p>
            </div>
          </div>
        </div>
      </Section>

      {channels.length ? (
        <Section tone="paper2">
          <h2 className="font-display text-3xl font-semibold tracking-tight md:text-5xl">{t.channelsTitle}</h2>
          <ul className="mt-8 flex flex-wrap gap-2">
            {channels.map((c) => (
              <li key={c.slug}>
                <Link href={`/channels/${c.slug}`} className="inline-flex rounded-full border border-ink/15 bg-paper px-4 py-2.5 hover:border-coral hover:text-coral">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </Section>
      ) : null}

      <Section tone="dark">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <Link href={`/services/${next.slug}`} className="group">
            <span className="mono-label text-paper/55">{t.next} · {String(next.order).padStart(2, "0")}</span>
            <span className="font-display mt-2 block text-3xl font-semibold tracking-tight group-hover:text-coral md:text-5xl">{next.name} →</span>
          </Link>
          <PillLink href={copy.footerCta.primary.href}>{copy.footerCta.primary.label}</PillLink>
        </div>
      </Section>
    </>
  );
}
