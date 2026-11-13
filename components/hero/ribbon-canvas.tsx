"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState, type MutableRefObject } from "react";
import * as THREE from "three";
import { theme } from "@/brand/theme";
import { buildCardSurface, type CardSurface } from "./card-texture";
import { CentreObject } from "./centre-object";
import { RIBBON, bendPoint, spacing, thetaOf, wrap } from "./ribbon-config";
import { cardFragment, cardVertex } from "./ribbon-shaders";
import type { HeroCard, RibbonStore } from "./ribbon-store";

const palette = {
  coral: theme.colors.coral,
  ink: theme.colors.ink,
  ink2: theme.colors.ink2,
  paper: theme.colors.paper,
  silver: theme.colors.silver,
  mint: theme.colors.mint,
  indigo: theme.colors.indigo,
};

type Props = {
  cards: HeroCard[];
  store: MutableRefObject<RibbonStore>;
  active: boolean;
  colors: { coral: string; label: string; silver: string; ink: string };
  monogramUrl: string;
};

export default function RibbonCanvas({ cards, store, active, colors, monogramUrl }: Props) {
  return (
    <Canvas
      frameloop={active ? "always" : "never"}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, RIBBON.camZ], fov: RIBBON.fov, near: 0.1, far: 60 }}
      style={{ position: "absolute", inset: 0 }}
      aria-hidden
      onCreated={(state) => {
        if (process.env.NODE_ENV !== "production") {
          (window as unknown as { __r3f: unknown; __ribbon: unknown }).__r3f = state;
          (window as unknown as { __ribbon: unknown }).__ribbon = store.current;
        }
      }}
    >
      <ResponsiveCamera />
      <Ribbon cards={cards} store={store} colors={colors} />
      <Deferred>
        <CentreObject store={store} coral={colors.coral} silver={colors.silver} ink={colors.ink} monogramUrl={monogramUrl} />
      </Deferred>
    </Canvas>
  );
}

/**
 * Mounts its children once the ribbon has had a moment to set up, so the glass cube's
 * shader compile and environment bake run in a separate task from the ribbon's.
 */
function Deferred({ children }: { children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const go = () => setShow(true);
    const id =
      typeof window.requestIdleCallback === "function" ? window.requestIdleCallback(go, { timeout: 1200 }) : window.setTimeout(go, 500);
    return () => {
      if (typeof window.cancelIdleCallback === "function") window.cancelIdleCallback(id);
      clearTimeout(id);
    };
  }, []);
  return show ? <>{children}</> : null;
}

/** Pull the camera back on narrower viewports so ~5 cards stay in view. */
function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    const aspect = size.width / size.height;
    const k = THREE.MathUtils.clamp(1.75 / aspect, 0.92, 1.6);
    camera.position.set(0, 0, RIBBON.camZ * k);
    camera.lookAt(0, 0.1, 0);
    camera.updateProjectionMatrix();
  }, [camera, size]);
  return null;
}

type CardMat = THREE.ShaderMaterial & {
  uniforms: Record<string, THREE.IUniform>;
};

