import type { Metadata } from "next";
import Link from "next/link";
import { copy } from "@/brand";
import { getInsights } from "@/lib/content/site";

const t = copy.insightsPage;

export const metadata: Metadata = { title: t.title, description: t.body, alternates: { canonical: "/insights" } };

const date = (d: string) => new Date(`${d}T00:00:00+05:30`).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

export default function InsightsPage() {
  const posts = getInsights();
  return (
    <section className="mesh-dark grain relative min-h-screen overflow-hidden text-paper">
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-24 pt-36 md:px-8 md:pt-44">
        <p className="eyebrow">{t.eyebrow}</p>
        <h1 className="display-xl mt-5 max-w-[14ch]">{t.title}</h1>
        <p className="mt-6 max-w-xl text-lg text-silver">{t.body}</p>
        <ul className="mt-16 border-t border-paper/15">
          {posts.map((p) => (
            <li key={p.slug} className="border-b border-paper/15">
              <Link href={`/insights/${p.slug}`} className="group grid gap-3 py-8 md:grid-cols-[12rem_1fr_auto] md:items-baseline md:gap-8">
                <span className="mono-label text-paper/55">
                  {date(p.date)} · {p.readMinutes} {t.minRead}
                </span>
                <span>
                  <span className="font-display block text-3xl font-semibold tracking-tight group-hover:text-coral md:text-4xl">{p.title}</span>
                  <span className="mt-2 block max-w-2xl text-silver">{p.summary}</span>
                </span>
                <span className="mono-label text-coral">{t.readMore} →</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
