/** Tuning knobs for the hero ribbon (world units unless noted). Brand-agnostic. */
export const RIBBON = {
  cardW: 2.05,
  photoH: 1.37, // 3:2 photos
  labelH: 0.22, // mono label strip above each photo
  gap: 0.3,
  radius: 5.6, // cylinder radius (viewer is inside the cylinder)
  curl: 0.3, // extra bend toward the edges (0 = pure cylinder)
  yOffset: 0.5, // lift the ribbon above the headline block
  cornerRadius: 0.05, // in photo-height units (shader)
  camZ: 8.4,
  fov: 44,
  driftPerSec: 0.32, // auto drift
  wheelGain: 0.0055,
  maxVelocity: 26,
  damping: 2.6, // per second, exponential
  hoverStraighten: 0.55,
  textureWidth: 800,
  maxTheta: 1.85, // radians; cards beyond this are hidden
} as const;

export const spacing = RIBBON.cardW + RIBBON.gap;

/** Angle on the cylinder for an arc-length position s, with extra curl at the edges. */
export function thetaOf(s: number) {
  const t = s / RIBBON.radius;
  return t * (1 + RIBBON.curl * t * t);
}

/** World position of a card-local point, mirroring the vertex shader. */
export function bendPoint(cardX: number, localX: number, localY: number, straighten: number) {
  const R = RIBBON.radius;
  const th = Math.max(-2.2, Math.min(2.2, thetaOf(cardX + localX)));
  const bx = R * Math.sin(th);
  const bz = R * (1 - Math.cos(th));
  const thc = thetaOf(cardX);
  const fx = R * Math.sin(thc) + Math.cos(thc) * localX;
  const fz = R * (1 - Math.cos(thc)) + Math.sin(thc) * localX;
  return {
    x: bx + (fx - bx) * straighten,
    y: localY + RIBBON.yOffset,
    z: bz + (fz - bz) * straighten,
  };
}

export const wrap = (x: number, len: number) => ((((x + len / 2) % len) + len) % len) - len / 2;