function Ribbon({
  cards,
  store,
  colors,
}: {
  cards: HeroCard[];
  store: MutableRefObject<RibbonStore>;
  colors: Props["colors"];
}) {
  const { camera, size } = useThree();
  const total = cards.length * spacing;
  const totalH = RIBBON.photoH + RIBBON.labelH;
  const [textures, setTextures] = useState<(THREE.Texture | null)[]>(() => cards.map(() => null));

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(RIBBON.cardW, totalH, 64, 1);
    // Plane centred on the photo, label strip sits above it.
    g.translate(0, RIBBON.labelH / 2, 0);
    return g;
  }, [totalH]);

  const materials = useMemo<CardMat[]>(
    () =>
      cards.map(
        () =>
          new THREE.ShaderMaterial({
            vertexShader: cardVertex,
            fragmentShader: cardFragment,
            transparent: true,
            depthWrite: false,
            toneMapped: false,
            side: THREE.DoubleSide,
            uniforms: {
              uMap: { value: null },
              uX: { value: 0 },
              uR: { value: RIBBON.radius },
              uCurl: { value: RIBBON.curl },
              uStraight: { value: 0 },
              uYOff: { value: RIBBON.yOffset },
              uHover: { value: 0 },
              uVel: { value: 0 },
              uOpacity: { value: 0 },
              uAspect: { value: RIBBON.cardW / RIBBON.photoH },
              uLabelFrac: { value: RIBBON.labelH / totalH },
              uRadius: { value: RIBBON.cornerRadius },
              uCoral: { value: new THREE.Color(colors.coral) },
              uLabel: { value: new THREE.Color(colors.label) },
            },
          }) as CardMat,
      ),
    [cards, colors.coral, colors.label, totalH],
  );

  // Motion-graphic surfaces, redrawn round-robin while visible (see useFrame).
  const surfaces = useRef<(CardSurface | null)[]>(cards.map(() => null));
  const lastDraw = useRef<number[]>(cards.map(() => -1));
  const clock = useRef(0);
  const cursor = useRef(0);

  // Load textures centre-out so the visible cards appear first.
  useEffect(() => {
    let cancelled = false;
    const order = cards
      .map((_, i) => i)
      .sort((a, b) => Math.min(a, cards.length - a) - Math.min(b, cards.length - b));
    let loaded = 0;
    let readyFired = false;
    // Build one card per frame (centre-out) instead of all at once, so the main thread is
    // never blocked by a long burst of canvas drawing and texture uploads.
    const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => r()));
    (async () => {
      for (const i of order) {
        if (cancelled) return;
        try {
          const surface = await buildCardSurface(cards[i], cards.length, palette);
          if (cancelled) return surface.texture.dispose();
          surfaces.current[i] = surface;
          setTextures((prev) => {
            const next = prev.slice();
            next[i] = surface.texture;
            return next;
          });
        } catch {
          /* skip a failed card */
        }
        loaded++;
        if (!readyFired && (loaded >= Math.min(8, cards.length) || loaded === cards.length)) {
          readyFired = true;
          store.current.onReady?.();
        }
        await nextFrame();
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [cards, store]);

  useEffect(() => {
    textures.forEach((t, i) => {
      if (t) materials[i].uniforms.uMap.value = t;
    });
  }, [textures, materials]);

  useEffect(
    () => () => {
      geometry.dispose();
      materials.forEach((m) => m.dispose());
    },
    [geometry, materials],
  );

  const meshes = useRef<(THREE.Mesh | null)[]>([]);
  const smoothVel = useRef(0);
  const tmp = useMemo(() => new THREE.Vector3(), []);

  // Project a card's photo outline to CSS pixels (for hit testing and transitions).
  const projectOutline = (cardX: number, straighten: number) => {
    const pts: { x: number; y: number }[] = [];
    const halfW = RIBBON.cardW / 2;
    const halfH = RIBBON.photoH / 2;
    const steps = 8;
    for (let k = 0; k <= steps; k++) {
      const lx = -halfW + (k / steps) * RIBBON.cardW;
      const p = bendPoint(cardX, lx, halfH, straighten);
      tmp.set(p.x, p.y, p.z).project(camera);
      pts.push({ x: ((tmp.x + 1) / 2) * size.width, y: ((1 - tmp.y) / 2) * size.height });
    }
    for (let k = steps; k >= 0; k--) {
      const lx = -halfW + (k / steps) * RIBBON.cardW;
      const p = bendPoint(cardX, lx, -halfH, straighten);
      tmp.set(p.x, p.y, p.z).project(camera);
      pts.push({ x: ((tmp.x + 1) / 2) * size.width, y: ((1 - tmp.y) / 2) * size.height });
    }
    return pts;
  };

  const cardXs = useRef<number[]>(cards.map(() => 0));
  const straightens = useRef<number[]>(cards.map(() => 0));

  useEffect(() => {
    store.current.getCardRect = (i) => {
      const pts = projectOutline(cardXs.current[i], straightens.current[i]);
      const xs = pts.map((p) => p.x);
      const ys = pts.map((p) => p.y);
      const left = Math.min(...xs);
      const top = Math.min(...ys);
      return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top };
    };
  });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const s = store.current;

    // --- motion ---
    if (s.targetOffset !== null) {
      const d = s.targetOffset - s.offset;
      s.offset += d * Math.min(1, dt * 6);
      s.velocity = d * 2;
      if (Math.abs(d) < 0.002) s.targetOffset = null;
    } else if (!s.dragging) {
      s.velocity *= Math.exp(-RIBBON.damping * dt);
      const drift = s.hovered !== null ? RIBBON.driftPerSec * 0.15 : RIBBON.driftPerSec;
      s.offset += (drift + s.velocity) * dt;
    }
    smoothVel.current += (THREE.MathUtils.clamp(s.velocity / 14, -1, 1) - smoothVel.current) * Math.min(1, dt * 8);

    // --- hit test ---
    let hovered: number | null = s.focusIndex;
    if (hovered === null && s.pointer && !s.dragging) {
      const px = ((s.pointer.x + 1) / 2) * size.width;
      const py = ((1 - s.pointer.y) / 2) * size.height;
      for (let i = 0; i < cards.length; i++) {
        const x = wrap(i * spacing - s.offset, total);
        if (Math.abs(thetaOf(x)) > 1.2) continue;
        if (pointInPolygon(px, py, projectOutline(x, straightens.current[i]))) {
          hovered = i;
          break;
        }
      }
    }
    s.hovered = hovered;

    // --- per-card uniforms ---
    for (let i = 0; i < cards.length; i++) {
      const m = materials[i];
      const mesh = meshes.current[i];
      const x = wrap(i * spacing - s.offset, total);
      cardXs.current[i] = x;
      const visible = Math.abs(thetaOf(x)) < RIBBON.maxTheta;
      if (mesh) mesh.visible = visible;
      if (!visible) continue;
      const isHover = hovered === i ? 1 : 0;
      const u = m.uniforms;
      u.uX.value = x;
      u.uHover.value += (isHover - u.uHover.value) * Math.min(1, dt * 10);
      straightens.current[i] += (isHover * RIBBON.hoverStraighten - straightens.current[i]) * Math.min(1, dt * 7);
      u.uStraight.value = straightens.current[i];
      u.uVel.value = smoothVel.current;
      const target = textures[i] ? 1 : 0;
      u.uOpacity.value += (target - u.uOpacity.value) * Math.min(1, dt * 3);
    }

    // --- motion graphics: at most 2 texture uploads per frame, ~30fps per visible card ---
    clock.current += dt;
    let uploads = 0;
    for (let k = 0; k < cards.length && uploads < 2; k++) {
      const i = (cursor.current + k) % cards.length;
      const surf = surfaces.current[i];
      if (!surf || Math.abs(thetaOf(cardXs.current[i])) > 1.25) continue;
      if (clock.current - lastDraw.current[i] < 1 / 30) continue;
      surf.draw(clock.current + i * 0.37);
      lastDraw.current[i] = clock.current;
      uploads++;
      cursor.current = (i + 1) % cards.length;
    }

    // --- DOM callbacks ---
    s.onProgress?.(((s.offset % total) + total) % total / total);
    if (hovered !== null) {
      const pts = projectOutline(cardXs.current[hovered], straightens.current[hovered]);
      const bl = pts[pts.length - 1]; // bottom-left corner of the photo
      s.onChip?.(hovered, bl.x, bl.y);
    } else {
      s.onChip?.(null, 0, 0);
    }
  });

  return (
    <group>
      {cards.map((c, i) => (
        <mesh
          key={c.slug}
          ref={(el) => {
            meshes.current[i] = el;
          }}
          geometry={geometry}
          material={materials[i]}
          frustumCulled={false}
          renderOrder={1}
        />
      ))}
    </group>
  );
}

function pointInPolygon(x: number, y: number, pts: { x: number; y: number }[]) {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const a = pts[i];
    const b = pts[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) inside = !inside;
  }
  return inside;
}
