'use client';

import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';

export default function Intro() {
  const intro = useUI((s) => s.intro);
  const setIntro = useUI((s) => s.setIntro);

  if (intro === false) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      style={{
        background: 'rgba(8, 8, 12, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
        animation: 'intro-fade-in 0.6s ease both',
      }}
    >
      <style>{`
        @keyframes intro-fade-in {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes intro-fade-out {
          from { opacity: 1; }
          to   { opacity: 0; }
        }
      `}</style>

      <div className="flex flex-col items-center gap-6 px-8 text-center max-w-2xl">
        {/* Name */}
        <h1
          className="font-mono text-4xl sm:text-5xl font-bold tracking-tight"
          style={{ color: 'var(--fg)' }}
        >
          {profile.name}
        </h1>

        {/* Headline */}
        <p
          className="font-sans text-base sm:text-lg leading-relaxed max-w-xl"
          style={{ color: 'rgba(255,255,255,0.6)' }}
        >
          {profile.headline}
        </p>

        {/* Accent divider */}
        <div
          className="w-12 h-px"
          style={{ background: 'var(--silicon, #5eead4)' }}
        />

        {/* Enter button */}
        <button
          onClick={() => setIntro(false)}
          className="font-mono text-sm px-6 py-2.5 rounded transition-colors duration-200"
          style={{
            border: '1px solid var(--silicon, #5eead4)',
            color: 'var(--silicon, #5eead4)',
            background: 'transparent',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              'rgba(94, 234, 212, 0.08)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
          }}
        >
          Enter
        </button>
      </div>
    </div>
  );
}
