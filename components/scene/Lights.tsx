'use client';

import { useEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { PointLight } from 'three';
import { zones } from '@/lib/portfolio';
import { useUI } from '@/lib/store';

const ZONE_MAX_INTENSITY = 2.2;
// Left-to-right power-on: silicon (−X) first → ml (+X) last.
const STAGGER = 0.15; // seconds between districts waking
const RAMP = 0.5; // seconds for a single district to reach full intensity

export default function Lights() {
  const intro = useUI((s) => s.intro);
  const reduced = useUI((s) => s.reduced);

  const lightRefs = useRef<(PointLight | null)[]>([]);
  // Timestamp (in elapsed-clock seconds) when the power-on sweep began; null = not started.
  const bootStart = useRef<number | null>(null);
  const booted = useRef(false);

  // When reduced, the rig is fully lit immediately and never animates.
  useEffect(() => {
    if (reduced) {
      lightRefs.current.forEach((l) => {
        if (l) l.intensity = ZONE_MAX_INTENSITY;
      });
      booted.current = true;
    }
  }, [reduced]);

  // While the intro overlay is up, hold the district lights dark so the
  // dismiss reads as a genuine power-on.
  useEffect(() => {
    if (reduced) return;
    if (intro) {
      bootStart.current = null;
      booted.current = false;
      lightRefs.current.forEach((l) => {
        if (l) l.intensity = 0;
      });
    }
  }, [intro, reduced]);

  useFrame((state) => {
    if (reduced || booted.current) return;
    if (intro) return; // still dark behind the overlay

    const t = state.clock.elapsedTime;
    if (bootStart.current == null) bootStart.current = t;
    const elapsed = t - bootStart.current;

    let allDone = true;
    for (let i = 0; i < lightRefs.current.length; i++) {
      const l = lightRefs.current[i];
      if (!l) continue;
      const local = elapsed - i * STAGGER;
      let k = local / RAMP;
      if (k < 0) k = 0;
      if (k < 1) allDone = false;
      if (k > 1) k = 1;
      // Smooth ease-out so the wake feels lit, not switched.
      const eased = 1 - (1 - k) * (1 - k);
      l.intensity = eased * ZONE_MAX_INTENSITY;
    }
    if (allDone) booted.current = true;
  });

  return (
    <>
      {/* Soft fill — Environment + ambient now carry the metal, so keep it low. */}
      <ambientLight intensity={0.35} color="#2a3550" />

      {/* KEY — static brushed-studio key. Tight ortho shadow frustum over the die. */}
      <directionalLight
        position={[12, 20, 14]}
        intensity={1.6}
        color="#eef2fb"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={60}
      />

      {/* RIM / back — cool edge separation. No shadow. */}
      <directionalLight position={[-16, 8, -12]} intensity={0.7} color="#3a5a82" />

      {/* Overhead keynote wash — soft, static. */}
      <spotLight
        position={[0, 24, 8]}
        angle={0.5}
        penumbra={1}
        intensity={1.0}
        color="#dfe6f2"
      />

      {/* Per-zone district lights — tweened 0→2.2 left-to-right on power-on. */}
      {zones.map((zone, i) => (
        <pointLight
          key={zone.id}
          ref={(el) => {
            lightRefs.current[i] = el;
          }}
          position={[zone.origin[0], 2.4, zone.origin[2]]}
          color={zone.accent}
          intensity={reduced ? ZONE_MAX_INTENSITY : 0}
          distance={14}
          decay={2}
        />
      ))}
    </>
  );
}
