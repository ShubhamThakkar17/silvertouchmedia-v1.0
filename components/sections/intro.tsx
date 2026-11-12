import Image from "next/image";
import { copy } from "@/brand";
import { CountUp } from "@/components/ui/count-up";

/** Home section B: "One agency for every touchpoint." with arched image, rings and stats. */
export function Intro({ image }: { image: { src: string; blurDataURL?: string } }) {
  const c = copy.intro;
  return (
    <section className="relative overflow-hidden bg-paper text-ink">
      <div className="mx-auto grid max-w-[1600px] gap-14 px-4 py-24 md:px-8 md:py-36 lg:grid-cols-[1.15fr_1fr] lg:items-center">
        <div>
          <p className="eyebrow">{c.eyebrow}</p>
          <h2 className="display-xl mt-5 max-w-[12ch]">{c.title}</h2>
          <div className="mt-8 grid max-w-2xl gap-4 text-lg leading-relaxed text-ink/75">
            {c.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="mt-14 grid grid-cols-2 gap-x-6 gap-y-10 border-t border-ink/10 pt-10 sm:grid-cols-4">
            {c.stats.map((s) => (
              <div key={s.label}>
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="font-display block text-5xl font-semibold tracking-tight text-coral md:text-6xl">
                    <CountUp to={s.value} plain={"format" in s && s.format === "year"} />
                  </span>
                  <span className="mono-label mt-3 block text-ink/60">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>
        <div className="relative mx-auto w-full max-w-[520px]">
          <div aria-hidden className="radar absolute -right-16 -top-16 w-[70%] text-ink/40" />
          <div className="relative aspect-[4/5] overflow-hidden rounded-t-[999px] rounded-b-[var(--brand-radius-card)] bg-paper-2">
            <Image
              src={image.src}
              alt=""
              fill
              sizes="(min-width: 1024px) 520px, 90vw"
              placeholder={image.blurDataURL ? "blur" : "empty"}
              blurDataURL={image.blurDataURL}
              className="object-cover"
            />
          </div>
          <p className="mono-label mt-3 text-ink/50">{copy.disclaimers.concept}</p>
        </div>
      </div>
    </section>
  );
}
