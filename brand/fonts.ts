/**
 * FONTS — next/font needs static calls, so the brand's typefaces live here.
 * Swap the imports to rebrand; keep the exported names and CSS variables.
 */
import localFont from "next/font/local";
import { Inter, JetBrains_Mono, Space_Grotesk } from "next/font/google";

export const fontDisplay = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--nf-display",
  display: "swap",
});

export const fontBody = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-body",
  display: "swap",
  // Body and mono text are never the largest paint; only the display face is preloaded.
  preload: false,
});

export const fontMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--nf-mono",
  display: "swap",
  preload: false,
});

/**
 * Symbols subset (₹, arrows, ≈, superscripts) cut from the brand fonts, ~2 KB each.
 * Listed first in every font stack so browsers never download Google's large
 * latin-ext files just for the rupee sign. Rebuild with pyftsubset if the fonts change.
 */
export const fontSymbols = localFont({
  src: [
    { path: "./fonts/symbols-body-400.woff2", weight: "400", style: "normal" },
    { path: "./fonts/symbols-body-600.woff2", weight: "500 700", style: "normal" },
  ],
  variable: "--nf-symbols",
  display: "swap",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9, U+2190-2199, U+2248, U+2070-2079" }],
});
export const fontSymbolsDisplay = localFont({
  src: [{ path: "./fonts/symbols-display-600.woff2", weight: "500 700", style: "normal" }],
  variable: "--nf-symbols-display",
  display: "swap",
  preload: false,
  declarations: [{ prop: "unicode-range", value: "U+20B9, U+2190-2199, U+2248, U+2070-2079" }],
});

export const fontVariables = `${fontDisplay.variable} ${fontBody.variable} ${fontMono.variable} ${fontSymbols.variable} ${fontSymbolsDisplay.variable}`;
