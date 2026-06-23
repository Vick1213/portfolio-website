'use client';

import { useEffect, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';

import { useUI } from '@/lib/store';
import { overviewCamera, zoneCamera, projectCamera } from '@/lib/camera';

export default function CameraRig() {
  const { activeZone, selected, reduced } = useUI();
  const camera = useThree((state) => state.camera);

  // Smooth look-at target, interpolated each frame by GSAP
  const lookAtTarget = useRef<THREE.Vector3>(
    new THREE.Vector3(...overviewCamera.target)
  );

  // Auto-orbit angle (radians) — accumulated over time
  const orbitAngle = useRef<number>(0);

  // Active GSAP tweens — kill before starting new ones
  const posTween = useRef<gsap.core.Tween | null>(null);
  const targetTween = useRef<gsap.core.Tween | null>(null);

  // Whether a GSAP transition is currently running
  const tweenActive = useRef<boolean>(false);

  // OrbitControls ref — typed broadly to avoid direct three-stdlib dependency
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const orbitRef = useRef<any>(null);

  // ─── GSAP tween on activeZone / selected change ───────────────────────────
  useEffect(() => {
    const pose = selected ? projectCamera(selected) : zoneCamera(activeZone);

    // Kill any in-flight tweens
    if (posTween.current) {
      posTween.current.kill();
      posTween.current = null;
    }
    if (targetTween.current) {
      targetTween.current.kill();
      targetTween.current = null;
    }

    tweenActive.current = true;

    // Tween camera position
    posTween.current = gsap.to(camera.position, {
      x: pose.pos[0],
      y: pose.pos[1],
      z: pose.pos[2],
      duration: 1.2,
      ease: 'power3.inOut',
      onComplete: () => {
        tweenActive.current = false;
        posTween.current = null;
      },
    });

    // Tween the lookAt target vector
    const lv = lookAtTarget.current;
    targetTween.current = gsap.to(lv, {
      x: pose.target[0],
      y: pose.target[1],
      z: pose.target[2],
      duration: 1.2,
      ease: 'power3.inOut',
      onComplete: () => {
        targetTween.current = null;
      },
    });

    // Sync orbit controls target to overview when returning to overview
    if (!selected && !activeZone && orbitRef.current) {
      const ov = overviewCamera.target;
      orbitRef.current.target.set(ov[0], ov[1], ov[2]);
    }
  }, [activeZone, selected, camera]);

  // ─── Per-frame: lookAt + auto-orbit ───────────────────────────────────────
  useFrame((_, delta) => {
    const inOverview = activeZone === null && selected === null;

    if (inOverview && !reduced && !tweenActive.current) {
      // Gentle auto-orbit: rotate camera position around overviewCamera.target
      const ANGULAR_VELOCITY = 0.04; // radians per second
      orbitAngle.current += ANGULAR_VELOCITY * delta;

      const ov = overviewCamera;
      const cx = ov.pos[0];
      const cy = ov.pos[1];
      const cz = ov.pos[2];
      const tx = ov.target[0];
      const tz = ov.target[2];

      // Radius in XZ plane from target
      const dx = cx - tx;
      const dz = cz - tz;
      const radius = Math.sqrt(dx * dx + dz * dz);

      // Base angle is the initial angle of the overview camera from target
      const baseAngle = Math.atan2(dz, dx);
      const angle = baseAngle + orbitAngle.current;

      camera.position.x = tx + radius * Math.cos(angle);
      camera.position.y = cy;
      camera.position.z = tz + radius * Math.sin(angle);

      // Keep lookAt target pinned to overview target
      lookAtTarget.current.set(ov.target[0], ov.target[1], ov.target[2]);
    }

    camera.lookAt(lookAtTarget.current);
  });

  // ─── OrbitControls ────────────────────────────────────────────────────────
  const inOverview = activeZone === null && selected === null;
  const overviewTarget = overviewCamera.target;

  return (
    <OrbitControls
      ref={orbitRef}
      makeDefault
      enableDamping
      enabled={inOverview}
      target={overviewTarget}
      minPolarAngle={0.2}
      maxPolarAngle={Math.PI / 2.2}
      minDistance={8}
      maxDistance={50}
    />
  );
}
