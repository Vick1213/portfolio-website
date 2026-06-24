'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF } from '@react-three/drei';
import { Box3, Object3D, Vector3 } from 'three';

import { useUI } from '@/lib/store';
import type { PCComponent } from '@/lib/rig';

const MODEL_URL = '/models/rig.glb';

// The exported GLB is ~5 units tall (Blender scale). Scale it up to fill the
// scene volume the camera/pan-bounds were tuned for.
const RIG_SCALE = 2.6;

// How far the teardown spreads. Each chunk moves out from the build's center by
// (its own offset from center) × this factor — the classic exploded-view law, so
// parts already near the edge travel further and the silhouette opens evenly.
const SPREAD = 1.5;

const COMPONENT_IDS: PCComponent[] = ['mobo', 'cpu', 'gpu', 'ram', 'storage', 'psu', 'io'];

export default function RigModel() {
  const { scene } = useGLTF(MODEL_URL);
  const reduced = useUI((s) => s.reduced);
  const explodeTarget = useUI((s) => s.explodeTarget);

  // Clone so HMR / multiple mounts don't share one mutated graph.
  const root = useMemo(() => scene.clone(true), [scene]);

  // Resolve the 7 named groups and precompute, at the ASSEMBLED state, each
  // chunk's displacement vector = (its bbox center − whole-rig center) × SPREAD.
  const parts = useMemo(() => {
    const rigCenter = new Box3().setFromObject(root).getCenter(new Vector3());
    const box = new Box3();
    const out: { node: Object3D; rest: Vector3; disp: Vector3 }[] = [];
    for (const id of COMPONENT_IDS) {
      const node = root.getObjectByName(`RIG_${id}`);
      if (!node) continue;
      box.setFromObject(node);
      if (box.isEmpty()) continue;
      const center = box.getCenter(new Vector3());
      const disp = center.sub(rigCenter).multiplyScalar(SPREAD);
      // Keep a sane minimum so a chunk sitting dead-center still separates.
      if (disp.length() < 0.6) disp.setLength(0.6);
      out.push({ node, rest: node.position.clone(), disp });
    }
    return out;
  }, [root]);

  useEffect(() => {
    root.traverse((o) => {
      o.castShadow = true;
      o.receiveShadow = true;
    });
  }, [root]);

  // Local lerped value — never touches React state per frame.
  const t = useRef(reduced ? 1 : 0);
  const tmp = useRef(new Vector3());

  useEffect(() => {
    if (reduced) t.current = 1;
  }, [reduced]);

  useFrame((_, delta) => {
    const target = reduced ? 1 : explodeTarget;
    const k = 1 - Math.exp(-6 * Math.min(delta, 0.05));
    t.current += (target - t.current) * k;
    const e = t.current;
    for (const p of parts) {
      tmp.current.copy(p.disp).multiplyScalar(e).add(p.rest);
      p.node.position.copy(tmp.current);
    }
  });

  return <primitive object={root} scale={RIG_SCALE} position={[0, -1, 0]} />;
}

useGLTF.preload(MODEL_URL);
