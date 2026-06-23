'use client';

import { useProgress } from '@react-three/drei';

export default function Loader() {
  const { active, progress } = useProgress();

  if (!active) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#050505',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.25rem',
        pointerEvents: 'none',
        fontFamily: 'var(--font-mono), monospace',
      }}
    >
      <span
        style={{
          color: '#5eead4',
          fontSize: '0.75rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
        }}
      >
        BOOTING SILICON…
      </span>

      <span
        style={{
          color: '#e2e8f0',
          fontSize: '2rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
        }}
      >
        {Math.round(progress)}%
      </span>

      <div
        style={{
          width: '16rem',
          height: '2px',
          backgroundColor: '#1a2a2a',
          borderRadius: '9999px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            height: '100%',
            width: `${progress}%`,
            backgroundColor: '#5eead4',
            borderRadius: '9999px',
            transition: 'width 0.1s linear',
          }}
        />
      </div>
    </div>
  );
}
