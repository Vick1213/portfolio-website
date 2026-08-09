'use client';

import { useEffect } from 'react';

import { THEMES, useTheme } from '@/lib/themeStore';

/**
 * Six-stop theme slider that lives in the sticky résumé nav. Drives the
 * `data-theme` attribute on `.rz-root` (see themes.css). Styled entirely with
 * `--rz-*` tokens so the control itself retheme with the page.
 */
export default function ThemeSlider() {
  const theme = useTheme((s) => s.theme);
  const setTheme = useTheme((s) => s.setTheme);
  const hydrate = useTheme((s) => s.hydrate);

  // Restore the saved theme after mount only — SSR always renders 'spec'.
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const idx = Math.max(
    0,
    THEMES.findIndex((t) => t.id === theme)
  );

  return (
    <div className="rz-themer" title="Page theme">
      <div className="rz-themer-track">
        <input
          type="range"
          min={0}
          max={THEMES.length - 1}
          step={1}
          value={idx}
          aria-label="Page theme"
          aria-valuetext={THEMES[idx].label}
          onChange={(e) => setTheme(THEMES[Number(e.target.value)].id)}
          className="rz-themer-range"
        />
        <div className="rz-themer-dots" aria-hidden="true">
          {THEMES.map((t, i) => (
            <span
              key={t.id}
              className={i === idx ? 'rz-themer-dot rz-themer-dot--on' : 'rz-themer-dot'}
            />
          ))}
        </div>
      </div>
      <span className="rz-themer-label" aria-hidden="true">
        {THEMES[idx].label}
      </span>

      <style>{`
        .rz-themer {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          width: 200px;
          flex-shrink: 0;
        }
        .rz-themer-track {
          position: relative;
          width: 100%;
          height: 20px;
          display: flex;
          align-items: center;
        }
        .rz-themer-range {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          height: 20px;
          margin: 0;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        /* The track carries the active theme's progress gradient — a colorful
           strip that reads as "this changes the look". */
        .rz-themer-range::-webkit-slider-runnable-track {
          height: 4px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-progress);
        }
        .rz-themer-range::-moz-range-track {
          height: 4px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-progress);
        }
        .rz-themer-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          margin-top: -6px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-ink);
          border: 3px solid var(--rz-bg);
          box-shadow: 0 0 0 1.5px var(--rz-ink), 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .rz-themer-range::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-ink);
          border: 3px solid var(--rz-bg);
          box-shadow: 0 0 0 1.5px var(--rz-ink), 0 2px 8px rgba(0, 0, 0, 0.25);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .rz-themer-range:hover::-webkit-slider-thumb {
          transform: scale(1.25);
          box-shadow: 0 0 0 1.5px var(--rz-ink), 0 0 12px var(--rz-accent);
        }
        .rz-themer-range:hover::-moz-range-thumb {
          transform: scale(1.25);
          box-shadow: 0 0 0 1.5px var(--rz-ink), 0 0 12px var(--rz-accent);
        }
        /* Grabbed: the thumb grows under the pointer the instant it's held.
           Capped at 1.3 so it never pokes past the top of the 60px nav. */
        .rz-themer-range:active::-webkit-slider-thumb {
          transform: scale(1.3);
        }
        .rz-themer-range:active::-moz-range-thumb {
          transform: scale(1.3);
        }
        .rz-themer-range:focus-visible {
          outline: 2px solid var(--rz-accent);
          outline-offset: 4px;
        }

        /* Stop markers under the track — the thumb rides over them. */
        .rz-themer-dots {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-inline: 6px;
          pointer-events: none;
        }
        .rz-themer-dot {
          width: 6px;
          height: 6px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-bg);
          border: 1px solid var(--rz-ink);
          opacity: 0.7;
        }
        .rz-themer-dot--on { opacity: 0; }

        .rz-themer-label {
          font-family: var(--rz-mono);
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--rz-ink);
          line-height: 1;
          white-space: nowrap;
          user-select: none;
        }
        .rz-themer-label::before {
          content: 'Theme · ';
          color: var(--rz-muted);
          font-weight: 500;
        }

        @media (max-width: 560px) {
          .rz-themer { width: 128px; }
        }
      `}</style>
    </div>
  );
}
