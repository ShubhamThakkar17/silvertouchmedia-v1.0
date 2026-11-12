"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

type Item = {
  slug: string;
  name: string;
  headline: string;
  bullets: string[];
  image: { src: string; blurDataURL?: string };
};

/**
 * Gobo studio-page pattern: a big headline list of disciplines. Hovering or focusing
 * one dims the others, shows its mono sub-list and swaps the sticky image.
 */
export function ServicesList({ items, cta, concept }: { items: Item[]; cta: string; concept: string }) {
  const [active, setActive] = useState(0);
  const cur = items[active];
  return (
    <div className="grid gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <ol>
        {items.map((it, i) => (
          <li key={it.slug} className="border-b border-paper/10">
            <Link
              href={`/services/${it.slug}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              className={`group grid grid-cols-[3rem_1fr] gap-4 py-6 transition-opacity duration-300 md:py-8 ${active === i ? "" : "lg:opacity-30"}`}
            >
              <span className="mono-label pt-3 text-coral">({String(i + 1).padStart(2, "0")})</span>
              <span>
                <span className="font-display block text-3xl font-semibold leading-none tracking-tight md:text-6xl">{it.name}</span>
                <span className="mt-3 block text-silver">{it.headline}</span>
                <ul className="mono-label mt-5 flex flex-wrap gap-x-4 gap-y-2 text-paper/60 lg:hidden">
                  {it.bullets.slice(0, 4).map((b) => (
                    <li key={b}>{b}</li>
                  ))}
                </ul>
              </span>
            </Link>
          </li>
        ))}
      </ol>
      <div className="hidden lg:block">
        <div className="sticky top-28">
          <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--brand-radius-card)] bg-ink-2">
            {items.map((it, i) => (
              <Image
                key={it.slug}
                src={it.image.src}
                alt=""
                fill
                sizes="40vw"
                placeholder={it.image.blurDataURL ? "blur" : "empty"}
                blurDataURL={it.image.blurDataURL}
                className="object-cover transition-opacity duration-500"
                style={{ opacity: i === active ? 1 : 0 }}
              />
            ))}
            <span className="mono-label absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1.5 text-paper/70">{concept}</span>
          </div>
          <ul className="mono-label mt-6 grid grid-cols-2 gap-x-6 gap-y-3 text-paper/70" aria-live="polite">
            {cur.bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
          <Link href={`/services/${cur.slug}`} className="mono-label mt-6 inline-block text-coral hover:underline">
            {cta} →
          </Link>
        </div>
      </div>
    </div>
  );
}
