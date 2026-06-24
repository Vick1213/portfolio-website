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
      {/* Neutral fill — enough to read the dead/standby rig (visible but
          un-glowing) before power-on, without blowing the white set out. */}
      <ambientLight intensity={0.55} color="#eef2f8" />

      {/* KEY — white studio key. Tight ortho shadow frustum casts the defined
          contact shadow onto the table. */}
      <directionalLight
        position={[14, 22, 16]}
        intensity={1.5}
        color="#ffffff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-30}
        shadow-camera-right={30}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={60}
        shadow-bias={-0.0004}
      />

      {/* RIM / back — subtle edge separation against the studio sweep. No shadow. */}
      <directionalLight position={[-16, 10, -12]} intensity={0.55} color="#dfe6f2" />

      {/* Overhead keynote wash — soft, static. */}
      <spotLight
        position={[0, 24, 8]}
        angle={0.6}
        penumbra={1}
        intensity={0.7}
        color="#ffffff"
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
