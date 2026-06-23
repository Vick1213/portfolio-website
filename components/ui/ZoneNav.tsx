'use client';

import { useUI } from '@/lib/store';
import { zones } from '@/lib/portfolio';
import type { Zone } from '@/lib/types';

export default function ZoneNav() {
  const activeZone = useUI((s) => s.activeZone);
  const setZone = useUI((s) => s.setZone);

  return (
    <nav aria-label="Project zones" className="flex items-center gap-1.5 flex-wrap justify-center">
      {/* Overview chip */}
      <button
        type="button"
        aria-pressed={activeZone === null}
        onClick={() => setZone(null)}
        className="pointer-events-auto flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
        style={{
          border: `1px solid ${activeZone === null ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
          background:
            activeZone === null ? 'rgba(255,255,255,0.08)' : 'transparent',
          color: activeZone === null ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.45)',
        }}
      >
        <span
          aria-hidden="true"
          className="inline-block w-1.5 h-1.5 rounded-full"
          style={{ background: 'rgba(255,255,255,0.5)' }}
        />
        Overview
      </button>

      {/* Per-zone chips */}
      {zones.map((zone) => {
        const isActive = activeZone === zone.id;
        return (
          <button
            key={zone.id}
            type="button"
            aria-pressed={isActive}
            onClick={() => setZone(zone.id as Zone)}
            className="pointer-events-auto relative flex items-center gap-1.5 px-3 py-1 rounded-full font-mono text-xs transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
            style={{
              border: `1px solid ${isActive ? zone.accent : 'rgba(255,255,255,0.12)'}`,
              background: isActive ? `${zone.accent}18` : 'transparent',
              color: isActive ? zone.accent : 'rgba(255,255,255,0.45)',
              outlineColor: zone.accent,
              boxShadow: isActive ? `0 0 14px ${zone.accent}33` : 'none',
            }}
          >
            <span
              aria-hidden="true"
              className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{
                background: zone.accent,
                boxShadow: isActive ? `0 0 6px ${zone.accent}` : 'none',
              }}
            />
            {zone.label}
            {/* Active accent underline tying chip to its 3D district */}
            {isActive && (
              <span
                aria-hidden="true"
                className="absolute left-3 right-3 rounded-full"
                style={{
                  bottom: '2px',
                  height: '1.5px',
                  background: zone.accent,
                  boxShadow: `0 0 6px ${zone.accent}`,
                }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
