'use client';

import { Text } from '@react-three/drei';
import type { ZoneMeta } from '@/lib/types';

interface ZoneLabelProps {
  zone: ZoneMeta;
}

export default function ZoneLabel({ zone }: ZoneLabelProps) {
  return (
    <group position={[zone.origin[0], 3.2, -2]}>
      <Text
        fontSize={0.9}
        color={zone.accent}
        anchorX="center"
        anchorY="middle"
        position={[0, 0, 0]}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {zone.label}
      </Text>
      <Text
        fontSize={0.45}
        color={zone.accent}
        anchorX="center"
        anchorY="middle"
        position={[0, -0.75, 0]}
        fillOpacity={0.55}
        outlineWidth={0.02}
        outlineColor="#000000"
      >
        {zone.blurb}
      </Text>
    </group>
  );
}
