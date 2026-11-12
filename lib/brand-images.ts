import manifest from "@/data/generated/brand-images.json";

type Entry = { file: string; width: number; height: number; blurDataURL: string };
const images = manifest as Record<string, Entry>;

/** Look up a processed brand image by key, or by its public path. */
export function brandImage(keyOrPath: string): { src: string; blurDataURL?: string; width?: number; height?: number } {
  const byKey = images[keyOrPath];
  if (byKey) return { src: byKey.file, blurDataURL: byKey.blurDataURL, width: byKey.width, height: byKey.height };
  const hit = Object.values(images).find((e) => e.file === keyOrPath);
  return hit ? { src: hit.file, blurDataURL: hit.blurDataURL, width: hit.width, height: hit.height } : { src: keyOrPath };
}
