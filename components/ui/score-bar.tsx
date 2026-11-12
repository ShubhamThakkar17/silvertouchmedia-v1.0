/** A labelled 1–5 (or 0–5) bar. Five segments so values read at a glance and print well. */
export function ScoreBar({ label, value, max = 5, href }: { label: string; value: number; max?: number; href?: string }) {
  const content = (
    <>
      <span className="text-sm">{label}</span>
      <span className="flex gap-1" aria-hidden>
        {Array.from({ length: max }, (_, i) => (
          <span key={i} className={`h-2.5 w-full rounded-full ${i < value ? "bg-coral" : "bg-current/12"}`} />
        ))}
      </span>
      <span className="sr-only">
        {value} of {max}
      </span>
    </>
  );
  const cls = "grid grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)] items-center gap-4 py-2";
  return href ? (
    <a href={href} className={`${cls} rounded transition-colors hover:text-coral`}>
      {content}
    </a>
  ) : (
    <div className={cls}>{content}</div>
  );
}
