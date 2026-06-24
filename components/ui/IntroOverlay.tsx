'use client';

import { useState } from 'react';
import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';

const ZONE_LEGEND = 'linear-gradient(90deg, #5eead4, #818cf8, #f0abfc, #fbbf24)';
const STANDBY = '#ffb454';

/**
 * First-paint welcome card shown while the rig is in STANDBY (`intro === true`).
 * It NEVER powers the rig on — that is always the physical power button's job.
 * It only sets intent:
 *   • "Show me the tour"  → arms `tourAfterBoot`, then prompts the user to press
 *      the power button. On power-on the rig boots, waits a beat, explodes, and
 *      runs the guided tour (wired in PowerButton.boot()).
 *   • "Explore on my own" → just dismisses the card. The rig stays dark/off and
 *      the glowing power button behaves exactly as it does with no overlay.
 *   • "Skip to résumé"    → jumps to the static résumé view.
 */
export default function IntroOverlay() {
  const intro = useUI((s) => s.intro);
  const [armed, setArmed] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (!intro || dismissed) return null;

  const showTour = () => {
    useUI.getState().setTourAfterBoot(true);
    setArmed(true); // hand off to the physical power button
  };
  const exploreManually = () => {
    useUI.getState().setTourAfterBoot(false);
    setDismissed(true); // close the card; rig stays off, power button as-is
  };
  const toResume = () => {
    useUI.getState().setView('list');
    useUI.getState().setIntro(false);
  };

  // ── Armed: card hands off to the physical power button ──────────────────
  if (armed) {
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[18vh] p-4 pointer-events-none">
        <style>{`@keyframes intro-pulse { 0%,100% { opacity: 0.6; } 50% { opacity: 1; } }`}</style>
        <div
          className="font-mono text-center"
          style={{
            background: 'rgba(10,13,20,0.8)',
            border: `1px solid ${STANDBY}55`,
            borderRadius: '999px',
            padding: '0.7rem 1.2rem',
            color: STANDBY,
            fontSize: '0.8rem',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            textShadow: `0 0 12px ${STANDBY}66`,
            boxShadow: '0 12px 40px -16px rgba(0,0,0,0.7)',
            animation: 'intro-pulse 2s ease-in-out infinite',
          }}
        >
          ⏻ Press the power button to begin the tour
        </div>
      </div>
    );
  }

  // ── Choose: the welcome card ────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
      style={{
        background: 'radial-gradient(900px 600px at 50% 45%, rgba(8,11,18,0.08) 0%, rgba(8,11,18,0.28) 100%)',
        animation: 'intro-fade 0.5s ease-out',
      }}
    >
      <style>{`
        @keyframes intro-fade { from { opacity: 0; } to { opacity: 1; } }
        @keyframes intro-rise { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
        .intro-card { animation: intro-rise 0.55s cubic-bezier(0.22,1,0.36,1) both; }
        .intro-primary { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .intro-primary:hover { transform: translateY(-1px); box-shadow: 0 14px 34px -10px rgba(94,234,212,0.5); }
        .intro-ghost { transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease; }
        .intro-ghost:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.4); color: #fff; }
        .intro-skip { transition: color 0.15s ease; }
        .intro-skip:hover { color: #cbd5e1; }
      `}</style>

      <div
        className="intro-card pointer-events-auto relative w-full"
        style={{
          maxWidth: '440px',
          borderRadius: '18px',
          padding: '1.9rem 1.9rem 1.6rem',
          background: 'linear-gradient(180deg, rgba(13,17,26,0.92) 0%, rgba(10,13,20,0.94) 100%)',
          border: '1px solid rgba(255,255,255,0.12)',
          boxShadow: '0 30px 80px -24px rgba(0,0,0,0.7)',
          color: '#e6ebf4',
          overflow: 'hidden',
        }}
      >
        <div aria-hidden="true" style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: ZONE_LEGEND }} />

        <span
          className="font-mono"
          style={{ fontSize: '0.66rem', fontWeight: 600, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#5eead4' }}
        >
          Interactive Portfolio
        </span>

        <h1 style={{ fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-0.02em', margin: '0.55rem 0 0.5rem', lineHeight: 1.1 }}>
          {profile.name}
        </h1>

        <p style={{ fontSize: '0.92rem', lineHeight: 1.6, color: 'rgba(230,235,244,0.72)', margin: '0 0 1.5rem' }}>
          My career, built as a PC. Each part of the rig — CPU, GPU, board, memory —
          maps to an area of my work. Power it on and click any part to explore the
          projects inside.
        </p>

        {/* Primary: arm the guided tour (then user presses the power button) */}
        <button
          type="button"
          onClick={showTour}
          className="intro-primary pointer-events-auto w-full font-mono"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            fontSize: '0.82rem',
            fontWeight: 700,
            letterSpacing: '0.04em',
            color: '#04221d',
            background: 'linear-gradient(135deg, #5eead4 0%, #34d399 100%)',
            border: 'none',
            borderRadius: '11px',
            padding: '0.8rem 1rem',
            cursor: 'pointer',
            boxShadow: '0 10px 28px -12px rgba(94,234,212,0.55)',
          }}
        >
          ▸ SHOW ME THE TOUR
        </button>

        {/* Secondary: dismiss; explore manually via the power button */}
        <button
          type="button"
          onClick={exploreManually}
          className="intro-ghost pointer-events-auto w-full font-mono"
          style={{
            marginTop: '0.6rem',
            fontSize: '0.76rem',
            fontWeight: 600,
            letterSpacing: '0.03em',
            color: 'rgba(230,235,244,0.8)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.18)',
            borderRadius: '11px',
            padding: '0.7rem 0.8rem',
            cursor: 'pointer',
          }}
        >
          EXPLORE ON MY OWN
        </button>

        <button
          type="button"
          onClick={toResume}
          className="intro-skip pointer-events-auto font-mono"
          style={{
            display: 'block',
            margin: '1.1rem auto 0',
            fontSize: '0.74rem',
            letterSpacing: '0.04em',
            color: '#94a3b8',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          Prefer a classic résumé? Skip to it →
        </button>
      </div>
    </div>
  );
}
