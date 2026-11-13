import type { Metadata } from "next";
import { brand, copy } from "@/brand";
import { INDUSTRIES } from "@/data/industries";
import { ContactForm } from "@/components/forms/contact-form";
import { PillLink } from "@/components/ui/pill-link";
import { whatsappUrl } from "@/lib/whatsapp";

const t = copy.contactPage;

export const metadata: Metadata = {
  title: `Contact`,
  description: t.body,
  alternates: { canonical: "/contact" },
};

/** Location card: radar motif over a stylised grid (no map API or third-party embed). */
function LocationCard() {
  const maps = `https://www.google.com/maps/search/?api=1&query=${brand.address.geo.lat},${brand.address.geo.lng}`;
  return (
    <a
      href={maps}
      target="_blank"
      rel="noreferrer"
      className="group relative block aspect-[16/10] overflow-hidden rounded-[var(--brand-radius-card)] bg-ink text-paper"
      aria-label={`${brand.address.display}. ${t.mapCta}`}
    >
      <svg aria-hidden viewBox="0 0 400 250" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
        <defs>
          <pattern id="grid" width="22" height="22" patternUnits="userSpaceOnUse">
            <path d="M22 0H0V22" fill="none" stroke="var(--brand-paper)" strokeOpacity=".07" />
          </pattern>
        </defs>
        <rect width="400" height="250" fill="url(#grid)" />
        <path d="M-10 170 C 80 150, 140 210, 210 160 S 330 90, 420 120" fill="none" stroke="var(--brand-indigo)" strokeWidth="14" strokeOpacity=".7" />
        <path d="M60 -10 L 150 260 M 0 70 L 400 40 M 260 -10 L 300 260" stroke="var(--brand-silver)" strokeOpacity=".18" strokeWidth="3" />
        {[18, 36, 58, 84].map((r) => (
          <circle key={r} cx="205" cy="118" r={r} fill="none" stroke="var(--brand-coral)" strokeOpacity={0.55 - r / 200} />
        ))}
        <circle cx="205" cy="118" r="6" fill="var(--brand-coral)" />
      </svg>
      <span className="absolute bottom-0 left-0 right-0 flex items-end justify-between bg-gradient-to-t from-ink to-transparent p-5 pt-16">
        <span>
          <span className="mono-label block text-paper/60">{t.hq}</span>
          <span className="font-display text-2xl font-semibold">{brand.address.display}</span>
        </span>
        <span className="mono-label text-coral group-hover:underline">{t.mapCta} ↗</span>
      </span>
    </a>
  );
}

export default function ContactPage() {
  const wa = whatsappUrl(brand.contact.whatsappDefaultText);
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-20 pt-36 md:px-8 md:pt-44">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1 className="display-xl mt-5 max-w-[15ch]">{t.title}</h1>
          <p className="mt-6 max-w-xl text-lg text-silver">{t.body}</p>
        </div>
      </section>
      <section className="bg-paper text-ink">
        <div className="mx-auto grid max-w-[1600px] gap-14 px-4 py-20 md:px-8 md:py-28 lg:grid-cols-[1.4fr_1fr]">
          <ContactForm
            copy={t.form}
            industries={INDUSTRIES.map((i) => ({ id: i.id, label: i.label }))}
            budgets={t.budgetBands}
            whatsappHref={wa}
            whatsappLabel={t.whatsappCta}
            turnstileSiteKey={process.env.TURNSTILE_SITE_KEY || undefined}
          />
          <aside className="space-y-6">
            <div className="rounded-[var(--brand-radius-card)] bg-forest p-7 text-paper">
              <span aria-hidden className="radar block w-14 text-mint" />
              <h2 className="font-display mt-6 text-2xl font-semibold tracking-tight">{t.discoveryTitle}</h2>
              <p className="mt-2 text-mint">{t.discoveryBody}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                <PillLink href={wa} data-event="whatsapp_click">
                  {t.whatsappCta}
                </PillLink>
                <PillLink href={`tel:${brand.contact.phoneE164}`} variant="outline-dark">
                  {t.callCta}
                </PillLink>
              </div>
            </div>
            <dl className="grid gap-4 rounded-[var(--brand-radius-card)] border border-ink/10 p-7">
              <div>
                <dt className="mono-label text-ink/65">{t.callCta}</dt>
                <dd className="mt-1 text-xl">
                  <a href={`tel:${brand.contact.phoneE164}`} className="hover:text-coral">
                    {brand.contact.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="mono-label text-ink/65">{t.emailCta}</dt>
                <dd className="mt-1 break-all text-xl">
                  <a href={`mailto:${brand.contact.email}`} className="hover:text-coral">
                    {brand.contact.email}
                  </a>
                </dd>
              </div>
            </dl>
            <LocationCard />
          </aside>
        </div>
      </section>
    </>
  );
}
