import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { brand, copy } from "@/brand";
import { brandImage } from "@/lib/brand-images";
import { MdxBody } from "@/components/content/mdx-body";
import { getChannel, getChannels } from "@/lib/content/channels";

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

/** Hero is the shared-element target for the ribbon. M3 renders the guide body; the full template lands in M4. */
export default async function ChannelPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const c = getChannel(slug);
  if (!c) notFound();
  const img = brandImage(c.heroImage);
  const pad = Math.max(2, String(getChannels().length).length);

  return (
    <>
      <section className="relative h-[78svh] min-h-[520px] overflow-hidden bg-ink text-paper">
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
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
        <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-12 md:px-8">
          <p className="mono-label text-paper/80">
            ({String(c.order).padStart(pad, "0")}) {c.label} · PAN-India
          </p>
          <h1 className="display-xl mt-4 max-w-[16ch]">{c.name}</h1>
          <p className="mt-5 max-w-xl text-xl text-silver">{c.tagline}</p>
          {c.imageIsConcept ? (
            <p className="mono-label mt-6 text-paper/50">{copy.disclaimers.concept}</p>
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
      <section className="bg-paper text-ink">
        <div className="mx-auto max-w-[1600px] px-4 py-20 md:px-8">
          <p className="eyebrow">{c.ribbonStat}</p>
          <p className="mt-4 max-w-2xl text-2xl">{c.bestFor}.</p>
          <MdxBody source={c.body} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link
              href={`/planner?mode=budget&channels=${c.slug}`}
              className="mono-label rounded-full bg-coral px-6 py-4 text-ink"
            >
              {copy.channelPage.planCta} {c.shortName}
            </Link>
            <Link href="/" className="mono-label rounded-full border border-ink/20 px-6 py-4">
              ← {copy.channelPage.backToChannels}
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
