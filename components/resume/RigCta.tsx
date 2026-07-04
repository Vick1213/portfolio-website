'use client';

import { useUI } from '@/lib/store';
import { useResponsive } from '@/lib/useResponsive';
import Reveal from './Reveal';

const ZONE_ROW = [
  { label: 'GPU', color: '#5eead4' },
  { label: 'RAM', color: '#818cf8' },
  { label: 'SSD', color: '#f0abfc' },
  { label: 'PSU', color: '#fbbf24' },
];

/**
 * The page's single dark moment — an ink panel echoing the rig's tempered-glass
 * side, inviting the visitor into the interactive 3D build.
 */
export default function RigCta() {
  const setView = useUI((s) => s.setView);
  const { webgl } = useResponsive();

  if (!webgl) return null;

  return (
    <section className="rz-section rz-rig-section" aria-labelledby="rig-cta-heading">
      <div className="rz-col">
        <Reveal>
          <div className="rz-rig-panel">
            <img
              src="/images/themes/rig-panel.jpg"
              alt=""
              aria-hidden="true"
              className="rz-rig-bg"
              loading="lazy"
              decoding="async"
            />
            <div className="rz-rig-top">
              <span className="rz-rig-eyebrow">Interactive version</span>
              <span className="rz-rig-zones" aria-hidden="true">
                {ZONE_ROW.map((z) => (
                  <span className="rz-rig-zone" key={z.label}>
                    <span className="rz-rig-zone-chip" style={{ background: z.color }} />
                    {z.label}
                  </span>
                ))}
              </span>
            </div>

            <h2 id="rig-cta-heading" className="rz-rig-h2">
              See the <em>rig</em> this résumé lives in.
            </h2>
            <p className="rz-rig-line">
              Every project is mounted on a real component of a PC build — GPU, RAM, storage —
              explorable in WebGL with a guided cinematic intro.
            </p>
            <button type="button" className="rz-rig-button" onClick={() => setView('3d')}>
              Launch the interactive rig&nbsp;→
            </button>
          </div>
        </Reveal>
      </div>

      <style>{`
        .rz-rig-panel {
          background: #101115;
          border-radius: 20px;
          padding: clamp(36px, 6vw, 72px);
          position: relative;
          overflow: hidden;
        }
        /* Faint zone-gradient glow along the panel's top edge. */
        .rz-rig-panel::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 1px;
          background: linear-gradient(90deg, #5eead4, #818cf8, #f0abfc, #fbbf24);
          opacity: 0.9;
        }
        .rz-rig-panel::after {
          content: '';
          position: absolute;
          top: -140px;
          left: 20%;
          width: 60%;
          height: 240px;
          background: radial-gradient(closest-side, rgba(129,140,248,0.18), transparent);
          pointer-events: none;
        }

        /* Photographic backdrop — a real tempered-glass side panel with faint
           fan glow. Themes that restyle the panel (glass/neo/brutal/pixel)
           hide it via themes.css. */
        .rz-rig-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.6;
          pointer-events: none;
        }
        .rz-rig-top,
        .rz-rig-h2,
        .rz-rig-line,
        .rz-rig-button {
          position: relative;
        }

        .rz-rig-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          margin-bottom: clamp(1.75rem, 4vw, 3rem);
        }
        .rz-rig-eyebrow {
          font-family: var(--rz-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #5eead4;
        }
        .rz-rig-zones {
          display: flex;
          gap: 1.25rem;
        }
        .rz-rig-zone {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          font-family: var(--rz-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          color: rgba(230,235,244,0.55);
        }
        .rz-rig-zone-chip {
          width: 7px;
          height: 7px;
        }

        .rz-rig-h2 {
          font-family: var(--rz-display);
          font-size: clamp(30px, 4.6vw, 52px);
          font-weight: 500;
          letter-spacing: -0.02em;
          line-height: 1.05;
          color: #f2f4f8;
          margin: 0 0 1rem;
          max-width: 18em;
        }
        .rz-rig-h2 em {
          font-family: var(--rz-serif);
          font-style: italic;
          font-size: 1.08em;
          color: #5eead4;
        }
        .rz-rig-line {
          font-size: 16px;
          color: rgba(230,235,244,0.62);
          line-height: 1.6;
          margin: 0 0 2rem;
          max-width: 54ch;
        }
        .rz-rig-button {
          font-family: var(--rz-mono);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #101115;
          background: #f2f4f8;
          border: 1px solid #f2f4f8;
          border-radius: 999px;
          padding: 13px 26px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease, transform 0.2s ease;
        }
        .rz-rig-button:hover {
          background: #5eead4;
          border-color: #5eead4;
          transform: translateY(-2px);
        }

        @media (max-width: 720px) {
          .rz-rig-zones { display: none; }
        }
      `}</style>
    </section>
  );
}
