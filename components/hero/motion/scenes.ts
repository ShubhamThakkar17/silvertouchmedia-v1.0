/**
 * Hero motion graphics: one animated, code-drawn scene per channel, in the brand palette.
 * Drawn with Canvas 2D in a 600×400 design space, cover-fitted to any canvas size, so the
 * same scene feeds the WebGL ribbon (as a texture) and the CSS fallback cards.
 *
 * Style rules (keep every scene uniform): ink panel + coral/indigo glow + dot grid,
 * silver line art, coral for the media surface, mint as the only secondary accent.
 * Keep key content inside x 70–530 so 4:3 crops still read.
 */
export type Palette = { coral: string; ink: string; ink2: string; paper: string; silver: string; mint: string; indigo: string };
type Ctx = CanvasRenderingContext2D;
type Scene = (g: Ctx, t: number, c: Palette) => void;

export const DESIGN_W = 600;
export const DESIGN_H = 400;
const TAU = Math.PI * 2;

// ---------- helpers ----------
const rnd = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const ease = (x: number) => 0.5 - 0.5 * Math.cos(Math.PI * Math.min(1, Math.max(0, x)));
const loop = (t: number, period: number) => (t % period) / period;

function rr(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.roundRect(x, y, w, h, r);
}
function stroke(g: Ctx, color: string, width = 2, alpha = 1) {
  g.globalAlpha = alpha;
  g.strokeStyle = color;
  g.lineWidth = width;
  g.stroke();
  g.globalAlpha = 1;
}
function fill(g: Ctx, color: string, alpha = 1) {
  g.globalAlpha = alpha;
  g.fillStyle = color;
  g.fill();
  g.globalAlpha = 1;
}
function circle(g: Ctx, x: number, y: number, r: number) {
  g.beginPath();
  g.arc(x, y, Math.max(0, r), 0, TAU);
}
function line(g: Ctx, x1: number, y1: number, x2: number, y2: number) {
  g.beginPath();
  g.moveTo(x1, y1);
  g.lineTo(x2, y2);
}
function glow(g: Ctx, x: number, y: number, r: number, color: string, alpha: number) {
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color);
  gr.addColorStop(1, "transparent");
  g.globalAlpha = alpha;
  g.fillStyle = gr;
  g.fillRect(x - r, y - r, r * 2, r * 2);
  g.globalAlpha = 1;
}
/** Text-like bars (no real text, per the image style rules). */
function bars(g: Ctx, x: number, y: number, w: number, rows: number, gap: number, color: string, alpha: number, seed = 0) {
  for (let i = 0; i < rows; i++) {
    rr(g, x, y + i * gap, w * (0.55 + rnd(seed + i) * 0.45), gap * 0.42, 2);
    fill(g, color, alpha);
  }
}
function people(g: Ctx, n: number, y: number, t: number, speed: number, c: Palette, seed = 0) {
  for (let i = 0; i < n; i++) {
    const x = ((rnd(seed + i) * 700 + t * speed * (0.6 + rnd(seed + i + 9))) % 700) - 50;
    const h = 22 + rnd(seed + i + 3) * 10;
    circle(g, x, y - h - 5, 5);
    fill(g, c.silver, 0.55);
    rr(g, x - 5, y - h, 10, h, 4);
    fill(g, c.silver, 0.4);
  }
}

// ---------- background (cached per palette) ----------
const bgCache = new Map<string, HTMLCanvasElement>();
function background(c: Palette, glowX: number, glowY: number): HTMLCanvasElement {
  const key = `${c.ink2}${glowX}${glowY}`;
  const hit = bgCache.get(key);
  if (hit) return hit;
  const cv = document.createElement("canvas");
  cv.width = DESIGN_W;
  cv.height = DESIGN_H;
  const g = cv.getContext("2d")!;
  g.fillStyle = c.ink2;
  g.fillRect(0, 0, DESIGN_W, DESIGN_H);
  glow(g, glowX, glowY, 380, c.coral, 0.32);
  glow(g, 560, -40, 360, c.indigo, 0.75);
  glow(g, 40, 420, 300, c.ink, 0.6);
  g.fillStyle = c.paper;
  g.globalAlpha = 0.07;
  for (let x = 12; x < DESIGN_W; x += 24) for (let y = 12; y < DESIGN_H; y += 24) g.fillRect(x, y, 1.6, 1.6);
  g.globalAlpha = 1;
  bgCache.set(key, cv);
  return cv;
}

