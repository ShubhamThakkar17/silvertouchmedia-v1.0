import Link from "next/link";
import QRCode from "qrcode";
import { brand, copy, theme } from "@/brand";
import { ConsentLink } from "@/components/analytics/consent";
import { Logo } from "@/components/brand/logo";
import { whatsappUrl } from "@/lib/whatsapp";

export async function SiteFooter() {
  const wa = whatsappUrl();
  const qrSvg = await QRCode.toString(wa, {
    type: "svg",
    margin: 0,
    color: { dark: theme.colors.ink, light: "#0000" },
    errorCorrectionLevel: "M",
  });

  return (
    <footer className="mesh-dark grain relative overflow-hidden text-paper">
      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-10 pt-24 md:px-8 md:pt-32">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          <div>
            <p className="eyebrow">{brand.category}</p>
            <h2 className="display-xl mt-5 max-w-[14ch]">{copy.footerCta.title}</h2>
            <p className="mt-6 max-w-xl text-lg text-silver">{copy.footerCta.body}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href={copy.footerCta.primary.href}
                className="mono-label rounded-full bg-coral px-6 py-4 text-ink transition-transform hover:-translate-y-0.5"
              >
                {copy.footerCta.primary.label}
              </Link>
              <Link
                href={copy.footerCta.secondary.href}
                className="mono-label rounded-full border border-silver/30 px-6 py-4 transition-colors hover:border-coral hover:text-coral"
              >
                [&nbsp;{copy.footerCta.secondary.label}&nbsp;]
              </Link>
            </div>
          </div>

          <div className="rounded-[var(--brand-radius-card)] border border-silver/15 bg-ink-2/70 p-6 backdrop-blur md:p-8">
            <dl className="grid gap-5">
              <div>
                <dt className="mono-label text-silver/70">Studio</dt>
                <dd className="mt-1 text-lg">{brand.address.display}</dd>
              </div>
              <div>
                <dt className="mono-label text-silver/70">Call</dt>
                <dd className="mt-1 text-lg">
                  <a href={`tel:${brand.contact.phoneE164}`} className="hover:text-coral">
                    {brand.contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono-label text-silver/70">Email</dt>
                <dd className="mt-1 break-all text-lg">
                  <a href={`mailto:${brand.contact.email}`} className="hover:text-coral">
                    {brand.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={wa}
              target="_blank"
              rel="noreferrer"
              className="mt-6 flex items-center gap-4 rounded-2xl bg-paper p-3 text-ink transition-transform hover:-translate-y-0.5"
            >
              <span
                className="block size-24 shrink-0 [&_svg]:size-full"
                aria-hidden
                dangerouslySetInnerHTML={{ __html: qrSvg }}
              />
              <span className="text-sm leading-snug">
                <span className="mono-label block text-coral">WhatsApp</span>
                {copy.footerCta.whatsappLabel}
              </span>
            </a>
          </div>
        </div>

        <div className="mt-20 grid gap-10 border-t border-silver/15 pt-10 sm:grid-cols-2 lg:grid-cols-4">
          {copy.footer.columns.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <p className="mono-label text-silver/60">{col.title}</p>
              <ul className="mt-4 grid gap-2">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="hover:text-coral">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          ))}
          <div className="lg:col-span-2 lg:text-right">
            <p className="mono-label text-silver/60">{brand.legalLine}</p>
            <p className="mt-4 text-sm text-silver/70">{copy.footer.imageCredits}</p>
          </div>
        </div>

        <div className="mt-16 text-[clamp(2rem,11.5vw,12rem)] leading-none text-paper/95" aria-hidden>
          <Logo className="w-full" />
        </div>
        <p className="mono-label mt-8 flex flex-wrap justify-between gap-3 text-silver/60">
          <span>
            © {new Date().getFullYear()} {brand.name}. {copy.footer.rights}
          </span>
          <ConsentLink className="mono-label underline-offset-2 hover:text-coral hover:underline" />
          <span>{brand.legalLine}</span>
        </p>
      </div>
    </footer>
  );
}
