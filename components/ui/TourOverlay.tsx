'use client';

import { useUI, tourBus } from '@/lib/store';
import { TOUR_ORDER } from '@/lib/camera';
import { zoneById } from '@/lib/portfolio';
import type { Zone } from '@/lib/types';

const INK = '#e6ebf4';

// Career-beat copy keyed by zone — one to two readable lines per stop.
const BEAT: Record<Zone, string> = {
  ml: '2022–2024. Where it started — CNNs, LSTMs, a hackathon grader. Learning to make machines think.',
  client:
    'Shipping for real clients — marketing sites, data platforms, deadlines and stakeholders.',
  web: 'Production systems — multi-tenant marketplaces, real-time terminals, AI apps that stay online for months.',
  silicon:
    'Now — designing the chips that run the models. Custom AI-accelerator ASICs, RTL to synthesis.',
};

/**
 * Lower-third guided-tour announcement. Renders only while `tourActive`.
 * Never renders under reduced motion (startTour no-ops when reduced).
 */
export default function TourOverlay() {
  const tourActive = useUI((s) => s.tourActive);
  const tourZone = useUI((s) => s.tourZone);

  if (!tourActive) return null;

  const i = tourZone ? TOUR_ORDER.indexOf(tourZone) : -1;
  const meta = tourZone ? zoneById[tourZone] : null;
  const accent = meta ? meta.accent : INK;

  return (
    <>
      {/* Lower-third announcement (pointer-events disabled so it never blocks the canvas). */}
      <div
        role="status"
        aria-live="polite"
        style={{
          position: 'fixed',
          left: '50%',
          transform: 'translateX(-50%)',
          bottom: '88px',
          zIndex: 45,
          pointerEvents: 'none',
          textAlign: 'center',
          maxWidth: '560px',
          width: 'calc(100% - 32px)',
        }}
      >
        {/* Eyebrow */}
        <div
          className="font-mono uppercase"
          style={{
            fontSize: '10px',
            letterSpacing: '0.28em',
            color: 'rgba(255,255,255,0.55)',
            marginBottom: '8px',
            transition: 'opacity 180ms ease',
          }}
        >
          {tourZone ? `SELF-TEST ▸ DISTRICT ${i + 1}/4` : 'SELF-TEST ▸ INITIALIZING'}
        </div>

        {/* Zone title (hidden when no zone announced yet) */}
        {tourZone && meta && (
          <div
            className="font-mono uppercase"
            style={{
              fontSize: '30px',
              lineHeight: 1.05,
              letterSpacing: '0.06em',
              fontWeight: 700,
              color: accent,
              textShadow: `0 0 24px ${accent}55`,
              marginBottom: '10px',
              transition: 'opacity 180ms ease',
            }}
          >
            {meta.label}
          </div>
        )}

        {/* Career beat */}
        {tourZone && (
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: INK,
              opacity: 0.78,
              margin: '0 auto 14px',
              maxWidth: '480px',
              transition: 'opacity 180ms ease',
            }}
          >
            {BEAT[tourZone]}
          </p>
        )}

        {/* Four-segment progress strip (left→right in TOUR_ORDER). */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {TOUR_ORDER.map((zoneId, idx) => {
            const segAccent = zoneById[zoneId].accent;
            const filled = i >= 0 && idx <= i;
            return (
              <span
                key={zoneId}
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: '34px',
                  height: '3px',
                  borderRadius: 2,
                  background: segAccent,
                  opacity: filled ? 1 : 0.25,
                  transition: 'opacity 180ms ease',
                }}
              />
            );
          })}
        </div>
      </div>

      {/* SKIP pill — re-enables pointer events on itself. */}
      <button
        type="button"
        aria-label="Skip tour"
        onClick={() => tourBus.skip()}
        className="font-mono uppercase"
        style={{
          position: 'fixed',
          right: '16px',
          bottom: '88px',
          zIndex: 45,
          pointerEvents: 'auto',
          background: 'rgba(10,14,22,0.6)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 9999,
          padding: '6px 14px',
          color: 'rgba(255,255,255,0.7)',
          fontSize: '11px',
          letterSpacing: '0.14em',
          cursor: 'pointer',
        }}
      >
        SKIP ▸
      </button>
    </>
  );
}
