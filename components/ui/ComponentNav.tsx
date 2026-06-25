'use client';

import { useUI } from '@/lib/store';
import { COMPONENT_ORDER, COMPONENT_SHORT, pcComponentById } from '@/lib/rig';

/**
 * Center-HUD component nav, the 7 PC parts as compact accent chips, plus an
 * Overview reset. Clicking a chip flies the camera to that component and opens
 * its panel; the active chip carries the part's accent.
 */
export default function ComponentNav() {
  const activeComponent = useUI((s) => s.activeComponent);
  const setComponent = useUI((s) => s.setComponent);

  return (
    <nav aria-label="PC components" className="flex items-center gap-1 flex-nowrap justify-center [&>button]:flex-shrink-0">
      {/* Overview chip */}
      <button
        type="button"
        aria-pressed={activeComponent === null}
        onClick={() => setComponent(null)}
        className="pointer-events-auto flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        style={{
          border: `1px solid ${activeComponent === null ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
          background: activeComponent === null ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: activeComponent === null ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        />
        Overview
      </button>

      {/* Per-component chips */}
      {COMPONENT_ORDER.map((id) => {
        const meta = pcComponentById[id];
        const isActive = activeComponent === id;
        return (
          <button
            key={id}
            type="button"
            aria-pressed={isActive}
            aria-label={meta.label}
            onClick={() => setComponent(id)}
            className="pointer-events-auto relative flex items-center gap-1.5 px-2.5 py-1 rounded-full font-mono text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              border: `1px solid ${isActive ? meta.accent : 'rgba(255,255,255,0.12)'}`,
              background: isActive ? `${meta.accent}18` : 'transparent',
              color: isActive ? meta.accent : 'rgba(255,255,255,0.45)',
              outlineColor: meta.accent,
              boxShadow: isActive ? `0 0 14px ${meta.accent}33` : 'none',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: meta.accent,
                boxShadow: isActive ? `0 0 6px ${meta.accent}` : 'none',
              }}
            />
            {COMPONENT_SHORT[id]}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-2.5 right-2.5 rounded-full"
                style={{
                  bottom: '2px',
                  height: '1.5px',
                  background: meta.accent,
                  boxShadow: `0 0 6px ${meta.accent}`,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
