'use client';

import { Grid } from '@react-three/drei';
import { DIE_CENTER, DIE_SIZE } from '@/lib/constants';

export default function ChipDie() {
  // Top surface y = DIE_CENTER[1] + DIE_SIZE[1]/2
  const topY = DIE_CENTER[1] + DIE_SIZE[1] / 2;

  return (
    <group>
      {/* Silicon slab */}
      <mesh position={DIE_CENTER}>
        <boxGeometry args={DIE_SIZE} />
        <meshStandardMaterial
          color="#080c14"
          metalness={0.95}
          roughness={0.25}
          emissive="#0a1a2a"
          emissiveIntensity={0.15}
        />
      </mesh>

      {/* Etched grid overlay on top surface */}
      <Grid
        position={[DIE_CENTER[0], topY + 0.01, DIE_CENTER[2]]}
        args={[DIE_SIZE[0], DIE_SIZE[2]]}
        cellSize={1}
        cellThickness={0.4}
        cellColor="#1e3040"
        sectionSize={5}
        sectionThickness={0.8}
        sectionColor="#2e5060"
        fadeDistance={35}
        fadeStrength={1.5}
        infiniteGrid={false}
        side={2}
      />
    </group>
  );
}