// ---------- scenes ----------
const print: Scene = (g, t, c) => {
  g.save();
  g.translate(300, 215);
  g.rotate(-0.06);
  rr(g, -190, -130, 240, 270, 6);
  fill(g, c.paper, 0.92);
  bars(g, -170, -105, 200, 4, 14, c.ink, 0.25, 1);
  rr(g, -170, -40, 200, 90, 4);
  fill(g, c.coral, 0.6 + 0.4 * (0.5 + 0.5 * Math.sin(t * 2)));
  bars(g, -170, 64, 200, 4, 14, c.ink, 0.22, 7);
  g.restore();
  // incoming sheet
  const p = ease(loop(t, 3.6) * 1.6);
  const x = 560 - p * 260;
  g.save();
  g.translate(x, 205);
  g.rotate(0.08 - p * 0.05);
  rr(g, -110, -135, 230, 270, 6);
  fill(g, c.paper, 0.97);
  bars(g, -92, -112, 190, 6, 14, c.ink, 0.22, 3);
  circle(g, 50, 40, 46);
  fill(g, c.coral, 0.9);
  bars(g, -92, 100, 190, 2, 14, c.ink, 0.22, 11);
  g.restore();
};

const tv: Scene = (g, t, c) => {
  rr(g, 110, 70, 380, 230, 14);
  fill(g, c.ink, 1);
  stroke(g, c.silver, 3, 0.7);
  g.save();
  rr(g, 124, 84, 352, 202, 8);
  g.clip();
  for (let k = 0; k < 3; k++) {
    g.beginPath();
    for (let x = 120; x <= 480; x += 6) {
      const y = 200 + Math.sin(x / 48 + t * 1.6 + k) * (34 - k * 8) + Math.sin(x / 19 - t * 2) * 6 + k * 18;
      if (x === 120) g.moveTo(x, y);
      else g.lineTo(x, y);
    }
    g.lineTo(480, 300);
    g.lineTo(120, 300);
    g.closePath();
    fill(g, k === 0 ? c.coral : k === 1 ? c.paper : c.mint, k === 0 ? 0.95 : 0.25);
  }
  for (let y = 84; y < 286; y += 4) {
    g.fillStyle = c.ink;
    g.globalAlpha = 0.12;
    g.fillRect(124, y + ((t * 30) % 4), 352, 1);
  }
  g.globalAlpha = 1;
  g.restore();
  circle(g, 146, 104, 5);
  fill(g, c.coral, 0.5 + 0.5 * Math.sin(t * 5));
  line(g, 300, 300, 300, 330);
  stroke(g, c.silver, 3, 0.7);
  line(g, 240, 332, 360, 332);
  stroke(g, c.silver, 3, 0.7);
};

const radio: Scene = (g, t, c) => {
  for (let i = 0; i < 4; i++) {
    const p = loop(t + i * 0.55, 2.2);
    circle(g, 220, 160, 40 + p * 190);
    stroke(g, c.coral, 2, (1 - p) * 0.8);
  }
  rr(g, 196, 110, 48, 100, 24);
  fill(g, c.silver, 0.9);
  for (let y = 124; y < 200; y += 10) {
    line(g, 202, y, 238, y);
    stroke(g, c.ink, 1.5, 0.35);
  }
  g.beginPath();
  g.arc(220, 190, 40, 0, Math.PI);
  stroke(g, c.silver, 3, 0.8);
  line(g, 220, 230, 220, 300);
  stroke(g, c.silver, 3, 0.8);
  line(g, 180, 300, 260, 300);
  stroke(g, c.silver, 3, 0.8);
  for (let i = 0; i < 12; i++) {
    const h = 20 + Math.abs(Math.sin(t * 3 + i * 0.7) * Math.cos(t * 1.3 + i)) * 130;
    rr(g, 320 + i * 17, 300 - h, 10, h, 4);
    fill(g, i % 4 === 0 ? c.mint : c.coral, 0.85);
  }
};

const cinema: Scene = (g, t, c) => {
  g.beginPath();
  g.moveTo(300, 380);
  g.lineTo(130, 70);
  g.lineTo(470, 70);
  g.closePath();
  const beam = g.createLinearGradient(300, 380, 300, 70);
  beam.addColorStop(0, "rgba(255,255,255,0.0)");
  beam.addColorStop(1, "rgba(255,255,255,0.16)");
  g.fillStyle = beam;
  g.globalAlpha = 0.8 + 0.2 * Math.sin(t * 13) * Math.sin(t * 7);
  g.fill();
  g.globalAlpha = 1;
  rr(g, 120, 50, 360, 150, 6);
  const scr = g.createLinearGradient(120, 50, 480, 200);
  scr.addColorStop(0, c.indigo);
  scr.addColorStop(1, c.ink);
  g.fillStyle = scr;
  g.fill();
  g.save();
  rr(g, 120, 50, 360, 150, 6);
  g.clip();
  g.beginPath();
  g.moveTo(120, 200);
  for (let x = 120; x <= 480; x += 6) g.lineTo(x, 150 + Math.sin(x / 40 + t * 1.2) * 26 + Math.sin(x / 13 - t) * 4);
  g.lineTo(480, 200);
  g.closePath();
  fill(g, c.coral, 0.95);
  glow(g, 120 + loop(t, 6) * 360, 110, 120, c.coral, 0.5);
  circle(g, 300 + Math.sin(t * 0.8) * 110, 100, 26);
  fill(g, c.paper, 0.9);
  g.restore();
  stroke(g, c.silver, 2, 0.5);
  for (let row = 0; row < 3; row++) {
    for (let i = 0; i < 9 - row; i++) {
      const x = 90 + row * 22 + i * 52;
      const y = 280 + row * 40;
      rr(g, x, y, 44, 40, 10);
      fill(g, c.ink, 0.95);
      stroke(g, c.silver, 1, 0.15);
    }
  }
};

