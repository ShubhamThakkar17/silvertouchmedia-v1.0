"use client";

import type { ReactNode } from "react";

type Opt<T extends string> = { id: T; label: ReactNode; disabled?: boolean };

/** Toggle buttons as a labelled group. Single select uses aria-pressed on one item. */
export function Chips<T extends string>({
  label,
  options,
  value,
  onChange,
  multiple = false,
  size = "md",
}: {
  label: string;
  options: Opt<T>[];
  value: T[];
  onChange: (next: T[]) => void;
  multiple?: boolean;
  size?: "sm" | "md";
}) {
  const toggle = (id: T) => {
    if (!multiple) return onChange([id]);
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  };
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o.id);
        return (
          <button
            key={o.id}
            type="button"
            aria-pressed={on}
            disabled={o.disabled}
            onClick={() => toggle(o.id)}
            className={`rounded-full border transition-colors disabled:opacity-35 ${size === "sm" ? "px-3 py-1.5 text-sm" : "px-4 py-2.5"} ${
              on ? "border-coral bg-coral text-ink" : "border-current/20 hover:border-coral"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export function Field({ label, hint, children, id }: { label: string; hint?: string; children: ReactNode; id?: string }) {
  return (
    <div>
      {id ? (
        <label htmlFor={id} className="mono-label opacity-65">
          {label}
        </label>
      ) : (
        <p className="mono-label opacity-65">{label}</p>
      )}
      {hint ? <p className="mt-1 text-sm opacity-70">{hint}</p> : null}
      <div className="mt-3">{children}</div>
    </div>
  );
}
