"use client";

import { motion } from "motion/react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { FallbackCarousel } from "./fallback-carousel";
import { spacing } from "./ribbon-config";
import { createRibbonStore, type HeroCard, type RibbonStore, type ScreenRect } from "./ribbon-store";
import { useHeroMode } from "./use-webgl-capable";

const RibbonCanvas = dynamic(() => import("./ribbon-canvas"), { ssr: false });

export type HeroCopy = {
  eyebrow: string;
  headline: string;
  subline: string;
  exploreChip: string;
  ribbonLabel: string;
  ribbonHelp: string;
  scrollHint: string;
};

type Props = {
  cards: HeroCard[];
  copy: HeroCopy;
  colors: { coral: string; label: string; silver: string; ink: string };
  monogramUrl: string;
};

export function HeroShell({ cards, copy, colors, monogramUrl }: Props) {
  const mode = useHeroMode();
  const router = useRouter();
  const section = useRef<HTMLElement>(null);
  const store = useRef<RibbonStore>(createRibbonStore());
  const tick = useRef<HTMLDivElement>(null);
  const chip = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  const [active, setActive] = useState(true);
  const [chipIndex, setChipIndex] = useState<number | null>(null);
  const [transition, setTransition] = useState<{ rect: ScreenRect; src: string } | null>(null);
  const drag = useRef<{ x: number; startX: number; t: number; moved: boolean } | null>(null);
  const total = cards.length * spacing;
  const webgl = mode === "webgl";

  // Wire store callbacks (DOM writes only, no re-render per frame).
  useEffect(() => {
    const s = store.current;
    s.onReady = () => setReady(true);
    s.onProgress = (p) => {
      if (tick.current) tick.current.style.transform = `translateX(${(p * 100).toFixed(2)}%)`;
    };
    let last: number | null = null;
    s.onChip = (i, x, y) => {
      if (i !== last) {
        last = i;
        setChipIndex(i);
        if (i !== null) router.prefetch(`/channels/${cards[i].slug}`);
      }
      if (chip.current && i !== null) {
        // Keep the chip on screen when the hovered card is cut off at an edge.
        const w = chip.current.offsetWidth || 160;
        const maxX = (section.current?.clientWidth ?? window.innerWidth) - w - 16;
        const cx = Math.min(Math.max(x + 14, 16), maxX);
        chip.current.style.transform = `translate(${cx}px, ${y - 46}px)`;
      }
    };
  }, [cards, router]);

  // Pause rendering when the hero is off-screen or the tab is hidden.
  useEffect(() => {
    if (!webgl || !section.current) return;
    let inView = true;
    const update = () => setActive(inView && document.visibilityState === "visible");
    const io = new IntersectionObserver(([e]) => {
      inView = e.isIntersecting;
      update();
    });
    io.observe(section.current);
    document.addEventListener("visibilitychange", update);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, [webgl]);

  const select = useCallback(
    (i: number) => {
      const rect = store.current.getCardRect?.(i);
      const href = `/channels/${cards[i].slug}`;
      if (!rect || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return router.push(href);
      setTransition({ rect, src: cards[i].heroImage });
      window.setTimeout(() => router.push(href), 520);
    },
    [cards, router],
  );

  // Pointer, wheel and drag input for the ribbon.
  useEffect(() => {
    const el = section.current;
    if (!webgl || !el) return;
    const s = store.current;

    const inBand = (clientY: number) => {
      const r = el.getBoundingClientRect();
      const y = (clientY - r.top) / r.height;
      return window.scrollY < 24 && y > 0.1 && y < 0.76;
    };
    const setPointer = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      s.pointer = { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -(((e.clientY - r.top) / r.height) * 2 - 1) };
      el.dataset.ribbonCapture = inBand(e.clientY) ? "true" : "false";
    };
    const onMove = (e: PointerEvent) => {
      setPointer(e);
      const d = drag.current;
      if (d) {
        const dx = e.clientX - d.x;
        d.x = e.clientX;
        if (Math.abs(e.clientX - d.startX) > 6) {
          d.moved = true;
          s.dragging = true;
        }
        const worldPerPx = 9 / el.clientWidth;
        s.offset -= dx * worldPerPx;
        const now = performance.now();
        const dtMs = Math.max(8, now - d.t);
        s.velocity = (-dx * worldPerPx * 1000) / dtMs;
        d.t = now;
      }
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest("a,button")) return;
      setPointer(e);
      drag.current = { x: e.clientX, startX: e.clientX, t: performance.now(), moved: false };
      s.targetOffset = null;
    };
    const onUp = () => {
      const d = drag.current;
      drag.current = null;
      s.dragging = false;
      if (d && !d.moved && s.hovered !== null && s.focusIndex === null) select(s.hovered);
    };
    const onLeave = () => {
      s.pointer = null;
      drag.current = null;
      s.dragging = false;
    };
    const onWheel = (e: WheelEvent) => {
      const horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY);
      if (!horizontal && !inBand(e.clientY)) return;
      e.preventDefault();
      const delta = (horizontal ? e.deltaX : e.deltaY) * (e.deltaMode === 1 ? 32 : 1);
      s.targetOffset = null;
      s.velocity = Math.max(-26, Math.min(26, s.velocity + delta * 0.0055 * 6));
    };

    el.addEventListener("pointermove", onMove);
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("pointermove", onMove);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("wheel", onWheel);
    };
  }, [webgl, select]);

  // Keyboard: focusing a card link centres it in the ribbon.
  const focusCard = (i: number | null) => {
    const s = store.current;
    s.focusIndex = i;
    if (i === null) return;
    const base = i * spacing;
    const k = Math.round((s.offset - base) / total);
    s.targetOffset = base + k * total;
  };
  const onListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const links = Array.from(e.currentTarget.querySelectorAll("a"));
    const cur = links.indexOf(document.activeElement as HTMLAnchorElement);
    const next = (cur + (e.key === "ArrowRight" ? 1 : -1) + links.length) % links.length;
    links[next]?.focus();
  };

  const pad = Math.max(2, String(cards.length).length);

  return (
    <section
      ref={section}
      aria-label={copy.ribbonLabel}
      className="mesh-dark grain relative h-[100svh] min-h-[640px] w-full select-none overflow-hidden text-paper"
      style={{ touchAction: webgl ? "pan-y" : undefined, cursor: webgl && chipIndex !== null ? "pointer" : undefined }}
    >
      {/* Poster / fallback */}
      <motion.div
        className="absolute inset-x-0 top-[22%] z-[1] sm:top-[14%] md:top-[16%]"
        initial={false}
        animate={{ opacity: webgl && ready ? 0 : 1 }}
        transition={{ duration: 0.8 }}
        style={{ pointerEvents: webgl ? "none" : undefined }}
      >
        <FallbackCarousel cards={cards} interactive={mode === "css"} label={copy.ribbonLabel} />
      </motion.div>

      {/* WebGL ribbon */}
      {webgl ? (
        <motion.div
          className="absolute inset-0 z-[2]"
          initial={{ opacity: 0 }}
          animate={{ opacity: ready ? 1 : 0 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <RibbonCanvas cards={cards} store={store} active={active} colors={colors} monogramUrl={monogramUrl} />
        </motion.div>
      ) : null}

      {/* Keyboard access to every card in WebGL mode */}
      {webgl ? (
        <ul aria-label={copy.ribbonLabel} className="sr-only-focusable absolute left-4 top-20 z-20" onKeyDown={onListKey}>
          {cards.map((c, i) => (
            <li key={c.slug}>
              <Link
                href={`/channels/${c.slug}`}
                onFocus={() => focusCard(i)}
                onBlur={() => focusCard(null)}
                onClick={(e) => {
                  e.preventDefault();
                  select(i);
                }}
                className="mono-label block bg-ink px-3 py-2 text-coral"
              >
                ({String(c.order).padStart(pad, "0")}) {c.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : null}

      {/* Hover chip */}
      <div
        ref={chip}
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-30 will-change-transform"
        style={{ opacity: webgl && chipIndex !== null ? 1 : 0, transition: "opacity .25s" }}
      >
        <span className="mono-label inline-flex items-center gap-2 rounded-full bg-coral px-3 py-1.5 text-ink shadow-lg">
          {copy.exploreChip}
        </span>
      </div>

      {/* Headline block */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 px-4 pb-12 md:px-8 md:pb-20">
        <div className="mx-auto flex max-w-[1600px] items-end justify-between gap-8">
          <div className="max-w-[62rem]">
            <p className="mono-label text-silver/80">{copy.eyebrow}</p>
            <h1 className="mt-4 text-[clamp(2rem,4.2vw,4.4rem)] font-semibold leading-[0.98] tracking-[-0.03em]">
              <span className="block text-paper">{copy.headline}</span>
              <span className="block text-paper/60">{copy.subline}</span>
            </h1>
          </div>
          <p className="mono-label hidden max-w-[16rem] text-right text-silver/60 lg:block">
            {webgl ? copy.ribbonHelp : null}
          </p>
        </div>
      </div>

      {/* Progress track */}
      {webgl ? (
        <div aria-hidden className="absolute bottom-6 left-1/2 z-10 hidden w-40 -translate-x-1/2 md:block">
          <div className="relative h-px w-full bg-silver/25">
            <div ref={tick} className="absolute inset-y-0 left-0 w-full will-change-transform">
              <span className="absolute -top-[5px] left-0 h-[11px] w-px bg-paper" />
            </div>
          </div>
          <p className="mono-label mt-3 text-center text-[10px] text-silver/50">{copy.scrollHint} ↓</p>
        </div>
      ) : null}

      {/* Shared-element transition into the channel page hero */}
      {transition ? (
        <motion.div
          className="fixed z-[60] overflow-hidden bg-ink"
          initial={{
            left: transition.rect.left,
            top: transition.rect.top,
            width: transition.rect.width,
            height: transition.rect.height,
            borderRadius: 10,
          }}
          animate={{ left: 0, top: 0, width: "100vw", height: "78svh", borderRadius: 0 }}
          transition={{ duration: 0.55, ease: [0.65, 0, 0.35, 1] }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={transition.src} alt="" className="size-full object-cover" />
        </motion.div>
      ) : null}
    </section>
  );
}
