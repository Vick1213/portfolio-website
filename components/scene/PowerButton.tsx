'use client';

import { useEffect, useMemo, useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import { Group, MeshStandardMaterial, Vector3 } from 'three';

import { useUI } from '@/lib/store';
import { rigChannel } from '@/lib/rig';

/**
 * On-case power button. While the rig is in STANDBY (store `intro` === true) it
 * sits dark with a slow breathing amber glow, anchored to the case's front face
 * (derived from the rig's live world AABB, never hand-guessed coordinates).
 * Clicking it powers the machine on (`setIntro(false)`), which the scene reads
 * to flood the RGB lights L→R, fade the hotspots in, and pulse the bloom.
 *
 * The button is a real 3D power glyph (emissive ring + stroke) so it reads as
 * part of the chassis, not a DOM overlay. A drag rotates the rig (OrbitControls);
 * a click without drag boots, same coexistence the hotspots use.
 */

const STANDBY = '#ffb454'; // breathing amber while powered off

export default function PowerButton() {
  const intro = useUI((s) => s.intro);
  const reduced = useUI((s) => s.reduced);

  const group = useRef<Group>(null);
  const ringMat = useRef<MeshStandardMaterial>(null);
  const strokeMat = useRef<MeshStandardMaterial>(null);
  const hovered = useRef(false);
  const pos = useMemo(() => new Vector3(), []);

  // The actual power-on. ALWAYS triggered by the physical button (or its
  // keyboard equivalent), the welcome card only arms intent, never boots. If
  // the tour was armed ("Show me the tour"), give the lit rig a beat to read as
  // "powered on", then auto-explode + run the guided tour.
  const boot = () => {
    const s = useUI.getState();
    s.setIntro(false);
    if (s.tourAfterBoot) {
      s.setTourAfterBoot(false);
      if (!s.reduced) window.setTimeout(() => useUI.getState().startTour(), 1000);
    }
  };

  // Keyboard shortcut: Enter / Space / Escape boots while in standby.
  useEffect(() => {
    if (!intro) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        e.preventDefault();
        boot();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [intro]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const p = rigChannel.power;
    if (!p.ready) {
      g.visible = false;
      return;
    }
    g.visible = intro; // only while powered off
    if (!intro) return;

    // Anchor to the case top-front edge (robust against stray geometry) and face
    // the viewer (upright Y-billboard) so the glyph always reads head-on from the
    // open side the camera frames, no per-axis guessing.
    pos.copy(p.anchor);
    g.position.copy(pos);
    g.scale.setScalar(p.size);
    g.lookAt(state.camera.position.x, g.position.y, state.camera.position.z);

    // Breathing glow (faster + brighter on hover), the "press me" cue.
    const breathe = reduced ? 0.6 : 0.5 + 0.5 * Math.sin(state.clock.elapsedTime * 2.2);
    const base = hovered.current ? 2.4 : 0.9 + breathe * 1.1;
    if (ringMat.current) ringMat.current.emissiveIntensity = base;
    if (strokeMat.current) strokeMat.current.emissiveIntensity = base;
  });

  const enter = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    hovered.current = true;
    document.body.style.cursor = 'pointer';
  };
  const leave = () => {
    hovered.current = false;
    document.body.style.cursor = '';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    hovered.current = false;
    document.body.style.cursor = '';
    boot();
  };

  return (
    <group ref={group} visible={false}>
      {/* Ring of the power glyph (⏻). Torus faces +Z toward the viewer. */}
      <mesh>
        <torusGeometry args={[1, 0.16, 16, 40]} />
        <meshStandardMaterial
          ref={ringMat}
          color={STANDBY}
          emissive={STANDBY}
          emissiveIntensity={1}
          toneMapped={false}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* The vertical stroke that breaks the ring (top-center). */}
      <mesh position={[0, 0.55, 0.02]}>
        <boxGeometry args={[0.18, 0.95, 0.18]} />
        <meshStandardMaterial
          ref={strokeMat}
          color={STANDBY}
          emissive={STANDBY}
          emissiveIntensity={1}
          toneMapped={false}
          metalness={0.2}
          roughness={0.4}
        />
      </mesh>
      {/* Dark recessed bezel behind the glyph so it reads as a real case button. */}
      <mesh position={[0, 0, -0.12]}>
        <circleGeometry args={[1.55, 40]} />
        <meshStandardMaterial color="#10141c" metalness={0.6} roughness={0.5} />
      </mesh>

      {/* Generous invisible hover/click target. */}
      <mesh onPointerOver={enter} onPointerOut={leave} onClick={click}>
        <sphereGeometry args={[2.2, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Standby hint, only while powered off (drei <Html> does NOT inherit the
          parent group's visibility, so it must be gated on `intro` explicitly). */}
      {intro && (
        <Html center zIndexRange={[18, 8]} style={{ pointerEvents: 'none' }}>
          <div
            className="font-mono"
            style={{
              pointerEvents: 'none',
              transform: 'translate(64px, -2px)',
              whiteSpace: 'nowrap',
              fontSize: 10,
              letterSpacing: '0.22em',
              textTransform: 'uppercase',
              color: STANDBY,
              textShadow: `0 0 10px ${STANDBY}aa`,
            }}
          >
            ⏻ Press to boot
          </div>
        </Html>
      )}
    </group>
  );
}
