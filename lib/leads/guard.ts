import "server-only";

/**
 * Abuse protection for lead endpoints: Cloudflare Turnstile + IP rate limit.
 * Both degrade gracefully: without TURNSTILE_SECRET the check is skipped (local/dev),
 * without Upstash env the limiter is in-memory (per server instance).
 */

export async function verifyTurnstile(token: string | undefined, ip: string): Promise<{ ok: boolean; skipped?: boolean }> {
  const secret = process.env.TURNSTILE_SECRET;
  if (!secret) return { ok: true, skipped: true };
  if (!token) return { ok: false };
  try {
    const body = new URLSearchParams({ secret, response: token, remoteip: ip });
    const r = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", { method: "POST", body, signal: AbortSignal.timeout(8000) });
    const j = (await r.json()) as { success?: boolean };
    return { ok: !!j.success };
  } catch {
    return { ok: false };
  }
}

const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 5;
const memory = new Map<string, number[]>();

/** Returns true when the request is allowed. */
export async function rateLimit(key: string): Promise<boolean> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (url && token) {
    try {
      const k = `rl:${key}`;
      const r = await fetch(`${url}/pipeline`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "content-type": "application/json" },
        body: JSON.stringify([
          ["INCR", k],
          ["EXPIRE", k, String(WINDOW_MS / 1000), "NX"],
        ]),
        signal: AbortSignal.timeout(3000),
      });
      const [incr] = (await r.json()) as { result: number }[];
      return incr.result <= MAX_HITS;
    } catch {
      /* fall through to memory */
    }
  }
  const now = Date.now();
  const hits = (memory.get(key) ?? []).filter((t) => now - t < WINDOW_MS);
  hits.push(now);
  memory.set(key, hits);
  if (memory.size > 5000) memory.clear();
  return hits.length <= MAX_HITS;
}

export function clientIp(req: Request): string {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
}
