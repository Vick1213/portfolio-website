'use client';

import * as React from 'react';
import { useMemo } from 'react';
import * as THREE from 'three';
import { Instances, Instance, Text } from '@react-three/drei';

/**
 * Psu — a power supply unit. The heavy box at the bottom of the rig.
 * size = [10, 4, 4]; front faces +Z. Procedural Three.js only.
 *
 * Features:
 *  - brushed-metal box body
 *  - top fan grille: instanced thin slat bars over a fan (hub + instanced blades)
 *  - rear vent: instanced slats
 *  - side label plate (engraved branding via drei <Text>)
 *  - cable bundle exiting one end: bent TubeGeometry cylinders -> connector blocks
 *  - accent power LED
 */
export default function Psu({ accent = '#39d98a' }: { accent?: string }) {
  const W = 10;
  const H = 4;
  const D = 4;

  // ---- Top fan grille slats (instanced thin bars across the X axis) ----
  const grilleR = 1.55; // fan radius footprint on top
  const grilleCenterX = 1.2; // fan sits toward the cable-opposite end
  const slats = useMemo(() => {
    const out: { pos: [number, number, number]; len: number }[] = [];
    const count = 13;
    const span = grilleR * 2;
    for (let i = 0; i < count; i++) {
      const t = (i / (count - 1) - 0.5) * span; // -r..r
      // chord length of the circular grille at this offset
      const inside = grilleR * grilleR - t * t;
      const len = inside > 0 ? Math.sqrt(inside) * 2 : 0;
      if (len < 0.05) continue;
      out.push({ pos: [grilleCenterX + t, H / 2 + 0.04, 0], len });
    }
    return out;
  }, []);

  // ---- Fan blades (instanced, swept around hub) ----
  const blades = useMemo(() => {
    const out: { rot: number }[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) out.push({ rot: (i / count) * Math.PI * 2 });
    return out;
  }, []);

  // ---- Rear vent slats (instanced thin horizontal bars on -X face) ----
  const ventSlats = useMemo(() => {
    const out: { y: number }[] = [];
    const count = 9;
    for (let i = 0; i < count; i++) {
      const y = (i / (count - 1) - 0.5) * (H - 1.2);
      out.push({ y });
    }
    return out;
  }, []);

  // ---- Cable bundle: bent tubes from +X end to connector blocks ----
  const cables = useMemo(() => {
    const startX = W / 2; // exit face
    const defs: { color: string; offY: number; offZ: number; spread: number }[] = [
      { color: '#1a1a1a', offY: 0.55, offZ: 0.6, spread: 0.0 },
      { color: '#1a1a1a', offY: 0.2, offZ: -0.5, spread: 0.15 },
      { color: '#caa23a', offY: -0.25, offZ: 0.35, spread: -0.1 },
      { color: '#b03030', offY: -0.6, offZ: -0.55, spread: 0.25 },
    ];
    return defs.map((d) => {
      const p0 = new THREE.Vector3(startX - 0.1, d.offY, d.offZ);
      const p1 = new THREE.Vector3(startX + 0.9, d.offY + 0.1, d.offZ * 1.1);
      const p2 = new THREE.Vector3(startX + 1.9, d.offY - 0.4 + d.spread, d.offZ * 1.3);
      const p3 = new THREE.Vector3(startX + 2.7, d.offY - 0.9 + d.spread, d.offZ * 1.5);
      const curve = new THREE.CatmullRomCurve3([p0, p1, p2, p3]);
      const geom = new THREE.TubeGeometry(curve, 24, 0.13, 10, false);
      const end = p3.clone();
      const tangent = curve.getTangentAt(1).normalize();
      return { geom, color: d.color, end, tangent };
    });
  }, []);

  // dispose tube geometries on unmount
  React.useEffect(() => {
    return () => cables.forEach((c) => c.geom.dispose());
  }, [cables]);

  return (
    <group>
      {/* ---- Main brushed-metal body ---- */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[W, H, D]} />
        <meshStandardMaterial color="#b6bfcd" metalness={0.9} roughness={0.34} />
      </mesh>

      {/* subtle darker chassis recess line on front (+Z) face */}
      <mesh position={[0, -H / 2 + 0.3, D / 2 + 0.001]}>
        <boxGeometry args={[W * 0.96, 0.08, 0.02]} />
        <meshStandardMaterial color="#5a626e" metalness={0.7} roughness={0.5} />
      </mesh>

      {/* ---- Top fan recess (dark plastic well) ---- */}
      <mesh position={[grilleCenterX, H / 2 + 0.01, 0]} receiveShadow>
        <cylinderGeometry args={[grilleR + 0.12, grilleR + 0.12, 0.18, 28]} />
        <meshStandardMaterial color="#15191f" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* ---- Fan hub ---- */}
      <mesh position={[grilleCenterX, H / 2 - 0.02, 0]} castShadow>
        <cylinderGeometry args={[0.45, 0.5, 0.22, 20]} />
        <meshStandardMaterial color="#0e1116" metalness={0.4} roughness={0.5} />
      </mesh>
      {/* hub accent dot */}
      <mesh position={[grilleCenterX, H / 2 + 0.1, 0]}>
        <cylinderGeometry args={[0.16, 0.16, 0.04, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.4}
          toneMapped={false}
        />
      </mesh>

      {/* ---- Fan blades (instanced, swept radially around hub) ---- */}
      <Instances castShadow limit={blades.length} range={blades.length}>
        <boxGeometry args={[0.16, 0.05, 0.95]} />
        <meshStandardMaterial color="#23272f" metalness={0.35} roughness={0.55} />
        {blades.map((b, i) => (
          <group key={i} rotation={[0, b.rot, 0]} position={[grilleCenterX, H / 2 - 0.02, 0]}>
            <Instance position={[0, 0, 0.55]} rotation={[0.3, 0, 0]} />
          </group>
        ))}
      </Instances>

      {/* ---- Top grille slats (instanced thin bars) ---- */}
      <Instances limit={slats.length} range={slats.length} castShadow>
        <boxGeometry args={[0.07, 0.05, 1]} />
        <meshStandardMaterial color="#3a414c" metalness={0.85} roughness={0.4} />
        {slats.map((s, i) => (
          <Instance key={i} position={s.pos} scale={[1, 1, s.len]} />
        ))}
      </Instances>
      {/* a couple of perpendicular cross-bars over the grille for honeycomb feel */}
      <Instances limit={2} range={2} castShadow>
        <boxGeometry args={[1, 0.05, 0.07]} />
        <meshStandardMaterial color="#3a414c" metalness={0.85} roughness={0.4} />
        <Instance position={[grilleCenterX, H / 2 + 0.04, -0.5]} scale={[grilleR * 1.7, 1, 1]} />
        <Instance position={[grilleCenterX, H / 2 + 0.04, 0.5]} scale={[grilleR * 1.7, 1, 1]} />
      </Instances>

      {/* ---- Rear vent slats (instanced) on -X face ---- */}
      <Instances limit={ventSlats.length} range={ventSlats.length} castShadow>
        <boxGeometry args={[0.06, 0.14, D * 0.7]} />
        <meshStandardMaterial color="#0e1116" metalness={0.4} roughness={0.6} />
        {ventSlats.map((v, i) => (
          <Instance key={i} position={[-W / 2 - 0.01, v.y, 0]} />
        ))}
      </Instances>
      {/* rear power-socket block */}
      <mesh position={[-W / 2 - 0.06, -H / 2 + 0.7, D * 0.28]} castShadow>
        <boxGeometry args={[0.18, 0.8, 0.8]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ---- Side label plate on front (+Z) face ---- */}
      <mesh position={[-1.2, 0.1, D / 2 + 0.012]}>
        <boxGeometry args={[4.2, 2.4, 0.03]} />
        <meshStandardMaterial color="#e8ecf2" metalness={0.2} roughness={0.55} />
      </mesh>
      <mesh position={[-1.2, 1.05, D / 2 + 0.03]}>
        <boxGeometry args={[4.2, 0.5, 0.01]} />
        <meshStandardMaterial color="#1b1f27" metalness={0.2} roughness={0.6} />
      </mesh>
      <Text
        position={[-1.2, 1.05, D / 2 + 0.045]}
        fontSize={0.34}
        color={accent}
        anchorX="center"
        anchorY="middle"
        sdfGlyphSize={64}
      >
        FOUNDRY PSU
      </Text>
      <Text
        position={[-1.2, 0.35, D / 2 + 0.045]}
        fontSize={0.26}
        color="#11151c"
        anchorX="center"
        anchorY="middle"
        sdfGlyphSize={64}
      >
        850W 80+ GOLD
      </Text>
      <Text
        position={[-1.2, -0.55, D / 2 + 0.045]}
        fontSize={0.16}
        color="#3a414c"
        anchorX="center"
        anchorY="middle"
        sdfGlyphSize={64}
        maxWidth={3.8}
      >
        +12V 70A  ATX 3.0  FULLY MODULAR
      </Text>

      {/* ---- Accent power LED + switch on front near rear end ---- */}
      <mesh position={[W / 2 - 0.5, -H / 2 + 0.55, D / 2 + 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.1, 0.1, 0.06, 14]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={1.8}
          toneMapped={false}
        />
      </mesh>
      {/* rocker switch beside LED */}
      <mesh position={[W / 2 - 1.0, -H / 2 + 0.55, D / 2 + 0.02]} castShadow>
        <boxGeometry args={[0.4, 0.24, 0.08]} />
        <meshStandardMaterial color="#0e1116" metalness={0.3} roughness={0.6} />
      </mesh>

      {/* ---- Cable opening shroud on +X end ---- */}
      <mesh position={[W / 2 + 0.02, -0.1, 0]} castShadow>
        <boxGeometry args={[0.22, 2.0, 2.0]} />
        <meshStandardMaterial color="#0a0c10" metalness={0.3} roughness={0.7} />
      </mesh>

      {/* ---- Cable bundle (bent tubes) + connector blocks ---- */}
      {cables.map((c, i) => (
        <group key={i}>
          <mesh geometry={c.geom} castShadow receiveShadow>
            <meshStandardMaterial color={c.color} metalness={0.2} roughness={0.7} />
          </mesh>
          {/* connector block at cable end, oriented along tube tangent */}
          <mesh
            position={c.end.clone().add(c.tangent.clone().multiplyScalar(0.25)).toArray()}
            castShadow
          >
            <boxGeometry args={[0.5, 0.32, 0.32]} />
            <meshStandardMaterial color="#111317" metalness={0.35} roughness={0.55} />
          </mesh>
          {/* accent-tinted pin row on connector */}
          <mesh
            position={c.end.clone().add(c.tangent.clone().multiplyScalar(0.5)).toArray()}
          >
            <boxGeometry args={[0.05, 0.24, 0.24]} />
            <meshStandardMaterial color="#caa23a" metalness={1} roughness={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
