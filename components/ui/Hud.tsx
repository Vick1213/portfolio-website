'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';
import { COMPONENT_ORDER, pcComponentById } from '@/lib/rig';
import ComponentNav from './ComponentNav';

const INK = '#e6ebf4';
const SILICON = '#5eead4';
// 7-accent legend hairline, in board reading order.
const COMPONENT_LEGEND = COMPONENT_ORDER.map((id) => pcComponentById[id].accent).join(', ');

export default function Hud() {
  const view = useUI((s) => s.view);
  const setView = useUI((s) => s.setView);
  const activeComponent = useUI((s) => s.activeComponent);
  const tourActive = useUI((s) => s.tourActive);
  const selected = useUI((s) => s.selected);
  const reduced = useUI((s) => s.reduced);
  const explodeTarget = useUI((s) => s.explodeTarget);
  const exploded = explodeTarget > 0.5;

  // Active-component accent drives the status dot + toggle tint; default silicon teal.
  const accent = activeComponent ? pcComponentById[activeComponent].accent : SILICON;

  // Esc → overview, gated so it never conflicts with ProjectPanel's or the tour's Esc.
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      const s = useUI.getState();
      if (s.selected === null && s.activeComponent !== null && !s.tourActive) {
        s.setComponent(null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, []);

  // Mode-aware bottom-left helper text.
  const helperText = tourActive
    ? null
    : activeComponent !== null && selected === null
      ? 'DRAG TO EXPLORE · ESC FOR OVERVIEW'
      : 'LEFT-DRAG ROTATE · RIGHT-DRAG PAN · SCROLL ZOOM · CLICK A PART';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      style={{ height: '56px' }}
    >
      <style>{`
        @keyframes hud-pulse {
          0%, 100% { opacity: 0.55; transform: scale(0.9); }
          50%      { opacity: 1;    transform: scale(1.1); }
        }
        /* Component nav becomes a swipeable strip when it can't fit (mobile). */
        .hud-nav-scroll {
          overflow-x: auto;
          overflow-y: hidden;
          overscroll-behavior-x: contain;
          scrollbar-width: none;
          -ms-overflow-style: none;
          -webkit-overflow-scrolling: touch;
        }
        .hud-mail:active {
          transform: scale(0.96);
        }
        .hud-nav-scroll::-webkit-scrollbar { display: none; }
        /* Free up horizontal room on small screens. */
        @media (max-width: 720px) {
          .hud-subtitle { display: none; }
        }
        @media (max-width: 560px) {
          .hud-explode { display: none; }
          .hud-email-label { display: none; }
        }
      `}</style>

      {/* Frosted-glass keynote plank */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(10,14,22,0.82) 0%, rgba(10,14,22,0.5) 100%)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.12)',
        }}
      />

      {/* Component-accent legend hairline */}
      <div
        aria-hidden="true"
        className="absolute left-0 right-0"
        style={{
          top: '56px',
          height: '1px',
          background: `linear-gradient(90deg, ${COMPONENT_LEGEND})`,
          opacity: 0.5,
        }}
      />

      <div className="relative flex items-center justify-between h-full px-4 gap-3">
        {/* Left: two-line identity + status dot */}
        <div className="pointer-events-auto flex-shrink-0 min-w-0 flex flex-col justify-center leading-none">
          <div className="flex items-center gap-2 min-w-0">
            <span
              className="font-mono truncate"
              style={{
                color: INK,
                opacity: 0.92,
                fontSize: '13px',
                letterSpacing: '0.02em',
              }}
              aria-label={`Portfolio of ${profile.name}`}
            >
              {profile.name}
            </span>
            <span
              className="flex items-center gap-1 flex-shrink-0 font-mono"
              style={{ fontSize: '9px', color: accent, letterSpacing: '0.18em' }}
              aria-label="Status: online"
            >
              <span
                aria-hidden="true"
                className="inline-block rounded-full"
                style={{
                  width: '5px',
                  height: '5px',
                  background: accent,
                  boxShadow: `0 0 6px ${accent}`,
                  animation: 'hud-pulse 2.4s ease-in-out infinite',
                }}
              />
              ONLINE
            </span>
          </div>
          <span
            className="hud-subtitle font-mono uppercase truncate mt-1"
            style={{
              fontSize: '10px',
              letterSpacing: '0.24em',
              color: 'rgba(255,255,255,0.45)',
            }}
          >
            CHIP ARCHITECT · FULL-STACK
          </span>
        </div>

        {/* Center: component nav, swipeable strip on small screens */}
        <div className="hud-nav-scroll pointer-events-auto flex-1 flex justify-center">
          <ComponentNav />
        </div>

        {/* Right cluster: EXPLODE toggle + TOUR pill + 3D / List segmented toggle */}
        <div className="flex-shrink-0 flex items-center gap-2">
          {/* EXPLODE / ASSEMBLE, only in 3D view */}
          {view === '3d' && (
            <button
              type="button"
              onClick={() => useUI.getState().toggleExplode()}
              aria-pressed={exploded}
              aria-label={exploded ? 'Assemble the rig' : 'Explode the rig'}
              className="hud-explode pointer-events-auto flex-shrink-0 rounded-full font-mono text-xs px-3.5 py-1.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                border: `1px solid ${accent}`,
                color: accent,
                background: exploded ? `${accent}2e` : `${accent}14`,
                outlineColor: accent,
              }}
            >
              {exploded ? '▣ ASSEMBLE' : '◳ EXPLODE'}
            </button>
          )}

          {/* BUILD TOUR pill, only in 3D view and when motion is allowed */}
          {!reduced && view === '3d' && (
            <button
              type="button"
              onClick={() => useUI.getState().startTour()}
              disabled={tourActive}
              aria-label={tourActive ? 'Tour in progress' : 'Start build tour'}
              className="pointer-events-auto flex-shrink-0 rounded-full font-mono text-xs px-3.5 py-1.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
              style={{
                border: `1px solid ${tourActive ? 'rgba(255,255,255,0.15)' : accent}`,
                color: tourActive ? 'rgba(255,255,255,0.35)' : accent,
                background: tourActive ? 'transparent' : `${accent}1f`,
                outlineColor: accent,
                cursor: tourActive ? 'default' : 'pointer',
              }}
            >
              {tourActive ? 'TOURING…' : '▸ TOUR'}
            </button>
          )}

          {/* Email CTA, an always-present "next step" so the experience never
              dead-ends. Filled with the active accent to read as the primary action. */}
          <a
            href={`mailto:${profile.email}`}
            aria-label={`Email ${profile.name}`}
            className="hud-mail pointer-events-auto flex-shrink-0 rounded-full font-mono text-xs px-3.5 py-1.5 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              border: `1px solid ${accent}`,
              color: '#06080f',
              background: accent,
              outlineColor: accent,
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            ✉ <span className="hud-email-label">Email</span>
          </a>

          {/* 3D / Résumé segmented toggle */}
          <div
            role="group"
            aria-label="View mode"
            className="pointer-events-auto flex-shrink-0 flex items-center rounded-full font-mono text-xs overflow-hidden"
            style={{
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.02)',
            }}
          >
          <button
            type="button"
            onClick={() => setView('3d')}
            aria-pressed={view === '3d'}
            aria-label="3D view"
            className="px-3.5 py-1.5 rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              background: view === '3d' ? `${accent}1f` : 'transparent',
              color: view === '3d' ? accent : 'rgba(255,255,255,0.4)',
              outlineColor: accent,
            }}
          >
            3D
          </button>
          <button
            type="button"
            onClick={() => setView('list')}
            aria-pressed={view === 'list'}
            aria-label="Résumé view"
            className="px-3.5 py-1.5 rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              background: view === 'list' ? `${accent}1f` : 'transparent',
              color: view === 'list' ? accent : 'rgba(255,255,255,0.4)',
              outlineColor: accent,
            }}
          >
            Résumé
          </button>
          </div>
        </div>
      </div>

      {/* Bottom-left ghost helper line, lifted clear of the ~55px footer bar.
          Sits directly over the white set, so it gets its own dark pill + dark
          ink to stay legible. */}
      {helperText && (
        <span
          aria-hidden="true"
          className="fixed left-4 font-mono uppercase pointer-events-none select-none"
          style={{
            bottom: '72px',
            fontSize: '10px',
            letterSpacing: '0.18em',
            color: 'rgba(255,255,255,0.78)',
            background: 'rgba(10,14,22,0.55)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            borderRadius: '9999px',
            padding: '4px 10px',
          }}
        >
          {helperText}
        </span>
      )}
    </header>
  );
}
