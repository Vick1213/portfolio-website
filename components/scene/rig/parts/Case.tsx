'use client';

import { useMemo } from 'react';
import { Instance, Instances } from '@react-three/drei';
import * as THREE from 'three';

/**
 * Case — the mid-tower CHASSIS SHELL that encloses the whole build.
 *
 * size ≈ [22, 30, 16]. Deliberately SUBTLE so it never hides the inner parts:
 * an open test-bench style brushed-metal FRAME (corner rails + top/bottom edge
 * beams, instanced), a faint tempered-glass side-panel hint (large transparent
 * tinted plane), a few mesh standoff posts, and an accent power-LED strip along
 * one front edge.
 *
 * Procedural Three.js only. Centered at local origin, "front" faces +Z.
 */

type CaseProps = { accent?: string };

const W = 22; // X
const H = 30; // Y
const D = 16; // Z

// Thin square beam cross-section for the frame rails.
const RAIL = 0.5;

// Brushed-metal material shared across every frame beam (one material instance).
function FrameMaterial() {
  return (
    <meshStandardMaterial
      color="#aab3c2"
      metalness={0.9}
      roughness={0.35}
    />
  );
}

export default function Case({ accent = '#36e0c8' }: CaseProps) {
  const hx = W / 2;
  const hy = H / 2;
  const hz = D / 2;

  // --- Vertical corner rails (4) -------------------------------------------
  // Each is a tall box beam at a corner. We instance a single unit-ish beam
  // (RAIL × H × RAIL) translated to the four corners.
  const verticalRails = useMemo<[number, number, number][]>(
    () => [
      [-hx + RAIL / 2, 0, -hz + RAIL / 2],
      [hx - RAIL / 2, 0, -hz + RAIL / 2],
      [-hx + RAIL / 2, 0, hz - RAIL / 2],
      [hx - RAIL / 2, 0, hz - RAIL / 2],
    ],
    [hx, hz],
  );

  // --- Horizontal edge beams along X (top + bottom, front + back) -----------
  const beamsX = useMemo<[number, number, number][]>(
    () => [
      [0, hy - RAIL / 2, -hz + RAIL / 2],
      [0, hy - RAIL / 2, hz - RAIL / 2],
      [0, -hy + RAIL / 2, -hz + RAIL / 2],
      [0, -hy + RAIL / 2, hz - RAIL / 2],
    ],
    [hy, hz],
  );

  // --- Horizontal edge beams along Z (top + bottom, left + right) -----------
  const beamsZ = useMemo<[number, number, number][]>(
    () => [
      [-hx + RAIL / 2, hy - RAIL / 2, 0],
      [hx - RAIL / 2, hy - RAIL / 2, 0],
      [-hx + RAIL / 2, -hy + RAIL / 2, 0],
      [hx - RAIL / 2, -hy + RAIL / 2, 0],
    ],
    [hx, hy],
  );

  // --- Mesh standoff posts (motherboard-tray standoffs) ---------------------
  // Small cylinders on an inset plane near the back, where a board would mount.
  const standoffs = useMemo<[number, number, number][]>(() => {
    const sx = W * 0.3;
    const sy = H * 0.28;
    return [
      [-sx, sy, -hz + 1.2],
      [sx, sy, -hz + 1.2],
      [-sx, -sy, -hz + 1.2],
      [sx, -sy, -hz + 1.2],
      [0, 0, -hz + 1.2],
      [-sx, 0, -hz + 1.2],
      [sx, 0, -hz + 1.2],
    ];
  }, [hz]);

  return (
    <group>
      {/* Vertical corner rails (instanced) */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[RAIL, H, RAIL]} />
        <FrameMaterial />
        {verticalRails.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* Top/bottom edge beams running along X (instanced) */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[W, RAIL, RAIL]} />
        <FrameMaterial />
        {beamsX.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* Top/bottom edge beams running along Z (instanced) */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[RAIL, RAIL, D]} />
        <FrameMaterial />
        {beamsZ.map((p, i) => (
          <Instance key={i} position={p} />
        ))}
      </Instances>

      {/* Thin back panel (the only mostly-solid surface — motherboard tray) */}
      <mesh position={[0, 0, -hz + 0.6]} castShadow receiveShadow>
        <boxGeometry args={[W - RAIL, H - RAIL, 0.15]} />
        <meshStandardMaterial
          color="#0b0f18"
          metalness={0.4}
          roughness={0.6}
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Mesh standoff posts (instanced cylinders) */}
      <Instances castShadow receiveShadow>
        <cylinderGeometry args={[0.18, 0.18, 0.7, 12]} />
        <meshStandardMaterial color="#cdd6e4" metalness={0.9} roughness={0.3} />
        {standoffs.map((p, i) => (
          // rotate so the cylinder axis points along +Z (out of the tray)
          <Instance key={i} position={p} rotation={[Math.PI / 2, 0, 0]} />
        ))}
      </Instances>

      {/* Faint tempered-glass side panel hint (left face, +X out of view side
          mirrored: place on +X). Large transparent tinted plane. */}
      <mesh position={[hx - RAIL, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[D - RAIL * 2, H - RAIL * 2]} />
        <meshStandardMaterial
          color="#9fd8e8"
          metalness={0.1}
          roughness={0.05}
          transparent
          opacity={0.06}
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>

      {/* Accent power-LED strip along the front-bottom edge (emissive). */}
      <mesh position={[0, -hy + RAIL / 2, hz - RAIL]}>
        <boxGeometry args={[W * 0.85, 0.12, 0.12]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* Tiny accent power button/dot on the front-top rail. */}
      <mesh position={[-hx + RAIL * 1.6, hy - RAIL / 2, hz - RAIL / 2]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
