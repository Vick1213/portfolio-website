'use client';

import { useMemo, useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Billboard, Edges, Html, RoundedBox, Text } from '@react-three/drei';
import * as THREE from 'three';
import type { Project } from '@/lib/types';
import { TILE_SIZE, TILE_SIZE_FEATURED } from '@/lib/constants';
import { tilePosition } from '@/lib/camera';
import { projects, zoneById } from '@/lib/portfolio';
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
// Labels are billboarded at a fixed world size, so they balloon when the camera
// flies in close. Scale the label group ∝ distance to keep a ~constant on-screen
// size (clamped) so names never overlap up close.
const LABEL_REF_DIST = 16;
const LABEL_MIN_SCALE = 0.5;
const LABEL_MAX_SCALE = 1.5;

// Derive a SHORT display name: split on em-dash / middot, take first segment.
function shortName(name: string): string {
  return name.split(/[—·]/)[0].trim();
}

// Zone → short designator prefix for the hover datasheet callout.
const ABBR: Record<string, string> = { silicon: 'SIL', web: 'WEB', client: 'CLI', ml: 'ML' };

interface ProjectTileProps {
  project: Project;
}

export default function ProjectTile({ project }: ProjectTileProps) {
  const groupRef = useRef<THREE.Group>(null!);
  const labelRef = useRef<THREE.Group>(null!);
  const matRef = useRef<THREE.MeshStandardMaterial>(null!);

  const [hovered, setHovered] = useState(false);
  const reduced = useUI((s) => s.reduced);
  // When a project panel is open, the DOM panel is the detail surface — hide the
  // in-3D tile labels so the zoomed-in scene isn't a wall of overlapping names.
  const selected = useUI((s) => s.selected);
  // Hover callout only shows while the user is freely exploring (not mid-fly/tour).
  // Subscribe to camMode (not hoveredId) so a hover on one tile doesn't re-render all tiles.
  const camMode = useUI((s) => s.camMode);

  const position = tilePosition(project);
  const accent = zoneById[project.zone].accent;

  const footprint = project.featured ? TILE_SIZE_FEATURED : TILE_SIZE;
  const height = project.featured ? 0.8 : 0.5;
  const metalness = 0.7;
  const roughness = 0.32;
  // Lift non-featured tiles so they don't read dead-dark next to featured ones,
  // while keeping a clear featured > normal hierarchy.
  const baseEmissive = project.featured ? 0.95 : 0.74;
  const hoverEmissive = project.featured ? 1.5 : 1.15;

  const yTarget = useRef(0);
  const emissiveTarget = useRef(baseEmissive);
  const yCurrent = useRef(0);
  const emissiveCurrent = useRef(baseEmissive);

  const label = useMemo(() => shortName(project.name), [project.name]);
  const subLabel = `${project.primaryLanguage} · ${project.commits}c`;
  // Datasheet-style designator: zone abbreviation + zero-padded index within its zone.
  const designator = useMemo(() => {
    const idx = projects
      .filter((p) => p.zone === project.zone)
      .findIndex((p) => p.id === project.id);
    return `${ABBR[project.zone]}-${String(idx + 1).padStart(2, '0')}`;
  }, [project.id, project.zone]);
  const specStrip = `${project.primaryLanguage} · ${project.commits}c · ${project.months}mo`;
  const labelY = height / 2 + 0.5;
  const nameSize = project.featured ? 0.4 : 0.32;

  useFrame((state, delta) => {
    // Label visibility + constant-on-screen sizing.
    SCRATCH.set(position[0], position[1], position[2]);
    const dist = state.camera.position.distanceTo(SCRATCH);
    if (labelRef.current) {
      // Visible only in the readable band AND when no project panel is open AND
      // not while hovered (the DOM datasheet callout replaces the 3D label).
      labelRef.current.visible = dist <= CULL_DISTANCE && selected === null && !hovered;
      // Keep ~constant screen size so names don't balloon/overlap up close.
      const s = Math.min(LABEL_MAX_SCALE, Math.max(LABEL_MIN_SCALE, dist / LABEL_REF_DIST));
      labelRef.current.scale.setScalar(s);
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
    useUI.getState().setHovered(project.id);
    document.body.style.cursor = 'pointer';
  };

  const handlePointerOut = () => {
    setHovered(false);
    useUI.getState().setHovered(null);
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
          color="#212c3e"
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

      {/* Datasheet hover callout — DOM overlay, only while freely exploring this tile */}
      {hovered && camMode === 'free' && selected === null && (
        <Html
          position={[0, height / 2 + 0.9, 0]}
          center
          distanceFactor={12}
          occlude={false}
          zIndexRange={[30, 0]}
          style={{ pointerEvents: 'none' }}
        >
          <div
            style={{
              position: 'relative',
              width: 220,
              boxSizing: 'border-box',
              background: 'rgba(8,11,18,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: `1px solid ${accent}`,
              borderRadius: 8,
              padding: '10px 12px',
              boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
              color: INK,
              userSelect: 'none',
              pointerEvents: 'none',
              transition: reduced ? 'none' : 'opacity 120ms ease',
            }}
          >
            {/* Accent corner pin */}
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
                width: 6,
                height: 6,
                background: accent,
                borderRadius: 1,
              }}
            />

            <div
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                fontSize: 10,
                letterSpacing: '0.12em',
                color: accent,
                opacity: 0.75,
                marginLeft: 12,
              }}
            >
              {designator}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                fontSize: 14,
                fontWeight: 700,
                color: accent,
                marginTop: 2,
                lineHeight: 1.2,
              }}
            >
              {label}
            </div>

            <div
              style={{
                fontFamily: 'system-ui, -apple-system, Segoe UI, sans-serif',
                fontSize: 11,
                lineHeight: 1.35,
                color: INK,
                opacity: 0.9,
                marginTop: 5,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {project.tagline}
            </div>

            <div
              style={{
                fontFamily: 'var(--font-mono, ui-monospace, SFMono-Regular, Menlo, monospace)',
                fontSize: 10,
                letterSpacing: '0.04em',
                color: INK,
                opacity: 0.5,
                marginTop: 7,
              }}
            >
              {specStrip}
            </div>

            {/* Subtle accent leader line: L-shaped polyline from card bottom to a dot */}
            <svg
              width={16}
              height={22}
              style={{
                position: 'absolute',
                left: 14,
                top: '100%',
                overflow: 'visible',
                pointerEvents: 'none',
              }}
            >
              <polyline
                points="0,0 0,14 8,20"
                fill="none"
                stroke={accent}
                strokeWidth={1}
                opacity={0.7}
              />
              <circle cx={8} cy={20} r={3} fill={accent} opacity={0.7} />
            </svg>
          </div>
        </Html>
      )}
    </group>
  );
}
