'use client';

import { Billboard, Text } from '@react-three/drei';
import type { ZoneMeta } from '@/lib/types';
import { useUI } from '@/lib/store';

// Labels omit an explicit `font` so troika-three-text uses its single shared
// global default font (one SDF atlas across all 3D text, no remote font URL).
const INK = '#e6ebf4';
const INK_OUTLINE = '#05080f';

interface ZoneLabelProps {
  zone: ZoneMeta;
}

export default function ZoneLabel({ zone }: ZoneLabelProps) {
  const activeZone = useUI((s) => s.activeZone);
  const zoomed = activeZone !== null;

  return (
    // Upright + camera-facing so labels never recede/smear along the horizon.
    // Lifted clear of tiles and pushed back in Z; capped maxWidth + hide-on-zoom
    // guarantees no collision with the ~12u-away neighbor zone or the DOM HUD.
    <Billboard position={[zone.origin[0], 4.4, -2]}>
      <Text
        fontSize={0.85}
        color={INK}
        anchorX="center"
        anchorY="bottom"
        position={[0, 0, 0]}
        outlineWidth={0.02}
        outlineColor={INK_OUTLINE}
        maxWidth={5}
        textAlign="center"
        sdfGlyphSize={128}
      >
        {zone.label}
      </Text>

      {/* Thin accent underline as the per-zone color cue */}
      <mesh position={[0, -0.16, 0]}>
        <planeGeometry args={[Math.min(zone.label.length * 0.42 + 0.4, 4.2), 0.05]} />
        <meshBasicMaterial color={zone.accent} toneMapped={false} transparent opacity={0.9} />
      </mesh>

      {/* Blurb — hidden entirely when a zone is active (zoomed in) */}
      {!zoomed && (
        <Text
          fontSize={0.32}
          color={zone.accent}
          fillOpacity={0.55}
          anchorX="center"
          anchorY="top"
          position={[0, -0.32, 0]}
          maxWidth={4}
          textAlign="center"
          outlineWidth={0.008}
          outlineColor={INK_OUTLINE}
          sdfGlyphSize={128}
        >
          {zone.blurb}
        </Text>
      )}
    </Billboard>
  );
}
