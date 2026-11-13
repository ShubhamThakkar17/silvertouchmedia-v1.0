"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { copy } from "@/brand/copy";
import { AUDIENCES } from "@/data/audiences";
import { INDUSTRIES } from "@/data/industries";
import { ALLOCATION, DURATIONS, OBJECTIVES, SCENARIOS, STAGES } from "@/data/planner-weights";
import { TIERS, ZONES } from "@/data/regions";
import { track } from "@/lib/analytics";
import { formatINRCompact, parseINR } from "@/lib/format-inr";
import { monthsLabel } from "@/lib/planner/describe";
import { runPlan, toQuery, type PlannerState } from "@/lib/planner/state";
import type { PlannerChannel } from "@/lib/planner/types";
import { Chips, Field } from "./chips";
import { BudgetResults, ChannelsResults } from "./results";
import { UnlockModal } from "./unlock-modal";

const t = copy.planner;
const MIN = Math.log10(ALLOCATION.budgetMinINR);
const MAX = Math.log10(ALLOCATION.budgetMaxINR);
const STEPS = 400;
const toStep = (v: number) => Math.round(((Math.log10(v) - MIN) / (MAX - MIN)) * STEPS);
function fromStep(step: number) {
  const v = 10 ** (MIN + ((MAX - MIN) * step) / STEPS);
  const e = 10 ** Math.floor(Math.log10(v) - 1); // two significant figures
  return Math.round(v / e) * e;
}

function Step({ n, title, optional, children }: { n: number; title: string; optional?: boolean; children: React.ReactNode }) {
  return (
    <section className="border-t border-ink/10 py-8 first:border-t-0 first:pt-0">
      <h2 className="flex items-baseline gap-3">
        <span className="mono-label text-coral">{String(n).padStart(2, "0")}</span>
        <span className="font-display text-2xl font-semibold tracking-tight">{title}</span>
        {optional ? <span className="mono-label opacity-50">{t.optional}</span> : null}
      </h2>
      <div className="mt-6 space-y-7">{children}</div>
    </section>
  );
}

