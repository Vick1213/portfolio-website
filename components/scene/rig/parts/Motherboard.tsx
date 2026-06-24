'use client';

import { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance, Edges, Text } from '@react-three/drei';

/**
 * Motherboard — the large ATX PCB the whole build mounts to.
 *
 * size = [18, 22, 0.5]: large face in the X–Y plane, thickness along Z.
 * "Front" (where the socket / slots / connectors live) faces +Z.
 *
 * HIGH REALISM via detailed-but-instanced procedural geometry only.
 * No model files, no textures, no new deps.
 */

const SIZE: [number, number, number] = [18, 22, 0.5];
const W = SIZE[0];
const H = SIZE[1];
const T = SIZE[2];

// Front face of the substrate (+Z). All surface detail sits just in front of this.
const FRONT = T / 2;

// ---- shared materials (declared as JSX below; geometry reused via instancing) ----

type Props = { accent?: string };

export default function Motherboard({ accent = '#39d0ff' }: Props) {
  // --- copper trace network (thin, low-emissive accent boxes, instanced) ---
  const traces = useMemo(() => {
    const out: { pos: [number, number, number]; scale: [number, number, number] }[] = [];
    let seed = 1337;
    const rnd = () => {
      // deterministic pseudo-random so SSR/CSR match
      seed = (seed * 1664525 + 1013904223) % 4294967296;
      return seed / 4294967296;
    };
    const traceCount = 90;
    for (let i = 0; i < traceCount; i++) {
      const horizontal = rnd() > 0.5;
      const len = 1.5 + rnd() * 5;
      const x = (rnd() - 0.5) * (W - 1.5);
      const y = (rnd() - 0.5) * (H - 1.5);
      if (horizontal) {
        out.push({ pos: [x, y, FRONT + 0.005], scale: [len, 0.05, 1] });
      } else {
        out.push({ pos: [x, y, FRONT + 0.005], scale: [0.05, len, 1] });
      }
    }
    return out;
  }, []);

  // --- electrolytic capacitors (cylinders), scattered ---
  const caps = useMemo(
    () =>
      [
        [-7.2, 6.6, 0.55],
        [-6.0, 6.6, 0.55],
        [-7.2, 5.4, 0.55],
        [-6.0, 5.4, 0.45],
        [5.6, -7.0, 0.55],
        [6.8, -7.0, 0.45],
        [5.6, -8.2, 0.55],
        [-1.5, -8.6, 0.45],
        [-0.2, -8.6, 0.55],
        [7.6, 2.0, 0.45],
        [7.6, 0.6, 0.55],
        [-7.8, -2.0, 0.45],
      ] as [number, number, number][],
    []
  );

  // --- small SMD chips scattered ---
  const smd = useMemo(
    () =>
      [
        [-8.0, 9.5, 0.9, 0.6],
        [-6.0, 9.5, 0.7, 0.5],
        [2.0, 9.6, 1.0, 0.7],
        [8.0, -2.5, 0.8, 0.8],
        [8.0, -4.0, 0.6, 0.6],
        [-8.2, 1.5, 0.6, 0.9],
        [-3.0, -6.5, 0.7, 0.7],
        [0.5, -3.0, 0.9, 0.5],
        [4.0, 4.0, 0.6, 0.6],
        [6.5, 8.5, 0.8, 0.5],
        [-2.0, 8.0, 0.5, 0.5],
        [3.5, -9.0, 0.7, 0.6],
      ] as [number, number, number, number][],
    []
  );

  // --- RAM slots (4 vertical), to the right of the socket ---
  const ramX = 5.5;
  const ramStep = 0.85;
  const ramSlots = useMemo(
    () => [0, 1, 2, 3].map((i) => ramX + (i - 1.5) * ramStep),
    []
  );

  // --- CPU socket pin grid (instanced contacts) ---
  const socketCx = -1.5;
  const socketCy = 5.0;
  const socketSize = 4.5;
  const pins = useMemo(() => {
    const out: [number, number, number][] = [];
    const n = 18; // 18x18 contact grid
    const span = socketSize - 1.0;
    const step = span / (n - 1);
    for (let ix = 0; ix < n; ix++) {
      for (let iy = 0; iy < n; iy++) {
        out.push([
          socketCx - span / 2 + ix * step,
          socketCy - span / 2 + iy * step,
          FRONT + 0.06,
        ]);
      }
    }
    return out;
  }, []);

  // --- corner screw holes ---
  const screws = useMemo(
    () =>
      [
        [-W / 2 + 0.8, H / 2 - 0.8],
        [W / 2 - 0.8, H / 2 - 0.8],
        [-W / 2 + 0.8, -H / 2 + 0.8],
        [W / 2 - 0.8, -H / 2 + 0.8],
        [0, H / 2 - 0.8],
        [0, -H / 2 + 0.8],
      ] as [number, number][],
    []
  );

  return (
    <group>
      {/* ---------- PCB substrate slab ---------- */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, T]} />
        <meshStandardMaterial color="#0a1410" metalness={0.2} roughness={0.7} />
        <Edges threshold={15} color="#13241c" />
      </mesh>

      {/* faint silkscreen border on front */}
      <lineSegments position={[0, 0, FRONT + 0.002]}>
        <edgesGeometry args={[new THREE.PlaneGeometry(W - 0.6, H - 0.6)]} />
        <lineBasicMaterial color="#1c3a2a" />
      </lineSegments>

      {/* ---------- copper traces (instanced, low-emissive accent) ---------- */}
      <Instances limit={traces.length} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[1, 1, 0.02]} />
        <meshStandardMaterial
          color="#7a5a2a"
          metalness={0.85}
          roughness={0.35}
          emissive={accent}
          emissiveIntensity={0.18}
          toneMapped={false}
        />
        {traces.map((t, i) => (
          <Instance key={i} position={t.pos} scale={t.scale} />
        ))}
      </Instances>

      {/* ---------- CPU SOCKET (recessed square, upper-center) ---------- */}
      <group position={[socketCx, socketCy, 0]}>
        {/* black socket frame */}
        <mesh position={[0, 0, FRONT + 0.04]} castShadow receiveShadow>
          <boxGeometry args={[socketSize, socketSize, 0.16]} />
          <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* recessed cavity floor (darker, set back) */}
        <mesh position={[0, 0, FRONT + 0.02]} receiveShadow>
          <boxGeometry args={[socketSize - 0.5, socketSize - 0.5, 0.06]} />
          <meshStandardMaterial color="#0c0e12" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* retention lever (thin metal arm along one edge) */}
        <mesh
          position={[socketSize / 2 + 0.18, -0.2, FRONT + 0.08]}
          castShadow
        >
          <boxGeometry args={[0.12, socketSize * 0.7, 0.12]} />
          <meshStandardMaterial color="#cdd6e4" metalness={0.9} roughness={0.35} />
        </mesh>
      </group>

      {/* socket pin/contact grid (instanced gold contacts) */}
      <Instances limit={pins.length} castShadow={false} receiveShadow={false}>
        <boxGeometry args={[0.07, 0.07, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
        {pins.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* ---------- PCIe x16 SLOT (long, black, lower area) + latch ---------- */}
      <group position={[-1.0, -5.5, 0]}>
        <mesh position={[0, 0, FRONT + 0.05]} castShadow receiveShadow>
          <boxGeometry args={[9.0, 0.7, 0.22]} />
          <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* slot channel (gold contact strip inside) */}
        <mesh position={[0, 0, FRONT + 0.09]}>
          <boxGeometry args={[8.6, 0.18, 0.08]} />
          <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
        </mesh>
        {/* end latch */}
        <mesh position={[4.7, 0, FRONT + 0.07]} castShadow>
          <boxGeometry args={[0.45, 0.55, 0.3]} />
          <meshStandardMaterial color="#1b1f26" metalness={0.3} roughness={0.6} />
        </mesh>
      </group>

      {/* ---------- shorter PCIe slots (x1 / x4) ---------- */}
      {[-7.6, -3.0].map((yy, idx) => (
        <group key={idx} position={[-2.5, yy, 0]}>
          <mesh position={[0, 0, FRONT + 0.05]} castShadow receiveShadow>
            <boxGeometry args={[idx === 0 ? 2.4 : 4.6, 0.6, 0.2]} />
            <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
          </mesh>
          <mesh position={[0, 0, FRONT + 0.085]}>
            <boxGeometry args={[idx === 0 ? 2.1 : 4.3, 0.14, 0.07]} />
            <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}

      {/* ---------- RAM SLOTS (4 vertical, instanced black bodies) ---------- */}
      <Instances limit={ramSlots.length} castShadow receiveShadow>
        <boxGeometry args={[0.5, 7.5, 0.28]} />
        <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
        {ramSlots.map((x, i) => (
          <Instance key={i} position={[x, 1.0, FRONT + 0.07]} />
        ))}
      </Instances>
      {/* RAM slot color-key accent strip (small emissive tab per slot) */}
      <Instances limit={ramSlots.length} castShadow={false}>
        <boxGeometry args={[0.5, 0.5, 0.06]} />
        <meshStandardMaterial
          emissive={accent}
          emissiveIntensity={1.4}
          color="#101418"
          toneMapped={false}
        />
        {ramSlots.map((x, i) => (
          <Instance key={i} position={[x, 4.95, FRONT + 0.12]} />
        ))}
      </Instances>
      {/* RAM slot inner gold contacts (thin strip down each slot) */}
      <Instances limit={ramSlots.length} castShadow={false}>
        <boxGeometry args={[0.18, 7.0, 0.05]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
        {ramSlots.map((x, i) => (
          <Instance key={i} position={[x, 1.0, FRONT + 0.16]} />
        ))}
      </Instances>

      {/* ---------- chipset HEATSINK (low brushed-metal block) ---------- */}
      <group position={[2.0, -9.0, 0]}>
        <mesh position={[0, 0, FRONT + 0.2]} castShadow receiveShadow>
          <boxGeometry args={[3.6, 3.0, 0.5]} />
          <meshStandardMaterial color="#9aa4b2" metalness={0.9} roughness={0.35} />
          <Edges threshold={20} color="#c3ccd9" />
        </mesh>
        {/* engraved accent line on heatsink */}
        <mesh position={[0, 0.4, FRONT + 0.46]}>
          <boxGeometry args={[3.0, 0.12, 0.04]} />
          <meshStandardMaterial
            emissive={accent}
            emissiveIntensity={1.6}
            color="#222831"
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ---------- rear I/O shield region (top-left edge) ---------- */}
      <group position={[-W / 2 + 2.4, H / 2 - 1.3, 0]}>
        <mesh position={[0, 0, FRONT + 0.12]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 1.9, 0.4]} />
          <meshStandardMaterial color="#cdd6e4" metalness={0.9} roughness={0.35} />
        </mesh>
        {/* dark port cutouts (instanced) */}
        <Instances limit={6} castShadow={false}>
          <boxGeometry args={[0.55, 0.45, 0.2]} />
          <meshStandardMaterial color="#05070a" metalness={0.4} roughness={0.5} />
          {[
            [-1.5, 0.45],
            [-0.4, 0.45],
            [0.7, 0.45],
            [-1.5, -0.45],
            [-0.4, -0.45],
            [1.4, -0.1],
          ].map((p, i) => (
            <Instance key={i} position={[p[0], p[1], FRONT + 0.3]} />
          ))}
        </Instances>
      </group>

      {/* ---------- 24-pin ATX power connector (right edge) ---------- */}
      <group position={[W / 2 - 1.3, 3.5, 0]}>
        {/* white-ish plastic shroud */}
        <mesh position={[0, 0, FRONT + 0.25]} castShadow receiveShadow>
          <boxGeometry args={[1.2, 4.6, 0.55]} />
          <meshStandardMaterial color="#d7d2c4" metalness={0.2} roughness={0.7} />
        </mesh>
        {/* 2x12 pin holes (instanced dark cavities) */}
        <Instances limit={24} castShadow={false}>
          <boxGeometry args={[0.34, 0.28, 0.2]} />
          <meshStandardMaterial color="#0a0c10" metalness={0.3} roughness={0.6} />
          {Array.from({ length: 24 }).map((_, i) => {
            const col = i % 2;
            const row = Math.floor(i / 2);
            return (
              <Instance
                key={i}
                position={[
                  -0.3 + col * 0.6,
                  -1.98 + row * 0.36,
                  FRONT + 0.45,
                ]}
              />
            );
          })}
        </Instances>
      </group>

      {/* ---------- electrolytic CAPACITORS (instanced cylinders) ---------- */}
      <Instances limit={caps.length} castShadow receiveShadow>
        <cylinderGeometry args={[0.32, 0.32, 1, 14]} />
        <meshStandardMaterial color="#1b2733" metalness={0.7} roughness={0.4} />
        {caps.map((c, i) => (
          <Instance
            key={i}
            position={[c[0], c[1], FRONT + c[2] / 2]}
            scale={[1, 1, c[2]]}
            // lay cylinder along Z so flat top faces the viewer
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </Instances>
      {/* capacitor tops with cross-vent accent (small emissive) */}
      <Instances limit={caps.length} castShadow={false}>
        <boxGeometry args={[0.4, 0.05, 0.02]} />
        <meshStandardMaterial color="#3a4452" metalness={0.6} roughness={0.5} />
        {caps.map((c, i) => (
          <Instance key={i} position={[c[0], c[1], FRONT + c[2] + 0.01]} />
        ))}
      </Instances>

      {/* ---------- small SMD chips (instanced) ---------- */}
      <Instances limit={smd.length} castShadow receiveShadow>
        <boxGeometry args={[1, 0.16, 1]} />
        <meshStandardMaterial color="#10141a" metalness={0.5} roughness={0.5} />
        {smd.map((s, i) => (
          <Instance
            key={i}
            position={[s[0], s[1], FRONT + 0.08]}
            scale={[s[2], 1, s[3]]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </Instances>

      {/* ---------- corner screw holes (instanced) ---------- */}
      <Instances limit={screws.length} castShadow={false} receiveShadow>
        <cylinderGeometry args={[0.28, 0.28, T + 0.04, 12]} />
        <meshStandardMaterial color="#070b09" metalness={0.4} roughness={0.6} />
        {screws.map((s, i) => (
          <Instance
            key={i}
            position={[s[0], s[1], 0]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </Instances>
      {/* metallic standoff rings around holes */}
      <Instances limit={screws.length} castShadow={false} receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.06, 12]} />
        <meshStandardMaterial color="#9aa4b2" metalness={0.9} roughness={0.35} />
        {screws.map((s, i) => (
          <Instance
            key={i}
            position={[s[0], s[1], FRONT + 0.03]}
            rotation={[Math.PI / 2, 0, 0]}
          />
        ))}
      </Instances>

      {/* ---------- engraved branding (minimal) ---------- */}
      <Text
        position={[W / 2 - 4.2, -H / 2 + 1.0, FRONT + 0.02]}
        fontSize={0.7}
        color={accent}
        anchorX="right"
        anchorY="middle"
        sdfGlyphSize={64}
        outlineWidth={0}
      >
        FOUNDRY-X
      </Text>
    </group>
  );
}
