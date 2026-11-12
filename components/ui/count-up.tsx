"use client";

import { animate, useInView } from "motion/react";
import { useEffect, useRef } from "react";

/** Counts up when scrolled into view. Renders the final value on the server (no layout shift, SEO-safe). */
export function CountUp({ to, plain = false, duration = 1.4 }: { to: number; plain?: boolean; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10% 0px" });
  const fmt = (n: number) => (plain ? String(Math.round(n)) : Math.round(n).toLocaleString("en-IN"));

  useEffect(() => {
    if (!inView || !ref.current) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const from = plain ? Math.max(0, to - 26) : 0;
    const controls = animate(from, to, {
      duration,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => {
        if (ref.current) ref.current.textContent = fmt(v);
      },
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView, to]);

  return <span ref={ref}>{fmt(to)}</span>;
}
