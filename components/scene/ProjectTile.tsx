'use client';

import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/lib/types';
import { TILE_SIZE, TILE_SIZE_FEATURED } from '@/lib/constants';
import { tilePosition } from '@/lib/camera';
import { zoneById } from '@/lib/portfolio';
import { useUI } from '@/lib/store';

interface ProjectTileProps {
  project: Project;
}

export default function ProjectTile({ project }: ProjectTileProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);
  const pulseRef = useRef(0);

  const [hovered, setHovered] = useState(false);
  const reduced = useUI((s) => s.reduced);

  const yTarget = useRef(0);
  const emissiveTarget = useRef(project.featured ? 0.5 : 0.25);
  const yCurrent = useRef(0);
  const emissiveCurrent = useRef(project.featured ? 0.5 : 0.25);

  const position = tilePosition(project);
  const accent = zoneById[project.zone].accent;

  const footprint = project.featured ? TILE_SIZE_FEATURED : TILE_SIZE;
  const height = project.featured ? 0.8 : 0.5;
  const metalness = project.featured ? 0.8 : 0.65;
  const roughness = project.featured ? 0.2 : 0.4;
  const baseEmissive = project.featured ? 0.5 : 0.25;
  const hoverEmissive = project.featured ? 1.4 : 1.0;

  // suppress unused warning — pulseRef is used inside useFrame closure
  void pulseRef;

  useFrame((state, delta) => {
    if (reduced) {
      // Static values when reduced motion is on
      if (groupRef.current) groupRef.current.position.y = 0;
      if (matRef.current) matRef.current.emissiveIntensity = baseEmissive;
      return;
    }

    yTarget.current = hovered ? 0.4 : 0;
    emissiveTarget.current = hovered ? hoverEmissive : baseEmissive;

    const lerpFactor = 1 - Math.exp(-10 * delta);
    yCurrent.current += (yTarget.current - yCurrent.current) * lerpFactor;
    emissiveCurrent.current += (emissiveTarget.current - emissiveCurrent.current) * lerpFactor;

    // Subtle ambient pulse only when not hovered
    if (!hovered) {
      const pulse = Math.sin(state.clock.elapsedTime * 0.8 + position[0] * 0.3) * 0.08;
      emissiveCurrent.current += pulse;
    }

    if (groupRef.current) {
      groupRef.current.position.y = yCurrent.current;
    }
    if (matRef.current) {
      matRef.current.emissiveIntensity = emissiveCurrent.current;
    }
  });

  const handlePointerOver = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    setHovered(true);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    document.body.style.cursor = 'auto';
  };

  const handleClick = (e: { stopPropagation: () => void }) => {
    e.stopPropagation();
    useUI.getState().select(project);
  };

  return (
    <group
      ref={groupRef}
      position={position}
    >
      <RoundedBox
        args={[footprint, height, footprint]}
        radius={0.08}
        smoothness={4}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          ref={matRef}
          color="#0d1117"
          emissive={accent}
          emissiveIntensity={baseEmissive}
          metalness={metalness}
          roughness={roughness}
        />
      </RoundedBox>
    </group>
  );
}
