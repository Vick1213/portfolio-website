'use client';

import { Edges, Grid } from '@react-three/drei';
import { DIE_CENTER, DIE_SIZE } from '@/lib/constants';

// Cheap, static package-detail pads near the die edges (no per-frame work).
// Placed just above the top surface, in the negative-Z margin so they never
// collide with the compute tiles (which sit around z = 0..+5).
const PAD_POSITIONS: [number, number, number][] = [
  [-24, 0, -6],
  [-12, 0, -6.6],
  [0, 0, -6.9],
  [12, 0, -6.6],
  [24, 0, -6],
  [-24, 0, 9.5],
  [24, 0, 9.5],
];

export default function ChipDie() {
  // Top surface y = DIE_CENTER[1] + DIE_SIZE[1]/2  (= -0.1 per art direction)
  const topY = DIE_CENTER[1] + DIE_SIZE[1] / 2;

  return (
    <group>
      {/* Brushed-titanium silicon slab */}
      <mesh position={DIE_CENTER} castShadow receiveShadow>
        <boxGeometry args={DIE_SIZE} />
        <meshStandardMaterial
          color="#232a36"
          metalness={0.85}
          roughness={0.38}
          emissive="#0c1622"
          emissiveIntensity={0.12}
        />
        {/* Thin machined bevel */}
        <Edges threshold={15} color="#3a4658" />
      </mesh>

      {/* Etched grid overlay on top surface */}
      <Grid
        position={[DIE_CENTER[0], topY + 0.01, DIE_CENTER[2]]}
        args={[DIE_SIZE[0], DIE_SIZE[2]]}
        cellSize={1}
        cellThickness={0.6}
        cellColor="#2a3a4e"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#3e5570"
        fadeDistance={35}
        fadeStrength={1.5}
        infiniteGrid={false}
        side={2}
      />

      {/* Small emissive package pads for chip realism (static) */}
      {PAD_POSITIONS.map((p, i) => (
        <mesh key={i} position={[p[0], topY + 0.02, p[2]]}>
          <boxGeometry args={[0.6, 0.04, 0.6]} />
          <meshStandardMaterial
            color="#1a2230"
            metalness={0.7}
            roughness={0.4}
            emissive="#3e5570"
            emissiveIntensity={0.35}
          />
        </mesh>
      ))}
    </group>
  );
}
