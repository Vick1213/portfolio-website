'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import { useUI, camReport, tourBus } from '@/lib/store';
import { overviewCamera, zoneCamera, PAN_BOUNDS, ZOOM_BOUNDS, TOUR_ORDER } from '@/lib/camera';

// ─── Module scope (zero per-frame allocation) ────────────────────────────────
const CLAMP_V = new THREE.Vector3();

// Clamp the pan TARGET to the rig volume (X/Y/Z), then shift the camera by the
// same delta so the framing never shears. Y is clamped (not pinned) because the
// rig is a tall tower and panning is screen-space.
function clampPan(c: { target: THREE.Vector3; object: THREE.Object3D }) {
  const t = c.target;
  const cx = THREE.MathUtils.clamp(t.x, PAN_BOUNDS.minX, PAN_BOUNDS.maxX);
  const cy = THREE.MathUtils.clamp(t.y, PAN_BOUNDS.minY, PAN_BOUNDS.maxY);
  const cz = THREE.MathUtils.clamp(t.z, PAN_BOUNDS.minZ, PAN_BOUNDS.maxZ);
  CLAMP_V.set(cx - t.x, cy - t.y, cz - t.z);
  if (CLAMP_V.lengthSq() > 0) {
    t.set(cx, cy, cz);
    c.object.position.add(CLAMP_V);
  }
}

