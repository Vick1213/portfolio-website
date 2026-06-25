'use client';

import { Suspense, memo, useEffect, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { BackSide, Group } from 'three';
import {
  Environment,
  Lightformer,
  ContactShadows,
  MeshReflectorMaterial,
  GradientTexture,
  GradientType,
} from '@react-three/drei';

import { rigChannel } from '@/lib/rig';

import Lights from './scene/Lights';
import RigScene from './scene/rig/RigScene';
import CameraRig from './scene/CameraRig';
import Effects from './scene/Effects';

import { zones } from '@/lib/portfolio';
import { overviewCamera } from '@/lib/camera';
import { useUI } from '@/lib/store';

/**
 * Bright studio environment built ONLY from inline Lightformers, no external
 * HDR (works fully offline). White product-shot lighting: a broad overhead key
 * + bright neutral side softboxes give the brushed metal clean studio
 * reflections, while four low district-accent strips tint the reflections just
 * enough to keep the RGB identity without coloring the white set.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Overhead key, broad neutral-white studio softbox. */}
      <Lightformer
        form="rect"
        intensity={1.0}
        color="#ffffff"
        scale={[40, 24, 1]}
        position={[0, 16, 0]}
        rotation-x={Math.PI / 2}
      />
      {/* Side softboxes for clean edge highlights on the metal. */}
      <Lightformer
        form="rect"
        intensity={0.65}
        color="#eef2f8"
        scale={[12, 24, 1]}
        position={[30, 6, 0]}
        rotation-y={-Math.PI / 2}
      />
      <Lightformer
        form="rect"
        intensity={0.65}
        color="#eef2f8"
        scale={[12, 24, 1]}
        position={[-30, 6, 0]}
        rotation-y={Math.PI / 2}
      />
      {/* Soft front fill so the front face isn't a flat silhouette. */}
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#ffffff"
        scale={[30, 18, 1]}
        position={[0, 4, 30]}
        rotation-y={Math.PI}
      />
      {/* Per-zone accent strips, subtle jewel-tone tint in the reflections. */}
      {zones.map((z) => (
        <Lightformer
          key={z.id}
          form="rect"
          intensity={0.3}
          color={z.accent}
          scale={[6, 2, 1]}
          position={[z.origin[0], 8, -10]}
        />
      ))}
    </Environment>
  );
}

/**
 * Glossy white "table" the rig sits on, plus soft contact shadows that ground
 * it (the shadow is what sells "on a table" against a white set). The whole
 * group tracks the rig's live world floor (rigChannel.bounds.min.y) so the rig
 * rests ON the surface regardless of model scale. Plain swap for low-power.
 */
function Floor({ plain }: { plain: boolean }) {
  const ref = useRef<Group>(null);
  useFrame(() => {
    const g = ref.current;
    const f = rigChannel.floor;
    if (!g || !f.ready) return;
    // Sit the surface just under the case bottom, centered on the case.
    g.position.set(f.x, f.y - 0.02, f.z);
  });
  return (
    <group ref={ref} position={[0, -8, 0]}>
      {/* Matte studio "table". A reflective floor mirrors the case's dark open
          side into a black slab below it (the user's "black blob"), so the
          surface is deliberately matte, grounding comes from the crisp contact
          shadow below instead. */}
      <mesh rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[160, 120]} />
        <meshStandardMaterial color="#eef1f6" metalness={0} roughness={0.96} />
      </mesh>
      {/* Tight, defined contact shadow directly under the case, small + crisp
          so the case reads as firmly planted on the studio surface. */}
      <ContactShadows
        position={[0, 0.02, 0]}
        opacity={0.62}
        blur={1.5}
        scale={16}
        far={6}
        resolution={1024}
        color="#1b2230"
      />
    </group>
  );
}

// Memoized: the Canvas must mount exactly once. Parent state changes (e.g. the
// scroll cinematic → interactive `phase` flip in ScrollStage) must NOT re-render
// the R3F <Canvas>, re-rendering it from a parent throws a "circular structure
// to JSON" error in dev and needlessly rebuilds the scene. Experience takes no
// props, so memo makes it render once and never again from above; its own store
// subscriptions still drive internal updates.
function Experience() {
  const reduced = useUI((s) => s.reduced);

  // Detect coarse pointer (mobile/touch) once, swaps the reflector for a
  // plain plane and disables atmosphere to keep touch devices smooth.
  const [coarsePointer, setCoarsePointer] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(pointer: coarse)');
    setCoarsePointer(mq.matches);
    const onChange = (e: MediaQueryListEvent) => setCoarsePointer(e.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  const lowPower = reduced || coarsePointer;

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: overviewCamera.pos, fov: 50, near: 0.1, far: 200 }}
    >
      <color attach="background" args={['#e7ebf1']} />
      <fog attach="fog" args={['#e2e7ee', 90, 190]} />

      <Suspense fallback={null}>
        {/* Seamless studio backdrop, a bright white "cyclorama" that falls off
            to a soft light-gray at the edges (gentle product-shot vignette), so
            the rig reads as lit ON a set instead of floating in a flat void. */}
        <mesh position={[0, 4, -40]}>
          <sphereGeometry args={[140, 48, 48]} />
          <meshBasicMaterial side={BackSide} fog={false}>
            <GradientTexture
              type={GradientType.Radial}
              stops={[0, 0.4, 0.75, 1]}
              colors={['#eef1f5', '#e4e9f0', '#d3dae3', '#c2cad6']}
            />
          </meshBasicMaterial>
        </mesh>

        <StudioEnvironment />

        <Floor plain={lowPower} />

        <Lights />
        <RigScene />
        <CameraRig />
        <Effects />
      </Suspense>
    </Canvas>
  );
}

export default memo(Experience);
