import type { Metadata } from "next";
import { copy } from "@/brand";
import { ChannelsList } from "@/components/sections/channels-list";
import { getChannels, toCore } from "@/lib/content/channels";

export const metadata: Metadata = {
  title: `Media channels we plan and buy`,
  description: copy.channelsIndex.body,
  alternates: { canonical: "/channels" },
};

export default function ChannelsPage() {
  const channels = getChannels();
  return (
    <section className="mesh-dark grain relative min-h-screen overflow-hidden text-paper">
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-24 pt-36 md:px-8 md:pt-44">
        <p className="eyebrow">{copy.channelsIndex.eyebrow}</p>
        <h1 className="display-xl mt-5 max-w-[14ch]">{copy.channelsIndex.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-silver">{copy.channelsIndex.body}</p>
        <div className="mt-14">
          <ChannelsList
            channels={channels.map(toCore)}
            filter
            labels={{ all: copy.channelsList.filterAll, filterLabel: copy.channelsList.filterLabel, count: copy.channelsList.count }}
          />
        </div>
      </div>
    </section>
  );
}
