import "server-only";
import { brand, copy } from "@/brand";
import { LeadNotification, VisitorConfirmation, emailSubject } from "@/emails/templates";
import { readAttribution, deviceFrom } from "./attribution";
import { sendEmail, type Attachment } from "./email";
import { appendLeadRow, SHEET_COLUMNS, type SheetRow } from "./sheets";

export type DeliveryReport = {
  sheet: Awaited<ReturnType<typeof appendLeadRow>>;
  notify: Awaited<ReturnType<typeof sendEmail>>;
  visitor: Awaited<ReturnType<typeof sendEmail>> | "none";
};

const pretty = (k: string) => k.replace(/_/g, " ").replace(/^./, (c) => c.toUpperCase());

/** Adds attribution, writes the Sheet row and sends both emails. Never throws. */
export async function deliverLead(
  req: Request,
  args: {
    source: "form" | "planner";
    row: SheetRow;
    visitor: { name: string; email?: string };
    attachments?: Attachment[];
    whatsappUrl?: string;
  },
): Promise<DeliveryReport> {
  const attr = readAttribution(req.headers.get("cookie"));
  const row: SheetRow = {
    ...args.row,
    timestamp: new Date().toISOString(),
    source: args.source,
    utm_source: attr.utm_source,
    utm_medium: attr.utm_medium,
    utm_campaign: attr.utm_campaign,
    referrer: attr.referrer,
    page: [attr.landing, req.headers.get("referer"), deviceFrom(req.headers.get("user-agent"))].filter(Boolean).join(" | "),
  };

  const title = emailSubject(copy.emails.leadSubject, {
    source: copy.emails.sources[args.source],
    name: row.name ?? "",
    city: row.city || "city not given",
  });
  const rows = SHEET_COLUMNS.filter((k) => k !== "recommended_mix_json").map((k) => ({ k: pretty(k), v: row[k] ?? "" }));

  const [sheet, notify, visitor] = await Promise.all([
    appendLeadRow(row),
    process.env.LEAD_EMAIL_TO
      ? sendEmail({
          to: process.env.LEAD_EMAIL_TO,
          subject: title,
          react: LeadNotification({ title, rows, whatsappUrl: args.whatsappUrl }),
          replyTo: args.visitor.email || undefined,
          attachments: args.attachments,
        })
      : Promise.resolve("skipped" as const),
    args.visitor.email
      ? sendEmail({
          to: args.visitor.email,
          subject: emailSubject(args.source === "planner" ? copy.emails.visitorSubject : copy.emails.contactSubject, { brand: brand.name }),
          react: VisitorConfirmation({ name: args.visitor.name, kind: args.source }),
          replyTo: brand.contact.email,
          attachments: args.attachments,
        })
      : Promise.resolve("none" as const),
  ]);

  if (process.env.NODE_ENV !== "production") console.info("[lead]", args.source, { sheet, notify, visitor });
  return { sheet, notify, visitor };
}
