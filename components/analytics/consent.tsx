"use client";

import Link from "next/link";
import Script from "next/script";
import { useEffect, useState } from "react";
import { copy } from "@/brand/copy";

const KEY = "consent.v1";
type Choice = "all" | "essential";

/**
 * Consent banner (brief §10). Non-essential is declined by default: GA4 and Meta Pixel load
 * only after "Accept all", and only when their IDs are set. The choice is stored locally and
 * can be changed from the footer link ("Cookie settings" dispatches `consent:open`).
 */
export function Consent({ ga4Id, pixelId }: { ga4Id?: string; pixelId?: string }) {
  const [choice, setChoice] = useState<Choice | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem(KEY);
    } catch {
      /* storage blocked: ask every visit */
    }
    if (saved === "all" || saved === "essential") setChoice(saved);
    else setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("consent:open", reopen);
    return () => window.removeEventListener("consent:open", reopen);
  }, []);

  const decide = (c: Choice) => {
    setChoice(c);
    setOpen(false);
    try {
      localStorage.setItem(KEY, c);
    } catch {
      /* ignore */
    }
  };

  const analytics = choice === "all";
  return (
    <>
      {analytics && ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${ga4Id}',{anonymize_ip:true});`}
          </Script>
        </>
      ) : null}
      {analytics && pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');`}
        </Script>
      ) : null}

      {open ? (
        <div role="dialog" aria-modal="false" aria-labelledby="consent-title" className="fixed inset-x-3 bottom-3 z-[60] mx-auto max-w-xl rounded-[var(--brand-radius-card)] border border-paper/15 bg-ink p-5 text-paper shadow-2xl md:bottom-6">
          <p id="consent-title" className="mono-label text-coral">
            {copy.consent.title}
          </p>
          <p className="mt-2 text-sm text-silver">
            {copy.consent.body}{" "}
            <Link href="/privacy" className="underline underline-offset-2">
              {copy.consent.policy}
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => decide("essential")} className="mono-label rounded-full border border-paper/25 px-4 py-2.5 hover:border-coral">
              {copy.consent.decline}
            </button>
            <button type="button" onClick={() => decide("all")} className="mono-label rounded-full bg-coral px-4 py-2.5 text-ink hover:bg-paper">
              {copy.consent.accept}
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}

/** Footer link that reopens the banner. */
export function ConsentLink({ className = "" }: { className?: string }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event("consent:open"))} className={className}>
      {copy.consent.manage}
    </button>
  );
}
