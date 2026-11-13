import type { CSSProperties, ReactNode } from "react";
import { brand, copy, theme } from "@/brand";

/**
 * Email-safe templates: tables and inline styles only, rendered to HTML with
 * @react-email/render. All text comes from brand copy.
 */
const c = theme.colors;
const fill = (tpl: string, v: Record<string, string>) => tpl.replace(/\{(\w+)\}/g, (_, k) => v[k] ?? "");
const font = "Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif";

function Shell({ preview, children }: { preview: string; children: ReactNode }) {
  return (
    <html lang="en-IN">
      {/* eslint-disable-next-line @next/next/no-head-element -- email HTML, not a Next page */}
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width" />
        <title>{preview}</title>
      </head>
      <body style={{ margin: 0, padding: 0, background: c.paper2, fontFamily: font, color: c.ink }}>
        <div style={{ display: "none", maxHeight: 0, overflow: "hidden" }}>{preview}</div>
        <table role="presentation" width="100%" cellPadding={0} cellSpacing={0} style={{ background: c.paper2 }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: "32px 12px" }}>
                <table role="presentation" width={600} cellPadding={0} cellSpacing={0} style={{ maxWidth: 600, width: "100%", background: c.paper, borderRadius: 14, overflow: "hidden" }}>
                  <tbody>
                    <tr>
                      <td style={{ background: c.ink, color: c.paper, padding: "22px 28px" }}>
                        <span style={{ fontSize: 17, fontWeight: 700 }}>{brand.name}</span>
                        <span style={{ color: c.coral, fontSize: 22, lineHeight: "10px", marginLeft: 6 }}>●</span>
                      </td>
                    </tr>
                    <tr>
                      <td style={{ padding: "28px", fontSize: 15, lineHeight: "24px" }}>{children}</td>
                    </tr>
                    <tr>
                      <td style={{ padding: "18px 28px", borderTop: `1px solid ${c.paper2}`, fontSize: 12, color: "#6b6e75" }}>
                        {brand.contact.phone} · {brand.contact.email} · {brand.address.display}
                        <br />
                        {brand.legalLine}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  );
}

const cell: CSSProperties = { padding: "6px 0", borderBottom: `1px solid ${c.paper2}`, verticalAlign: "top", fontSize: 14 };

/** Internal notification with every field as a table. */
export function LeadNotification({ title, rows, whatsappUrl }: { title: string; rows: { k: string; v: string }[]; whatsappUrl?: string }) {
  return (
    <Shell preview={title}>
      <p style={{ margin: "0 0 6px", fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: c.coral }}>{title}</p>
      <p style={{ margin: "0 0 18px" }}>{copy.emails.leadIntro}</p>
      <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
        <tbody>
          {rows
            .filter((r) => r.v)
            .map((r) => (
              <tr key={r.k}>
                <td style={{ ...cell, width: 170, color: "#6b6e75" }}>{r.k}</td>
                <td style={{ ...cell, whiteSpace: "pre-wrap" }}>{r.v}</td>
              </tr>
            ))}
        </tbody>
      </table>
      {whatsappUrl ? (
        <p style={{ margin: "22px 0 0" }}>
          <a href={whatsappUrl} style={{ background: c.coral, color: c.ink, padding: "12px 18px", borderRadius: 999, textDecoration: "none", fontSize: 13, fontWeight: 600 }}>
            WhatsApp
          </a>
        </p>
      ) : null}
    </Shell>
  );
}

/** Visitor confirmation (planner: with PDF attached; contact form: plain thanks). */
export function VisitorConfirmation({ name, kind }: { name: string; kind: "planner" | "form" }) {
  const e = copy.emails;
  const body = kind === "planner" ? e.visitorBody : e.contactBody;
  return (
    <Shell preview={body}>
      <p style={{ margin: "0 0 14px" }}>{fill(e.visitorGreeting, { name })}</p>
      <p style={{ margin: "0 0 14px" }}>{body}</p>
      <p style={{ margin: "22px 0 0" }}>{fill(e.visitorSignoff, { brand: brand.name })}</p>
    </Shell>
  );
}

export const emailSubject = (tpl: string, v: Record<string, string>) => fill(tpl, v);
