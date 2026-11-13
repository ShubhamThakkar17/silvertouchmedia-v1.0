# Google Sheet lead sink (Apps Script)

Every contact-form and planner lead is appended as a row. No Google Cloud project or
service account is needed.

1. Create a Google Sheet (any name). Open **Extensions → Apps Script**.
2. Replace the default code with [`Code.gs`](Code.gs). Change `SECRET` to a long random
   string (for example `openssl rand -hex 24`).
3. **Deploy → New deployment → Web app.** Execute as: *Me*. Who has access: *Anyone*.
   Authorise when asked. Copy the web app URL.
4. In Vercel (or `.env.local`) set:
   - `SHEETS_WEBHOOK_URL` = the web app URL
   - `SHEETS_WEBHOOK_SECRET` = the same secret as in the script
5. Send a test lead from `/contact`. A `Leads` tab appears with the header row:

   `timestamp, source, mode, name, company, phone, email, city, industry, brand_stage,
   objective, regions, audiences, duration, budget_input, channels_selected,
   recommended_mix_json, scenario_totals, est_impressions, est_reach, roi_band, message,
   utm_source, utm_medium, utm_campaign, referrer, page`

When you change `Code.gs`, deploy a **new version** (Manage deployments → Edit → New
version); the URL stays the same.

## Optional: service account instead

If you prefer the Sheets API, leave `SHEETS_WEBHOOK_URL` empty and set
`GOOGLE_SERVICE_ACCOUNT_EMAIL`, `GOOGLE_PRIVATE_KEY` (with `\n` for line breaks),
`GOOGLE_SHEET_ID` and optionally `GOOGLE_SHEET_RANGE` (default `Leads!A1`). Share the sheet
with the service account email as an editor. See `lib/leads/sheets.ts`.