const hoardings: Scene = (g, t, c) => {
  g.beginPath();
  g.moveTo(250, 230);
  g.lineTo(350, 230);
  g.lineTo(600, 400);
  g.lineTo(0, 400);
  g.closePath();
  fill(g, c.ink, 0.9);
  for (let i = 0; i < 6; i++) {
    const p = (loop(t, 1.4) + i / 6) % 1;
    const y = 232 + p * p * 170;
    const w = 2 + p * 6;
    line(g, 300, y, 300, y + 4 + p * 22);
    stroke(g, c.silver, w, 0.6);
  }
  for (let i = 0; i < 5; i++) {
    const p = (loop(t, 2.2) + i / 5) % 1;
    const y = 232 + p * p * 170;
    const xL = 275 - p * p * 210;
    const xR = 325 + p * p * 210;
    circle(g, xL, y, 1 + p * 4);
    fill(g, c.coral, 0.9);
    circle(g, xR, y, 1 + p * 4);
    fill(g, c.paper, 0.9);
  }
  line(g, 190, 230, 190, 160);
  stroke(g, c.silver, 6, 0.8);
  rr(g, 80, 60, 230, 110, 4);
  fill(g, c.coral, 1);
  stroke(g, c.silver, 3, 0.8);
  circle(g, 250, 115, 30);
  fill(g, c.paper, 0.9);
  bars(g, 100, 82, 120, 3, 18, c.ink, 0.35, 5);
  for (let i = 0; i < 4; i++) {
    glow(g, 105 + i * 60, 58, 26, c.paper, 0.35 + 0.1 * Math.sin(t * 4 + i));
  }
};

const dooh: Scene = (g, t, c) => {
  line(g, 0, 330, 600, 330);
  stroke(g, c.silver, 1.5, 0.3);
  people(g, 7, 330, t, 40, c, 3);
  rr(g, 228, 40, 144, 270, 12);
  fill(g, c.ink, 1);
  stroke(g, c.silver, 3, 0.75);
  g.save();
  rr(g, 238, 50, 124, 250, 6);
  g.clip();
  const slide = Math.floor(t / 2.4) % 3;
  const p = ease(loop(t, 2.4) * 4);
  g.translate(0, (1 - p) * 40);
  g.globalAlpha = p;
  if (slide === 0) {
    circle(g, 300, 150, 52 + Math.sin(t * 2) * 6);
    fill(g, c.coral);
    bars(g, 256, 230, 90, 3, 16, c.paper, 0.6, 2);
  } else if (slide === 1) {
    for (let i = 0; i < 5; i++) {
      rr(g, 252 + i * 20, 250 - (40 + i * 26), 14, 40 + i * 26, 3);
      fill(g, i === 4 ? c.coral : c.mint, 0.9);
    }
  } else {
    g.beginPath();
    g.moveTo(238, 300);
    for (let x = 238; x <= 362; x += 4) g.lineTo(x, 170 + Math.sin(x / 18 + t * 3) * 26);
    g.lineTo(362, 300);
    g.closePath();
    fill(g, c.coral);
  }
  g.restore();
  g.globalAlpha = 1;
  glow(g, 300, 175, 170, c.coral, 0.18);
};

