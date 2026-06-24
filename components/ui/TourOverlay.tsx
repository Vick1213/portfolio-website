'use client';

import { useUI, tourBus } from '@/lib/store';
import { COMPONENT_TOUR_ORDER, pcComponentById, type PCComponent } from '@/lib/rig';

const INK = '#e6ebf4';

// Career-beat copy keyed by component — the build narrative, one to two lines.
const BEAT: Record<PCComponent, string> = {
  mobo: '2022–2024. The board it all mounts to — CNNs, LSTMs, computer vision, a hackathon grader, even a UE5 game. Learning to make machines think.',
  cpu: 'The general-purpose brain — multi-tenant marketplaces, real-time terminals, AI apps that stay online for months.',
  ram: 'Fast, modular shipping — SPAs, React Native + Flutter apps, LLM tools spun up and deployed in days.',
  storage: 'Where the data lives and moves — ETL pipelines, scrapers, DuckDB time-series, lead platforms.',
  psu: 'Powers the build and connects it to clients — paid delivery, marketing sites, self-hosted ops.',
  gpu: 'The finale — not a card he bought, a card he designed. Custom AI-accelerator silicon, RTL to synthesis.',
  io: 'The expansion slots where the CS fundamentals were learned — C++, C#/ASP.NET, XML.',
};

/**
 * Lower-third BUILD TOUR announcement. Renders only while `tourActive`.
 * Never renders under reduced motion (startTour no-ops when reduced).
 */
export default function TourOverlay() {
  const tourActive = useUI((s) => s.tourActive);
  const tourComponent = useUI((s) => s.tourComponent);

  if (!tourActive) return null;

  const total = COMPONENT_TOUR_ORDER.length;
  const i = tourComponent ? COMPONENT_TOUR_ORDER.indexOf(tourComponent) : -1;
  const meta = tourComponent ? pcComponentById[tourComponent] : null;
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
          maxWidth: '600px',
          width: 'calc(100% - 32px)',
          // Dark scrim so the lower-third copy stays legible over the white set.
          background: 'rgba(10,14,22,0.66)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: 14,
          padding: '16px 22px',
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
          {tourComponent ? `BUILD TOUR ▸ STAGE ${i + 1}/${total}` : 'BUILD TOUR ▸ POWERING UP'}
        </div>

        {/* Component title (hidden when no stop announced yet) */}
        {tourComponent && meta && (
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
        {tourComponent && (
          <p
            style={{
              fontSize: '14px',
              lineHeight: 1.5,
              color: INK,
              opacity: 0.78,
              margin: '0 auto 14px',
              maxWidth: '500px',
              transition: 'opacity 180ms ease',
            }}
          >
            {BEAT[tourComponent]}
          </p>
        )}

        {/* Progress strip (left→right in COMPONENT_TOUR_ORDER). */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
          {COMPONENT_TOUR_ORDER.map((id, idx) => {
            const segAccent = pcComponentById[id].accent;
            const filled = i >= 0 && idx <= i;
            return (
              <span
                key={id}
                aria-hidden="true"
                style={{
                  display: 'block',
                  width: '30px',
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
