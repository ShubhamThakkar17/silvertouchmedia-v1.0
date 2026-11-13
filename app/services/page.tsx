import type { Metadata } from "next";
import { copy } from "@/brand";
import { ServicesList } from "@/components/sections/services-list";
import { Engagement } from "@/components/sections/home-sections";
import { brandImage } from "@/lib/brand-images";
import { getServices } from "@/lib/content/site";

const t = copy.servicesPage;

export const metadata: Metadata = {
  title: `Services: strategy, creative, digital, media, BTL and PR`,
  description: t.body,
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  const items = getServices().map((s) => ({
    slug: s.slug,
    name: s.name,
    headline: s.headline,
    bullets: s.bullets,
    image: brandImage(s.image),
  }));
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-24 pt-36 md:px-8 md:pt-44">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-xl mt-5 max-w-[14ch]">{t.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{t.body}</p>
          <div className="mt-16">
            <ServicesList items={items} cta={t.detailCta} concept={copy.disclaimers.concept} />
          </div>
        </div>
      </section>
      <Engagement />
    </>
  );
}
