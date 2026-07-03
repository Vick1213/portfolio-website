'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, Lightformer } from '@react-three/drei';
import { Box3, Group, MathUtils, Vector3 } from 'three';

import { useUI } from '@/lib/store';
import { useResponsive } from '@/lib/useResponsive';

/**
 * HeroRig, a small live render of the actual PC-rig model floating in the
 * résumé hero, a visual bridge to the full 3D experience. Clicking it switches
 * the app to the 3D view (`setView('3d')`).
 *
 * Deliberately lightweight: it loads the SAME `/models/rig.glb` the main scene
 * loads, mirroring that scene's loader (`useGLTF`, drei's default DRACO decoder),
 * but skips all of the heavy machinery, no postprocessing, no shadow maps, no
 * per-zone lights, no reflective floor. Just the case, soft studio lighting, and
 * a tiny inline Lightformer environment so the brushed-metal case reads white on
 * a paper page instead of muddy grey. Idle yaw + float + damped mouse parallax.
 *
 * Render guards (returns null until ALL hold): WebGL available, viewport width
 * ≥ 900px, motion not reduced, and the browser is idle (so the hero text paints
 * first). Safe to `next/dynamic` import with `ssr: false`, no top-level window
 * access.
 */

const MODEL_URL = '/models/rig.glb';

// Normalize the model's largest dimension (the tower's height) to this many
// world units, then frame it with the camera below. Chosen so the tower fills
// ~68% of the frame height at the camera distance, leaving clean margin.
const TARGET_SIZE = 2.4;

// Camera framing the centered, normalized tower with margin. fov 32 keeps the
// perspective gentle (little foreshortening) so it reads as a product shot.
const CAM_POS: [number, number, number] = [0, 0.15, 6.2];
const CAM_FOV = 32;

// Motion tuning.
const IDLE_YAW = 0.15; // rad/s continuous turntable spin
const FLOAT_AMP = 0.04; // ± world units, vertical bob
const FLOAT_SPEED = 0.9; // rad/s of the sin bob
const TILT_MAX = 0.12; // ± rad mouse-parallax tilt
const TILT_DAMP = 3; // per-second lerp toward the pointer
const HOVER_SCALE = 1.04;
const SCALE_DAMP = 6; // per-second lerp toward the hover scale

// Shared, per-frame hover flag written by the wrapper's mouse handlers and read
// inside useFrame, kept off React state so hover never re-renders the tree.
interface HoverRef {
  hovered: boolean;
}

function RigTower({ hoverRef }: { hoverRef: React.MutableRefObject<HoverRef> }) {
  const { scene } = useGLTF(MODEL_URL);

  // Clone so HMR / a second mount never mutate the shared cached graph, and
  // center + normalize the model to TARGET_SIZE so framing is independent of the
  // GLB's authored Blender scale.
  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new Box3().setFromObject(root);
    const size = box.getSize(new Vector3());
    const center = box.getCenter(new Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    const s = TARGET_SIZE / maxDim;
    // Recenter to the origin (pre-scale offset), then the outer group scales it.
    root.position.set(-center.x, -center.y, -center.z);
    return { root, scale: s };
  }, [scene]);

  const outer = useRef<Group>(null); // float (y) + hover scale
  const spin = useRef<Group>(null); // idle yaw + parallax tilt

  const yaw = useRef(0);
  const tiltX = useRef(0);
  const tiltY = useRef(0);
  const curScale = useRef(1);

  useFrame((state, delta) => {
    const d = Math.min(delta, 0.05);
    const o = outer.current;
    const sp = spin.current;
    if (!o || !sp) return;

    // Idle turntable yaw + damped pointer parallax on top of it.
    yaw.current += IDLE_YAW * d;
    const px = state.pointer.x; // normalized [-1, 1] over the canvas
    const py = state.pointer.y;
    const k = 1 - Math.exp(-TILT_DAMP * d);
    tiltY.current += (px * TILT_MAX - tiltY.current) * k;
    tiltX.current += (-py * TILT_MAX - tiltX.current) * k;
    sp.rotation.y = yaw.current + tiltY.current;
    sp.rotation.x = tiltX.current;

    // Gentle vertical float.
    o.position.y = Math.sin(state.clock.elapsedTime * FLOAT_SPEED) * FLOAT_AMP;

    // Smooth hover scale (no spring lib).
    const targetScale = hoverRef.current.hovered ? HOVER_SCALE : 1;
    const sk = 1 - Math.exp(-SCALE_DAMP * d);
    curScale.current = MathUtils.lerp(curScale.current, targetScale, sk);
    o.scale.setScalar(curScale.current);
  });

  return (
    <group ref={outer}>
      <group ref={spin}>
        <primitive object={model.root} scale={model.scale} />
      </group>
    </group>
  );
}

