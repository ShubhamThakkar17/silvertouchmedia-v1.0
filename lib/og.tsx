import fs from "node:fs";
import path from "node:path";
import { ImageResponse } from "next/og";
import { brand, theme } from "@/brand";
import { pdfFonts } from "@/brand/pdf";

export const OG_SIZE = { width: 1200, height: 630 };

const font = (p: string) => fs.readFileSync(path.join(process.cwd(), p));

/** Brand-templated Open Graph card: ink, coral glow, radar rings, coral eyebrow, big title. */
export function ogImage({ eyebrow, title, footer }: { eyebrow: string; title: string; footer?: string }) {
  const c = theme.colors;
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          backgroundColor: c.ink,
          backgroundImage: `radial-gradient(circle at 0% 100%, ${c.coral}88 0%, transparent 55%), radial-gradient(circle at 100% 100%, ${c.forest} 0%, transparent 50%), radial-gradient(circle at 50% 0%, ${c.indigo} 0%, transparent 55%)`,
          color: c.paper,
          fontFamily: "Body",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: "Display", fontSize: 34 }}>{brand.name}</div>
          <div style={{ display: "flex", width: 120, height: 120, borderRadius: 999, border: `2px solid ${c.paper}33`, alignItems: "center", justifyContent: "center" }}>
            <div style={{ display: "flex", width: 76, height: 76, borderRadius: 999, border: `2px solid ${c.paper}44`, alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 16, height: 16, borderRadius: 999, background: c.coral }} />
            </div>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 26, letterSpacing: 6, textTransform: "uppercase", color: c.coral }}>{eyebrow}</div>
          <div style={{ fontFamily: "Display", fontSize: title.length > 34 ? 72 : 92, lineHeight: 1.0, letterSpacing: -2, marginTop: 18, maxWidth: 1000 }}>{title}</div>
          {footer ? <div style={{ fontSize: 28, color: c.silver, marginTop: 24 }}>{footer}</div> : null}
        </div>
      </div>
    ),
    {
      ...OG_SIZE,
      fonts: [
        { name: "Display", data: font(pdfFonts.display.semibold), weight: 600, style: "normal" },
        { name: "Body", data: font(pdfFonts.body.regular), weight: 400, style: "normal" },
      ],
    },
  );
}