function bus(g: Ctx, x: number, y: number, t: number, c: Palette) {
  rr(g, x, y, 250, 86, 14);
  fill(g, c.paper, 0.95);
  rr(g, x, y + 46, 250, 18, 0);
  fill(g, c.coral);
  for (let i = 0; i < 6; i++) {
    rr(g, x + 14 + i * 38, y + 12, 30, 26, 4);
    fill(g, c.ink, 0.85);
  }
  for (const wx of [x + 50, x + 200]) wheel(g, wx, y + 88, 16, t, c);
}
function wheel(g: Ctx, x: number, y: number, r: number, t: number, c: Palette) {
  circle(g, x, y, r);
  fill(g, c.ink);
  stroke(g, c.silver, 3, 0.8);
  for (let k = 0; k < 3; k++) {
    const a = -t * 8 + (k * TAU) / 3;
    line(g, x, y, x + Math.cos(a) * r * 0.7, y + Math.sin(a) * r * 0.7);
    stroke(g, c.silver, 2, 0.6);
  }
}
const busAuto: Scene = (g, t, c) => {
  for (let i = 0; i < 8; i++) {
    const w = 40 + rnd(i) * 50;
    const h = 60 + rnd(i + 4) * 110;
    const x = ((i * 90 - t * 14) % 720 + 720) % 720 - 60;
    rr(g, x, 300 - h, w, h, 3);
    fill(g, c.silver, 0.08);
  }
  line(g, 0, 302, 600, 302);
  stroke(g, c.silver, 2, 0.4);
  for (let i = 0; i < 10; i++) {
    const x = ((i * 80 - t * 160) % 800 + 800) % 800 - 100;
    line(g, x, 340, x + 40, 340);
    stroke(g, c.silver, 3, 0.4);
  }
  // Vehicles stay in frame and bob gently; the road and city scroll past to show speed.
  bus(g, 270 + Math.sin(t * 0.45) * 26, 196 + Math.sin(t * 9) * 0.8, t, c);
  // auto-rickshaw
  const ax = 92 + Math.sin(t * 0.55 + 1.3) * 22;
  g.beginPath();
  g.moveTo(ax, 290);
  g.lineTo(ax + 6, 238);
  g.quadraticCurveTo(ax + 50, 214, ax + 120, 236);
  g.lineTo(ax + 124, 290);
  g.closePath();
  fill(g, c.coral);
  rr(g, ax + 4, 262, 120, 30, 6);
  fill(g, c.ink, 0.9);
  wheel(g, ax + 24, 296, 12, t, c);
  wheel(g, ax + 104, 296, 12, t, c);
};

const metroWraps: Scene = (g, t, c) => {
  for (let i = 0; i < 12; i++) {
    const w = 30 + rnd(i + 2) * 40;
    const h = 50 + rnd(i + 7) * 130;
    rr(g, i * 52, 250 - h, w, h, 2);
    fill(g, c.silver, 0.07);
    if (rnd(i) > 0.5) {
      circle(g, i * 52 + w / 2, 250 - h - 6, 2);
      fill(g, c.coral, 0.5 + 0.5 * Math.sin(t * 3 + i));
    }
  }
  rr(g, 0, 262, 600, 16, 0);
  fill(g, c.silver, 0.5);
  for (let i = 0; i < 6; i++) {
    rr(g, 30 + i * 110, 278, 20, 122, 2);
    fill(g, c.silver, 0.3);
  }
  const x = ((t * 90) % 1100) - 520;
  for (let k = 0; k < 3; k++) {
    const cx = x + k * 182;
    rr(g, cx, 196, 176, 64, 18);
    fill(g, c.paper, 0.96);
    g.save();
    rr(g, cx, 196, 176, 64, 18);
    g.clip();
    g.beginPath();
    g.moveTo(cx, 260);
    g.bezierCurveTo(cx + 60, 200, cx + 110, 270, cx + 176, 206);
    g.lineTo(cx + 176, 260);
    g.closePath();
    fill(g, c.coral);
    g.restore();
    for (let w = 0; w < 4; w++) {
      rr(g, cx + 16 + w * 40, 206, 30, 18, 4);
      fill(g, c.ink, 0.8);
    }
  }
};

const insideMetro: Scene = (g, t, c) => {
  g.beginPath();
  g.moveTo(0, 300);
  g.lineTo(600, 300);
  g.lineTo(600, 400);
  g.lineTo(0, 400);
  g.closePath();
  fill(g, c.silver, 0.12);
  line(g, 0, 300, 600, 300);
  stroke(g, c.coral, 3, 0.8);
  rr(g, 70, 60, 460, 210, 10);
  fill(g, c.ink, 0.85);
  stroke(g, c.silver, 2, 0.4);
  const open = ease((Math.sin(t * 1.4) + 1) / 2);
  const gap = open * 60;
  rr(g, 300 - 90 - gap, 80, 90, 190, 4);
  fill(g, c.paper, 0.9);
  rr(g, 300 + gap, 80, 90, 190, 4);
  fill(g, c.paper, 0.9);
  rr(g, 300 - 76 - gap, 96, 62, 70, 4);
  fill(g, c.coral, 0.85);
  rr(g, 314 + gap, 96, 62, 70, 4);
  fill(g, c.coral, 0.85);
  glow(g, 300, 180, 70 * open + 1, c.mint, 0.35);
  for (const px of [40, 560]) {
    rr(g, px - 18, 40, 36, 260, 4);
    fill(g, c.silver, 0.35);
    rr(g, px - 18, 120, 36, 90, 2);
    fill(g, c.coral, 0.9);
  }
  people(g, 6, 360, t, 30, c, 11);
};

