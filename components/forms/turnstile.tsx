"use client";

import { useEffect, useRef } from "react";

type TurnstileApi = {
  render: (el: HTMLElement, opts: Record<string, unknown>) => string;
  remove: (id: string) => void;
};
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
let loading: Promise<void> | null = null;
function load(): Promise<void> {
  if (window.turnstile) return Promise.resolve();
  loading ??= new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = SRC;
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile"));
    document.head.appendChild(s);
  });
  return loading;
}

/**
 * Cloudflare Turnstile widget. Renders nothing without a site key (local/dev), in which
 * case the server also skips verification.
 */
export function Turnstile({ siteKey, onToken, theme = "auto" }: { siteKey?: string; onToken: (t: string | undefined) => void; theme?: "light" | "dark" | "auto" }) {
  const ref = useRef<HTMLDivElement>(null);
  const cb = useRef(onToken);
  cb.current = onToken;

  useEffect(() => {
    if (!siteKey || !ref.current) return;
    let id: string | undefined;
    let cancelled = false;
    load()
      .then(() => {
        if (cancelled || !ref.current || !window.turnstile) return;
        id = window.turnstile.render(ref.current, {
          sitekey: siteKey,
          theme,
          callback: (t: string) => cb.current(t),
          "expired-callback": () => cb.current(undefined),
          "error-callback": () => cb.current(undefined),
        });
      })
      .catch(() => cb.current(undefined));
    return () => {
      cancelled = true;
      if (id && window.turnstile) window.turnstile.remove(id);
    };
  }, [siteKey, theme]);

  if (!siteKey) return null;
  return <div ref={ref} className="min-h-[65px]" />;
}
