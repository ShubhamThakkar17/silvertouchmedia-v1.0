import Link from "next/link";
import { copy } from "@/brand";

type Key = keyof typeof copy.placeholder.pages;

/** Temporary page shell for routes scheduled in later milestones. */
export function PlaceholderPage({ page }: { page: Key }) {
  return (
    <section className="mesh-dark grain relative flex min-h-[80svh] items-end overflow-hidden text-paper">
      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-20 pt-40 md:px-8">
        <p className="eyebrow">{copy.placeholder.eyebrow}</p>
        <h1 className="display-xl mt-5 max-w-[16ch]">{copy.placeholder.pages[page]}</h1>
        <p className="mt-6 max-w-xl text-lg text-silver">{copy.placeholder.body}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href={copy.footerCta.primary.href} className="mono-label rounded-full bg-coral px-6 py-4 text-ink">
            {copy.footerCta.primary.label}
          </Link>
          <Link href="/channels" className="mono-label rounded-full border border-silver/30 px-6 py-4">
            {copy.channelsIndex.eyebrow}
          </Link>
        </div>
      </div>
    </section>
  );
}
