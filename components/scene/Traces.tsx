'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import type { Vector3 } from '@react-three/fiber';
import { zones, projects } from '@/lib/portfolio';
import { tilePosition } from '@/lib/camera';
import { useUI } from '@/lib/store';
import type { ZoneMeta } from '@/lib/types';

// Y-offset to float traces above die surface
const TRACE_Y = 0.05;

interface ZoneTracesProps {
  zone: ZoneMeta;
  reduced: boolean;
}

function ZoneTraces({ zone, reduced }: ZoneTracesProps) {
  const dashOffsetRef = useRef(0);
  const lineRefs = useRef<{ setDashOffset?: (v: number) => void }[]>([]);

  const zoneProjects = projects.filter((p) => p.zone === zone.id);
  const featured = zoneProjects.find((p) => p.featured);

  useFrame((_state, delta) => {
    if (reduced) return;
    dashOffsetRef.current -= delta * 0.5;
    // Update each line's dash offset via material
    lineRefs.current.forEach((ref) => {
      if (ref && ref.setDashOffset) {
        ref.setDashOffset(dashOffsetRef.current);
      }
    });
  });

  if (!featured) return null;

  const featuredPos = tilePosition(featured);
  const others = zoneProjects.filter((p) => p !== featured);

  if (others.length === 0) return null;

  return (
    <>
      {others.map((proj, i) => {
        const targetPos = tilePosition(proj);
        const points: Vector3[] = [
          [featuredPos[0], TRACE_Y, featuredPos[2]],
          [targetPos[0], TRACE_Y, targetPos[2]],
        ];

        return (
          <Line
            key={proj.id}
            points={points}
            color={zone.accent}
            lineWidth={0.8}
            dashed={!reduced}
            dashSize={0.3}
            gapSize={0.2}
            dashOffset={dashOffsetRef.current}
          />
        );
      })}
    </>
  );
}

export default function Traces() {
  const reduced = useUI((s) => s.reduced);

  return (
    <>
      {zones.map((zone) => (
        <ZoneTraces key={zone.id} zone={zone} reduced={reduced} />
      ))}
    </>
  );
}
