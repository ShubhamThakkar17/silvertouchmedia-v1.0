import "server-only";
import path from "node:path";
import { Circle, Document, Font, Page, StyleSheet, Svg, Text, View, renderToBuffer } from "@react-pdf/renderer";
import { brand, copy, theme } from "@/brand";
import { pdfFonts } from "@/brand/pdf";
import { formatCountRange, formatINR, formatINRCompact, formatINRRange } from "@/lib/format-inr";
import { describeAssumption, describeInputs, describeReason } from "@/lib/planner/describe";
import type { ChannelLine, Totals } from "@/lib/planner/plan";
import type { PlanResult, PlannerState } from "@/lib/planner/state";

let registered = false;
function registerFonts() {
  if (registered) return;
  const abs = (p: string) => path.join(process.cwd(), p);
  Font.register({
    family: pdfFonts.body.family,
    fonts: [
      { src: abs(pdfFonts.body.regular), fontWeight: 400 },
      { src: abs(pdfFonts.body.semibold), fontWeight: 600 },
    ],
  });
  Font.register({ family: pdfFonts.display.family, src: abs(pdfFonts.display.semibold), fontWeight: 600 });
  Font.registerHyphenationCallback((w) => [w]);
  registered = true;
}

const c = theme.colors;
const s = StyleSheet.create({
  page: { fontFamily: pdfFonts.body.family, fontSize: 9.5, color: c.ink, backgroundColor: c.paper, paddingTop: 48, paddingBottom: 56, paddingHorizontal: 44, lineHeight: 1.45 },
  cover: { backgroundColor: c.ink, color: c.paper, padding: 48, justifyContent: "space-between" },
  mono: { fontSize: 7.5, letterSpacing: 1.2, textTransform: "uppercase" },
  eyebrow: { fontSize: 8, letterSpacing: 1.6, textTransform: "uppercase", color: c.coral },
  h1: { fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 40, lineHeight: 1.05, letterSpacing: -1 },
  h2: { fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 18, marginBottom: 10, letterSpacing: -0.3 },
  muted: { color: "#5b5e66" },
  row: { flexDirection: "row", borderBottomWidth: 0.6, borderBottomColor: "#d9d9d4", paddingVertical: 6 },
  th: { fontSize: 7, letterSpacing: 1, textTransform: "uppercase", color: "#6b6e75" },
  card: { backgroundColor: c.paper2, borderRadius: 8, padding: 12 },
  footer: { position: "absolute", bottom: 24, left: 44, right: 44, flexDirection: "row", justifyContent: "space-between", fontSize: 7, color: "#8a8d94" },
  section: { marginBottom: 22 },
});

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text>
        {brand.name} · {copy.disclaimers.indicative}
      </Text>
      <Text render={({ pageNumber, totalPages }) => `${copy.pdf.page} ${pageNumber} / ${totalPages}`} />
    </View>
  );
}

function Radar({ size = 90, color = c.coral, ring = "#ffffff" }: { size?: number; color?: string; ring?: string }) {
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      {[0.95, 0.72, 0.5].map((k) => (
        <Circle key={k} cx={r} cy={r} r={r * k - 1} stroke={ring} strokeOpacity={0.25} strokeWidth={0.8} fill="none" />
      ))}
      <Circle cx={r} cy={r} r={size * 0.045} fill={color} />
    </Svg>
  );
}

function TotalsRow({ totals, kpi }: { totals: Totals; kpi: "leads" | "reach" }) {
  const t = copy.planner.results;
  const cells = [
    { k: t.impressions, v: formatCountRange(totals.impressions.low, totals.impressions.high) },
    { k: t.reach, v: formatCountRange(totals.reach.low, totals.reach.high) },
    ...(kpi === "leads" && totals.leads ? [{ k: t.leads, v: formatCountRange(totals.leads.low, totals.leads.high) }] : []),
    ...(kpi === "leads" && totals.cpl ? [{ k: t.cpl, v: formatINRRange(totals.cpl.low, totals.cpl.high) }] : []),
  ];
  return (
    <View style={{ flexDirection: "row", gap: 8, marginBottom: 12 }}>
      {cells.map((x) => (
        <View key={x.k} style={[s.card, { flex: 1 }]}>
          <Text style={s.th}>{x.k}</Text>
          <Text style={{ fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 13, lineHeight: 1.25, marginTop: 4 }}>{x.v}</Text>
        </View>
      ))}
    </View>
  );
}

