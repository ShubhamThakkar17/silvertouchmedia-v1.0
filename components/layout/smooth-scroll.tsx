"use client";

import Lenis from "lenis";
import { useEffect } from "react";

/** Lenis smooth scroll. Disabled for reduced motion. Elements with
 *  [data-lenis-prevent] (the hero ribbon) handle their own wheel input. */
export function SmoothScroll() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const lenis = new Lenis({
      lerp: 0.12,
      smoothWheel: true,
      // The hero ribbon flags itself while the pointer is over the card band.
      prevent: (node) => Boolean(node.closest?.('[data-ribbon-capture="true"]')),
    });
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(raf);
      lenis.destroy();
    };
  }, []);
  return null;
}
