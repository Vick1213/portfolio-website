'use client';

import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';
import ZoneNav from './ZoneNav';

export default function Hud() {
  const view = useUI((s) => s.view);
  const setView = useUI((s) => s.setView);

  return (
    <div
      className="fixed top-0 left-0 right-0 z-40 pointer-events-none"
      style={{ height: '52px' }}
    >
      {/* Subtle top gradient to separate HUD from canvas */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(to bottom, rgba(8,8,12,0.72) 0%, rgba(8,8,12,0) 100%)',
        }}
      />

      <div className="relative flex items-center justify-between h-full px-4 gap-3">
        {/* Left: profile name */}
        <div className="pointer-events-auto flex-shrink-0 min-w-0">
          <span
            className="font-mono text-xs tracking-widest uppercase truncate"
            style={{ color: 'rgba(255,255,255,0.55)' }}
          >
            {profile.name}
          </span>
        </div>

        {/* Center: zone nav */}
        <div className="pointer-events-auto flex-1 flex justify-center overflow-hidden">
          <ZoneNav />
        </div>

        {/* Right: 3D / List segmented toggle */}
        <div
          className="pointer-events-auto flex-shrink-0 flex items-center rounded font-mono text-xs overflow-hidden"
          style={{ border: '1px solid rgba(255,255,255,0.15)' }}
        >
          <button
            onClick={() => setView('3d')}
            className="px-3 py-1.5 transition-colors duration-150"
            style={{
              background: view === '3d' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: view === '3d' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            }}
          >
            3D
          </button>
          <div
            className="self-stretch w-px"
            style={{ background: 'rgba(255,255,255,0.15)' }}
          />
          <button
            onClick={() => setView('list')}
            className="px-3 py-1.5 transition-colors duration-150"
            style={{
              background: view === 'list' ? 'rgba(255,255,255,0.12)' : 'transparent',
              color: view === 'list' ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
            }}
          >
            List
          </button>
        </div>
      </div>
    </div>
  );
}
