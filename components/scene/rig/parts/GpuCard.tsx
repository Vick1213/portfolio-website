'use client';

/**
 * GpuCard — THE HERO part of the exploded rig.
 *
 * A full triple-slot GRAPHICS CARD modeled procedurally (no external models,
 * no textures, no new deps). size = [16, 5, 1.4]; centered at local origin;
 * "front" (shroud + fans) faces +Z.
 *
 * Composition:
 *  - PCB card base (dark substrate)
 *  - Metal SHROUD/cover with angular cutouts
 *  - TWO recessed fans (hub + INSTANCED angled blades, accent-lit hub)
 *  - Finned HEATSINK visible under the shroud (INSTANCED fins)
 *  - Rear BACKPLATE (brushed metal, vent slots)
 *  - PCIe BRACKET at one end with HDMI/DisplayPort outputs
 *  - Gold PCIe EDGE CONNECTOR along the bottom (INSTANCED gold fingers)
 *  - 8-pin power connector on top
 *  - Accent RGB light bar along the top edge (emissive, toneMapped=false)
 *  - Exposed central GPU DIE ("AiToChip") flanked by 4 VRAM modules (tapeouts)
 *  - Engraved "VELOCITY SILICON" branding via drei <Text>
 *
 * Performance: every repeated element (fan blades, heatsink fins, gold fingers,
 * VRAM modules, backplate vents, power-pin holes) is INSTANCED. Shared
 * geometries/materials; modest segment counts.
 */

import { Instance, Instances, Text } from '@react-three/drei';
import { useMemo } from 'react';

type GpuCardProps = { accent?: string };

// ---- size box ----------------------------------------------------------------
const W = 16; // X
const H = 5; // Y
const D = 1.4; // Z (thickness)

// ---- shared material props (FOUNDRY look) -----------------------------------
const PCB = { color: '#0a1410', metalness: 0.2, roughness: 0.7 } as const;
const METAL = { color: '#aab4c2', metalness: 0.92, roughness: 0.34 } as const;
const PLASTIC = { color: '#15191f', metalness: 0.3, roughness: 0.6 } as const;
const GOLD = { color: '#d4af37', metalness: 1, roughness: 0.3 } as const;
const SILICON = { color: '#161b24', metalness: 0.55, roughness: 0.45 } as const;