const railways: Scene = (g, t, c) => {
  glow(g, 470, 150, 200, c.coral, 0.5);
  circle(g, 470, 150, 44);
  fill(g, c.coral, 0.95);
  line(g, 0, 245, 600, 245);
  stroke(g, c.silver, 1, 0.25);
  for (let i = 0; i < 9; i++) {
    const x = ((i * 90 - t * 120) % 810 + 810) % 810 - 60;
    line(g, x, 160, x, 300);
    stroke(g, c.silver, 3, 0.35);
    line(g, x - 14, 170, x + 14, 170);
    stroke(g, c.silver, 2, 0.35);
  }
  line(g, 0, 312, 600, 312);
  stroke(g, c.silver, 3, 0.6);
  for (let i = 0; i < 20; i++) {
    const x = ((i * 34 - t * 260) % 680 + 680) % 680 - 40;
    line(g, x, 312, x - 8, 326);
    stroke(g, c.silver, 2, 0.35);
  }
  const x = 40 + Math.sin(t * 0.6) * 20;
  for (let k = 0; k < 4; k++) {
    const cx = x + k * 132;
    rr(g, cx, 236, 126, 70, k === 0 ? 30 : 10);
    fill(g, c.paper, 0.95);
    rr(g, cx, 278, 126, 14, 0);
    fill(g, c.coral);
    for (let w = 0; w < 4; w++) {
      rr(g, cx + 12 + w * 28, 248, 20, 18, 3);
      fill(g, c.ink, 0.8);
    }
  }
};

const airport: Scene = (g, t, c) => {
  rr(g, 70, 50, 300, 190, 10);
  fill(g, c.ink, 0.95);
  stroke(g, c.silver, 2, 0.5);
  for (let r = 0; r < 6; r++) {
    for (let k = 0; k < 8; k++) {
      const flip = Math.floor(t * 2 + r * 0.7 + k * 0.13) % 5;
      rr(g, 88 + k * 22, 68 + r * 27, 18, 20, 2);
      fill(g, c.paper, 0.15 + (flip === k % 5 ? 0.5 : 0.15));
    }
    rr(g, 274, 70 + r * 27, 80, 16, 3);
    fill(g, r === Math.floor(t) % 6 ? c.coral : c.mint, 0.75);
  }
  const p = loop(t, 5);
  const px = 160 + p * 420;
  const py = 360 - p * p * 260;
  g.save();
  g.translate(px, py);
  g.rotate(-0.25 - p * 0.35);
  rr(g, -46, -8, 92, 16, 8);
  fill(g, c.paper);
  g.beginPath();
  g.moveTo(-6, 0);
  g.lineTo(-26, 34);
  g.lineTo(-4, 34);
  g.lineTo(18, 0);
  fill(g, c.coral);
  g.beginPath();
  g.moveTo(-40, 0);
  g.lineTo(-52, -20);
  g.lineTo(-40, -20);
  g.lineTo(-28, 0);
  fill(g, c.coral);
  g.restore();
  for (let i = 0; i < 12; i++) {
    circle(g, 40 + i * 48, 372, 3);
    fill(g, i % 2 ? c.coral : c.paper, 0.4 + 0.6 * ((Math.sin(t * 6 - i * 0.6) + 1) / 2));
  }
};

const airline: Scene = (g, t, c) => {
  for (let side = -1; side <= 1; side += 2) {
    for (let w = 0; w < 4; w++) {
      const d = w / 4;
      const x = 300 + side * (280 - d * 190);
      const y = 120 + d * 40;
      const h = 70 - d * 40;
      rr(g, x - 12 * (1 - d), y, 24 * (1 - d) + 4, h, 8);
      fill(g, c.paper, 0.18);
      const s = (loop(t, 3) + w * 0.3) % 1;
      glow(g, x, y + h / 2, 40 * (1 - d) + 8, c.paper, 0.25 * (1 - s));
    }
  }
  for (let r = 3; r >= 0; r--) {
    const d = r / 4;
    const sc = 1 - d * 0.7;
    const y = 360 - r * 50;
    for (let side = -1; side <= 1; side += 2) {
      for (let k = 0; k < 3; k++) {
        const x = 300 + side * (40 * sc + k * 64 * sc + 32 * sc);
        rr(g, x - 28 * sc, y - 90 * sc, 56 * sc, 110 * sc, 14 * sc);
        fill(g, c.silver, 0.25 + 0.4 * sc);
        rr(g, x - 24 * sc, y - 86 * sc, 48 * sc, 30 * sc, 10 * sc);
        fill(g, c.coral, 0.6 + 0.4 * sc);
      }
    }
  }
  line(g, 300, 400, 300, 110);
  stroke(g, c.coral, 2, 0.25 + 0.15 * Math.sin(t * 2));
};

