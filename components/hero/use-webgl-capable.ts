"use client";

import { useEffect, useState } from "react";

export type HeroMode = "pending" | "webgl" | "css";

/**
 * Decides whether the device gets the WebGL ribbon or the CSS fallback.
 * Override with ?ribbon=webgl or ?ribbon=css for testing.
 */
export function useHeroMode(): HeroMode {
  const [mode, setMode] = useState<HeroMode>("pending");
  useEffect(() => {
    const force = new URLSearchParams(window.location.search).get("ribbon");
    if (force === "webgl" || force === "css") return setMode(force);

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const coarseSmall = window.matchMedia("(pointer: coarse)").matches && window.innerWidth < 1024;
    const narrow = window.innerWidth < 768;
    const cores = navigator.hardwareConcurrency ?? 8;
    const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const saveData = Boolean(conn?.saveData);
    let webgl2 = false;
    try {
      const c = document.createElement("canvas");
      webgl2 = Boolean(c.getContext("webgl2"));
    } catch {
      webgl2 = false;
    }
    const ok = !reduced && !coarseSmall && !narrow && cores > 4 && !saveData && webgl2;
    setMode(ok ? "webgl" : "css");
  }, []);
  return mode;
}