export function PlannerApp({ channels, initial, turnstileSiteKey }: { channels: PlannerChannel[]; initial: PlannerState; turnstileSiteKey?: string }) {
  const id = useId();
  const router = useRouter();
  const pathname = usePathname();
  const [s, setS] = useState<PlannerState>(initial);
  const [budgetText, setBudgetText] = useState(formatINRCompact(initial.budgetINR));
  const [sheet, setSheet] = useState(false);
  const [unlock, setUnlock] = useState(false);
  const [copied, setCopied] = useState(false);
  const started = useRef(false);

  const set = <K extends keyof PlannerState>(k: K, v: PlannerState[K]) => {
    if (!started.current) {
      started.current = true;
      track("planner_start", { mode: s.mode });
    }
    setS((prev) => ({ ...prev, [k]: v }));
  };

  // Keep the URL in sync (shareable plans) without adding history entries.
  useEffect(() => {
    const h = setTimeout(() => router.replace(`${pathname}?${toQuery(s)}`, { scroll: false }), 250);
    return () => clearTimeout(h);
  }, [s, pathname, router]);

  const plan = useMemo(() => runPlan(channels, s), [channels, s]);
  const name = useMemo(() => {
    const m = new Map(channels.map((c) => [c.slug, c.name]));
    return (slug: string) => m.get(slug) ?? slug;
  }, [channels]);

  useEffect(() => {
    const h = setTimeout(() => track("planner_result", { mode: s.mode, industry: s.industry }), 1200);
    return () => clearTimeout(h);
  }, [plan, s.mode, s.industry]);

  const hasResult = plan.mode === "budget" ? plan.lines.length > 0 : s.channels.length > 0;
  const headline =
    plan.mode === "budget"
      ? `${formatINRCompact(s.budgetINR)} · ${plan.lines.length} ${copy.channelsList.count}`
      : `${copy.planner.scenarios[s.intensity].label} · ${formatINRCompact(plan.scenarios.find((x) => x.id === s.intensity)?.totalINR ?? 0)}`;

  const chOptions = channels.map((c) => ({ id: c.slug, label: c.shortName }));

  const shareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked: the URL bar already holds the link */
    }
  };

  const results = (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl font-semibold tracking-tight">{t.results.title}</h2>
        <a href="/planner-methodology" className="mono-label rounded-full border border-paper/25 px-3 py-1.5 hover:border-coral hover:text-coral">
          {t.results.badge} · {t.results.how}
        </a>
      </div>
      {plan.mode === "budget" ? (
        <BudgetResults plan={plan} name={name} />
      ) : (
        <ChannelsResults plan={plan} state={s} onIntensity={(v) => set("intensity", v)} name={name} />
      )}
      <div className="flex flex-wrap gap-3 border-t border-paper/10 pt-6">
        <button
          type="button"
          disabled={!hasResult}
          onClick={() => setUnlock(true)}
          className="mono-label rounded-full bg-coral px-6 py-4 text-ink transition-colors hover:bg-paper disabled:opacity-40"
        >
          {t.unlock.cta} →
        </button>
        <button type="button" onClick={shareLink} className="mono-label rounded-full border border-paper/25 px-5 py-4 hover:border-coral hover:text-coral" aria-live="polite">
          {copied ? t.copied : t.share}
        </button>
      </div>
    </div>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.15fr)] lg:items-start">
      {/* Inputs */}
      <div className="rounded-[var(--brand-radius-card)] bg-paper p-5 text-ink md:p-8">
        <div role="radiogroup" aria-label={t.modeLabel} className="mb-8 grid grid-cols-2 gap-2 rounded-2xl bg-paper-2 p-1.5">
          {(["budget", "channels"] as const).map((m) => (
            <button
              key={m}
              type="button"
              role="radio"
              aria-checked={s.mode === m}
              onClick={() => {
                set("mode", m);
                track("planner_mode", { mode: m });
              }}
              className={`rounded-xl px-3 py-3 text-left transition-colors ${s.mode === m ? "bg-ink text-paper" : "hover:bg-paper"}`}
            >
              <span className="block font-medium">{t.modes[m].label}</span>
              <span className="mt-0.5 block text-sm opacity-65">{t.modes[m].hint}</span>
            </button>
          ))}
        </div>

        <Step n={1} title={t.steps.business}>
          <Field label={t.fields.industry} id={`${id}-ind`}>
            <select
              id={`${id}-ind`}
              value={s.industry}
              onChange={(e) => set("industry", e.target.value as PlannerState["industry"])}
              className="w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 text-lg"
            >
              {INDUSTRIES.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label={t.fields.stage}>
            <Chips label={t.fields.stage} options={STAGES.map((x) => ({ id: x.id, label: x.label }))} value={[s.stage]} onChange={(v) => set("stage", v[0])} size="sm" />
          </Field>
          <Field label={t.fields.objective}>
            <Chips label={t.fields.objective} options={OBJECTIVES.map((x) => ({ id: x.id, label: x.label }))} value={[s.objective]} onChange={(v) => set("objective", v[0])} size="sm" />
          </Field>
        </Step>

        <Step n={2} title={t.steps.where}>
          <Field label={t.fields.zones}>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                aria-pressed={s.zones.length === 0}
                onClick={() => set("zones", [])}
                className={`rounded-full border px-4 py-2.5 ${s.zones.length === 0 ? "border-coral bg-coral text-ink" : "border-ink/20 hover:border-coral"}`}
              >
                {t.fields.panIndia}
              </button>
              <Chips label={t.fields.zones} multiple options={ZONES.map((z) => ({ id: z.id, label: z.label }))} value={s.zones} onChange={(v) => set("zones", v)} />
            </div>
          </Field>
          <Field label={t.fields.tiers}>
            <Chips label={t.fields.tiers} multiple options={TIERS.map((x) => ({ id: x.id, label: x.label }))} value={s.tiers} onChange={(v) => set("tiers", v)} size="sm" />
          </Field>
        </Step>

        <Step n={3} title={t.steps.who} optional>
          <Chips label={t.fields.audiences} multiple options={AUDIENCES.map((a) => ({ id: a.id, label: a.label }))} value={s.audiences} onChange={(v) => set("audiences", v)} size="sm" />
        </Step>

        {s.mode === "budget" ? (
          <Step n={4} title={t.steps.budget}>
            <Field label={t.fields.budget} hint={t.fields.budgetHelp} id={`${id}-bud`}>
              <div className="flex items-center gap-3">
                <input
                  id={`${id}-bud`}
                  inputMode="decimal"
                  value={budgetText}
                  onChange={(e) => setBudgetText(e.target.value)}
                  onBlur={() => {
                    const v = parseINR(budgetText);
                    const clamped = Number.isFinite(v) ? Math.min(ALLOCATION.budgetMaxINR, Math.max(ALLOCATION.budgetMinINR, v)) : s.budgetINR;
                    set("budgetINR", clamped);
                    setBudgetText(formatINRCompact(clamped));
                  }}
                  onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
                  className="w-40 rounded-xl border border-ink/15 bg-paper px-4 py-3 font-display text-2xl font-semibold text-coral"
                />
                <span className="text-sm opacity-60">
                  ≈ {formatINRCompact(s.budgetINR / s.months)} {t.fields.perMonth}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={STEPS}
                value={toStep(s.budgetINR)}
                onChange={(e) => {
                  const v = fromStep(Number(e.target.value));
                  set("budgetINR", v);
                  setBudgetText(formatINRCompact(v));
                }}
                aria-label={t.fields.budget}
                aria-valuetext={formatINRCompact(s.budgetINR)}
                className="mt-5 w-full accent-[var(--brand-coral)]"
              />
              <div className="mono-label mt-1 flex justify-between opacity-50">
                <span>{formatINRCompact(ALLOCATION.budgetMinINR)}</span>
                <span>{formatINRCompact(ALLOCATION.budgetMaxINR)}+</span>
              </div>
            </Field>
            <Field label={t.fields.include}>
              <Chips label={t.fields.include} multiple size="sm" options={chOptions.map((o) => ({ ...o, disabled: s.exclude.includes(o.id) }))} value={s.include} onChange={(v) => set("include", v)} />
            </Field>
            <Field label={t.fields.exclude}>
              <Chips label={t.fields.exclude} multiple size="sm" options={chOptions.map((o) => ({ ...o, disabled: s.include.includes(o.id) }))} value={s.exclude} onChange={(v) => set("exclude", v)} />
            </Field>
          </Step>
        ) : (
          <Step n={4} title={t.steps.channels}>
            <Field label={t.fields.pick}>
              <Chips label={t.fields.pick} multiple options={chOptions} value={s.channels} onChange={(v) => set("channels", v)} size="sm" />
            </Field>
            <Field label={t.fields.intensity}>
              <Chips
                label={t.fields.intensity}
                options={SCENARIOS.map((x) => ({ id: x.id, label: copy.planner.scenarios[x.id].label }))}
                value={[s.intensity]}
                onChange={(v) => set("intensity", v[0])}
              />
            </Field>
          </Step>
        )}

        <Step n={5} title={t.steps.duration}>
          <Chips
            label={t.steps.duration}
            options={DURATIONS.map((d) => ({ id: String(d) as `${typeof d}`, label: monthsLabel(d) }))}
            value={[String(s.months) as `${typeof s.months}`]}
            onChange={(v) => set("months", Number(v[0]) as PlannerState["months"])}
          />
        </Step>
      </div>

      {/* Results: sticky panel on desktop */}
      <aside aria-label={t.results.title} className="no-scrollbar hidden overscroll-contain lg:sticky lg:top-24 lg:block lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:pr-1">
        {results}
      </aside>

      {/* Results: bottom sheet on mobile */}
      <div className="lg:hidden">
        <div className="fixed inset-x-0 bottom-0 z-40 border-t border-paper/15 bg-ink/95 px-4 py-3 backdrop-blur-md">
          <button
            type="button"
            aria-expanded={sheet}
            aria-controls={`${id}-sheet`}
            onClick={() => setSheet((v) => !v)}
            className="flex w-full items-center justify-between gap-3"
          >
            <span className="text-left">
              <span className="mono-label block text-paper/55">{t.results.title}</span>
              <span className="font-display text-lg font-semibold">{hasResult ? headline : t.sheetOpen}</span>
            </span>
            <span className="mono-label rounded-full bg-coral px-4 py-2.5 text-ink">{sheet ? t.sheetClose : t.sheetOpen}</span>
          </button>
        </div>
        <div
          id={`${id}-sheet`}
          hidden={!sheet}
          className="fixed inset-x-0 bottom-[68px] top-16 z-40 overflow-y-auto overscroll-contain border-t border-paper/15 bg-ink px-4 py-6"
        >
          {results}
        </div>
      </div>

      <UnlockModal open={unlock} onClose={() => setUnlock(false)} state={s} plan={plan} name={name} turnstileSiteKey={turnstileSiteKey} />
    </div>
  );
}
