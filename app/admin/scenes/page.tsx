import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SceneCanvas } from "@/components/hero/motion/scene-canvas";
import { adminAllowed } from "@/lib/admin";
import { loadChannels } from "@/lib/content/load-channels";

export const metadata: Metadata = { title: "Hero scenes", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Review sheet for the 18 hero motion graphics. Dev and Vercel previews only. */
export default function ScenesPage() {
  if (!adminAllowed()) notFound();
  const channels = loadChannels();
  return (
    <div className="bg-ink px-4 pb-24 pt-28 text-paper md:px-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight">Hero scenes</h1>
      <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {channels.map((c, i) => (
          <li key={c.slug}>
            <p className="mono-label mb-2 text-paper/70">
              ({String(c.order).padStart(2, "0")}) {c.name}
            </p>
            <div className="aspect-[3/2] overflow-hidden rounded-[10px]">
              <SceneCanvas slug={c.slug} seed={i} />
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
