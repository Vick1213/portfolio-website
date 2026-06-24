'use client';

import { useEffect, useRef } from 'react';

import { useUI, camReport } from '@/lib/store';
import { DIE_X_RANGE } from '@/lib/camera';
import { zones } from '@/lib/portfolio';
import type { Zone } from '@/lib/types';

const MAP_W = 200;
const MAP_H = 60;

// silicon→SIL, web→WEB, client→CLI, ml→ML
const CELL_LABEL: Record<Zone, string> = {
  silicon: 'SIL',
  web: 'WEB',
  client: 'CLI',
  ml: 'ML',
};

/**
 * Bottom-right "DIE FLOORPLAN" minimap.
 *  - Four clickable district cells (left→right: silicon, web, client, ml).
 *  - A ref-driven "you are here" viewport rect polling `camReport` via its own
 *    requestAnimationFrame (~20Hz, no React state, cancelled on unmount).
 */
export default function Minimap() {
  const activeZone = useUI((s) => s.activeZone);
  const reduced = useUI((s) => s.reduced);
  const tourActive = useUI((s) => s.tourActive);

  const rectRef = useRef<HTMLDivElement>(null);

  // "You are here" rect: ref-driven rAF poll of camReport — never touches React state.
  useEffect(() => {
    let raf = 0;
    let frame = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      // throttle to ~20Hz (every ~3rd frame at 60fps)
      frame = (frame + 1) % 3;
      if (frame !== 0) return;
      const el = rectRef.current;
      if (!el) return;

      // width ∝ visible span derived from camera distance
      const span = Math.min(52, Math.max(8, camReport.dist * 0.9));
      const rectW = (span / 52) * MAP_W;
      const cx =
        ((camReport.x - DIE_X_RANGE.min) / (DIE_X_RANGE.max - DIE_X_RANGE.min)) * MAP_W;
      let left = cx - rectW / 2;
      left = Math.max(0, Math.min(MAP_W - rectW, left));

      el.style.width = `${rectW}px`;
      el.style.left = `${left}px`;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Hidden during the guided tour — the TourOverlay owns the lower-right corner,
  // and this also removes the minimap-click-during-tour race.
  if (tourActive) return null;

  return (
    <div
      style={{
        position: 'fixed',
        right: '16px',
        bottom: '72px',
        zIndex: 30,
        pointerEvents: 'auto',
        background: 'rgba(10,14,22,0.6)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        border: '1px solid rgba(255,255,255,0.08)',
        borderRadius: 10,
        padding: '8px 10px',
        userSelect: 'none',
      }}
    >
      <style>{`
        @keyframes minimap-glow {
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
          marginBottom: '6px',
        }}
      >
        DIE FLOORPLAN
      </div>

      {/* Map box: cells + viewport rect. Background click → overview. */}
      <div
        onClick={() => useUI.getState().setZone(null)}
        style={{
          position: 'relative',
          width: `${MAP_W}px`,
          height: `${MAP_H}px`,
          borderRadius: 4,
          overflow: 'hidden',
        }}
      >
        {/* Four district cells, left→right in `zones` order (ascending world X). */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
          }}
        >
          {zones.map((zone) => {
            const accent = zone.accent;
            const isActive = activeZone === zone.id;
            return (
              <button
                key={zone.id}
                type="button"
                aria-label={`Fly to ${zone.label}`}
                aria-pressed={isActive}
                onClick={(e) => {
                  e.stopPropagation();
                  useUI.getState().setZone(zone.id);
                }}
                className="font-mono"
                style={{
                  flex: '1 1 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: isActive ? `${accent}33` : `${accent}1f`,
                  border: `1px solid ${isActive ? accent : `${accent}55`}`,
                  borderRadius: 3,
                  margin: '1px',
                  color: isActive ? accent : `${accent}cc`,
                  fontSize: '10px',
                  letterSpacing: '0.12em',
                  cursor: 'pointer',
                  transition: reduced ? 'none' : 'background 140ms ease, border-color 140ms ease',
                  boxShadow: isActive ? `0 0 10px ${accent}` : 'none',
                  animation:
                    isActive && !reduced ? 'minimap-glow 2.2s ease-in-out infinite' : 'none',
                }}
              >
                {CELL_LABEL[zone.id]}
              </button>
            );
          })}
        </div>

        {/* "You are here" viewport rectangle — ref-driven, no React state. */}
        <div
          ref={rectRef}
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '40px',
            border: '1px solid rgba(255,255,255,0.85)',
            background: 'rgba(255,255,255,0.06)',
            borderRadius: 3,
            pointerEvents: 'none',
            boxShadow: '0 0 6px rgba(255,255,255,0.25)',
          }}
        />
      </div>
    </div>
  );
}
