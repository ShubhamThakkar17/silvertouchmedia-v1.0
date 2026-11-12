/**
 * THEME TOKENS — exported to CSS variables (--brand-*) in app/layout.tsx and
 * mapped to Tailwind utilities in app/globals.css (bg-coral, text-ink, …).
 * Change colours here only.
 */
export const theme = {
  colors: {
    coral: "#FF5B3A", // primary: accents, active states, key numbers, CTAs
    ink: "#121316", // dark sections, hero base
    ink2: "#1B1D21", // dark cards
    paper: "#F5F5F3", // light sections
    paper2: "#ECECE8", // light cards
    forest: "#0F4D3A", // "where we work", reporting, highlight cards
    mint: "#9FD9C0", // secondary lines on forest
    silver: "#B9BCC2", // hairlines, muted text on dark
    indigo: "#2B2F6B", // hero mesh glow only
  },
  radii: { card: "18px", pill: "999px" },
  shadows: {
    soft: "0 1px 2px rgba(18,19,22,.06), 0 12px 32px -12px rgba(18,19,22,.18)",
  },
  /** Chart palette built from brand tokens (used by Recharts in later milestones). */
  chart: ["#FF5B3A", "#0F4D3A", "#9FD9C0", "#2B2F6B", "#B9BCC2", "#FF9C85"],
} as const;

export type ThemeColor = keyof typeof theme.colors;

const toKebab = (s: string) => s.replace(/([a-z])([A-Z0-9])/g, "$1-$2").toLowerCase();

/** `:root{--brand-coral:#FF5B3A;…}` */
export function themeCssVars(): string {
  const c = Object.entries(theme.colors)
    .map(([k, v]) => `--brand-${toKebab(k)}:${v};`)
    .join("");
  const r = Object.entries(theme.radii)
    .map(([k, v]) => `--brand-radius-${k}:${v};`)
    .join("");
  return `:root{${c}${r}--brand-shadow-soft:${theme.shadows.soft};}`;
}