export default function CameraRig() {
  const camera = useThree((s) => s.camera);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null);

  const lookAtTarget = useRef(new THREE.Vector3(...overviewCamera.target));

  const posTween = useRef<gsap.core.Tween | null>(null);
  const targetTween = useRef<gsap.core.Tween | null>(null);
  const tourTl = useRef<gsap.core.Timeline | null>(null);
  const lastToken = useRef(0);

  const camMode = useUI((s) => s.camMode);
  const reduced = useUI((s) => s.reduced);
  const flyRequest = useUI((s) => s.flyRequest);
  const tourActive = useUI((s) => s.tourActive);

  // ─── Hand-off (no snap) ─────────────────────────────────────────────────────
  const handOff = useCallback(() => {
    const c = controlsRef.current;
    if (c) {
      c.target.copy(lookAtTarget.current);
      c.update();
    }
    useUI.getState().setCamMode('free');
  }, [camera]);

  // ─── Mount: set initial target imperatively (never pass `target` prop) ───────
  useLayoutEffect(() => {
    const c = controlsRef.current;
    if (c) {
      c.target.set(...overviewCamera.target);
      c.update();
    }
  }, []);

  // ─── Fly effect — token-keyed, dedup by flyRequest.token ─────────────────────
  useEffect(() => {
    if (!flyRequest || flyRequest.token === lastToken.current) return;
    lastToken.current = flyRequest.token;
    const { pose, durationMs } = flyRequest;
    posTween.current?.kill();
    targetTween.current?.kill();
    if (durationMs === 0) {
      // reduced → instant
      camera.position.set(...pose.pos);
      lookAtTarget.current.set(...pose.target);
      handOff();
      return;
    }
    const d = durationMs / 1000;
    posTween.current = gsap.to(camera.position, {
      x: pose.pos[0],
      y: pose.pos[1],
      z: pose.pos[2],
      duration: d,
      ease: 'power3.inOut',
    });
    targetTween.current = gsap.to(lookAtTarget.current, {
      x: pose.target[0],
      y: pose.target[1],
      z: pose.target[2],
      duration: d,
      ease: 'power3.inOut',
      onComplete: handOff,
    });
  }, [flyRequest, camera, handOff]);

  // ─── Tour timeline ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!tourActive) return;
    if (reduced) {
      useUI.getState().endTour(); // safety: never auto-animate under reduced
      return;
    }
    posTween.current?.kill();
    targetTween.current?.kill();
    let skipped = false;
    const startedAt = performance.now();
    const tl = gsap.timeline({
      onComplete: () => {
        handOff();
        useUI.getState().endTour();
      },
    });
    tourTl.current = tl;

    TOUR_ORDER.forEach((zoneId, i) => {
      const pose = zoneCamera(zoneId);
      const flyMs = i === 0 ? 1300 : zoneId === 'silicon' ? 1300 : 1100;
      const holdMs = zoneId === 'silicon' ? 1300 : 1100;
      const ease = i === 0 || zoneId === 'silicon' ? 'power3.inOut' : 'power2.inOut';
      tl.to(
        camera.position,
        { x: pose.pos[0], y: pose.pos[1], z: pose.pos[2], duration: flyMs / 1000, ease },
        '>'
      );
      tl.to(
        lookAtTarget.current,
        { x: pose.target[0], y: pose.target[1], z: pose.target[2], duration: flyMs / 1000, ease },
        '<'
      );
      tl.call(() => useUI.getState().setTourZone(zoneId));
      tl.to({}, { duration: holdMs / 1000 }); // hold
    });

    // settle to overview
    tl.call(() => useUI.getState().setTourZone(null));
    tl.to(
      camera.position,
      {
        x: overviewCamera.pos[0],
        y: overviewCamera.pos[1],
        z: overviewCamera.pos[2],
        duration: 1.4,
        ease: 'power3.inOut',
      },
      '>'
    );
    tl.to(
      lookAtTarget.current,
      {
        x: overviewCamera.target[0],
        y: overviewCamera.target[1],
        z: overviewCamera.target[2],
        duration: 1.4,
        ease: 'power3.inOut',
      },
      '<'
    );

    const doSkip = () => {
      if (skipped) return;
      skipped = true;
      tl.kill();
      useUI.getState().setTourZone(null);
      // Track the settle tweens in the shared refs so a subsequent fly (e.g. a
      // zone click) or unmount cancels them — no two writers fighting the camera.
      posTween.current?.kill();
      targetTween.current?.kill();
      posTween.current = gsap.to(camera.position, {
        x: overviewCamera.pos[0],
        y: overviewCamera.pos[1],
        z: overviewCamera.pos[2],
        duration: 0.8,
        ease: 'power3.inOut',
      });
      targetTween.current = gsap.to(lookAtTarget.current, {
        x: overviewCamera.target[0],
        y: overviewCamera.target[1],
        z: overviewCamera.target[2],
        duration: 0.8,
        ease: 'power3.inOut',
        onComplete: () => {
          handOff();
          useUI.getState().endTour();
        },
      });
    };

    tourBus.skip = doSkip;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') doSkip();
    };
    const onPointer = () => {
      if (performance.now() - startedAt > 500) doSkip(); // ignore the launching click
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('pointerdown', onPointer);
    window.addEventListener('wheel', onPointer, { passive: true });
    return () => {
      tl.kill();
      posTween.current?.kill();
      targetTween.current?.kill();
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('pointerdown', onPointer);
      window.removeEventListener('wheel', onPointer);
      tourBus.skip = () => {};
    };
  }, [tourActive, reduced, camera, handOff]);

  // ─── Per-frame ──────────────────────────────────────────────────────────────
  useFrame(() => {
    const mode = useUI.getState().camMode;
    if (mode === 'free') {
      const c = controlsRef.current;
      if (!c) return;
      clampPan(c);
      const tx = c.target.x;
      const tz = c.target.z;
      const dist = camera.position.distanceTo(c.target);
      if (
        Math.abs(tx - camReport.x) > 0.15 ||
        Math.abs(tz - camReport.z) > 0.15 ||
        Math.abs(dist - camReport.dist) > 0.5
      ) {
        camReport.x = tx;
        camReport.z = tz;
        camReport.dist = dist;
      }
      // Phase 3 TODO: live component tracking (nearest pcComponent → setActiveZoneSilently
      // equivalent) drives the HUD/manifest highlight. Disabled now (die-zone tracking removed).
    } else {
      camera.lookAt(lookAtTarget.current); // GSAP owns position; we own lookAt
    }
  });

  // ─── Board-explorer controls (drag-pan + scroll-zoom) ───────────────────────
  // OrbitControls (NOT drei MapControls): drei's MapControls calls controls.update()
  // UNCONDITIONALLY every frame, which fights the GSAP fly/tour writers; drei's
  // OrbitControls guards `if (controls.enabled) controls.update()`, giving us the
  // strict one-writer-per-frame mutex. MapControls is just OrbitControls with
  // {LEFT:PAN, screenSpacePanning:false} defaults — which we set explicitly below,
  // so the drag-to-pan / scroll-to-zoom board-explorer feel is identical.
  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={camMode === 'free'}
      enableDamping={!reduced}
      dampingFactor={0.08}
      panSpeed={0.9}
      zoomSpeed={0.8}
      rotateSpeed={0.4}
      screenSpacePanning
      zoomToCursor
      minDistance={ZOOM_BOUNDS.min}
      maxDistance={ZOOM_BOUNDS.max}
      minPolarAngle={0.35}
      maxPolarAngle={1.75}
      mouseButtons={{ LEFT: THREE.MOUSE.ROTATE, MIDDLE: THREE.MOUSE.DOLLY, RIGHT: THREE.MOUSE.PAN }}
      touches={{ ONE: THREE.TOUCH.ROTATE, TWO: THREE.TOUCH.DOLLY_PAN }}
      onStart={() => {
        posTween.current?.kill();
        targetTween.current?.kill();
        if (useUI.getState().camMode !== 'free') useUI.getState().setCamMode('free');
      }}
    />
  );
}