function LinesTable({ lines, name }: { lines: ChannelLine[]; name: (s: string) => string }) {
  const col = copy.planner.results.cols;
  const w = [3.2, 1.2, 0.8, 2, 2, 1.4];
  return (
    <View>
      <View style={[s.row, { borderBottomColor: c.ink }]}>
        {[col.channel, col.amount, col.share, col.impressions, col.reach, col.role].map((h, i) => (
          <Text key={h} style={[s.th, { flex: w[i] }]}>
            {h}
          </Text>
        ))}
      </View>
      {lines.map((l) => (
        <View key={l.slug} style={s.row} wrap={false}>
          <View style={{ flex: w[0], paddingRight: 6 }}>
            <Text style={{ fontWeight: 600 }}>{name(l.slug)}</Text>
            {l.reasons.length ? <Text style={[s.muted, { fontSize: 7.5 }]}>{l.reasons.map(describeReason).join(" · ")}</Text> : null}
          </View>
          <Text style={{ flex: w[1] }}>{formatINRCompact(l.amountINR)}</Text>
          <Text style={{ flex: w[2] }}>{Math.round(l.share * 100)}%</Text>
          <Text style={{ flex: w[3] }}>{formatCountRange(l.impressions.low, l.impressions.high)}</Text>
          <Text style={{ flex: w[4] }}>{formatCountRange(l.reach.low, l.reach.high)}</Text>
          <Text style={{ flex: w[5] }}>{copy.channelPage.funnel[l.role]}</Text>
        </View>
      ))}
    </View>
  );
}

export type PdfContact = { name: string; company?: string; city?: string };
export type PdfChannelNote = { slug: string; name: string; tagline: string; unitLabel: string; lowINR: number; highINR: number; kpi: string };

