"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { Turnstile } from "@/components/forms/turnstile";
import { track } from "@/lib/analytics";
import { ContactLead } from "@/lib/leads/schema";

type FormCopy = {
  name: string;
  company: string;
  phone: string;
  email: string;
  city: string;
  industry: string;
  industryPlaceholder: string;
  budget: string;
  budgetPlaceholder: string;
  message: string;
  submit: string;
  sending: string;
  required: string;
  invalidPhone: string;
  invalidEmail: string;
  success: string;
  error: string;
  privacy: string;
};

const field =
  "mt-2 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 text-lg outline-none transition-colors focus:border-coral aria-[invalid=true]:border-coral";

export function ContactForm({
  copy,
  industries,
  budgets,
  whatsappHref,
  whatsappLabel,
  turnstileSiteKey,
}: {
  copy: FormCopy;
  industries: { id: string; label: string }[];
  budgets: readonly string[];
  whatsappHref: string;
  whatsappLabel: string;
  turnstileSiteKey?: string;
}) {
  const id = useId();
  const [state, setState] = useState<"idle" | "done" | "error">("idle");
  const [token, setToken] = useState<string>();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ContactLead>({ resolver: zodResolver(ContactLead), mode: "onBlur" });

  const msg = (key?: string) => (key ? ((copy as Record<string, string>)[key] ?? copy.required) : undefined);

  const onSubmit = handleSubmit(async (data) => {
    try {
      track("contact_submit", { industry: data.industry || undefined });
      const r = await fetch("/api/lead", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...data, turnstileToken: token }) });
      setState(r.ok ? "done" : "error");
    } catch {
      setState("error");
    }
  });

  if (state === "done") {
    return (
      <div role="status" className="rounded-[var(--brand-radius-card)] bg-ink p-8 text-paper">
        <span aria-hidden className="radar block w-16 text-paper/60" />
        <p className="font-display mt-6 text-3xl font-semibold tracking-tight">{copy.success}</p>
        <a href={whatsappHref} target="_blank" rel="noreferrer" onClick={() => track("whatsapp_click", { from: "contact" })} className="mono-label mt-8 inline-flex rounded-full bg-coral px-6 py-4 text-ink">
          {whatsappLabel}
        </a>
      </div>
    );
  }

  const F = ({ name, label, children, required }: { name: keyof ContactLead; label: string; children: React.ReactNode; required?: boolean }) => (
    <div>
      <label htmlFor={`${id}-${name}`} className="mono-label text-ink/65">
        {label}
        {required ? <span className="text-coral"> *</span> : null}
      </label>
      {children}
      {errors[name] ? (
        <p id={`${id}-${name}-err`} className="mt-1.5 text-sm text-coral">
          {msg(errors[name]?.message)}
        </p>
      ) : null}
    </div>
  );
  const a11y = (name: keyof ContactLead) => ({
    id: `${id}-${name}`,
    "aria-invalid": errors[name] ? true : undefined,
    "aria-describedby": errors[name] ? `${id}-${name}-err` : undefined,
  });

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-5 sm:grid-cols-2">
      {F({ name: "name", label: copy.name, required: true, children: <input {...register("name")} {...a11y("name")} autoComplete="name" className={field} /> })}
      {F({ name: "company", label: copy.company, children: <input {...register("company")} {...a11y("company")} autoComplete="organization" className={field} /> })}
      {F({ name: "phone", label: copy.phone, required: true, children: <input {...register("phone")} {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" className={field} /> })}
      {F({ name: "email", label: copy.email, children: <input {...register("email")} {...a11y("email")} type="email" autoComplete="email" className={field} /> })}
      {F({ name: "city", label: copy.city, children: <input {...register("city")} {...a11y("city")} autoComplete="address-level2" className={field} /> })}
      {F({
        name: "industry",
        label: copy.industry,
        children: (
          <select {...register("industry")} {...a11y("industry")} defaultValue="" className={field}>
            <option value="">{copy.industryPlaceholder}</option>
            {industries.map((i) => (
              <option key={i.id} value={i.id}>
                {i.label}
              </option>
            ))}
          </select>
        ),
      })}
      <div className="sm:col-span-2">
        {F({
          name: "budget",
          label: copy.budget,
          children: (
            <select {...register("budget")} {...a11y("budget")} defaultValue="" className={field}>
              <option value="">{copy.budgetPlaceholder}</option>
              {budgets.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          ),
        })}
      </div>
      <div className="sm:col-span-2">
        {F({ name: "message", label: copy.message, children: <textarea {...register("message")} {...a11y("message")} rows={5} className={field} /> })}
      </div>
      {/* Honeypot, hidden from people and assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Website
          <input {...register("website")} tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <div className="sm:col-span-2">
        <Turnstile siteKey={turnstileSiteKey} onToken={setToken} theme="light" />
      </div>
      <div className="flex flex-wrap items-center gap-5 sm:col-span-2">
        <button type="submit" disabled={isSubmitting} className="mono-label rounded-full bg-coral px-8 py-4 text-ink transition-colors hover:bg-ink hover:text-paper disabled:opacity-60">
          {isSubmitting ? copy.sending : copy.submit}
        </button>
        <p className="text-sm text-ink/65">
          <Link href="/privacy" className="underline underline-offset-2">
            {copy.privacy}
          </Link>
        </p>
      </div>
      {state === "error" ? (
        <p role="alert" className="text-coral sm:col-span-2">
          {copy.error}
        </p>
      ) : null}
    </form>
  );
}
