'use client';

import { zones } from '@/lib/portfolio';

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.1} />
      <directionalLight position={[5, 12, 8]} intensity={0.5} />
      <directionalLight position={[-10, -2, -5]} intensity={0.08} color="#1a3a5a" />
      {zones.map((zone) => (
        <pointLight
          key={zone.id}
          position={[zone.origin[0], 3, zone.origin[2]]}
          color={zone.accent}
          intensity={4}
          distance={12}
        />
      ))}
    </>
  );
}