export function PlanDocument({
  state,
  plan,
  contact,
  notes,
  date,
}: {
  state: PlannerState;
  plan: PlanResult;
  contact: PdfContact;
  notes: PdfChannelNote[];
  date: string;
}) {
  const name = (slug: string) => notes.find((n) => n.slug === slug)?.name ?? slug;
  const p = copy.pdf;
  const lines = plan.mode === "budget" ? plan.lines : (plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0]).lines;
  const used = new Set(lines.map((l) => l.slug));
  return (
    <Document title={`${p.title}: ${contact.company || contact.name}`} author={brand.name} creator={brand.name}>
      {/* Cover */}
      <Page size="A4" style={[s.page, s.cover]}>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <Text style={{ fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 16 }}>{brand.name}</Text>
          <Text style={[s.mono, { color: c.silver }]}>{brand.category}</Text>
        </View>
        <View>
          <Radar size={110} />
          <Text style={[s.eyebrow, { marginTop: 24 }]}>{p.title}</Text>
          <Text style={[s.h1, { marginTop: 10, maxWidth: 420 }]}>{contact.company || contact.name}</Text>
          <Text style={{ fontSize: 13, color: c.silver, marginTop: 14 }}>
            {plan.mode === "budget"
              ? `${formatINR(state.budgetINR)} · ${state.months} ${copy.planner.fields.months}`
              : `${copy.planner.scenarios[state.intensity].label} · ${state.months} ${copy.planner.fields.months}`}
          </Text>
        </View>
        <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
          <View>
            <Text style={[s.mono, { color: c.silver }]}>{p.preparedFor}</Text>
            <Text style={{ marginTop: 4 }}>
              {contact.name}
              {contact.city ? `, ${contact.city}` : ""}
            </Text>
          </View>
          <View>
            <Text style={[s.mono, { color: c.silver }]}>{p.date}</Text>
            <Text style={{ marginTop: 4 }}>{date}</Text>
          </View>
        </View>
      </Page>

      {/* Plan */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.eyebrow}>{p.inputs}</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 8 }}>
            {describeInputs(state).map((r) => (
              <View key={r.k} style={{ width: "50%", paddingVertical: 4, paddingRight: 10 }}>
                <Text style={s.th}>{r.k}</Text>
                <Text>{r.v}</Text>
              </View>
            ))}
          </View>
        </View>

        {plan.mode === "channels" ? (
          <View style={s.section}>
            <Text style={s.h2}>{p.scenarios}</Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {plan.scenarios.map((sc) => {
                const on = sc.id === state.intensity;
                return (
                  <View key={sc.id} style={[s.card, { flex: 1 }, on ? { backgroundColor: c.coral } : {}]}>
                    <Text style={s.th}>
                      {copy.planner.scenarios[sc.id].label}
                      {on ? ` · ${p.selected}` : ""}
                    </Text>
                    <Text style={{ fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 15, lineHeight: 1.25, marginTop: 4, marginBottom: 3 }}>{formatINRCompact(sc.totalINR)}</Text>
                    <Text style={{ fontSize: 7.5 }}>{formatINRRange(sc.totalRange.low, sc.totalRange.high)}</Text>
                    <Text style={{ fontSize: 7.5, marginTop: 4 }}>{formatCountRange(sc.totals.reach.low, sc.totals.reach.high)}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        <View style={s.section}>
          <Text style={s.h2}>{plan.mode === "budget" ? p.mix : `${copy.planner.scenarios.split} ${copy.planner.scenarios[state.intensity].label}`}</Text>
          <Text style={[s.eyebrow, { marginBottom: 6 }]}>{p.totalsTitle}</Text>
          {plan.mode === "budget" ? (
            <TotalsRow totals={plan.totals} kpi={plan.roi.kpi} />
          ) : (
            <TotalsRow
              totals={(plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0]).totals}
              kpi={(plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0]).roi.kpi}
            />
          )}
          <LinesTable lines={lines} name={name} />
          {(() => {
            const roi = plan.mode === "budget" ? plan.roi : (plan.scenarios.find((x) => x.id === state.intensity) ?? plan.scenarios[0]).roi;
            return (
              <View style={[s.card, { marginTop: 10, backgroundColor: roi.band === "High" ? c.coral : c.paper2 }]}>
                <Text style={s.th}>{copy.planner.results.roiTitle}</Text>
                <Text style={{ fontFamily: pdfFonts.display.family, fontWeight: 600, fontSize: 14, lineHeight: 1.3 }}>{copy.channelPage.roiBands[roi.band]}</Text>
                <Text>
                  {copy.planner.results.kpi[roi.kpi]} {roi.newBrand ? copy.planner.results.newBrandNote : ""}
                </Text>
              </View>
            );
          })()}
        </View>
        <Footer />
      </Page>

      {/* Notes, assumptions, next steps */}
      <Page size="A4" style={s.page}>
        <View style={s.section}>
          <Text style={s.h2}>{p.notes}</Text>
          {notes
            .filter((n) => used.has(n.slug))
            .map((n) => (
              <View key={n.slug} style={[s.row, { flexDirection: "column" }]} wrap={false}>
                <Text style={{ fontWeight: 600 }}>{n.name}</Text>
                <Text style={s.muted}>{n.tagline}</Text>
                <Text style={{ fontSize: 8 }}>
                  {formatINRRange(n.lowINR, n.highINR)} {n.unitLabel}. {n.kpi}.
                </Text>
              </View>
            ))}
        </View>
        <View style={s.section}>
          <Text style={s.h2}>{p.assumptions}</Text>
          {plan.assumptions.map((a) => (
            <Text key={a.id} style={{ marginBottom: 3 }}>
              · {describeAssumption(a)}
            </Text>
          ))}
          <Text style={{ marginTop: 3 }}>· {copy.disclaimers.indicative}</Text>
        </View>
        <View style={s.section}>
          <Text style={s.h2}>{p.nextTitle}</Text>
          {p.next.map((x, i) => (
            <Text key={x} style={{ marginBottom: 4 }}>
              {i + 1}. {x}
            </Text>
          ))}
        </View>
        <View style={[s.card, { backgroundColor: c.ink, color: c.paper, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }]}>
          <View>
            <Text style={[s.eyebrow]}>{p.contactTitle}</Text>
            <Text style={{ marginTop: 4 }}>{brand.contact.phone}</Text>
            <Text>{brand.contact.email}</Text>
            <Text style={{ color: c.silver }}>{brand.address.display}</Text>
          </View>
          <Radar size={60} />
        </View>
        <Text style={{ marginTop: 10, fontSize: 7, color: "#8a8d94" }}>{brand.legalLine}</Text>
        <Footer />
      </Page>
    </Document>
  );
}

export async function renderPlanPdf(props: Parameters<typeof PlanDocument>[0]): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<PlanDocument {...props} />);
}
