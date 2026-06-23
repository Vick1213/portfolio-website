'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import * as THREE from 'three';
import { zones, projects } from '@/lib/portfolio';
import { tilePosition } from '@/lib/camera';
import { useUI } from '@/lib/store';

// Y-offset to float traces above die surface
const TRACE_Y = 0.05;

const PACKET_COUNT_MAX = 24;

// Module-scope scratch objects reused every frame — ZERO allocation in loop.
const V_A = new THREE.Vector3();
const V_B = new THREE.Vector3();
const V_P = new THREE.Vector3();
const M = new THREE.Matrix4();
const Q = new THREE.Quaternion();
const S = new THREE.Vector3(1, 1, 1);

interface Segment {
  a: [number, number, number];
  b: [number, number, number];
  accent: string;
  zoneIndex: number; // boot order 0 (silicon,-X) … 3 (ml,+X)
  offset: number; // per-packet phase offset
}

// drei <Line> material type (Line2Material has `opacity`).
type LineMat = THREE.Material & { opacity: number };
type LineEl = { material?: LineMat } | null;

export default function Traces() {
  const reduced = useUI((s) => s.reduced);
  const intro = useUI((s) => s.intro);

  // Build all featured→sibling segments once.
  const segments = useMemo<Segment[]>(() => {
    const segs: Segment[] = [];
    zones.forEach((zone, zi) => {
      const zoneProjects = projects.filter((p) => p.zone === zone.id);
      const featured = zoneProjects.find((p) => p.featured);
      if (!featured) return;
      const others = zoneProjects.filter((p) => p !== featured);
      if (others.length === 0) return;
      const fPos = tilePosition(featured);
      others.forEach((proj, oi) => {
        const tPos = tilePosition(proj);
        segs.push({
          a: [fPos[0], TRACE_Y, fPos[2]],
          b: [tPos[0], TRACE_Y, tPos[2]],
          accent: zone.accent,
          zoneIndex: zi,
          offset: (oi * 0.37) % 1,
        });
      });
    });
    return segs;
  }, []);

  const packetSegs = useMemo(() => segments.slice(0, PACKET_COUNT_MAX), [segments]);
  const packetCount = packetSegs.length;

  const instRef = useRef<THREE.InstancedMesh>(null!);
  const lineMatRefs = useRef<LineMat[]>([]);
  const haloMatRefs = useRef<LineMat[]>([]);

  // Tint each packet with its segment's accent (once, after mount).
  useEffect(() => {
    const mesh = instRef.current;
    if (!mesh) return;
    const c = new THREE.Color();
    for (let i = 0; i < packetCount; i++) {
      c.set(packetSegs[i].accent);
      mesh.setColorAt(i, c);
    }
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
  }, [packetSegs, packetCount]);

  // Power-on flood bookkeeping.
  const bootStart = useRef<number | null>(null);

  useFrame((state) => {
    // ---- Packets ----
    const mesh = instRef.current;
    if (mesh) {
      const t0 = state.clock.elapsedTime * 0.35;
      for (let i = 0; i < packetCount; i++) {
        const seg = packetSegs[i];
        // Reduced: frozen mid-segment. Otherwise travel along the segment.
        const t = reduced ? 0.5 : (t0 + seg.offset) % 1;
        V_A.set(seg.a[0], seg.a[1], seg.a[2]);
        V_B.set(seg.b[0], seg.b[1], seg.b[2]);
        V_P.copy(V_A).lerp(V_B, t);
        M.compose(V_P, Q, S);
        mesh.setMatrixAt(i, M);
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // ---- Power-on flood (left-to-right) ----
    if (reduced) return; // reduced lines are solid/static (set at mount)

    if (intro) {
      bootStart.current = null;
      // Pre-boot: traces dark, packets hidden behind dark lines.
      for (let i = 0; i < segments.length; i++) {
        if (lineMatRefs.current[i]) lineMatRefs.current[i].opacity = 0;
        if (haloMatRefs.current[i]) haloMatRefs.current[i].opacity = 0;
      }
      return;
    }

    if (bootStart.current === null) bootStart.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - bootStart.current;
    for (let i = 0; i < segments.length; i++) {
      const zi = segments[i].zoneIndex;
      const start = (zi / zones.length) * 0.9; // staggered window within ~1.4s
      const fill = Math.min(Math.max((elapsed - start) / 0.5, 0), 1);
      if (lineMatRefs.current[i]) lineMatRefs.current[i].opacity = fill;
      if (haloMatRefs.current[i]) haloMatRefs.current[i].opacity = 0.12 * fill;
    }
  });

  const initialLineOpacity = reduced ? 1 : 0;
  const initialHaloOpacity = reduced ? 0.12 : 0;

  return (
    <>
      {segments.map((seg, i) => {
        const points: [number, number, number][] = [seg.a, seg.b];
        return (
          <group key={i}>
            {/* Wide faint underline halo — bloom-bed */}
            <Line
              points={points}
              color={seg.accent}
              lineWidth={4}
              transparent
              opacity={initialHaloOpacity}
              ref={(node: LineEl) => {
                if (node?.material) haloMatRefs.current[i] = node.material;
              }}
            />
            {/* Bright primary trace */}
            <Line
              points={points}
              color={seg.accent}
              lineWidth={1.6}
              transparent
              opacity={initialLineOpacity}
              ref={(node: LineEl) => {
                if (node?.material) lineMatRefs.current[i] = node.material;
              }}
            />
          </group>
        );
      })}

      {/* One shared instanced mesh of traveling energy packets.
          Per-instance accent via setColorAt; basic + toneMapped=false so the
          colored dots read bright and feed Bloom. */}
      {packetCount > 0 && (
        <instancedMesh ref={instRef} args={[undefined, undefined, packetCount]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshBasicMaterial toneMapped={false} />
        </instancedMesh>
      )}
    </>
  );
}
