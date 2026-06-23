'use client';

import { zones } from '@/lib/portfolio';

export default function Lights() {
  return (
    <>
      <ambientLight intensity={0.15} />
      <directionalLight position={[5, 12, 8]} intensity={0.8} />
      {zones.map((zone) => (
        <pointLight
          key={zone.id}
          position={[zone.origin[0], 3, zone.origin[2]]}
          color={zone.accent}
          intensity={6}
          distance={14}
        />
      ))}
    </>
  );
}
