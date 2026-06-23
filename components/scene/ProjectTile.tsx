'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/lib/types';
import { TILE_SIZE, TILE_SIZE_FEATURED } from '@/lib/constants';
import { tilePosition } from '@/lib/camera';
import { zoneById } from '@/lib/portfolio';
import { useUI } from '@/lib/store';

// All 3D labels (tiles + zone labels) intentionally omit an explicit `font`
// prop so troika-three-text uses its single global default font — one shared
// SDF atlas for every label instead of one atlas per tile, and no remote font
// URL that could 404 offline.
const INK = '#e6ebf4';
const INK_OUTLINE = '#05080f';

// Module-scope scratch vector reused for every tile's distance cull — zero
// per-frame allocation.
const SCRATCH = new THREE.Vector3();
const CULL_DISTANCE = 26;

// Derive a SHORT display name: split on em-dash / middot, take first segment.
function shortName(name: string): string {
  return name.split(/[—·]/)[0].trim();
}

interface ProjectTileProps {
  project: Project;
}

export default function ProjectTile({ project }: ProjectTileProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const labelRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const [hovered, setHovered] = useState(false);
  const reduced = useUI((s) => s.reduced);

  const position = tilePosition(project);
  const accent = zoneById[project.zone].accent;

  const footprint = project.featured ? TILE_SIZE_FEATURED : TILE_SIZE;
  const height = project.featured ? 0.8 : 0.5;
  const metalness = 0.7;
  const roughness = 0.32;
  const baseEmissive = project.featured ? 0.85 : 0.55;
  const hoverEmissive = project.featured ? 1.4 : 1.0;

  const yTarget = useRef(0);
  const emissiveTarget = useRef(baseEmissive);
  const yCurrent = useRef(0);
  const emissiveCurrent = useRef(baseEmissive);

  const label = useMemo(() => shortName(project.name), [project.name]);
  const subLabel = `${project.primaryLanguage} · ${project.commits}c`;
  const labelY = height / 2 + 0.5;
  const nameSize = project.featured ? 0.4 : 0.32;

  useFrame((state, delta) => {
    // Distance cull — set the label group visible only when zoomed close.
    SCRATCH.set(position[0], position[1], position[2]);
    const dist = state.camera.position.distanceTo(SCRATCH);
    if (labelRef.current) {
      labelRef.current.visible = dist <= CULL_DISTANCE;
    }

    if (reduced) {
      if (groupRef.current) groupRef.current.position.y = 0;
      if (matRef.current) matRef.current.emissiveIntensity = baseEmissive;
      return;
    }

    yTarget.current = hovered ? 0.4 : 0;
    emissiveTarget.current = hovered ? hoverEmissive : baseEmissive;

    const lerpFactor = 1 - Math.exp(-10 * delta);
    yCurrent.current += (yTarget.current - yCurrent.current) * lerpFactor;
    emissiveCurrent.current += (emissiveTarget.current - emissiveCurrent.current) * lerpFactor;

    // Single hero motion: a subtle emissive breathe when idle.
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
    <group ref={groupRef} position={position}>
      <RoundedBox
        args={[footprint, height, footprint]}
        radius={0.08}
        smoothness={4}
        castShadow
        receiveShadow
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
        onClick={handleClick}
      >
        <meshStandardMaterial
          ref={matRef}
          color="#1a2230"
          emissive={accent}
          emissiveIntensity={baseEmissive}
          metalness={metalness}
          roughness={roughness}
        />
        {/* Always-on edge highlight so every tile reads as a lit chip block */}
        <Edges threshold={15} color={accent} transparent opacity={0.4} />
      </RoundedBox>

      {/* In-3D label — distance-culled via labelRef.visible in useFrame */}
      <group ref={labelRef}>
        <Billboard position={[0, labelY, 0]}>
          <Text
            fontSize={nameSize}
            color={INK}
            anchorX="center"
            anchorY="bottom"
            outlineWidth={0.012}
            outlineColor={INK_OUTLINE}
            maxWidth={3.2}
            textAlign="center"
            sdfGlyphSize={128}
          >
            {project.featured ? `★ ${label}` : label}
          </Text>

          {project.featured && (
            <mesh position={[0, -0.06, 0]}>
              <planeGeometry args={[Math.min(label.length * 0.22 + 0.4, 3), 0.035]} />
              <meshBasicMaterial color={accent} toneMapped={false} transparent opacity={0.85} />
            </mesh>
          )}

          <Text
            fontSize={0.18}
            color={accent}
            anchorX="center"
            anchorY="top"
            position={[0, -0.12, 0]}
            outlineWidth={0.006}
            outlineColor={INK_OUTLINE}
            maxWidth={3.2}
            textAlign="center"
            sdfGlyphSize={128}
          >
            {subLabel}
          </Text>
        </Billboard>
      </group>
    </group>
  );
}
