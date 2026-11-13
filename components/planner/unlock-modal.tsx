"use client";

import { useEffect, useId, useRef, useState } from "react";
import { copy } from "@/brand/copy";
import { Turnstile } from "@/components/forms/turnstile";
import { track } from "@/lib/analytics";
import { isIndianMobile } from "@/lib/leads/schema";
import { fill, oneLiner } from "@/lib/planner/describe";
import { toQuery, type PlanResult, type PlannerState } from "@/lib/planner/state";
import { whatsappUrl } from "@/lib/whatsapp";

const t = copy.planner.unlock;
const field = "mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3 text-base outline-none focus:border-coral aria-[invalid=true]:border-coral";

type Done = { emailed: boolean; pdfUrl: string; filename: string; whatsappUrl: string };

/** Gated full plan: contact details + Turnstile → /api/plan → PDF download + WhatsApp hand-off. */
export function UnlockModal({
  open,
  onClose,
  state,
  plan,
  name,
  turnstileSiteKey,
}: {
  open: boolean;
  onClose: () => void;
  state: PlannerState;
  plan: PlanResult;
  name: (s: string) => string;
  turnstileSiteKey?: string;
}) {
  const id = useId();
  const dialog = useRef<HTMLDialogElement>(null);
  const [values, setValues] = useState({ name: "", company: "", phone: "", email: "", city: "", message: "", website: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [token, setToken] = useState<string>();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<Done | null>(null);

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  useEffect(
    () => () => {
      if (done?.pdfUrl) URL.revokeObjectURL(done.pdfUrl);
    },
    [done],
  );

  const set = (k: keyof typeof values) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (values.name.trim().length < 2) e.name = t.required;
    if (!isIndianMobile(values.phone)) e.phone = t.invalidPhone;
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) e.email = t.invalidEmail;
    if (turnstileSiteKey && !token) e.captcha = t.captcha;
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setBusy(true);
    setFailed(false);
    track("plan_unlock_submit", { mode: state.mode, industry: state.industry });
    try {
      const r = await fetch("/api/plan", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...values, query: toQuery(state), turnstileToken: token }),
      });
      const j = (await r.json()) as { ok: boolean; emailed?: boolean; pdfBase64?: string; filename?: string; whatsappUrl?: string };
      if (!r.ok || !j.ok || !j.pdfBase64) throw new Error("failed");
      const bytes = Uint8Array.from(atob(j.pdfBase64), (ch) => ch.charCodeAt(0));
      setDone({
        emailed: !!j.emailed,
        pdfUrl: URL.createObjectURL(new Blob([bytes], { type: "application/pdf" })),
        filename: j.filename ?? "media-plan.pdf",
        whatsappUrl: j.whatsappUrl ?? whatsappUrl(),
      });
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const fallbackWa = whatsappUrl(fill(copy.planner.whatsappText, { summary: oneLiner(state, plan, name), link: typeof window === "undefined" ? "" : window.location.href }));

  const input = (k: "name" | "company" | "phone" | "email" | "city", labelText: string, props: React.InputHTMLAttributes<HTMLInputElement> = {}, required = false) => (
    <div>
      <label htmlFor={`${id}-${k}`} className="mono-label text-ink/65">
        {labelText}
        {required ? <span className="text-coral"> *</span> : null}
      </label>
      <input
        id={`${id}-${k}`}
        value={values[k]}
        onChange={set(k)}
        aria-invalid={errors[k] ? true : undefined}
        aria-describedby={errors[k] ? `${id}-${k}-err` : undefined}
        className={field}
        {...props}
      />
      {errors[k] ? (
        <p id={`${id}-${k}-err`} className="mt-1 text-sm text-coral">
          {errors[k]}
        </p>
      ) : null}
    </div>
  );

  return (
    <dialog
      ref={dialog}
      onClose={onClose}
      onClick={(e) => e.target === dialog.current && onClose()}
      aria-labelledby={`${id}-title`}
      className="m-auto w-[min(640px,calc(100vw-24px))] max-h-[calc(100svh-24px)] overflow-y-auto rounded-[var(--brand-radius-card)] bg-paper p-0 text-ink backdrop:bg-ink/70 backdrop:backdrop-blur-sm"
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <h2 id={`${id}-title`} className="font-display text-3xl font-semibold tracking-tight">
            {done ? t.successTitle : t.title}
          </h2>
          <button type="button" onClick={onClose} className="mono-label rounded-full border border-ink/15 px-3 py-2 hover:border-coral">
            {t.close}
          </button>
        </div>

        {done ? (
          <div role="status" className="mt-6">
            <p className="text-lg text-ink/75">{done.emailed ? t.successBody : t.successNoEmail}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href={done.pdfUrl} download={done.filename} className="mono-label rounded-full bg-coral px-6 py-4 text-ink hover:bg-ink hover:text-paper">
                {t.download} ↓
              </a>
              <a
                href={done.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => track("whatsapp_click", { from: "planner" })}
                className="mono-label rounded-full border border-ink/20 px-6 py-4 hover:border-coral hover:text-coral"
              >
                {t.whatsapp} ↗
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={submit} noValidate className="mt-4">
            <p className="text-ink/70">{t.body}</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {input("name", t.name, { autoComplete: "name" }, true)}
              {input("company", t.company, { autoComplete: "organization" })}
              {input("phone", t.phone, { type: "tel", inputMode: "tel", autoComplete: "tel" }, true)}
              {input("email", t.email, { type: "email", autoComplete: "email" })}
              {input("city", t.city, { autoComplete: "address-level2" })}
              <div className="sm:col-span-2">
                <label htmlFor={`${id}-message`} className="mono-label text-ink/65">
                  {t.message}
                </label>
                <textarea id={`${id}-message`} rows={3} value={values.message} onChange={set("message")} className={field} />
              </div>
              <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
                <input tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
              </div>
            </div>
            <div className="mt-5">
              <Turnstile siteKey={turnstileSiteKey} onToken={setToken} theme="light" />
              {errors.captcha ? <p className="mt-1 text-sm text-coral">{errors.captcha}</p> : null}
            </div>
            <p className="mt-4 text-sm text-ink/55">{t.consent}</p>
            <div className="mt-6 flex flex-wrap items-center gap-4">
              <button type="submit" disabled={busy} className="mono-label rounded-full bg-coral px-7 py-4 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60">
                {busy ? t.sending : t.submit}
              </button>
              {busy ? <span aria-hidden className="radar inline-block w-10 animate-pulse text-ink/50" /> : null}
            </div>
            {failed ? (
              <p role="alert" className="mt-4 text-coral">
                {t.error}{" "}
                <a href={fallbackWa} target="_blank" rel="noreferrer" className="underline">
                  {t.whatsapp}
                </a>
              </p>
            ) : null}
          </form>
        )}
      </div>
    </dialog>
  );
}
