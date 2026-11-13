"use client";

import { Environment, Lightformer, MeshTransmissionMaterial, RoundedBox } from "@react-three/drei";
import { useFrame, useLoader, useThree } from "@react-three/fiber";
import { useMemo, useRef, type MutableRefObject } from "react";
import * as THREE from "three";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import type { RibbonStore } from "./ribbon-store";

const CUBE = 1.08;
const DEPTH = 2.3;
const OUTER_RING = 1.5;

/**
 * Where the object sits, as fractions of the visible area at its depth: bottom right,
 * clear of the headline (bottom left), the card band (upper middle) and the help text.
 * `size` is the outer-ring diameter as a share of the visible height.
 */
const ANCHOR = { right: 0.07, bottom: 0.16, size: 0.27 };

/** Glass cube with the extruded brand monogram inside, radar rings and an orbiting dot. */
export function CentreObject({
  store,
  coral,
  silver,
  ink,
  monogramUrl,
}: {
  store: MutableRefObject<RibbonStore>;
  coral: string;
  silver: string;
  ink: string;
  monogramUrl: string;
}) {
  const group = useRef<THREE.Group>(null);
  const cube = useRef<THREE.Group>(null);
  const dot = useRef<THREE.Mesh>(null);
  const rings = useRef<THREE.Group>(null);
  const svg = useLoader(SVGLoader, monogramUrl);
  const { viewport, camera } = useThree();
  const anchorRef = useRef(new THREE.Vector3(0, 0, DEPTH));
  const glassBackground = useMemo(() => new THREE.Color(ink), [ink]);

  const monogram = useMemo(() => {
    const shapes = svg.paths.flatMap((p) => SVGLoader.createShapes(p));
    const geo = new THREE.ExtrudeGeometry(shapes, {
      depth: 70,
      bevelEnabled: true,
      bevelThickness: 10,
      bevelSize: 6,
      bevelSegments: 5,
      curveSegments: 32,
    });
    geo.computeBoundingBox();
    const bb = geo.boundingBox!;
    const sizeV = new THREE.Vector3();
    bb.getSize(sizeV);
    const centre = new THREE.Vector3();
    bb.getCenter(centre);
    geo.translate(-centre.x, -centre.y, -centre.z);
    const s = (CUBE * 0.58) / Math.max(sizeV.x, sizeV.y);
    geo.scale(s, -s, s); // SVG y axis points down
    geo.computeVertexNormals();
    return geo;
  }, [svg]);

  const ringGeos = useMemo(
    () =>
      [0.92, 1.2, 1.5].map((r) => {
        const pts = new THREE.EllipseCurve(0, 0, r, r, 0, Math.PI * 2).getPoints(160);
        return new THREE.BufferGeometry().setFromPoints(pts.map((p) => new THREE.Vector3(p.x, p.y, 0)));
      }),
    [],
  );

  useFrame((state, rawDt) => {
    const dt = Math.min(rawDt, 1 / 20);
    const t = state.clock.elapsedTime;
    if (group.current) {
      // Responsive bottom-right anchor (recomputed per frame: cheap, and follows resizes).
      const v = viewport.getCurrentViewport(camera, anchorRef.current.set(0, 0, DEPTH));
      const scale = (ANCHOR.size * v.height) / (OUTER_RING * 2);
      const r = OUTER_RING * scale;
      group.current.scale.setScalar(scale);
      group.current.position.set(v.width / 2 - r - ANCHOR.right * v.width, -v.height / 2 + r + ANCHOR.bottom * v.height, DEPTH);
    }
    const p = store.current.pointer ?? { x: 0, y: 0 };
    if (group.current) {
      group.current.rotation.y += (p.x * 0.35 - group.current.rotation.y) * dt * 2.5;
      group.current.rotation.x += (-p.y * 0.25 - group.current.rotation.x) * dt * 2.5;
    }
    if (cube.current) {
      cube.current.rotation.y = t * 0.28 + store.current.velocity * 0.02;
      cube.current.rotation.x = Math.sin(t * 0.4) * 0.18 + 0.32;
      cube.current.rotation.z = Math.cos(t * 0.3) * 0.08;
    }
    if (dot.current) {
      const a = t * 0.7;
      dot.current.position.set(Math.cos(a) * 1.5, Math.sin(a) * 1.5, 0);
    }
    if (rings.current) {
      rings.current.children.forEach((c, i) => {
        const k = 1 + Math.sin(t * 1.2 - i * 0.7) * 0.015;
        c.scale.setScalar(k);
      });
    }
  });

  return (
    <>
      <Environment resolution={128}>
        <Lightformer form="rect" intensity={2.2} position={[0, 4, 2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={1.4} color={coral} position={[-5, -1, 1]} scale={[3, 6, 1]} />
        <Lightformer form="rect" intensity={1.1} color="#9FD9C0" position={[5, 0, -1]} scale={[3, 6, 1]} />
        <Lightformer form="ring" intensity={1.6} position={[0, 0, 6]} scale={3} />
      </Environment>
      <ambientLight intensity={0.25} />
      <group ref={group} position={[0, 0.5, DEPTH]}>
        <group ref={rings} rotation={[0.12, 0, 0]}>
          {ringGeos.map((g, i) => (
            <lineLoop key={i} geometry={g}>
              <lineBasicMaterial color={silver} transparent opacity={0.26 - i * 0.06} toneMapped={false} />
            </lineLoop>
          ))}
          <mesh ref={dot}>
            <sphereGeometry args={[0.04, 24, 24]} />
            <meshBasicMaterial color={coral} toneMapped={false} />
          </mesh>
        </group>
        <group ref={cube}>
          <mesh geometry={monogram}>
            <meshStandardMaterial
              color={coral}
              emissive={coral}
              emissiveIntensity={0.28}
              metalness={0.55}
              roughness={0.18}
              envMapIntensity={1.4}
            />
          </mesh>
          <RoundedBox args={[CUBE, CUBE, CUBE]} radius={0.09} smoothness={5}>
            <MeshTransmissionMaterial
              backside
              backsideThickness={0.2}
              samples={4}
              resolution={512}
              background={glassBackground}
              transmission={1}
              thickness={0.32}
              roughness={0}
              ior={1.18}
              chromaticAberration={0.025}
              anisotropy={0.1}
              distortion={0.04}
              distortionScale={0.4}
              temporalDistortion={0}
              clearcoat={1}
              attenuationDistance={2.5}
              attenuationColor="#ffffff"
              color="#f4f5f7"
            />
          </RoundedBox>
        </group>
      </group>
    </>
  );
}
