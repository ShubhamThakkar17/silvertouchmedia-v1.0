/** 1 (weak) to 5 (strongest). */
export type Score = 1 | 2 | 3 | 4 | 5;

/**
 * Turns compact per-channel rows into keyed records, so the matrices in /data stay
 * readable as tables. Throws at import time if a row has the wrong length or a value
 * outside 1–5, which surfaces typos in the build and in tests.
 */
export function rowsToRecord<K extends string>(
  keys: readonly K[],
  rows: Record<string, readonly number[]>,
): Record<string, Record<K, Score>> {
  const out: Record<string, Record<K, Score>> = {};
  for (const [slug, row] of Object.entries(rows)) {
    if (row.length !== keys.length) {
      throw new Error(`Matrix row "${slug}" has ${row.length} values, expected ${keys.length}`);
    }
    const rec = {} as Record<K, Score>;
    keys.forEach((k, i) => {
      const v = row[i];
      if (!Number.isInteger(v) || v < 1 || v > 5) throw new Error(`Matrix "${slug}.${k}" = ${v}, expected 1–5`);
      rec[k] = v as Score;
    });
    out[slug] = rec;
  }
  return out;
}
