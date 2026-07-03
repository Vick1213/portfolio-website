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
          gap: 3px;
          width: 148px;
          flex-shrink: 0;
        }
        .rz-themer-track {
          position: relative;
          width: 100%;
          height: 16px;
          display: flex;
          align-items: center;
        }
        .rz-themer-range {
          appearance: none;
          -webkit-appearance: none;
          width: 100%;
          height: 16px;
          margin: 0;
          background: transparent;
          cursor: pointer;
          position: relative;
          z-index: 1;
        }
        .rz-themer-range::-webkit-slider-runnable-track {
          height: 2px;
          background: var(--rz-hairline-strong);
        }
        .rz-themer-range::-moz-range-track {
          height: 2px;
          background: var(--rz-hairline-strong);
        }
        .rz-themer-range::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 12px;
          height: 12px;
          margin-top: -5px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-accent);
          border: 2px solid var(--rz-bg);
          box-shadow: 0 0 0 1px var(--rz-accent);
          transition: transform 0.15s ease;
        }
        .rz-themer-range::-moz-range-thumb {
          width: 12px;
          height: 12px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-accent);
          border: 2px solid var(--rz-bg);
          box-shadow: 0 0 0 1px var(--rz-accent);
          transition: transform 0.15s ease;
        }
        .rz-themer-range:hover::-webkit-slider-thumb { transform: scale(1.2); }
        .rz-themer-range:hover::-moz-range-thumb { transform: scale(1.2); }
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
          padding-inline: 5px;
          pointer-events: none;
        }
        .rz-themer-dot {
          width: 4px;
          height: 4px;
          border-radius: var(--rz-thumb-radius, 999px);
          background: var(--rz-muted);
          opacity: 0.55;
        }
        .rz-themer-dot--on { opacity: 0; }

        .rz-themer-label {
          font-family: var(--rz-mono);
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--rz-muted);
          line-height: 1;
          white-space: nowrap;
          user-select: none;
        }

        @media (max-width: 560px) {
          .rz-themer { width: 104px; }
        }
      `}</style>
    </div>
  );
}
