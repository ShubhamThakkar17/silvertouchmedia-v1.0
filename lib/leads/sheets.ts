import "server-only";
import crypto from "node:crypto";

/** Column order for the Google Sheet (brief §10). The Apps Script writes in this order. */
export const SHEET_COLUMNS = [
  "timestamp",
  "source",
  "mode",
  "name",
  "company",
  "phone",
  "email",
  "city",
  "industry",
  "brand_stage",
  "objective",
  "regions",
  "audiences",
  "duration",
  "budget_input",
  "channels_selected",
  "recommended_mix_json",
  "scenario_totals",
  "est_impressions",
  "est_reach",
  "roi_band",
  "message",
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "referrer",
  "page",
] as const;
export type SheetRow = Partial<Record<(typeof SHEET_COLUMNS)[number], string>>;

/**
 * Appends a row. Primary path: Apps Script web app (SHEETS_WEBHOOK_URL + secret).
 * Optional path: a Google service account (GOOGLE_SERVICE_ACCOUNT_EMAIL,
 * GOOGLE_PRIVATE_KEY, GOOGLE_SHEET_ID) using the Sheets REST API, no SDK.
 */
export async function appendLeadRow(row: SheetRow): Promise<"webhook" | "service-account" | "skipped" | "failed"> {
  const ordered = SHEET_COLUMNS.map((c) => row[c] ?? "");
  if (process.env.SHEETS_WEBHOOK_URL) {
    try {
      const r = await fetch(process.env.SHEETS_WEBHOOK_URL, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ secret: process.env.SHEETS_WEBHOOK_SECRET ?? "", columns: SHEET_COLUMNS, row: ordered }),
        redirect: "follow",
        signal: AbortSignal.timeout(10000),
      });
      const j = (await r.json().catch(() => ({}))) as { ok?: boolean };
      return r.ok && j.ok !== false ? "webhook" : "failed";
    } catch {
      return "failed";
    }
  }
  if (process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL && process.env.GOOGLE_PRIVATE_KEY && process.env.GOOGLE_SHEET_ID) {
    try {
      const token = await serviceAccountToken(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL, process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"));
      const range = encodeURIComponent(process.env.GOOGLE_SHEET_RANGE ?? "Leads!A1");
      const r = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${process.env.GOOGLE_SHEET_ID}/values/${range}:append?valueInputOption=RAW&insertDataOption=INSERT_ROWS`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
          body: JSON.stringify({ values: [ordered] }),
          signal: AbortSignal.timeout(10000),
        },
      );
      return r.ok ? "service-account" : "failed";
    } catch {
      return "failed";
    }
  }
  return "skipped";
}

/** OAuth2 JWT bearer flow for a service account, signed with node:crypto. */
async function serviceAccountToken(email: string, privateKey: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const b64 = (o: object) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const unsigned = `${b64({ alg: "RS256", typ: "JWT" })}.${b64({
    iss: email,
    scope: "https://www.googleapis.com/auth/spreadsheets",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  })}`;
  const sig = crypto.sign("RSA-SHA256", Buffer.from(unsigned), privateKey).toString("base64url");
  const r = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${unsigned}.${sig}` }),
    signal: AbortSignal.timeout(8000),
  });
  const j = (await r.json()) as { access_token?: string };
  if (!j.access_token) throw new Error("No access token");
  return j.access_token;
}
