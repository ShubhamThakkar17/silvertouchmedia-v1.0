import type { ReactNode } from "react";

export type Tone = "dark" | "light" | "forest" | "paper2";

const toneClass: Record<Tone, string> = {
  dark: "bg-ink text-paper",
  light: "bg-paper text-ink",
  paper2: "bg-paper-2 text-ink",
  forest: "bg-forest text-paper",
};

/** Full-width section with the site's alternating dark/light rhythm and a 1600px container. */
export function Section({
  tone = "light",
  id,
  className = "",
  innerClassName = "",
  children,
  labelledBy,
}: {
  tone?: Tone;
  id?: string;
  className?: string;
  innerClassName?: string;
  children: ReactNode;
  labelledBy?: string;
}) {
  return (
    <section id={id} aria-labelledby={labelledBy} className={`relative ${toneClass[tone]} ${className}`}>
      <div className={`mx-auto max-w-[1600px] px-4 py-20 md:px-8 md:py-32 ${innerClassName}`}>{children}</div>
    </section>
  );
}

/** Eyebrow + display title + optional body. `id` goes on the h2 for aria-labelledby. */
export function SectionHeader({
  eyebrow,
  title,
  body,
  id,
  as: Tag = "h2",
  size = "lg",
  className = "",
  children,
}: {
  eyebrow?: string;
  title: string;
  body?: ReactNode;
  id?: string;
  as?: "h1" | "h2";
  size?: "xl" | "lg";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header className={`max-w-4xl ${className}`}>
      {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
      <Tag
        id={id}
        className={
          size === "xl"
            ? "display-xl mt-5"
            : "font-display mt-4 text-4xl font-semibold leading-[1.02] tracking-tight md:text-6xl"
        }
      >
        {title}
      </Tag>
      {body ? <div className="mt-6 max-w-2xl text-lg leading-relaxed opacity-75">{body}</div> : null}
      {children}
    </header>
  );
}
