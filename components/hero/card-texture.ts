import * as THREE from "three";
import { RIBBON } from "./ribbon-config";
import { drawScene, type Palette } from "./motion/scenes";
import type { HeroCard } from "./ribbon-store";

let monoFamily: string | null = null;
async function getMonoFamily() {
  if (monoFamily) return monoFamily;
  const v = getComputedStyle(document.documentElement).getPropertyValue("--nf-mono").trim();
  monoFamily = v || "ui-monospace, Menlo, monospace";
  try {
    await document.fonts.load(`500 22px ${monoFamily}`);
  } catch {
    /* fall back silently */
  }
  return monoFamily;
}

export type CardSurface = {
  texture: THREE.CanvasTexture;
  /** Redraws the motion-graphic area for time t (seconds) and flags the texture for upload. */
  draw: (t: number) => void;
};

/**
 * One canvas per card: mono label strip on top (drawn once, white on transparent) and the
 * channel's motion-graphic scene below (redrawn while visible). Rounded corners, RGB split
 * and label tint happen in the shader.
 */
export async function buildCardSurface(card: HeroCard, total: number, palette: Palette): Promise<CardSurface> {
  const W = RIBBON.textureWidth;
  const totalH = RIBBON.photoH + RIBBON.labelH;
  const H = Math.round((W * totalH) / RIBBON.cardW);
  const labelPx = Math.round((H * RIBBON.labelH) / totalH);
  const photoPx = H - labelPx;

  const family = await getMonoFamily();
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Label
  const pad = String(total).length;
  const left = `(${String(card.order).padStart(Math.max(2, pad), "0")}) ${card.name}`.toUpperCase();
  const right = card.ribbonStat.toUpperCase();
  ctx.fillStyle = "#ffffff";
  ctx.textBaseline = "middle";
  const size = Math.round(labelPx * 0.42);
  ctx.font = `500 ${size}px ${family}`;
  if ("letterSpacing" in ctx) (ctx as CanvasRenderingContext2D & { letterSpacing: string }).letterSpacing = `${(size * 0.1).toFixed(1)}px`;
  const y = labelPx * 0.45;
  ctx.textAlign = "left";
  ctx.fillText(left, 2, y, W * 0.66);
  ctx.textAlign = "right";
  ctx.globalAlpha = 0.7;
  ctx.fillText(right, W - 4, y, W * 0.32);
  ctx.globalAlpha = 1;

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  // Frequent uploads: skip mipmaps, keep it crisp with linear filtering + anisotropy.
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  tex.anisotropy = 4;

  const draw = (t: number) => {
    drawScene(ctx, card.slug, t, palette, 0, labelPx, W, photoPx);
    tex.needsUpdate = true;
  };
  draw(1.2 + card.order * 0.37); // a staggered first frame so cards are not in lockstep
  return { texture: tex, draw };
}
