'use client';

import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';

import Lights from './scene/Lights';
import ChipDie from './scene/ChipDie';
import Traces from './scene/Traces';
import ProjectTile from './scene/ProjectTile';
import ZoneLabel from './scene/ZoneLabel';
import CameraRig from './scene/CameraRig';
import Effects from './scene/Effects';

import { projects, zones } from '@/lib/portfolio';
import { overviewCamera } from '@/lib/camera';

export default function Experience() {
  return (
    <Canvas
      style={{ position: 'fixed', inset: 0, touchAction: 'none' }}
      dpr={[1, 2]}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
      camera={{ position: overviewCamera.pos, fov: 50, near: 0.1, far: 200 }}
    >
      <color attach="background" args={['#04050d']} />
      <fog attach="fog" args={['#04050d', 40, 110]} />

      <Suspense fallback={null}>
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
