"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { brand, copy } from "@/brand";
import { Logo } from "@/components/brand/logo";

const SUPERSCRIPT = ["⁰", "¹", "²", "³", "⁴", "⁵", "⁶", "⁷", "⁸", "⁹"];
const sup = (n: number) => String(n).split("").map((d) => SUPERSCRIPT[Number(d)]).join("");

export function SiteHeader({ channelCount }: { channelCount: number }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const socials = brand.socials.filter((s) => s.url);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 text-paper transition-colors duration-300 ${
        scrolled || open ? "bg-ink/85 backdrop-blur-md" : "bg-transparent"
      }`}
    >
      <a href="#main" className="sr-only-focusable mono-label absolute left-4 top-3 z-10 bg-coral px-3 py-2 text-ink">
        {copy.nav.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-6 px-4 md:px-8">
        <Link href="/" className="text-[15px] text-paper" aria-label={brand.name}>
          <Logo />
        </Link>

        <nav aria-label="Social" className="mono-label hidden items-center gap-1 text-silver/70 xl:flex">
          {socials.map((s, i) => (
            <span key={s.id} className="flex items-center gap-1">
              <a href={s.url} target="_blank" rel="noreferrer" className="transition-colors hover:text-paper">
                {s.label}
              </a>
              {i < socials.length - 1 ? <span aria-hidden>/</span> : null}
            </span>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          <nav aria-label="Primary" className="mono-label hidden items-center gap-6 lg:flex">
            {copy.nav.links.map((l) => {
              const active = pathname === l.href || pathname.startsWith(`${l.href}/`);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  aria-current={active ? "page" : undefined}
                  className={`transition-colors hover:text-coral ${active ? "text-coral" : ""}`}
                >
                  {l.label}
                  {"countKey" in l && l.countKey === "channels" ? (
                    <span className="ml-0.5 text-coral">{sup(channelCount)}</span>
                  ) : null}
                </Link>
              );
            })}
          </nav>
          <Link
            href={copy.nav.cta.href}
            className="mono-label hidden whitespace-nowrap text-paper transition-colors hover:text-coral sm:inline-flex"
          >
            [&nbsp;{copy.nav.cta.label}
            <span className="blink-cursor bg-coral" aria-hidden />
            &nbsp;]
          </Link>
          <button
            type="button"
            className="mono-label lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? copy.nav.menuClose : copy.nav.menuOpen}
          </button>
        </div>
      </div>

      <div id="mobile-menu" hidden={!open} className="border-t border-silver/15 px-4 pb-8 pt-4 lg:hidden">
        <nav aria-label="Mobile" className="flex flex-col gap-1">
          {copy.nav.links.map((l) => (
            <Link key={l.href} href={l.href} className="font-display py-2 text-3xl tracking-tight">
              {l.label}
            </Link>
          ))}
          <Link href={copy.nav.cta.href} className="mono-label mt-4 inline-flex text-coral">
            [&nbsp;{copy.nav.cta.label}&nbsp;]
          </Link>
          <div className="mono-label mt-6 flex gap-4 text-silver/70">
            {socials.map((s) => (
              <a key={s.id} href={s.url} target="_blank" rel="noreferrer">
                {s.label}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
