import { brand, copy } from "@/brand";
import { INDUSTRIES } from "@/data/industries";
import { Hero } from "@/components/hero/hero";
import { ChannelsList } from "@/components/sections/channels-list";
import { Engagement, IndustriesGrid, MarketSnapshot, Process, Reporting, Surfaces, WhyUs } from "@/components/sections/home-sections";
import { Intro } from "@/components/sections/intro";
import { ModelWheel } from "@/components/sections/model-wheel";
import { PlannerTeaser } from "@/components/sections/planner-teaser";
import { PillLink } from "@/components/ui/pill-link";
import { Section, SectionHeader } from "@/components/ui/section";
import { brandImage } from "@/lib/brand-images";
import { getChannels, toCore } from "@/lib/content/channels";
import { getIndustries, getServices } from "@/lib/content/site";
import { toPlannerChannel } from "@/lib/planner/types";

export default function HomePage() {
  const channels = getChannels();
  const services = getServices();

  return (
    <>
      <Hero />
      <Intro image={brandImage(brand.imagery.intro)} />

      {/* C · Channels index */}
      <Section tone="dark" labelledBy="channels-list">
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <SectionHeader eyebrow={copy.channelsList.eyebrow} title={copy.channelsList.title} id="channels-list" />
          <PillLink href="/channels" variant="outline-dark">
            {copy.channelsList.viewAll} →
          </PillLink>
        </div>
        <ChannelsList
          channels={channels.map(toCore)}
          labels={{ all: copy.channelsList.filterAll, filterLabel: copy.channelsList.filterLabel, count: copy.channelsList.count }}
        />
      </Section>

      {/* D · 360° model */}
      <Section tone="dark" className="border-t border-paper/10" labelledBy="model">
        <SectionHeader eyebrow={copy.model.eyebrow} title={copy.model.title} id="model" body={copy.model.footnote} />
        <div className="mt-14">
          <ModelWheel
            disciplines={services.map(({ slug, name, headline, bullets, outcome }) => ({ slug, name, headline, bullets, outcome }))}
            centre={copy.model.centre}
            outcomeLabel={copy.model.outcomeLabel}
            detailLabel={copy.servicesPage.detailCta}
          />
        </div>
      </Section>

      <Surfaces />
      <MarketSnapshot />

      {/* G · Planner teaser */}
      <section aria-labelledby="teaser" className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-32">
          <SectionHeader eyebrow={copy.plannerTeaser.eyebrow} title={copy.plannerTeaser.title} id="teaser" body={copy.plannerTeaser.body} />
          <div className="mt-14">
            <PlannerTeaser
              channels={channels.map(toPlannerChannel)}
              industries={INDUSTRIES.map((i) => ({ id: i.id, label: i.label }))}
              labels={copy.plannerTeaser}
            />
          </div>
        </div>
      </section>

      <IndustriesGrid industries={getIndustries()} />
      <Process />
      <Reporting />
      <WhyUs />
      <Engagement />
    </>
  );
}
