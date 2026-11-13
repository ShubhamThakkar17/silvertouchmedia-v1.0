"use client";

import { useEffect, useRef } from "react";
import { theme } from "@/brand/theme";
import { drawScene } from "./scenes";

const palette = {
  coral: theme.colors.coral,
  ink: theme.colors.ink,
  ink2: theme.colors.ink2,
  paper: theme.colors.paper,
  silver: theme.colors.silver,
  mint: theme.colors.mint,
  indigo: theme.colors.indigo,
};

/* ---------- motion gate: animation starts on first interaction or after an idle delay ---------- */
let gateOpen = false;
const gateListeners = new Set<() => void>();
function openGate() {
  if (gateOpen) return;
  gateOpen = true;
  gateListeners.forEach((f) => f());
  gateListeners.clear();
}
let gateArmed = false;
function armGate() {
  if (gateArmed || typeof window === "undefined") return;
  gateArmed = true;
  const evs = ["pointerdown", "pointermove", "touchstart", "wheel", "scroll", "keydown"] as const;
  const once = () => {
    evs.forEach((e) => window.removeEventListener(e, once));
    openGate();
  };
  evs.forEach((e) => window.addEventListener(e, once, { passive: true }));
  const later = () => setTimeout(once, 7000);
  if (document.readyState === "complete") later();
  else window.addEventListener("load", later, { once: true });
}

/* ---------- shared ticker: redraws visible canvases round-robin, max 2 per frame, ~30fps each ---------- */
type Item = { draw: (now: number) => void; visible: boolean; last: number };
const items = new Set<Item>();
let raf = 0;
function tick(now: number) {
  let budget = 2;
  for (const it of items) {
    if (!budget) break;
    if (!it.visible || now - it.last < 33) continue;
    it.draw(now);
    it.last = now;
    budget--;
  }
  raf = items.size ? requestAnimationFrame(tick) : 0;
}
function startTicker() {
  if (!raf && items.size) raf = requestAnimationFrame(tick);
}

/**
 * One channel's motion graphic in a plain <canvas> (CSS fallback carousel and poster).
 * Draws its first still frame when it scrolls into view; animates (shared ticker) only
 * after the motion gate opens; stays still under prefers-reduced-motion.
 * Decorative: the card link carries the accessible name.
 */
export function SceneCanvas({ slug, seed = 0, className = "" }: { slug: string; seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    const g = cv?.getContext("2d");
    if (!cv || !g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now() - seed * 370;
    let drawnOnce = false;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const w = Math.round(cv.clientWidth * dpr);
      const h = Math.round(cv.clientHeight * dpr);
      if (w && h && (cv.width !== w || cv.height !== h)) {
        cv.width = w;
        cv.height = h;
      }
    };
    const draw = (now: number) => {
      size();
      drawScene(g, slug, (now - start) / 1000 + 1.2, palette, 0, 0, cv.width, cv.height);
      drawnOnce = true;
    };
    const item: Item = { draw, visible: false, last: 0 };

    const io = new IntersectionObserver(([e]) => {
      item.visible = e.isIntersecting;
      if (item.visible && !drawnOnce) draw(performance.now());
      if (item.visible && !reduce && gateOpen) startTicker();
    });
    io.observe(cv);

    if (!reduce) {
      items.add(item);
      armGate();
      if (gateOpen) startTicker();
      else gateListeners.add(startTicker);
    }
    return () => {
      io.disconnect();
      items.delete(item);
    };
  }, [slug, seed]);

  return <canvas ref={ref} aria-hidden className={`block size-full bg-ink-2 ${className}`} />;
}
