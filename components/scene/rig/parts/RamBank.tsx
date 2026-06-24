'use client';

import { useMemo } from 'react';
import { Instances, Instance } from '@react-three/drei';
import * as THREE from 'three';

/**
 * RamBank — a bank of FOUR DIMM memory sticks standing vertically side by side.
 * Fills a [4, 6, 0.6] box, centered at local origin, "front" facing +Z.
 *
 * Each stick:
 *  - thin tall dark PCB
 *  - brushed-metal heat-spreader covering most of it (with a vented cut/notch pattern)
 *  - gold contact fingers along the bottom edge (instanced)
 *  - frosted RGB diffuser bar across the top, glowing with the accent (emissive)
 *
 * The 4 sticks are instanced via a shared group factory; the gold fingers are
 * instanced both within a stick and reused across sticks.
 */

const SIZE: [number, number, number] = [4, 6, 0.6];

// ── per-stick layout ──────────────────────────────────────────────
const STICK_COUNT = 4;
const GAP = 0.18; // gap between sticks
const STICK_W = (SIZE[0] - GAP * (STICK_COUNT - 1)) / STICK_COUNT; // ~0.86
const STICK_H = SIZE[1]; // 6
const PCB_T = 0.05;

// heat-spreader covers most of the height, leaving the contact fingers exposed
const SPREADER_H = STICK_H * 0.78;
const SPREADER_T = 0.07;
const SPREADER_Y = STICK_H * 0.06; // nudged up so fingers show at the bottom

// gold contact fingers along the bottom edge
const FINGER_COUNT = 14;
const FINGER_H = 0.35;
const FINGER_W = STICK_W / (FINGER_COUNT * 1.7);
const FINGER_GAP = (STICK_W - FINGER_COUNT * FINGER_W) / (FINGER_COUNT + 1);
const FINGERS_Y = -STICK_H / 2 + FINGER_H / 2;

// frosted RGB diffuser bar across the top
const DIFFUSER_H = 0.22;
const DIFFUSER_Y = STICK_H / 2 - DIFFUSER_H / 2 - 0.05;

// vent slots cut into the spreader face
const VENT_COUNT = 6;

export default function RamBank({ accent = '#37e0c8' }: { accent?: string }) {
  // shared geometries / materials (perf: reused across all 4 sticks)
  const fingerGeo = useMemo(
    () => new THREE.BoxGeometry(FINGER_W, FINGER_H, PCB_T + 0.01),
    [],
  );
  const ventGeo = useMemo(
    () => new THREE.BoxGeometry(STICK_W * 0.62, 0.04, SPREADER_T + 0.02),
    [],
  );

  const pcbMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0a1410',
        metalness: 0.2,
        roughness: 0.7,
      }),
    [],
  );
  const spreaderMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#c2ccd9',
        metalness: 0.9,
        roughness: 0.35,
      }),
    [],
  );
  const ventMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#1b2026',
        metalness: 0.5,
        roughness: 0.55,
      }),
    [],
  );
  const goldMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#d4af37',
        metalness: 1,
        roughness: 0.3,
      }),
    [],
  );
  const diffuserMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#0d1114',
        emissive: new THREE.Color(accent),
        emissiveIntensity: 1.6,
        metalness: 0.1,
        roughness: 0.4,
        transparent: true,
        opacity: 0.92,
        toneMapped: false,
      }),
    [accent],
  );

  // dispose on unmount
  useMemo(() => () => {
    [fingerGeo, ventGeo].forEach((g) => g.dispose());
    [pcbMat, spreaderMat, ventMat, goldMat, diffuserMat].forEach((m) => m.dispose());
  }, [fingerGeo, ventGeo, pcbMat, spreaderMat, ventMat, goldMat, diffuserMat]);

  // X positions of the 4 sticks
  const stickX = useMemo(() => {
    const xs: number[] = [];
    const span = STICK_COUNT * STICK_W + (STICK_COUNT - 1) * GAP;
    const x0 = -span / 2 + STICK_W / 2;
    for (let i = 0; i < STICK_COUNT; i++) xs.push(x0 + i * (STICK_W + GAP));
    return xs;
  }, []);

  // local X offsets of the gold fingers within one stick
  const fingerX = useMemo(() => {
    const xs: number[] = [];
    const x0 = -STICK_W / 2 + FINGER_GAP + FINGER_W / 2;
    for (let i = 0; i < FINGER_COUNT; i++) xs.push(x0 + i * (FINGER_W + FINGER_GAP));
    return xs;
  }, []);

  // Y offsets of the vent slots within the spreader
  const ventY = useMemo(() => {
    const ys: number[] = [];
    const region = SPREADER_H * 0.55;
    const step = region / (VENT_COUNT - 1);
    for (let i = 0; i < VENT_COUNT; i++) ys.push(SPREADER_Y - region / 2 + i * step);
    return ys;
  }, []);

  // one stick = a sub-group; rendered 4× at different X
  const Stick = () => (
    <group>
      {/* PCB substrate */}
      <mesh castShadow receiveShadow material={pcbMat}>
        <boxGeometry args={[STICK_W, STICK_H, PCB_T]} />
      </mesh>

      {/* heat-spreaders, front + back */}
      {[1, -1].map((side) => (
        <mesh
          key={side}
          castShadow
          receiveShadow
          material={spreaderMat}
          position={[0, SPREADER_Y, side * (PCB_T / 2 + SPREADER_T / 2)]}
        >
          <boxGeometry args={[STICK_W, SPREADER_H, SPREADER_T]} />
        </mesh>
      ))}

      {/* vented cut/notch pattern on the front spreader */}
      {ventY.map((y, i) => (
        <mesh
          key={`v${i}`}
          geometry={ventGeo}
          material={ventMat}
          position={[0, y, PCB_T / 2 + SPREADER_T]}
        />
      ))}

      {/* frosted RGB diffuser bar across the top (front + slight wrap) */}
      <mesh
        material={diffuserMat}
        position={[0, DIFFUSER_Y, PCB_T / 2 + SPREADER_T - 0.005]}
      >
        <boxGeometry args={[STICK_W * 0.94, DIFFUSER_H, SPREADER_T + 0.04]} />
      </mesh>

      {/* gold contact fingers along the bottom edge (instanced per stick) */}
      <Instances geometry={fingerGeo} material={goldMat} castShadow receiveShadow>
        {fingerX.map((x, i) => (
          <Instance key={i} position={[x, FINGERS_Y, 0]} />
        ))}
      </Instances>

      {/* center notch in the contact edge (the DIMM key) */}
      <mesh material={pcbMat} position={[STICK_W * 0.08, FINGERS_Y, 0]}>
        <boxGeometry args={[FINGER_W * 1.4, FINGER_H + 0.02, PCB_T + 0.03]} />
      </mesh>
    </group>
  );

  return (
    <group>
      {stickX.map((x, i) => (
        <group key={i} position={[x, 0, 0]}>
          <Stick />
        </group>
      ))}
    </group>
  );
}
