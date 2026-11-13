import type { Metadata } from "next";
import { copy } from "@/brand";
import { PlannerApp } from "@/components/planner/planner-app";
import { getChannels } from "@/lib/content/channels";
import { parseState } from "@/lib/planner/state";
import { toPlannerChannel } from "@/lib/planner/types";

const t = copy.planner;

export const metadata: Metadata = {
  title: `Media planner: budget to channels, channels to budget`,
  description: t.body,
  alternates: { canonical: "/planner" },
};

export default async function PlannerPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const channels = getChannels().map(toPlannerChannel);
  const initial = parseState(await searchParams, channels.map((c) => c.slug));
  return (
    <section className="mesh-dark grain relative min-h-screen overflow-hidden pb-32 text-paper lg:pb-24">
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pt-32 md:px-8 md:pt-40">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="font-display mt-4 max-w-[18ch] text-4xl font-semibold leading-none tracking-tight md:text-7xl">{t.title}</h1>
        <p className="mt-5 max-w-xl text-lg text-silver">{t.body}</p>
        <div className="mt-12">
          <PlannerApp channels={channels} initial={initial} turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined} />
        </div>
      </div>
    </section>
  );
}
