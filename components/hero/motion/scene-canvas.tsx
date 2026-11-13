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

/**
 * One channel's motion graphic in a plain <canvas> (CSS fallback carousel and poster).
 * Animates at ~30fps only while on screen; draws a single still frame under
 * prefers-reduced-motion. Decorative: the card link carries the accessible name.
 */
export function SceneCanvas({ slug, seed = 0, className = "" }: { slug: string; seed?: number; className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const g = cv.getContext("2d");
    if (!g) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let visible = false;
    let last = 0;
    const start = performance.now() - seed * 370;

    const size = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
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
    };
    const tick = (now: number) => {
      if (!visible) return;
      if (now - last > 33) {
        draw(now);
        last = now;
      }
      raf = requestAnimationFrame(tick);
    };

    draw(performance.now());
    if (reduce) return;

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      cancelAnimationFrame(raf);
      if (visible) raf = requestAnimationFrame(tick);
    });
    io.observe(cv);
    const ro = new ResizeObserver(() => draw(performance.now()));
    ro.observe(cv);
    return () => {
      io.disconnect();
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [slug, seed]);

  return <canvas ref={ref} aria-hidden className={`block size-full ${className}`} />;
}
