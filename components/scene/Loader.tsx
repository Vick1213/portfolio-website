'use client';

import { useProgress } from '@react-three/drei';

const bootLines = [
  'INIT MEMORY FABRIC…',
  'LOADING ZONE MAP…',
  'CALIBRATING TILE GRID…',
  'WARMING TRACE FABRIC…',
  'RENDERING SILICON…',
];

export default function Loader() {
  const { active, progress } = useProgress();

  if (!active) return null;

  const lineCount = Math.floor((progress / 100) * bootLines.length);
  const visibleLines = bootLines.slice(0, lineCount);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: '#04050d',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        pointerEvents: 'none',
        fontFamily: 'var(--font-mono), "Courier New", monospace',
        backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.08) 2px, rgba(0,0,0,0.08) 4px)',
      }}
    >
      {/* Boot log lines */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem',
          marginBottom: '0.5rem',
          width: '16rem',
        }}
      >
        {visibleLines.map((line, i) => (
          <span
            key={i}
            style={{
              color: '#2a6a5a',
              fontSize: '0.6rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
            }}
          >
            {'>'} {line}
          </span>
        ))}
      </div>

      {/* Main label */}
      <span
        style={{
          color: '#5eead4',
          fontSize: '0.7rem',
          letterSpacing: '0.25em',
          textTransform: 'uppercase',
        }}
      >
        BOOTING SILICON
      </span>

      {/* Large percentage */}
      <span
        style={{
          color: '#e2e8f0',
          fontSize: '3rem',
          fontWeight: 700,
          letterSpacing: '0.05em',
          lineHeight: 1,
          textShadow: '0 0 20px rgba(94,234,212,0.3)',
        }}
      >
        {String(Math.round(progress)).padStart(3, '0')}
        <span style={{ fontSize: '1.2rem', color: '#5eead4', marginLeft: '0.2rem' }}>%</span>
      </span>

      {/* Progress bar */}
      <div
        style={{
          width: '16rem',
          height: '2px',
          backgroundColor: '#0d1f2d',
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
            boxShadow: '0 0 8px #5eead4, 0 0 2px #5eead4',
          }}
        />
      </div>

      {/* Bottom system label */}
      <span
        style={{
          color: '#2a4a4a',
          fontSize: '0.55rem',
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          marginTop: '0.25rem',
        }}
      >
        VELOCITY SILICON — SYS INIT
      </span>
    </div>
  );
}