/**
 * Minimal inline studio env, one overhead white softbox + a front fill + a side
 * strip so the metal case picks up clean white reflections. resolution 128 +
 * frames 1: rendered ONCE into a small cube map, no per-frame cost. No external
 * HDR (works fully offline).
 */
function MiniStudio() {
  return (
    <Environment resolution={128} frames={1}>
      <Lightformer
        form="rect"
        intensity={1.1}
        color="#ffffff"
        scale={[20, 14, 1]}
        position={[0, 12, 2]}
        rotation-x={Math.PI / 2}
      />
      <Lightformer
        form="rect"
        intensity={0.6}
        color="#ffffff"
        scale={[16, 10, 1]}
        position={[0, 2, 12]}
        rotation-y={Math.PI}
      />
      <Lightformer
        form="rect"
        intensity={0.5}
        color="#eef2f8"
        scale={[8, 12, 1]}
        position={[14, 4, 0]}
        rotation-y={-Math.PI / 2}
      />
    </Environment>
  );
}

export default function HeroRig() {
  const { webgl } = useResponsive();

  // Viewport ≥ 900px (live), NOT reduced-motion, and browser idle before we
  // mount the Canvas so the hero text paints first.
  const [wide, setWide] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [idle, setIdle] = useState(false);
  const hoverRef = useRef<HoverRef>({ hovered: false });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;

    const wideMq = window.matchMedia('(min-width: 900px)');
    const reduceMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setWide(wideMq.matches);
    setReduced(reduceMq.matches);
    const onWide = (e: MediaQueryListEvent) => setWide(e.matches);
    const onReduce = (e: MediaQueryListEvent) => setReduced(e.matches);
    wideMq.addEventListener('change', onWide);
    reduceMq.addEventListener('change', onReduce);

    // Defer the Canvas until the browser is idle so the hero copy paints first.
    let idleHandle: number | undefined;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    const ric = (window as unknown as {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
    }).requestIdleCallback;
    const cic = (window as unknown as {
      cancelIdleCallback?: (h: number) => void;
    }).cancelIdleCallback;
    if (typeof ric === 'function') {
      idleHandle = ric(() => setIdle(true), { timeout: 1200 });
    } else {
      timeoutHandle = setTimeout(() => setIdle(true), 1200);
    }

    return () => {
      wideMq.removeEventListener('change', onWide);
      reduceMq.removeEventListener('change', onReduce);
      if (idleHandle !== undefined && typeof cic === 'function') cic(idleHandle);
      if (timeoutHandle !== undefined) clearTimeout(timeoutHandle);
    };
  }, []);

  const setView = useUI((s) => s.setView);

  if (!webgl || !wide || reduced || !idle) return null;

  const launch = () => setView('3d');
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      launch();
    }
  };

  return (
    <>
      <style>{`
        .rz-herorig-root {
          width: 100%;
          height: 100%;
          cursor: pointer;
          outline: none;
          -webkit-tap-highlight-color: transparent;
        }
        .rz-herorig-root:focus-visible {
          outline: 2px solid #1a2230;
          outline-offset: 6px;
          border-radius: 12px;
        }
        .rz-herorig-canvas {
          width: 100%;
          height: 100%;
        }
      `}</style>
      <div
        className="rz-herorig-root"
        role="button"
        tabIndex={0}
        aria-label="Launch the interactive 3D build"
        onClick={launch}
        onKeyDown={onKeyDown}
        onMouseEnter={() => {
          hoverRef.current.hovered = true;
        }}
        onMouseLeave={() => {
          hoverRef.current.hovered = false;
        }}
      >
        <Canvas
          className="rz-herorig-canvas"
          dpr={[1, 1.75]}
          gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
          camera={{ position: CAM_POS, fov: CAM_FOV, near: 0.1, far: 100 }}
        >
          {/* Soft ambient + a white key so the case reads on a paper-white page,
              the MiniStudio env supplies the metal's white reflections. */}
          <ambientLight intensity={0.7} color="#f4f4f2" />
          <directionalLight position={[6, 10, 8]} intensity={1.6} color="#ffffff" />
          <directionalLight position={[-8, 5, -6]} intensity={0.5} color="#dfe6f2" />

          <Suspense fallback={null}>
            <MiniStudio />
            <RigTower hoverRef={hoverRef} />
          </Suspense>
        </Canvas>
      </div>
    </>
  );
}

useGLTF.preload(MODEL_URL);
