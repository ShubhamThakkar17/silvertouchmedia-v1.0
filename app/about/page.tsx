import type { Metadata } from "next";
import Image from "next/image";
import { brand, copy } from "@/brand";
import { Promises, WhyUs } from "@/components/sections/home-sections";
import { WhereRings } from "@/components/sections/where-rings";
import { CountUp } from "@/components/ui/count-up";
import { Section } from "@/components/ui/section";
import { brandImage } from "@/lib/brand-images";

const t = copy.aboutPage;

export const metadata: Metadata = {
  title: `About the studio | ${brand.name}`,
  description: copy.intro.body[0],
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  const img = brandImage(brand.imagery.about);
  return (
    <>
      <section className="mesh-dark grain relative overflow-hidden text-paper">
        <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-24 pt-40 md:px-8 md:pt-56">
          <p className="eyebrow">{t.eyebrow}</p>
          <h1
            className="mt-6 max-w-[13ch] bg-gradient-to-br from-paper via-paper to-coral bg-clip-text font-display text-[clamp(3.2rem,10vw,11rem)] font-semibold leading-[0.9] tracking-[-0.04em] text-transparent"
          >
            {t.title}
          </h1>
          <p className="font-display mt-10 text-2xl text-silver md:text-3xl">{copy.hero.deckLines.disciplines}</p>
        </div>
      </section>

      <Section tone="light" labelledBy="story">
        <div className="grid gap-14 lg:grid-cols-[1fr_1fr] lg:items-center">
          <div>
            <h2 id="story" className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
              {t.storyTitle}
            </h2>
            <div className="mt-8 space-y-5 text-xl leading-relaxed text-ink/75">
              {t.story.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
            <dl className="mt-12 grid grid-cols-2 gap-8 border-t border-ink/10 pt-8">
              {copy.intro.stats.map((s) => (
                <div key={s.label}>
                  <dt className="sr-only">{s.label}</dt>
                  <dd>
                    <span className="font-display block text-5xl font-semibold tracking-tight text-coral">
                      <CountUp to={s.value} plain={"format" in s && s.format === "year"} />
                    </span>
                    <span className="mono-label mt-2 block text-ink/60">{s.label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[var(--brand-radius-card)]">
            <Image src={img.src} alt="" fill sizes="(min-width: 1024px) 45vw, 100vw" placeholder={img.blurDataURL ? "blur" : "empty"} blurDataURL={img.blurDataURL} className="object-cover" />
            <span className="mono-label absolute bottom-3 left-3 rounded-full bg-ink/70 px-3 py-1.5 text-paper/70">{copy.disclaimers.concept}</span>
          </div>
        </div>
      </Section>

      <Promises tone="dark" />

      <Section tone="forest" labelledBy="where">
        <div className="grid items-center gap-14 lg:grid-cols-2">
          <div>
            <p className="eyebrow !text-mint">{copy.where.eyebrow}</p>
            <h2 id="where" className="font-display mt-4 text-4xl font-semibold tracking-tight md:text-6xl">
              {copy.where.title}
            </h2>
            <p className="mt-6 max-w-lg text-lg text-mint">{copy.where.body}</p>
            <dl className="mt-10 grid grid-cols-2 gap-8">
              {copy.where.stats.map((s) => (
                <div key={s.label}>
                  <dd className="font-display text-5xl font-semibold">{s.value}</dd>
                  <dt className="mt-2 text-mint">{s.label}</dt>
                </div>
              ))}
            </dl>
          </div>
          <WhereRings rings={copy.where.rings} />
        </div>
      </Section>

      <Section tone="light" labelledBy="team">
        <h2 id="team" className="font-display text-4xl font-semibold tracking-tight md:text-6xl">
          {t.teamTitle}
        </h2>
        <p className="mt-4 max-w-xl text-lg text-ink/65">{t.teamBody}</p>
        <ul className="mt-12 grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {t.team.map((role) => (
            <li key={role}>
              <div className="grid aspect-[3/4] place-items-center rounded-[var(--brand-radius-card)] bg-gradient-to-b from-paper-2 to-silver/40 grayscale">
                <span aria-hidden className="radar w-1/2 text-ink/30" />
              </div>
              <p className="mono-label mt-3 text-ink/70">{role}</p>
            </li>
          ))}
        </ul>
      </Section>

      <WhyUs />
    </>
  );
}
