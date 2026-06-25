'use client';

import { useEffect, useLayoutEffect, useRef, useCallback } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import { useUI, camReport, tourBus } from '@/lib/store';
import { overviewCamera, componentCamera, PAN_BOUNDS, ZOOM_BOUNDS } from '@/lib/camera';
import { COMPONENT_TOUR_ORDER } from '@/lib/rig';
import { scrollChannel, cinematicPose } from '@/lib/scroll';

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

  // ─── Fly effect, token-keyed, dedup by flyRequest.token ─────────────────────
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

  // ─── BUILD TOUR timeline ────────────────────────────────────────────────────
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

    // Explode the rig for the tour. Every component lives INSIDE a closed case,
    // so touring the assembled tower just circles an opaque box, you never see
    // the part being narrated. Exploding lays each part out in the open; the
    // per-stop camera poses are read LIVE (function-based tweens below), so they
    // track each part's exploded center instead of the sealed-up rest position.
    useUI.getState().setExplodeTarget(1);

    const tl = gsap.timeline({
      onComplete: () => {
        handOff();
        useUI.getState().endTour();
      },
    });
    tourTl.current = tl;

    // Hold while the teardown settles, so the first fly's start-of-segment pose
    // read lands on the parts' final exploded positions, not a mid-spread frame.
    tl.to({}, { duration: 0.7 });

    COMPONENT_TOUR_ORDER.forEach((id, i) => {
      const isLast = i === COMPONENT_TOUR_ORDER.length - 1; // GPU finale
      const flyMs = i === 0 ? 1300 : isLast ? 1300 : 1050;
      const holdMs = isLast ? 1500 : 1050;
      const ease = i === 0 || isLast ? 'power3.inOut' : 'power2.inOut';
      // Function-based targets: gsap resolves these when the segment STARTS, so
      // each reads the live exploded center of the part via componentCamera().
      tl.to(
        camera.position,
        {
          x: () => componentCamera(id).pos[0],
          y: () => componentCamera(id).pos[1],
          z: () => componentCamera(id).pos[2],
          duration: flyMs / 1000,
          ease,
        },
        '>'
      );
      tl.to(
        lookAtTarget.current,
        {
          x: () => componentCamera(id).target[0],
          y: () => componentCamera(id).target[1],
          z: () => componentCamera(id).target[2],
          duration: flyMs / 1000,
          ease,
        },
        '<'
      );
      tl.call(() => useUI.getState().setTourComponent(id));
      tl.to({}, { duration: holdMs / 1000 }); // hold
    });

    // settle to overview + re-assemble the rig
    tl.call(() => {
      useUI.getState().setTourComponent(null);
      useUI.getState().setExplodeTarget(0);
    });
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
      useUI.getState().setTourComponent(null);
      useUI.getState().setExplodeTarget(0); // re-assemble on early exit
      // Track the settle tweens in the shared refs so a subsequent fly (e.g. a
      // component click) or unmount cancels them, no two writers fighting the camera.
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
    } else if (mode === 'cinematic') {
      // Scroll owns the camera: drive position + lookAt straight from the
      // scroll-progress channel through the keyframe path. The final keyframe
      // equals overviewCamera, so when `enterInteractive()` later flies to
      // overview there is nothing to snap.
      const pose = cinematicPose(scrollChannel.progress);
      camera.position.set(pose.pos[0], pose.pos[1], pose.pos[2]);
      lookAtTarget.current.set(pose.target[0], pose.target[1], pose.target[2]);
      camera.lookAt(lookAtTarget.current);
    } else {
      camera.lookAt(lookAtTarget.current); // GSAP owns position; we own lookAt
    }
  });

  // ─── Board-explorer controls (LEFT=rotate, RIGHT=pan, scroll=zoom) ───────────
  // OrbitControls (NOT drei MapControls): drei's MapControls calls controls.update()
  // UNCONDITIONALLY every frame, which fights the GSAP fly/tour writers; drei's
  // OrbitControls guards `if (controls.enabled) controls.update()`, giving us the
  // strict one-writer-per-frame mutex.
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
