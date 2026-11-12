import type { Metadata } from "next";
import Image from "next/image";
import { brand, copy } from "@/brand";
import { PillLink } from "@/components/ui/pill-link";
import { Section } from "@/components/ui/section";
import manifest from "@/data/generated/brand-images.json";
import { brandImage } from "@/lib/brand-images";

const t = copy.workPage;

export const metadata: Metadata = {
  title: `Work | ${brand.name}`,
  description: t.body,
  alternates: { canonical: "/work" },
};

const titleFromKey = (k: string) => k.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Empty-state work page: the deck's concept visuals, clearly labelled as concept. */
export default function WorkPage() {
  const keys = Object.keys(manifest).filter((k) => !k.startsWith("placeholder-"));
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-16 pt-36 md:px-8 md:pt-44">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-xl mt-5">{t.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{t.body}</p>
        </div>
      </section>
      <Section tone="dark" innerClassName="!pt-4">
        <ul className="columns-1 gap-4 sm:columns-2 lg:columns-3">
          {keys.map((k, i) => {
            const img = brandImage(k);
            return (
              <li key={k} className="mb-4 break-inside-avoid">
                <figure>
                  <div className={`relative overflow-hidden rounded-[var(--brand-radius-card)] ${i % 3 === 1 ? "aspect-[4/5]" : "aspect-[3/2]"}`}>
                    <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} className="object-cover" />
                    <span className="mono-label absolute left-3 top-3 rounded-full bg-coral px-3 py-1.5 text-ink">{t.conceptBadge}</span>
                  </div>
                  <figcaption className="mono-label mt-3 text-paper/60">{titleFromKey(k)}</figcaption>
                </figure>
              </li>
            );
          })}
        </ul>
      </Section>
      <Section tone="light">
        <h2 className="font-display text-4xl font-semibold tracking-tight md:text-6xl">{t.emptyTitle}</h2>
        <p className="mt-4 max-w-xl text-lg text-ink/65">{t.emptyBody}</p>
        <PillLink href={copy.footerCta.primary.href} className="mt-8">
          {copy.footerCta.primary.label}
        </PillLink>
      </Section>
    </>
  );
}