const cricket: Scene = (g, t, c) => {
  g.save();
  g.translate(300, 230);
  g.beginPath();
  g.ellipse(0, 0, 280, 130, 0, 0, TAU);
  fill(g, c.ink, 0.9);
  for (let i = 0; i < 160; i++) {
    const a = rnd(i) * TAU;
    const rr2 = 0.82 + rnd(i + 50) * 0.17;
    circle(g, Math.cos(a) * 280 * rr2, Math.sin(a) * 130 * rr2, 1.6);
    fill(g, rnd(i + 99) > 0.8 ? c.coral : c.paper, 0.25 + 0.5 * ((Math.sin(t * 4 + i) + 1) / 2));
  }
  g.beginPath();
  g.ellipse(0, 0, 200, 86, 0, 0, TAU);
  fill(g, c.mint, 0.22);
  // LED boundary
  const segs = 48;
  for (let i = 0; i < segs; i++) {
    const a0 = (i / segs) * TAU;
    const lit = (Math.floor(i - t * 14) % 6 + 6) % 6 < 3;
    g.beginPath();
    g.ellipse(0, 0, 214, 95, 0, a0, a0 + TAU / segs - 0.02);
    stroke(g, lit ? c.coral : c.paper, 6, lit ? 0.95 : 0.25);
  }
  rr(g, -10, -34, 20, 68, 3);
  fill(g, c.paper, 0.45);
  const p = loop(t, 2.6);
  const bx = -150 + p * 300;
  const by = -20 - Math.sin(p * Math.PI) * 120;
  circle(g, bx, by, 5);
  fill(g, c.paper);
  g.restore();
  for (const [x, y] of [
    [60, 70],
    [540, 70],
  ]) {
    line(g, x, y, x, y + 120);
    stroke(g, c.silver, 4, 0.6);
    rr(g, x - 22, y - 16, 44, 18, 3);
    fill(g, c.paper, 0.85 + 0.15 * Math.sin(t * 9 + x));
    g.beginPath();
    g.moveTo(x - 20, y);
    g.lineTo(300 - (x < 300 ? 60 : -60), 260);
    g.lineTo(300 + (x < 300 ? 60 : -60), 220);
    g.lineTo(x + 20, y);
    g.closePath();
    fill(g, c.paper, 0.05);
  }
};

const ambassadors: Scene = (g, t, c) => {
  circle(g, 300, 210, 150);
  fill(g, c.coral, 0.85);
  g.beginPath();
  g.moveTo(260, 0);
  g.lineTo(340, 0);
  g.lineTo(420, 400);
  g.lineTo(180, 400);
  g.closePath();
  fill(g, c.paper, 0.08);
  circle(g, 300, 160, 38);
  fill(g, c.ink);
  g.beginPath();
  g.moveTo(220, 330);
  g.quadraticCurveTo(300, 190, 380, 330);
  g.closePath();
  fill(g, c.ink);
  rr(g, 150, 340, 300, 12, 6);
  fill(g, c.coral, 0.9);
  for (let i = 0; i < 6; i++) {
    const p = loop(t + rnd(i) * 3, 1.8 + rnd(i + 5));
    if (p > 0.35) continue;
    const x = 70 + rnd(i * 3 + Math.floor(t / 2)) * 460;
    const y = 60 + rnd(i * 7 + Math.floor(t / 2)) * 200;
    glow(g, x, y, 40, c.paper, (0.35 - p) * 2.4);
    circle(g, x, y, 4);
    fill(g, c.paper, 1 - p * 2.5);
  }
};

