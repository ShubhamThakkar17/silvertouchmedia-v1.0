import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

type Variant = "primary" | "outline" | "outline-dark";

const variants: Record<Variant, string> = {
  primary: "bg-coral text-ink hover:bg-paper",
  outline: "border border-current/25 hover:border-coral hover:text-coral",
  "outline-dark": "border border-paper/25 text-paper hover:border-coral hover:text-coral",
};

/** Rounded mono CTA used across the site. External links open in a new tab. */
export function PillLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: { href: string; children: ReactNode; variant?: Variant; className?: string } & Omit<ComponentProps<"a">, "href">) {
  const cls = `mono-label inline-flex items-center gap-2 rounded-full px-6 py-4 transition-colors ${variants[variant]} ${className}`;
  if (/^(https?:|mailto:|tel:)/.test(href)) {
    const external = href.startsWith("http");
    return (
      <a href={href} className={cls} {...(external ? { target: "_blank", rel: "noreferrer" } : {})} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={cls} {...rest}>
      {children}
    </Link>
  );
}
