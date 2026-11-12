import { brand } from "@/brand";

type Props = { variant?: "lockup-inline" | "monogram"; className?: string };

/** Masked SVG so the logo takes the current text colour on any background. */
function Mask({ src, ratio, className }: { src: string; ratio: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block bg-current ${className ?? ""}`}
      style={{
        aspectRatio: String(ratio),
        WebkitMaskImage: `url("${src}")`,
        maskImage: `url("${src}")`,
        WebkitMaskRepeat: "no-repeat",
        maskRepeat: "no-repeat",
        WebkitMaskSize: "contain",
        maskSize: "contain",
        WebkitMaskPosition: "center",
        maskPosition: "center",
      }}
    />
  );
}

export function Logo({ variant = "lockup-inline", className }: Props) {
  if (variant === "monogram") {
    return (
      <span className={className}>
        <Mask src={brand.logo.monogram} ratio={440 / 482} className="h-full" />
        <span className="sr-only">{brand.name}</span>
      </span>
    );
  }
  return (
    <span className={`inline-flex items-center gap-2.5 ${className ?? ""}`}>
      <Mask src={brand.logo.monogram} ratio={440 / 482} className="h-[1.65em]" />
      <span className="flex flex-col leading-none">
        <Mask src={brand.logo.wordmark} ratio={1330 / 205} className="h-[0.95em]" />
        {brand.descriptor ? (
          <span className="mono-label mt-[0.32em] !text-[0.5em] !tracking-[0.42em] opacity-80">
            {brand.descriptor}
          </span>
        ) : null}
      </span>
      <span className="sr-only">{brand.name}</span>
    </span>
  );
}
