'use client';

import { Suspense, useEffect, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { BackSide } from 'three';
import {
  Environment,
  Lightformer,
  Stars,
  Sparkles,
  ContactShadows,
  MeshReflectorMaterial,
  GradientTexture,
} from '@react-three/drei';

import Lights from './scene/Lights';
import ChipDie from './scene/ChipDie';
import Traces from './scene/Traces';
import ProjectTile from './scene/ProjectTile';
import ZoneLabel from './scene/ZoneLabel';
import CameraRig from './scene/CameraRig';
import Effects from './scene/Effects';

import { projects, zones } from '@/lib/portfolio';
import { overviewCamera } from '@/lib/camera';
import { useUI } from '@/lib/store';

/**
 * Self-contained studio environment built ONLY from inline Lightformers —
 * no external HDR (works fully offline). Brushed-titanium metal now has
 * something real to reflect: an overhead key, cool side fills, and four
 * district-accent strips so each zone of the die reflects its own color.
 */
function StudioEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      {/* Overhead key — broad, neutral-cool studio rect. */}
      <Lightformer
        form="rect"
        intensity={0.9}
        color="#cfd8e6"
        scale={[40, 20, 1]}
        position={[0, 15, 0]}
        rotation-x={Math.PI / 2}
      />
      {/* Cool side fills for edge separation on the metal. */}
      <Lightformer
        form="rect"
        intensity={0.35}
        color="#1a2740"
        scale={[10, 20, 1]}
        position={[30, 6, 0]}
        rotation-y={-Math.PI / 2}
      />
      <Lightformer
        form="rect"
        intensity={0.35}
        color="#1a2740"
        scale={[10, 20, 1]}
        position={[-30, 6, 0]}
        rotation-y={Math.PI / 2}
      />
      {/* Per-zone accent strips — the die reflects each district's jewel tone. */}
      {zones.map((z) => (
        <Lightformer
          key={z.id}
          form="rect"
          intensity={0.5}
          color={z.accent}
          scale={[6, 2, 1]}
          position={[z.origin[0], 8, -10]}
        />
      ))}
    </Environment>
  );
}

/** Reflective grounding plane under the die, with a plain swap for low-power. */
function Floor({ plain }: { plain: boolean }) {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[0, -1.12, 3]} receiveShadow>
        <planeGeometry args={[60, 24]} />
        {plain ? (
          <meshStandardMaterial color="#070b14" metalness={0.3} roughness={0.95} />
        ) : (
          <MeshReflectorMaterial
            resolution={512}
            blur={[400, 100]}
            mixBlur={0.8}
            mixStrength={0.4}
            color="#0a0e16"
            metalness={0.6}
            roughness={0.9}
            depthScale={0.5}
          />
        )}
      </mesh>
      <ContactShadows
        position={[0, -1.1, 3]}
        opacity={0.5}
        blur={2.4}
        scale={60}
        far={8}
        color="#000308"
        frames={1}
      />
    </>
  );
}

export default function Experience() {
  const reduced = useUI((s) => s.reduced);

  // Detect coarse pointer (mobile/touch) once — swaps the reflector for a
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
  const atmosphere = !reduced && !coarsePointer;

  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      dpr={[1, 2]}
      shadows
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: overviewCamera.pos, fov: 50, near: 0.1, far: 200 }}
    >
      <color attach="background" args={['#06080f']} />
      <fog attach="fog" args={['#070a12', 55, 130]} />

      <Suspense fallback={null}>
        {/* Graded backdrop sphere — depth instead of a flat void. */}
        <mesh scale={[1, 1, 1]}>
          <sphereGeometry args={[120, 32, 32]} />
          <meshBasicMaterial side={BackSide}>
            <GradientTexture
              stops={[0, 0.55, 1]}
              colors={['#0b1018', '#060910', '#04060c']}
            />
          </meshBasicMaterial>
        </mesh>

        <StudioEnvironment />

        {atmosphere && (
          <>
            <Sparkles
              count={60}
              scale={[54, 8, 16]}
              size={1.4}
              speed={0.15}
              opacity={0.35}
              color="#8fa4c4"
            />
            <Stars radius={90} depth={30} count={800} factor={2} fade saturation={0} />
          </>
        )}

        <Floor plain={lowPower} />

        <Lights />
        <ChipDie />
        <Traces />
        {projects.map((p) => (
          <ProjectTile key={p.id} project={p} />
        ))}
        {zones.map((z) => (
          <ZoneLabel key={z.id} zone={z} />
        ))}
        <CameraRig />
        <Effects />
      </Suspense>
    </Canvas>
  );
}
