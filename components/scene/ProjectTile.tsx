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

  const [hovered, setHovered] = useState(false);

  // Animation targets (as refs to avoid re-renders)
  const yTarget = useRef(0);
  const emissiveTarget = useRef(0.4);
  const yCurrent = useRef(0);
  const emissiveCurrent = useRef(0.4);

  const position = tilePosition(project);
  const accent = zoneById[project.zone].accent;

  const footprint = project.featured ? TILE_SIZE_FEATURED : TILE_SIZE;
  const height = project.featured ? 0.8 : 0.5;

  useFrame((_state, delta) => {
    // Update targets based on hover state
    yTarget.current = hovered ? 0.4 : 0;
    emissiveTarget.current = hovered ? 1.2 : 0.4;

    // Lerp current values toward targets
    const lerpFactor = 1 - Math.exp(-10 * delta);
    yCurrent.current += (yTarget.current - yCurrent.current) * lerpFactor;
    emissiveCurrent.current += (emissiveTarget.current - emissiveCurrent.current) * lerpFactor;

    // Apply to group and material
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
          emissiveIntensity={0.4}
          metalness={0.7}
          roughness={0.3}
        />
      </RoundedBox>
    </group>
  );
}
