'use client';

import * as THREE from 'three';
import { useMemo } from 'react';
import { Edges, Instances, Instance, Text } from '@react-three/drei';

/**
 * Cpu — a socketed CPU chip with a tower air-cooler.
 *
 * Nominal size = [4.5, 4.5, 0.8] describes only the CHIP (the green substrate +
 * brushed IHS lid). The tower heatsink + fan deliberately extend upward in +Y and
 * forward in +Z beyond that box, as an exploded teardown stack.
 *
 * Realism via detail, performance via instancing:
 *  - ~36 aluminium fins        -> one <Instances>
 *  - 9 gold solder pads        -> one <Instances>
 *  - 9 angled fan blades       -> one <Instances>
 *  - 4 heatpipe cylinders      -> small reused geometry
 * No external models/textures, no new deps.
 */

const COL = {
  substrate: '#0a1410',
  ihs: '#cdd6e4',
  ihsDark: '#9aa4b2',
  alu: '#bcc4d0',
  black: '#15191f',
  copper: '#b06a3a',
  gold: '#d4af37',
  engrave: '#444b57',
};

const FIN_COUNT = 36;
const BLADE_COUNT = 9;

export default function Cpu({ accent = '#36e0c0' }: { accent?: string }) {
  // chip footprint
  const chipW = 4.2;
  const chipD = 4.2;

  // tower geometry envelope
  const finW = 3.6;
  const finD = 2.2;
  const finThick = 0.045;
  const finGap = 0.12;
  const towerBaseY = 0.55; // top of IHS-ish
  const finStackH = FIN_COUNT * finGap; // ~4.3
  const fanY = towerBaseY + finStackH + 0.05;

  const finPositions = useMemo(
    () =>
      Array.from({ length: FIN_COUNT }, (_, i) => towerBaseY + 0.35 + i * finGap),
    [],
  );

  const padPositions = useMemo(() => {
    const out: [number, number][] = [];
    const n = 3;
    const step = 1.1;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++)
        out.push([(i - 1) * step, (j - 1) * step]);
    return out;
  }, []);

  const blades = useMemo(
    () =>
      Array.from({ length: BLADE_COUNT }, (_, i) => (i / BLADE_COUNT) * Math.PI * 2),
    [],
  );

  return (
    <group>
      {/* ---------- CHIP ---------- */}
      {/* green substrate */}
      <mesh castShadow receiveShadow position={[0, -0.18, 0]}>
        <boxGeometry args={[chipW, 0.14, chipD]} />
        <meshStandardMaterial color={COL.substrate} metalness={0.2} roughness={0.7} />
      </mesh>

      {/* gold solder pads under the substrate */}
      <Instances castShadow receiveShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.06, 12]} />
        <meshStandardMaterial color={COL.gold} metalness={1} roughness={0.3} />
        {padPositions.map(([x, z], i) => (
          <Instance key={i} position={[x, -0.27, z]} />
        ))}
      </Instances>

      {/* IHS lid — beveled / stepped brushed-metal heat spreader */}
      <group position={[0, 0, 0]}>
        {/* lower step */}
        <mesh castShadow receiveShadow position={[0, -0.04, 0]}>
          <boxGeometry args={[chipW - 0.1, 0.12, chipD - 0.1]} />
          <meshStandardMaterial color={COL.ihsDark} metalness={0.9} roughness={0.4} />
        </mesh>
        {/* raised polished plateau */}
        <mesh castShadow receiveShadow position={[0, 0.12, 0]}>
          <boxGeometry args={[chipW - 0.7, 0.2, chipD - 0.7]} />
          <meshStandardMaterial color={COL.ihs} metalness={0.95} roughness={0.32} />
          <Edges threshold={15} color={COL.engrave} />
        </mesh>
        {/* engraved branding on the lid */}
        <Text
          position={[0, 0.225, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.28}
          color={COL.engrave}
          anchorX="center"
          anchorY="middle"
          sdfGlyphSize={64}
          maxWidth={chipW - 1}
        >
          CORE
        </Text>
      </group>

      {/* ---------- TOWER HEATSINK ---------- */}
      {/* cold-plate base block sitting on the IHS */}
      <mesh castShadow receiveShadow position={[0, towerBaseY + 0.1, 0]}>
        <boxGeometry args={[finW * 0.9, 0.2, finD * 0.9]} />
        <meshStandardMaterial color={COL.ihsDark} metalness={0.92} roughness={0.34} />
      </mesh>

      {/* heatpipes — copper U-cylinders rising through the fins */}
      {[-1, -0.34, 0.34, 1].map((fx, i) => (
        <mesh
          key={i}
          castShadow
          receiveShadow
          position={[fx * (finW / 2 - 0.4), towerBaseY + 0.35 + finStackH / 2, 0]}
        >
          <cylinderGeometry args={[0.1, 0.1, finStackH + 0.6, 12]} />
          <meshStandardMaterial color={COL.copper} metalness={1} roughness={0.3} />
        </mesh>
      ))}

      {/* INSTANCED aluminium fins */}
      <Instances castShadow receiveShadow>
        <boxGeometry args={[finW, finThick, finD]} />
        <meshStandardMaterial color={COL.alu} metalness={0.88} roughness={0.38} />
        {finPositions.map((y, i) => (
          <Instance key={i} position={[0, y, 0]} />
        ))}
      </Instances>

      {/* accent RGB strip glowing along the front top edge of the fin stack */}
      <mesh position={[0, towerBaseY + 0.35 + finStackH + 0.02, finD / 2 + 0.01]}>
        <boxGeometry args={[finW, 0.06, 0.04]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.6}
          toneMapped={false}
        />
      </mesh>

      {/* ---------- FAN ---------- */}
      <group position={[0, fanY + 0.3, 0]}>
        {/* black square frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[finW + 0.1, 0.55, finD + 0.1]} />
          <meshStandardMaterial
            color={COL.black}
            metalness={0.3}
            roughness={0.6}
          />
        </mesh>
        {/* hollow the frame visually with a recessed dark inner ring on top */}
        <mesh position={[0, 0.28, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[finD / 2 - 0.05, finD / 2 - 0.05, 0.04, 16]} />
          <meshStandardMaterial color="#0c0e12" metalness={0.3} roughness={0.7} />
        </mesh>

        {/* hub */}
        <mesh castShadow receiveShadow position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.5, 0.5, 0.5, 16]} />
          <meshStandardMaterial color={COL.ihsDark} metalness={0.85} roughness={0.4} />
        </mesh>

        {/* accent RGB ring around the hub */}
        <mesh position={[0, 0.31, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.62, 0.05, 8, 24]} />
          <meshStandardMaterial
            color={accent}
            emissive={accent}
            emissiveIntensity={1.8}
            toneMapped={false}
          />
        </mesh>

        {/* INSTANCED angled blades inside the frame */}
        <Instances castShadow receiveShadow>
          <boxGeometry args={[0.95, 0.03, 0.42]} />
          <meshStandardMaterial color={COL.alu} metalness={0.6} roughness={0.45} />
          {blades.map((a, i) => (
            <Instance
              key={i}
              position={[Math.cos(a) * 0.95, 0.08, Math.sin(a) * 0.95]}
              rotation={[0.5, -a, 0]}
            />
          ))}
        </Instances>
      </group>
    </group>
  );
}
