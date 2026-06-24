'use client';

import { Instance, Instances } from '@react-three/drei';

type ExpansionProps = { accent?: string };

// size = [6, 2.5, 0.4]
// Two low-profile PCIe add-in cards laid out side-by-side across X.
// Each card: green PCB + metal mounting bracket at one end + a port or two
// + a small chip + a row of gold PCIe fingers along the bottom (instanced).

const CARD_W = 2.7; // along X
const CARD_H = 1.8; // along Y (board body, bracket adds a little)
const CARD_T = 0.06; // board thickness along Z

// Per-card gold finger layout: short row along the bottom edge.
const FINGER_COUNT = 7;
const FINGER_W = 0.14;
const FINGER_H = 0.28;
const FINGER_GAP = 0.07;

// X centers for the two cards
const CARD_X = [-1.45, 1.45];

function Card({ accent, flip }: { accent: string; flip: boolean }) {
  // The bracket sits at one end (top, +Y). "flip" mirrors so the two cards
  // read slightly differently. Fingers run along the bottom (-Y) edge.
  const topY = CARD_H / 2;
  const botY = -CARD_H / 2;

  const fingerSpan = FINGER_COUNT * FINGER_W + (FINGER_COUNT - 1) * FINGER_GAP;
  const fingerStartX = -fingerSpan / 2 + FINGER_W / 2;

  const portX = flip ? 0.55 : -0.55;
  const chipX = flip ? -0.55 : 0.55;

  return (
    <group>
      {/* Green PCB substrate */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[CARD_W, CARD_H, CARD_T]} />
        <meshStandardMaterial color="#0a1410" metalness={0.2} roughness={0.7} />
      </mesh>

      {/* Faint silkscreen trace strip (cosmetic, no extra cost) */}
      <mesh position={[0, 0.15, CARD_T / 2 + 0.001]}>
        <planeGeometry args={[CARD_W * 0.82, 0.04]} />
        <meshStandardMaterial color="#16352a" metalness={0.1} roughness={0.85} />
      </mesh>

      {/* Metal mounting bracket along the top edge (utilitarian L-ish slab) */}
      <mesh
        position={[flip ? CARD_W / 2 - 0.05 : -CARD_W / 2 + 0.05, topY + 0.18, 0]}
        castShadow
        receiveShadow
      >
        <boxGeometry args={[0.1, 0.55, 0.5]} />
        <meshStandardMaterial color="#aab4c2" metalness={0.9} roughness={0.35} />
      </mesh>
      {/* Bracket top tab folding over the board edge */}
      <mesh position={[0, topY + 0.06, 0]} castShadow receiveShadow>
        <boxGeometry args={[CARD_W * 0.96, 0.1, 0.45]} />
        <meshStandardMaterial color="#9aa4b2" metalness={0.9} roughness={0.35} />
      </mesh>

      {/* Ports on the bracket — small rectangles (USB / network jack) */}
      <mesh position={[portX, topY + 0.18, 0.18]} castShadow>
        <boxGeometry args={[0.42, 0.26, 0.18]} />
        <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
      </mesh>
      <mesh position={[portX, topY + 0.18, 0.22]}>
        <boxGeometry args={[0.34, 0.18, 0.1]} />
        <meshStandardMaterial color="#0a0c0f" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Second smaller port jack beside it */}
      <mesh position={[portX + (flip ? -0.45 : 0.45), topY + 0.18, 0.16]} castShadow>
        <boxGeometry args={[0.22, 0.2, 0.16]} />
        <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* Small controller chip on the board face */}
      <mesh position={[chipX, -0.1, CARD_T / 2 + 0.04]} castShadow receiveShadow>
        <boxGeometry args={[0.5, 0.5, 0.08]} />
        <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
      </mesh>
      {/* Chip top sheen */}
      <mesh position={[chipX, -0.1, CARD_T / 2 + 0.085]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshStandardMaterial color="#1c2028" metalness={0.55} roughness={0.4} />
      </mesh>

      {/* Faint accent LED */}
      <mesh position={[flip ? -0.95 : 0.95, -0.55, CARD_T / 2 + 0.03]}>
        <boxGeometry args={[0.12, 0.12, 0.04]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* Gold PCIe fingers along the bottom edge (instanced) — both faces */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[FINGER_W, FINGER_H, CARD_T + 0.01]} />
        <meshStandardMaterial color="#d4af37" metalness={1} roughness={0.3} />
        {Array.from({ length: FINGER_COUNT }).map((_, i) => (
          <Instance
            key={i}
            position={[fingerStartX + i * (FINGER_W + FINGER_GAP), botY + FINGER_H / 2 - 0.02, 0]}
          />
        ))}
      </Instances>
    </group>
  );
}

export default function Expansion({ accent = '#7fd1c0' }: ExpansionProps) {
  // Cards stand upright (board face in X-Y, thickness in Z, "front" = +Z).
  return (
    <group>
      {CARD_X.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <Card accent={accent} flip={i === 1} />
        </group>
      ))}
    </group>
  );
}
