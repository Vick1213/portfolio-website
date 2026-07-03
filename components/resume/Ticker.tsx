'use client';

import { profile } from '@/lib/portfolio';

/**
 * Full-bleed marquee of the languages Saatvik ships in — a thin strip of
 * motion between the hero and the work. Duplicated content + translateX(-50%)
 * for a seamless loop; the global prefers-reduced-motion kill switch stops it.
 */
export default function Ticker() {
  const items = profile.languages;

  return (
    <div className="rz-ticker" aria-hidden="true">
      <div className="rz-ticker-track">
        {[0, 1].map((copy) => (
          <span className="rz-ticker-copy" key={copy}>
            {items.map((lang, i) => (
              <span className="rz-ticker-item" key={`${copy}-${lang}`}>
                {lang}
                <span className="rz-ticker-sep" style={{ color: ['#0d9488', '#4f46e5', '#a21caf', '#b45309'][i % 4] }}>
                  ✕
                </span>
              </span>
            ))}
          </span>
        ))}
      </div>

      <style>{`
        .rz-ticker {
          border-top: 1px solid var(--rz-hairline);
          overflow: hidden;
          padding-block: 14px;
          user-select: none;
        }
        .rz-ticker-track {
          display: flex;
          width: max-content;
          animation: rz-ticker-scroll 48s linear infinite;
        }
        .rz-ticker:hover .rz-ticker-track {
          animation-play-state: paused;
        }
        .rz-ticker-copy {
          display: flex;
          flex-shrink: 0;
        }
        .rz-ticker-item {
          display: inline-flex;
          align-items: center;
          font-family: var(--rz-mono);
          font-size: 12px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rz-secondary);
          white-space: nowrap;
        }
        .rz-ticker-sep {
          font-size: 9px;
          margin-inline: 1.4rem;
        }
        @keyframes rz-ticker-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .rz-ticker-track { animation: none; }
        }
      `}</style>
    </div>
  );
}
