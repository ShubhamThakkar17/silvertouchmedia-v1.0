"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { ZoneId } from "@/data/regions";
import { ZoneMap } from "@/components/ui/zone-map";

type Row = { slug: string; name: string; regionStrength: Record<ZoneId, number> };

/** Market page: pick a channel, see its strength by zone on the schematic map. */
export function RegionExplorer({ rows, label, title }: { rows: Row[]; label: string; title: string }) {
  const id = useId();
  const [slug, setSlug] = useState(rows[0].slug);
  const row = rows.find((r) => r.slug === slug) ?? rows[0];
  return (
    <div className="grid items-start gap-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <label htmlFor={id} className="mono-label opacity-60">
          {label}
        </label>
        <select id={id} value={slug} onChange={(e) => setSlug(e.target.value)} className="mt-3 w-full rounded-xl border border-ink/15 bg-paper px-4 py-3.5 text-lg">
          {rows.map((r) => (
            <option key={r.slug} value={r.slug}>
              {r.name}
            </option>
          ))}
        </select>
        <Link href={`/channels/${row.slug}`} className="mono-label mt-4 inline-block text-coral hover:underline">
          {row.name} →
        </Link>
      </div>
      <ZoneMap scores={row.regionStrength} title={`${title}: ${row.name}`} />
    </div>
  );
}
