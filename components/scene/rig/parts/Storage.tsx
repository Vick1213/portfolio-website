'use client';

import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import { Text } from '@react-three/drei';

/**
 * Storage — NVMe M.2 sticks + a 2.5" SATA SSD.
 *
 * Local box: size = [5, 3, 0.5] (X, Y, Z). Front faces +Z.
 * - Two thin green M.2 NVMe PCBs, each with a controller chip, two NAND chips, a label plate.
 * - One flat brushed-metal 2.5" SSD with a beveled top edge and an accent strip/logo plate.
 * - One small accent activity LED.
 * Procedural only — no models/textures/deps. Instancing for repeated NAND chips.
 */
export default function Storage({ accent = '#39e0c8' }: { accent?: string }) {
  // ---- shared chip transforms (instanced NAND across both M.2 sticks) ----
  // Each M.2 stick has 2 NAND packages. We lay both sticks side-by-side near the top.
  const m2StickX = 1.0; // half-width of an M.2 PCB
  const m2Positions: [number, number][] = [
    [-1.05, 0.78], // left stick center
    [1.05, 0.78], // right stick center
  ];

  // NAND chip instance transforms (world-local, relative to group)
  const nandInstances = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (const [cx, cy] of m2Positions) {
      // two NAND packages along the stick length, toward the open (right) end
      out.push({ pos: [cx + 0.18, cy, 0.07] });
      out.push({ pos: [cx + 0.62, cy, 0.07] });
    }
    return out;
  }, []);

  // M.2 controller chip positions (one per stick, near connector end)
  const controllerPositions: [number, number, number][] = m2Positions.map(
    ([cx, cy]) => [cx - 0.5, cy, 0.07]
  );

  // gold-finger instances for the M.2 connector edge (left end of each stick)
  const fingerInstances = useMemo(() => {
    const out: { pos: [number, number, number] }[] = [];
    for (const [cx, cy] of m2Positions) {
      const startX = cx - m2StickX + 0.04;
      const count = 9;
      const span = 0.5;
      for (let i = 0; i < count; i++) {
        const x = startX + (i / (count - 1)) * span;
        out.push({ pos: [x, cy, 0.022] });
      }
    }
    return out;
  }, []);

  return (
    <group>
      {/* ============================ 2.5" SSD ============================ */}
      {/* Sits in the lower portion of the box; brushed metal body. */}
      <group position={[0, -0.7, 0]}>
        {/* main body */}
        <mesh castShadow receiveShadow position={[0, 0, 0]}>
          <boxGeometry args={[4.6, 1.7, 0.34]} />
          <meshStandardMaterial color="#c2cad6" metalness={0.9} roughness={0.34} />
        </mesh>
        {/* beveled top edge (thin lighter chamfer strip along the front-top) */}
        <mesh castShadow receiveShadow position={[0, 0.84, 0.1]} rotation={[-0.5, 0, 0]}>
          <boxGeometry args={[4.6, 0.12, 0.06]} />
          <meshStandardMaterial color="#dbe2ee" metalness={0.95} roughness={0.28} />
        </mesh>
        {/* recessed underside (slightly darker plate) */}
        <mesh receiveShadow position={[0, 0, -0.18]}>
          <boxGeometry args={[4.4, 1.55, 0.02]} />
          <meshStandardMaterial color="#8a93a2" metalness={0.85} roughness={0.45} />
        </mesh>
        {/* accent strip / logo plate on top */}
        <mesh castShadow position={[-1.1, 0.1, 0.18]}>
          <boxGeometry args={[2.0, 0.7, 0.015]} />
          <meshStandardMaterial color="#11151b" metalness={0.4} roughness={0.55} />
        </mesh>
        <mesh position={[-1.1, 0.1, 0.19]}>
          <boxGeometry args={[2.0, 0.06, 0.005]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.6}
            toneMapped={false}
          />
        </mesh>
        <Text
          position={[-1.1, 0.34, 0.2]}
          fontSize={0.26}
          color="#e7edf6"
          anchorX="center"
          anchorY="middle"
          sdfGlyphSize={64}
        >
          SSD
        </Text>
        {/* SATA data + power connector notch on right edge */}
        <mesh castShadow position={[2.25, -0.25, 0.0]}>
          <boxGeometry args={[0.18, 0.9, 0.22]} />
          <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
        </mesh>
        {/* activity LED (accent) */}
        <mesh position={[2.0, 0.55, 0.18]}>
          <boxGeometry args={[0.12, 0.12, 0.04]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={2}
            toneMapped={false}
          />
        </mesh>
      </group>

      {/* ============================ M.2 NVMe sticks ============================ */}
      {m2Positions.map(([cx, cy], i) => (
        <group key={i} position={[cx, cy, 0]}>
          {/* green PCB substrate */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[m2StickX * 2, 0.62, 0.04]} />
            <meshStandardMaterial color="#0a3a22" metalness={0.2} roughness={0.7} />
          </mesh>
          {/* mounting notch / standoff hole at the open end */}
          <mesh position={[m2StickX - 0.08, 0, 0]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 12]} />
            <meshStandardMaterial color="#0b160f" metalness={0.3} roughness={0.7} />
          </mesh>
          {/* label plate (silver sticker) on the right portion */}
          <mesh position={[0.36, 0, 0.045]}>
            <boxGeometry args={[1.0, 0.5, 0.01]} />
            <meshStandardMaterial color="#cfd6e2" metalness={0.5} roughness={0.5} />
          </mesh>
        </group>
      ))}

      {/* controller chips (one per stick) — small dark packages */}
      {controllerPositions.map((p, i) => (
        <mesh key={`ctrl-${i}`} castShadow receiveShadow position={p}>
          <boxGeometry args={[0.34, 0.34, 0.06]} />
          <meshStandardMaterial color="#0c0e12" metalness={0.4} roughness={0.5} />
        </mesh>
      ))}

      {/* NAND flash packages — instanced (4 total across both sticks) */}
      <Instances limit={16} castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.46, 0.06]} />
        <meshStandardMaterial color="#161a20" metalness={0.35} roughness={0.55} />
        {nandInstances.map((n, i) => (
          <Instance key={i} position={n.pos} />
        ))}
      </Instances>

      {/* gold connector fingers — instanced thin slabs */}
      <Instances limit={32} castShadow>
        <boxGeometry args={[0.04, 0.16, 0.012]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
        {fingerInstances.map((f, i) => (
          <Instance key={i} position={f.pos} />
        ))}
      </Instances>
    </group>
  );
}