function heart(g: Ctx, x: number, y: number, s: number) {
  g.beginPath();
  g.moveTo(x, y + s * 0.3);
  g.bezierCurveTo(x, y, x - s * 0.5, y, x - s * 0.5, y + s * 0.3);
  g.bezierCurveTo(x - s * 0.5, y + s * 0.6, x, y + s * 0.8, x, y + s);
  g.bezierCurveTo(x, y + s * 0.8, x + s * 0.5, y + s * 0.6, x + s * 0.5, y + s * 0.3);
  g.bezierCurveTo(x + s * 0.5, y, x, y, x, y + s * 0.3);
}
function phone(g: Ctx, x: number, y: number, c: Palette) {
  rr(g, x, y, 150, 290, 22);
  fill(g, c.ink, 1);
  stroke(g, c.silver, 3, 0.8);
  rr(g, x + 55, y + 10, 40, 6, 3);
  fill(g, c.silver, 0.4);
}
const influencers: Scene = (g, t, c) => {
  circle(g, 300, 200, 150);
  stroke(g, c.silver, 16, 0.2);
  circle(g, 300, 200, 150);
  stroke(g, c.paper, 3, 0.5 + 0.2 * Math.sin(t * 2));
  phone(g, 225, 55, c);
  g.save();
  rr(g, 233, 75, 134, 260, 14);
  g.clip();
  const gr = g.createLinearGradient(233, 75, 367, 335);
  gr.addColorStop(0, c.coral);
  gr.addColorStop(1, c.indigo);
  g.fillStyle = gr;
  g.fillRect(233, 75, 134, 260);
  circle(g, 300, 180 + Math.sin(t * 2) * 10, 30);
  fill(g, c.paper, 0.9);
  rr(g, 245, 300, 110, 4, 2);
  fill(g, c.paper, 0.3);
  rr(g, 245, 300, 110 * loop(t, 6), 4, 2);
  fill(g, c.paper, 1);
  g.restore();
  for (let i = 0; i < 7; i++) {
    const p = loop(t + i * 0.45, 3.2);
    const x = 400 + Math.sin(p * 6 + i) * 18 + i * 6;
    const y = 320 - p * 260;
    heart(g, x, y, 16 + rnd(i) * 10);
    fill(g, i % 3 === 0 ? c.mint : c.coral, 1 - p);
  }
};

const social: Scene = (g, t, c) => {
  phone(g, 225, 55, c);
  g.save();
  rr(g, 233, 75, 134, 260, 14);
  g.clip();
  const off = (t * 34) % 120;
  for (let i = -1; i < 4; i++) {
    const y = 85 + i * 120 - off;
    rr(g, 241, y, 118, 110, 10);
    fill(g, c.ink2, 1);
    circle(g, 254, y + 14, 7);
    fill(g, i % 2 ? c.mint : c.coral);
    rr(g, 266, y + 10, 60, 6, 3);
    fill(g, c.paper, 0.4);
    rr(g, 247, y + 28, 106, 56, 6);
    fill(g, i % 2 ? c.coral : c.indigo, 0.9);
    heart(g, 254, y + 90, 12);
    fill(g, c.coral);
    rr(g, 268, y + 92, 40, 6, 3);
    fill(g, c.paper, 0.35);
  }
  g.restore();
  for (let i = 0; i < 3; i++) {
    const p = loop(t + i * 1.1, 3.3);
    const s = ease(p * 5) * (1 - ease((p - 0.7) * 3.3));
    const x = i % 2 ? 120 : 410;
    const y = 90 + i * 90;
    rr(g, x, y, 90 * s + 1, 34 * s + 1, 17);
    fill(g, c.paper, 0.9 * s);
    circle(g, x + 17, y + 17, 9 * s);
    fill(g, c.coral, s);
  }
};

const search: Scene = (g, t, c) => {
  rr(g, 70, 50, 460, 300, 14);
  fill(g, c.ink, 0.95);
  stroke(g, c.silver, 2, 0.4);
  for (let i = 0; i < 3; i++) {
    circle(g, 92 + i * 16, 70, 4);
    fill(g, i === 0 ? c.coral : c.silver, 0.6);
  }
  rr(g, 100, 96, 400, 40, 20);
  fill(g, c.paper, 0.95);
  const p = loop(t, 5);
  const typed = Math.min(8, Math.floor(p * 20));
  for (let i = 0; i < typed; i++) {
    rr(g, 124 + i * 24, 110, 18, 12, 3);
    fill(g, c.ink, 0.5);
  }
  if (Math.floor(t * 2) % 2 === 0) {
    rr(g, 124 + typed * 24, 106, 2, 20, 1);
    fill(g, c.coral);
  }
  const shown = p > 0.45;
  for (let r = 0; r < 4; r++) {
    const y = 160 + r * 44;
    rr(g, 100, y, r === 0 ? 260 : 220, 10, 4);
    fill(g, r === 0 ? c.coral : c.mint, shown ? 0.9 : 0.15);
    rr(g, 100, y + 16, 300, 6, 3);
    fill(g, c.paper, shown ? 0.3 : 0.08);
  }
  if (p > 0.6) {
    const q = ease((p - 0.6) * 4);
    const cx = 470 - q * 230;
    const cy = 320 - q * 155;
    if (p > 0.85) {
      circle(g, 240, 165, (p - 0.85) * 400);
      stroke(g, c.coral, 3, 1 - (p - 0.85) * 6);
    }
    g.beginPath();
    g.moveTo(cx, cy);
    g.lineTo(cx, cy + 22);
    g.lineTo(cx + 6, cy + 16);
    g.lineTo(cx + 15, cy + 18);
    g.closePath();
    fill(g, c.paper);
  }
  g.beginPath();
  for (let i = 0; i <= 10; i++) {
    const x = 410 + i * 9;
    const y = 320 - i * 9 - Math.sin(i + t * 2) * 5;
    if (!i) g.moveTo(x, y);
    else g.lineTo(x, y);
  }
  stroke(g, c.mint, 3, 0.9);
};

