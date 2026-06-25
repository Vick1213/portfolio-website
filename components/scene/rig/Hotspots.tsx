'use client';

import { useRef } from 'react';
import { useFrame, type ThreeEvent } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import type { Group } from 'three';

import { useUI } from '@/lib/store';
import {
  COMPONENT_ORDER,
  COMPONENT_SHORT,
  pcComponentById,
  projectsByComponent,
  rigChannel,
  type PCComponent,
} from '@/lib/rig';

/**
 * In-scene component hotspots, one per RIG_* group, anchored to its LIVE world
 * center (so they track the part as the rig explodes/assembles). Each is a small
 * accent LED with a generous invisible hover/click sphere. Hovering (or selecting)
 * a part raises a single constant-size datasheet callout, name, role, headline
 * skills, project count, so the labels never stack into a cluster the way 7
 * always-on pills would. Clicking flies to the component and opens its panel.
 *
 * Interaction is 3D-raycast based (R3F pointer events) and coexists with
 * OrbitControls: a drag rotates, a click without drag selects.
 */
export default function Hotspots() {
  const selected = useUI((s) => s.selected);
  const activeComponent = useUI((s) => s.activeComponent);
  const hoveredComponent = useUI((s) => s.hoveredComponent);
  const tourActive = useUI((s) => s.tourActive);
  const intro = useUI((s) => s.intro);

  // Hidden while reading a project, during the guided tour, or behind the intro.
  const visible = !selected && !tourActive && !intro;

  // One callout at a time: prefer the hovered part, else the active one.
  const calloutId = hoveredComponent ?? activeComponent;

  return (
    <group visible={visible}>
      {COMPONENT_ORDER.map((id) => (
        <Hotspot
          key={id}
          id={id}
          interactive={visible}
          highlighted={activeComponent === id || hoveredComponent === id}
          showCallout={visible && calloutId === id}
        />
      ))}
    </group>
  );
}

function Hotspot({
  id,
  interactive,
  highlighted,
  showCallout,
}: {
  id: PCComponent;
  interactive: boolean;
  highlighted: boolean;
  showCallout: boolean;
}) {
  const ref = useRef<Group>(null);
  const meta = pcComponentById[id];
  const accent = meta.accent;
  const count = projectsByComponent(id).length;

  // Follow the live world center every frame (kept out of React state).
  useFrame(() => {
    const g = ref.current;
    if (!g) return;
    const c = rigChannel.centers[id];
    g.position.set(c.x, c.y, c.z);
  });

  const enter = (e: ThreeEvent<PointerEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    useUI.getState().setHoveredComponent(id);
    document.body.style.cursor = 'pointer';
  };
  const leave = () => {
    if (useUI.getState().hoveredComponent === id) {
      useUI.getState().setHoveredComponent(null);
    }
    document.body.style.cursor = '';
  };
  const click = (e: ThreeEvent<MouseEvent>) => {
    if (!interactive) return;
    e.stopPropagation();
    useUI.getState().setComponent(id);
  };

  const topSkills = meta.skills.slice(0, 3);

  return (
    <group ref={ref}>
      {/* Accent LED, decorative pulse marking the part. */}
      <mesh>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color={accent}
          emissive={accent}
          emissiveIntensity={highlighted ? 2.6 : 1.2}
          toneMapped={false}
        />
      </mesh>
      {/* Soft accent halo ring so the marker reads against busy geometry. */}
      <mesh>
        <sphereGeometry args={[0.5, 16, 16]} />
        <meshBasicMaterial color={accent} transparent opacity={highlighted ? 0.28 : 0.12} toneMapped={false} />
      </mesh>

      {/* Generous invisible hover/click target. */}
      <mesh onPointerOver={enter} onPointerOut={leave} onClick={click}>
        <sphereGeometry args={[1.6, 16, 16]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {/* Single datasheet callout, only the hovered / active part shows one. */}
      {showCallout && (
        <Html center zIndexRange={[18, 8]} style={{ pointerEvents: 'none' }}>
          <div
            className="font-mono"
            style={{
              pointerEvents: 'none',
              transform: 'translateY(-46px)',
              width: 230,
              textAlign: 'left',
              borderRadius: 10,
              border: `1px solid ${accent}`,
              background: 'rgba(8,11,18,0.92)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              boxShadow: `0 0 20px ${accent}44`,
              padding: '9px 12px',
            }}
          >
            {/* Title row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <span
                aria-hidden="true"
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: 9999,
                  background: accent,
                  boxShadow: `0 0 6px ${accent}`,
                  flex: '0 0 auto',
                }}
              />
              <span style={{ fontSize: 12, letterSpacing: '0.06em', color: accent, fontWeight: 700 }}>
                {meta.label}
              </span>
              <span style={{ marginLeft: 'auto', fontSize: 9, letterSpacing: '0.08em', color: 'rgba(255,255,255,0.4)' }}>
                {COMPONENT_SHORT[id]}
              </span>
            </div>

            {/* Role */}
            <div
              style={{
                fontSize: 9.5,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: 'rgba(255,255,255,0.5)',
                margin: '6px 0',
              }}
            >
              {meta.role}
            </div>

            {/* Headline skills */}
            {topSkills.map((sk) => (
              <div
                key={sk}
                style={{ display: 'flex', gap: 6, fontSize: 10.5, lineHeight: 1.4, color: 'rgba(255,255,255,0.72)' }}
              >
                <span aria-hidden="true" style={{ color: accent }}>·</span>
                {sk}
              </div>
            ))}

            {/* View affordance */}
            <div style={{ marginTop: 7, fontSize: 9.5, letterSpacing: '0.16em', color: accent }}>
              CLICK · {count} PROJECT{count === 1 ? '' : 'S'} →
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