export default function GpuCard({ accent = '#39d3ff' }: GpuCardProps) {
  // Front face of the shroud (where fans/branding live).
  const frontZ = D / 2;
  const backZ = -D / 2;

  // Two fan centers, recessed in the shroud. Card length runs along X.
  // Reserve the +X end for the PCIe bracket region.
  const fanR = 1.7;
  const fanX1 = -3.8;
  const fanX2 = 1.0;
  const fanCenters: number[] = [fanX1, fanX2];

  // ---- INSTANCED data: heatsink fins (run along X, thin slats in X) ----------
  const finCount = 34;
  const finPositions = useMemo(() => {
    const arr: number[] = [];
    const span = W - 3.2; // leave room for bracket end
    const x0 = -span / 2 - 1.4;
    for (let i = 0; i < finCount; i++) {
      arr.push(x0 + (i / (finCount - 1)) * span);
    }
    return arr;
  }, []);

  // ---- INSTANCED data: gold PCIe fingers along the bottom edge ---------------
  // Two banks (short + long) like a real x16 connector, plus a notch gap.
  const goldFingers = useMemo(() => {
    const fingers: { x: number; w: number }[] = [];
    const fw = 0.16; // finger width
    const gap = 0.12;
    const pitch = fw + gap;
    // bank A (short, left of notch)
    const aStart = -W / 2 + 0.9;
    const aCount = 8;
    for (let i = 0; i < aCount; i++) fingers.push({ x: aStart + i * pitch, w: fw });
    // notch gap, then bank B (long, x16 main)
    const bStart = aStart + aCount * pitch + 0.55;
    const bCount = 30;
    for (let i = 0; i < bCount; i++) fingers.push({ x: bStart + i * pitch, w: fw });
    return fingers;
  }, []);

  // ---- INSTANCED data: backplate vent slots ----------------------------------
  const ventCount = 22;
  const ventPositions = useMemo(() => {
    const arr: number[] = [];
    const span = W - 4;
    const x0 = -span / 2 - 1.5;
    for (let i = 0; i < ventCount; i++) arr.push(x0 + (i / (ventCount - 1)) * span);
    return arr;
  }, []);

  // ---- INSTANCED data: 8-pin power connector holes (4x2) ---------------------
  const powerPins = useMemo(() => {
    const arr: [number, number][] = [];
    for (let r = 0; r < 2; r++) for (let c = 0; c < 4; c++) arr.push([c, r]);
    return arr;
  }, []);

  // VRAM module positions (4 tapeouts) flanking the central die, on the PCB.
  const vramPositions: [number, number][] = [
    [-2.2, 1.5],
    [2.2, 1.5],
    [-2.2, -1.5],
    [2.2, -1.5],
  ];

  return (
    <group>
      {/* ================= PCB CARD BASE ================= */}
      <mesh position={[0, 0, backZ + 0.12]} castShadow receiveShadow>
        <boxGeometry args={[W, H, 0.18]} />
        <meshStandardMaterial {...PCB} />
      </mesh>
      {/* subtle solder-mask sheen layer on the PCB face */}
      <mesh position={[0, 0, backZ + 0.215]}>
        <boxGeometry args={[W - 0.4, H - 0.4, 0.02]} />
        <meshStandardMaterial color="#0c1a14" metalness={0.35} roughness={0.55} />
      </mesh>

      {/* ================= REAR BACKPLATE ================= */}
      <mesh position={[0, 0, backZ - 0.04]} castShadow receiveShadow>
        <boxGeometry args={[W - 0.2, H - 0.1, 0.1]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* engraved channel on backplate for premium feel */}
      <mesh position={[0, 0, backZ - 0.09]}>
        <boxGeometry args={[W - 2.5, H - 1.6, 0.04]} />
        <meshStandardMaterial color="#7d8694" metalness={0.9} roughness={0.45} />
      </mesh>
      {/* INSTANCED backplate vent slots (cut-look: dark recesses) */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[0.1, H - 2.2, 0.14]} />
        <meshStandardMaterial {...PLASTIC} />
        {ventPositions.map((x, i) => (
          <Instance key={i} position={[x, -0.2, backZ - 0.1]} />
        ))}
      </Instances>

      {/* ================= HEATSINK (INSTANCED fins, under shroud) ========= */}
      {/* Fin stack sits between PCB and shroud, fins are thin slats spaced in X */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[0.06, H - 1.0, D - 0.55]} />
        <meshStandardMaterial color="#cdd6e4" metalness={0.95} roughness={0.3} />
        {finPositions.map((x, i) => (
          <Instance key={i} position={[x, -0.1, 0.0]} />
        ))}
      </Instances>
      {/* heatsink base block beneath fins (contact plate over the die) */}
      <mesh position={[0, -0.1, -0.05]} castShadow receiveShadow>
        <boxGeometry args={[W - 3.4, H - 1.4, 0.22]} />
        <meshStandardMaterial color="#9aa4b2" metalness={0.9} roughness={0.36} />
      </mesh>

      {/* ================= SHROUD / COVER (with angular cutouts) ========= */}
      {/* Built as a frame of 4 rails so the fans + fins show through, plus an
          angular diagonal strut between the two fan bores for the "angular cutout" look. */}
      {/* top rail */}
      <mesh position={[0, H / 2 - 0.35, frontZ - 0.18]} castShadow receiveShadow>
        <boxGeometry args={[W, 0.7, D - 0.3]} />
        <meshStandardMaterial color="#c4cdda" metalness={0.92} roughness={0.32} />
      </mesh>
      {/* bottom rail */}
      <mesh position={[0, -H / 2 + 0.35, frontZ - 0.18]} castShadow receiveShadow>
        <boxGeometry args={[W, 0.7, D - 0.3]} />
        <meshStandardMaterial color="#c4cdda" metalness={0.92} roughness={0.32} />
      </mesh>
      {/* left end rail (over heatsink end) */}
      <mesh position={[-W / 2 + 0.45, 0, frontZ - 0.18]} castShadow receiveShadow>
        <boxGeometry args={[0.9, H, D - 0.3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* right end rail (bracket-side shroud) */}
      <mesh position={[W / 2 - 1.7, 0, frontZ - 0.18]} castShadow receiveShadow>
        <boxGeometry args={[1.4, H, D - 0.3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* center spine between fans */}
      <mesh position={[(fanX1 + fanX2) / 2, 0, frontZ - 0.18]} castShadow receiveShadow>
        <boxGeometry args={[1.1, H, D - 0.3]} />
        <meshStandardMaterial {...METAL} />
      </mesh>
      {/* angular cutout accents: tilted dark slats on the shroud faces */}
      <mesh position={[fanX1, H / 2 - 0.55, frontZ - 0.02]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[2.0, 0.12, 0.06]} />
        <meshStandardMaterial color="#23282f" metalness={0.6} roughness={0.5} />
      </mesh>
      <mesh position={[fanX2, -H / 2 + 0.55, frontZ - 0.02]} rotation={[0, 0, -0.5]}>
        <boxGeometry args={[2.0, 0.12, 0.06]} />
        <meshStandardMaterial color="#23282f" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* ================= FANS (x2) ================= */}
      {fanCenters.map((cx, fi) => (
        <Fan key={fi} cx={cx} z={frontZ - 0.05} r={fanR} accent={accent} reverse={fi === 1} />
      ))}

      {/* ================= ACCENT RGB LIGHT BAR (top edge) ============== */}
      <mesh position={[-0.6, H / 2 + 0.02, frontZ - 0.18]}>
        <boxGeometry args={[W - 3.2, 0.16, 0.16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* thin secondary accent line along the front of the top rail */}
      <mesh position={[-0.6, H / 2 - 0.62, frontZ + 0.0]}>
        <boxGeometry args={[W - 3.4, 0.05, 0.05]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* ================= EXPOSED GPU DIE + VRAM (on PCB, visible) ====== */}
      {/* The shroud center spine is narrow enough that the die reads through;
          the die sits just in front of the PCB at the card center. */}
      <group position={[(fanX1 + fanX2) / 2, 0, backZ + 0.32]}>
        {/* package substrate (green/gold interposer) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.7, 1.7, 0.1]} />
          <meshStandardMaterial color="#13241a" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* the silicon die — "AiToChip" */}
        <mesh position={[0, 0, 0.08]} castShadow receiveShadow>
          <boxGeometry args={[1.1, 1.1, 0.08]} />
          <meshStandardMaterial
            {...SILICON}
            emissive={accent}
            emissiveIntensity={0.18}
          />
        </mesh>
        {/* die label */}
        <Text
          position={[0, 0, 0.13]}
          fontSize={0.26}
          color={accent}
          anchorX="center"
          anchorY="middle"
          sdfGlyphSize={64}
        >
          AiToChip
          <meshBasicMaterial color={accent} toneMapped={false} />
        </Text>
      </group>

      {/* VRAM modules (4 tapeouts) flanking the die */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[0.9, 0.7, 0.12]} />
        <meshStandardMaterial color="#1b232e" metalness={0.6} roughness={0.42} />
        {vramPositions.map(([x, y], i) => (
          <Instance key={i} position={[(fanX1 + fanX2) / 2 + x, y, backZ + 0.34]} />
        ))}
      </Instances>
      {/* tiny accent pad on each VRAM module */}
      <Instances>
        <boxGeometry args={[0.5, 0.08, 0.02]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={0.9}
          toneMapped={false}
        />
        {vramPositions.map(([x, y], i) => (
          <Instance key={i} position={[(fanX1 + fanX2) / 2 + x, y + 0.24, backZ + 0.41]} />
        ))}
      </Instances>

      {/* ================= PCIe BRACKET (display outputs) ================ */}
      <group position={[W / 2 - 0.25, 0, 0]}>
        {/* bracket plate (I/O shield) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.18, H + 1.4, D + 0.6]} />
          <meshStandardMaterial color="#d7dee9" metalness={0.95} roughness={0.28} />
        </mesh>
        {/* perforated vent triangle hint */}
        <mesh position={[0.02, H / 2 + 0.35, 0]}>
          <boxGeometry args={[0.16, 0.5, D]} />
          <meshStandardMaterial {...PLASTIC} />
        </mesh>
        {/* display outputs: 1 HDMI + 2 DisplayPort (dark rectangles) */}
        <mesh position={[-0.02, 1.1, 0.15]}>
          <boxGeometry args={[0.2, 0.55, 0.7]} />
          <meshStandardMaterial color="#0c0f14" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[-0.02, 0.1, 0.15]}>
          <boxGeometry args={[0.2, 0.45, 0.62]} />
          <meshStandardMaterial color="#0c0f14" metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[-0.02, -0.85, 0.15]}>
          <boxGeometry args={[0.2, 0.45, 0.62]} />
          <meshStandardMaterial color="#0c0f14" metalness={0.4} roughness={0.6} />
        </mesh>
      </group>

      {/* ================= GOLD PCIe EDGE CONNECTOR (INSTANCED) ========= */}
      {/* substrate tab below the PCB */}
      <mesh position={[-1.2, -H / 2 - 0.28, backZ + 0.12]} castShadow receiveShadow>
        <boxGeometry args={[W - 1.6, 0.62, 0.16]} />
        <meshStandardMaterial {...PCB} />
      </mesh>
      <Instances castShadow>
        <boxGeometry args={[goldFingers[0].w, 0.5, 0.04]} />
        <meshStandardMaterial {...GOLD} />
        {goldFingers.map((f, i) => (
          <Instance key={i} position={[f.x, -H / 2 - 0.3, backZ + 0.22]} />
        ))}
      </Instances>

      {/* ================= 8-PIN POWER CONNECTOR (top) ================== */}
      <group position={[W / 2 - 4.0, H / 2 + 0.3, frontZ - 0.25]}>
        {/* connector housing */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1.5, 0.7, 0.7]} />
          <meshStandardMaterial {...PLASTIC} />
        </mesh>
        {/* INSTANCED 8 pin holes (4x2 grid) */}
        <Instances>
          <boxGeometry args={[0.18, 0.18, 0.1]} />
          <meshStandardMaterial color="#050608" metalness={0.2} roughness={0.8} />
          {powerPins.map(([c, r], i) => (
            <Instance
              key={i}
              position={[-0.55 + c * 0.36, -0.15 + r * 0.3, 0.36]}
            />
          ))}
        </Instances>
      </group>

      {/* ================= ENGRAVED BRANDING ================= */}
      <Text
        position={[-0.6, -H / 2 + 0.35, frontZ + 0.02]}
        fontSize={0.34}
        letterSpacing={0.16}
        color={accent}
        anchorX="center"
        anchorY="middle"
        sdfGlyphSize={64}
      >
        VELOCITY SILICON
        <meshBasicMaterial color={accent} toneMapped={false} />
      </Text>
    </group>
  );
}