const pr: Scene = (g, t, c) => {
  for (let i = 2; i >= 0; i--) {
    const a = (i - 1) * 0.12 + Math.sin(t * 0.8 + i) * 0.02;
    g.save();
    g.translate(300 + (i - 1) * 60, 180);
    g.rotate(a);
    rr(g, -110, -120, 220, 230, 8);
    fill(g, c.paper, 0.95 - i * 0.1);
    rr(g, -92, -100, 150, 14, 3);
    fill(g, c.ink, 0.6);
    bars(g, -92, -72, 180, 3, 14, c.ink, 0.2, i * 9);
    rr(g, -92, -24, 184, 70, 6);
    fill(g, i === 1 ? c.coral : c.silver, i === 1 ? 0.95 : 0.5);
    bars(g, -92, 56, 180, 3, 14, c.ink, 0.2, i * 13);
    g.restore();
  }
  g.font = "700 120px Georgia, serif";
  g.fillStyle = c.coral;
  g.globalAlpha = 0.9;
  g.fillText("“", 70, 150);
  g.globalAlpha = 1;
  for (let k = 0; k < 3; k++) {
    const x = 250 + k * 50;
    line(g, x, 400, x + (k - 1) * 10, 330);
    stroke(g, c.silver, 4, 0.7);
    rr(g, x + (k - 1) * 10 - 12, 312, 24, 30, 10);
    fill(g, k === 1 ? c.coral : c.silver, 0.95);
  }
  const p = loop(t, 2.9);
  if (p < 0.12) glow(g, 500, 80, 90, c.paper, (0.12 - p) * 7);
};

const SCENES: Record<string, { draw: Scene; glow: [number, number] }> = {
  "print-media": { draw: print, glow: [120, 380] },
  television: { draw: tv, glow: [300, 360] },
  radio: { draw: radio, glow: [220, 160] },
  cinema: { draw: cinema, glow: [300, 120] },
  "hoardings-billboards": { draw: hoardings, glow: [190, 110] },
  "digital-ooh": { draw: dooh, glow: [300, 180] },
  "bus-brts-auto": { draw: busAuto, glow: [80, 380] },
  "metro-train-wraps": { draw: metroWraps, glow: [300, 380] },
  "inside-metro": { draw: insideMetro, glow: [300, 180] },
  "railways-train-branding": { draw: railways, glow: [470, 150] },
  "airport-branding": { draw: airport, glow: [220, 140] },
  "airline-inflight": { draw: airline, glow: [300, 380] },
  "cricket-stadiums-sports": { draw: cricket, glow: [300, 230] },
  "brand-ambassadors": { draw: ambassadors, glow: [300, 200] },
  "influencers-creators": { draw: influencers, glow: [300, 200] },
  "social-media": { draw: social, glow: [120, 380] },
  "search-performance": { draw: search, glow: [480, 380] },
  "digital-articles-pr": { draw: pr, glow: [80, 120] },
};

/** Generic fallback for a channel a clone adds without a scene: radar rings. */
const generic: Scene = (g, t, c) => {
  for (let i = 0; i < 4; i++) {
    const p = loop(t + i * 0.6, 2.4);
    circle(g, 300, 200, 30 + p * 180);
    stroke(g, c.coral, 2, 1 - p);
  }
  circle(g, 300, 200, 10);
  fill(g, c.coral);
};

export const hasScene = (slug: string) => slug in SCENES;

/**
 * Draws `slug` at time `t` (seconds) into the rect (x, y, w, h) of `g`, cover-fitted
 * around the scene's centre.
 */
export function drawScene(g: Ctx, slug: string, t: number, c: Palette, x: number, y: number, w: number, h: number) {
  const sc = SCENES[slug];
  const s = Math.max(w / DESIGN_W, h / DESIGN_H);
  g.save();
  g.beginPath();
  g.rect(x, y, w, h);
  g.clip();
  g.translate(x + (w - DESIGN_W * s) / 2, y + (h - DESIGN_H * s) / 2);
  g.scale(s, s);
  g.drawImage(background(c, ...(sc?.glow ?? [300, 200])), 0, 0);
  g.lineCap = "round";
  g.lineJoin = "round";
  (sc?.draw ?? generic)(g, t, c);
  g.restore();
}
