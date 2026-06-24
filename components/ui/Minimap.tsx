'use client';

import { useUI } from '@/lib/store';
import {
  COMPONENT_ORDER,
  COMPONENT_SHORT,
  pcComponentById,
  projectsByComponent,
} from '@/lib/rig';

/**
 * Bottom-right "BUILD MANIFEST" — the 7 PC components as a parts legend. Each row
 * is clickable (flies to that component + opens its panel); the active part is
 * highlighted in its accent. Replaces the old die-floorplan minimap.
 */
export default function Minimap() {
  const activeComponent = useUI((s) => s.activeComponent);
  const reduced = useUI((s) => s.reduced);
  const tourActive = useUI((s) => s.tourActive);

  // Hidden during the guided tour — the TourOverlay owns the lower-right corner.
  if (tourActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '72px',
        zIndex: 30,
        pointerEvents: 'auto',
        width: '184px',
        background: 'rgba(10,14,22,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 8px 6px',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes manifest-glow {
          0%, 100% { opacity: 0.85; }
          50%      { opacity: 1; }
        }
      `}</style>

      <div
        className="font-mono uppercase"
        style={{
          fontSize: '10px',
          letterSpacing: '0.22em',
          color: 'rgba(255,255,255,0.5)',
          margin: '2px 4px 6px',
        }}
      >
        BUILD MANIFEST
      </div>

      <div className="flex flex-col gap-0.5">
        {COMPONENT_ORDER.map((id) => {
          const meta = pcComponentById[id];
          const accent = meta.accent;
          const isActive = activeComponent === id;
          const count = projectsByComponent(id).length;
          return (
            <button
              key={id}
              type="button"
              aria-label={`Fly to ${meta.label}`}
              aria-pressed={isActive}
              onClick={() => useUI.getState().setComponent(id)}
              className="font-mono flex items-center gap-2"
              style={{
                width: '100%',
                textAlign: 'left',
                padding: '5px 6px',
                borderRadius: 6,
                border: `1px solid ${isActive ? accent : 'transparent'}`,
                background: isActive ? `${accent}1f` : 'transparent',
                cursor: 'pointer',
                transition: reduced ? 'none' : 'background 140ms ease, border-color 140ms ease',
                boxShadow: isActive ? `0 0 10px ${accent}33` : 'none',
              }}
              onMouseEnter={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 2,
                  background: accent,
                  boxShadow: isActive ? `0 0 8px ${accent}` : 'none',
                  flex: '0 0 auto',
                  animation: isActive && !reduced ? 'manifest-glow 2.2s ease-in-out infinite' : 'none',
                }}
              />
              <span
                style={{
                  flex: '0 0 36px',
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  color: isActive ? accent : 'rgba(255,255,255,0.78)',
                }}
              >
                {COMPONENT_SHORT[id]}
              </span>
              <span
                style={{
                  flex: '1 1 auto',
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.4)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {meta.label}
              </span>
              <span
                style={{
                  flex: '0 0 auto',
                  fontSize: 9.5,
                  color: isActive ? accent : 'rgba(255,255,255,0.35)',
                }}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
