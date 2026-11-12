import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/brand";
import { getChannels } from "@/lib/content/channels";

export const metadata: Metadata = {
  title: copy.channelsIndex.title,
  description: copy.channelsIndex.body,
  alternates: { canonical: "/channels" },
};

/** M2 version: plain numbered list. M4 adds filters and the cursor-follow image preview. */
export default function ChannelsPage() {
  const channels = getChannels();
  const pad = Math.max(2, String(channels.length).length);
  return (
    <div className="bg-paper text-ink">
      <section className="mx-auto max-w-[1600px] px-4 pb-10 pt-36 md:px-8">
        <p className="eyebrow">{copy.channelsIndex.eyebrow}</p>
        <h1 className="display-xl mt-5 max-w-[14ch]">{copy.channelsIndex.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-ink/70">{copy.channelsIndex.body}</p>
      </section>
      <ol className="mx-auto max-w-[1600px] px-4 pb-24 md:px-8">
        {channels.map((c) => (
          <li key={c.slug} className="border-t border-ink/10 last:border-b">
            <Link
              href={`/channels/${c.slug}`}
              className="group grid grid-cols-[3.5rem_1fr] items-baseline gap-x-4 gap-y-1 py-5 md:grid-cols-[4rem_1.4fr_8rem_1fr] md:py-6"
            >
              <span className="mono-label text-ink/50">({String(c.order).padStart(pad, "0")})</span>
              <span className="font-display text-2xl tracking-tight transition-colors group-hover:text-coral md:text-4xl">
                {c.name}
              </span>
              <span className="mono-label col-start-2 text-coral md:col-start-auto">{c.category}</span>
              <span className="col-start-2 text-ink/60 md:col-start-auto">{c.bestFor}</span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}