/**
 * Fan — a recessed cooling fan: a black ring frame, a central hub (accent-lit),
 * and INSTANCED angled blades sweeping out from the hub.
 */
function Fan({
  cx,
  z,
  r,
  accent,
  reverse,
}: {
  cx: number;
  z: number;
  r: number;
  accent: string;
  reverse: boolean;
}) {
  const bladeCount = 11;
  const dir = reverse ? -1 : 1;
  const blades = useMemo(() => {
    const arr: { rot: number }[] = [];
    for (let i = 0; i < bladeCount; i++) {
      arr.push({ rot: (i / bladeCount) * Math.PI * 2 });
    }
    return arr;
  }, []);

  return (
    <group position={[cx, 0, z]}>
      {/* recessed fan well / outer ring frame */}
      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[r + 0.18, r + 0.18, 0.18, 24]} />
        <meshStandardMaterial {...PLASTIC} />
      </mesh>
      {/* inner well backing (dark, sits behind blades) */}
      <mesh position={[0, 0, -0.14]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[r, r, 0.05, 24]} />
        <meshStandardMaterial color="#0a0d11" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* INSTANCED angled blades */}
      <Instances castShadow>
        <boxGeometry args={[r * 0.92, 0.5, 0.04]} />
        <meshStandardMaterial color="#1d2128" metalness={0.4} roughness={0.5} />
        {blades.map((b, i) => {
          // place blade so its inner end starts near the hub, then tilt (angle of attack)
          const a = b.rot;
          const rad = r * 0.5;
          return (
            <Instance
              key={i}
              position={[Math.cos(a) * rad, Math.sin(a) * rad, -0.08]}
              rotation={[0, dir * 0.5, a + Math.PI / 2]}
            />
          );
        })}
      </Instances>

      {/* central hub */}
      <mesh position={[0, 0, 0.02]} rotation={[Math.PI / 2, 0, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[0.42, 0.42, 0.16, 20]} />
        <meshStandardMaterial color="#22272f" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* accent-lit hub center */}
      <mesh position={[0, 0, 0.11]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.26, 0.26, 0.04, 20]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
