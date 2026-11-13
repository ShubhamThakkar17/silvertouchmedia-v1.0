import "server-only";
import { render } from "@react-email/render";
import type { ReactElement } from "react";
import { Resend } from "resend";

export type Attachment = { filename: string; content: Buffer };

/**
 * Sends one email through Resend. Without RESEND_API_KEY it does nothing and reports
 * "skipped", so local development and previews work without credentials.
 */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  react: ReactElement;
  replyTo?: string;
  attachments?: Attachment[];
}): Promise<"sent" | "skipped" | "failed"> {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.LEAD_EMAIL_FROM;
  if (!key || !from) return "skipped";
  try {
    const resend = new Resend(key);
    const html = await render(opts.react);
    const { error } = await resend.emails.send({
      from,
      to: opts.to,
      subject: opts.subject,
      html,
      replyTo: opts.replyTo,
      attachments: opts.attachments?.map((a) => ({ filename: a.filename, content: a.content })),
    });
    return error ? "failed" : "sent";
  } catch {
    return "failed";
  }
}
