import * as THREE from "three";
import { RIBBON } from "./ribbon-config";
import type { HeroCard } from "./ribbon-store";

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

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

/**
 * One canvas per card: mono label strip on top (white text on transparent),
 * photo cover-fitted below. Rounded corners and tinting happen in the shader.
 */
export async function buildCardTexture(card: HeroCard, total: number): Promise<THREE.CanvasTexture> {
  const W = RIBBON.textureWidth;
  const totalH = RIBBON.photoH + RIBBON.labelH;
  const H = Math.round((W * totalH) / RIBBON.cardW);
  const labelPx = Math.round((H * RIBBON.labelH) / totalH);
  const photoPx = H - labelPx;

  const [img, family] = await Promise.all([loadImage(card.cardImage), getMonoFamily()]);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // Photo, cover fit
  const scale = Math.max(W / img.width, photoPx / img.height);
  const dw = img.width * scale;
  const dh = img.height * scale;
  ctx.drawImage(img, (W - dw) / 2, labelPx + (photoPx - dh) / 2, dw, dh);

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
  tex.anisotropy = 8;
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.needsUpdate = true;
  return tex;
}
