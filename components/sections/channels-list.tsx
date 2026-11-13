"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ChannelCore, ChannelCategory } from "@/lib/content/schema";

/**
 * Gobo work-list pattern: numbered rows, big names, category tag and "best for".
 * On hover (fine pointers only) a floating preview follows the cursor and swaps per row.
 */
export function ChannelsList({
  channels,
  filter,
  labels,
}: {
  channels: ChannelCore[];
  filter?: boolean;
  labels: { all: string; filterLabel: string; count: string };
}) {
  const pad = Math.max(2, String(channels.length).length);
  const categories = useMemo(() => Array.from(new Set(channels.map((c) => c.category))), [channels]);
  const [cat, setCat] = useState<ChannelCategory | "all">("all");
  const [active, setActive] = useState<string | null>(null);
  const [enabled, setEnabled] = useState(false);
  const preview = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: 0, y: 0, tx: 0, ty: 0 });

  const shown = cat === "all" ? channels : channels.filter((c) => c.category === cat);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => setEnabled(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      pos.current.tx = e.clientX;
      pos.current.ty = e.clientY;
    };
    const tick = () => {
      const p = pos.current;
      p.x += (p.tx - p.x) * 0.18;
      p.y += (p.ty - p.y) * 0.18;
      if (preview.current) preview.current.style.transform = `translate3d(${p.x + 24}px, ${p.y - 110}px, 0)`;
      raf = requestAnimationFrame(tick);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    raf = requestAnimationFrame(tick);
    return () => {
      window.removeEventListener("pointermove", onMove);
      cancelAnimationFrame(raf);
    };
  }, [enabled]);

  return (
    <div>
      {filter ? (
        <div role="group" aria-label={labels.filterLabel} className="mb-10 flex flex-wrap gap-2">
          {(["all", ...categories] as const).map((k) => (
            <button
              key={k}
              type="button"
              aria-pressed={cat === k}
              onClick={() => setCat(k)}
              className={`mono-label rounded-full px-4 py-2.5 transition-colors ${
                cat === k ? "bg-coral text-ink" : "border border-current/20 hover:border-coral hover:text-coral"
              }`}
            >
              {k === "all" ? labels.all : k}
              <span className="ml-1.5 opacity-60">{k === "all" ? channels.length : channels.filter((c) => c.category === k).length}</span>
            </button>
          ))}
        </div>
      ) : null}

      <ul className="border-t border-current/15" onPointerLeave={() => setActive(null)}>
        {shown.map((c) => (
          <li key={c.slug} className="border-b border-current/15">
            <Link
              href={`/channels/${c.slug}`}
              onPointerEnter={() => setActive(c.slug)}
              onFocus={() => setActive(c.slug)}
              onBlur={() => setActive(null)}
              className={`group grid grid-cols-[3.2rem_1fr] items-baseline gap-x-4 gap-y-2 py-5 transition-opacity md:grid-cols-[4rem_1.6fr_7rem_1.4fr] md:py-6 ${
                active && active !== c.slug ? "md:opacity-35" : ""
              }`}
            >
              <span className="mono-label text-coral">({String(c.order).padStart(pad, "0")})</span>
              <span className="font-display text-3xl font-medium tracking-tight transition-colors group-hover:text-coral md:text-5xl">
                {c.name}
              </span>
              <span className="mono-label col-start-2 opacity-60 md:col-start-auto">{c.category}</span>
              <span className="col-start-2 text-sm opacity-70 md:col-start-auto md:text-base">{c.bestFor}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mono-label mt-4 opacity-70" aria-live="polite">
        {shown.length} {labels.count}
      </p>

      {enabled ? (
        <div
          ref={preview}
          aria-hidden
          className="pointer-events-none fixed left-0 top-0 z-40 hidden w-[300px] md:block"
          style={{ opacity: active ? 1 : 0, transition: "opacity .25s" }}
        >
          <div className="relative aspect-[3/2] overflow-hidden rounded-[14px] shadow-2xl">
            {channels.map((c) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.slug}
                src={c.cardImage}
                alt=""
                loading="lazy"
                decoding="async"
                className="absolute inset-0 size-full object-cover transition-[opacity,transform] duration-300"
                style={{ opacity: active === c.slug ? 1 : 0, transform: active === c.slug ? "scale(1)" : "scale(1.06)" }}
              />
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
