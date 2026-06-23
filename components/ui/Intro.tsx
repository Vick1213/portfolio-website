'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';

export default function Intro() {
  const intro = useUI((s) => s.intro);
  const setIntro = useUI((s) => s.setIntro);

  // Keyboard: Enter or Escape dismisses the intro
  useEffect(() => {
    if (!intro) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        setIntro(false);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [intro, setIntro]);

  if (intro === false) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio introduction"
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      style={{
        background: 'rgba(8, 8, 12, 0.92)',
        backdropFilter: 'blur(12px)',
        WebkitBackdropFilter: 'blur(12px)',
      }}
    >
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
          aria-hidden="true"
          className="w-12 h-px"
          style={{ background: 'var(--silicon, #5eead4)' }}
        />

        {/* Enter button */}
        <button
          onClick={() => setIntro(false)}
          autoFocus
          className="font-mono text-sm px-6 py-2.5 rounded transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
          style={{
            border: '1px solid var(--silicon, #5eead4)',
            color: 'var(--silicon, #5eead4)',
            background: 'transparent',
            outlineColor: 'var(--silicon, #5eead4)',
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
