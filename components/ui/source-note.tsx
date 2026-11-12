import { copy } from "@/brand";
import { getSource, type Source, type SourceId } from "@/data/sources";

/** "Pitch Madison Advertising Report 2026, via exchange4media": report first, publisher only when it adds something. */
export function sourceLabel(s: Source) {
  const via = s.publisher.match(/\(via (.+)\)/)?.[1];
  const pub = s.publisher.replace(/\s*\(via .+\)/, "");
  const head = s.report.toLowerCase().includes(pub.toLowerCase()) ? s.report : `${pub}, ${s.report}`;
  const year = s.report.includes(String(s.year)) ? "" : ` (${s.year})`;
  return `${head}${year}${via ? `, via ${via}` : ""}`;
}

/** "Source: …" in small mono. Flags unverified and internal sources honestly. */
export function SourceNote({ id, derived = false, className = "" }: { id: SourceId; derived?: boolean; className?: string }) {
  const s = getSource(id);
  const label = s.internal ? copy.sources.internal : sourceLabel(s);
  return (
    <p className={`mono-label leading-relaxed opacity-60 ${className}`}>
      {copy.sources.label}:{" "}
      {s.url && !s.internal ? (
        <a href={s.url} target="_blank" rel="noreferrer" className="underline decoration-current/40 underline-offset-2 hover:text-coral">
          {label}
        </a>
      ) : (
        label
      )}
      {derived ? ` · ${copy.sources.derived}` : null}
      {!s.verified ? <span className="text-coral"> · {copy.sources.unverified}</span> : null}
    </p>
  );
}
