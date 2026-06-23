'use client';

import { profile } from '@/lib/portfolio';
import ResumeView from './ResumeView';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

/* Inline SVG chip-trace motif — lightweight, no canvas/three.js */
function ChipMotif() {
  return (
    <svg
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity: 0.18,
        pointerEvents: 'none',
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id="chip-grid" x="0" y="0" width="48" height="48" patternUnits="userSpaceOnUse">
          {/* Outer border */}
          <rect x="4" y="4" width="40" height="40" fill="none" stroke="currentColor" strokeWidth="0.75" />
          {/* Die center square */}
          <rect x="14" y="14" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1" />
          {/* Horizontal traces — top side */}
          <line x1="4" y1="18" x2="14" y2="18" stroke="currentColor" strokeWidth="0.75" />
          <line x1="4" y1="24" x2="14" y2="24" stroke="currentColor" strokeWidth="0.75" />
          <line x1="4" y1="30" x2="14" y2="30" stroke="currentColor" strokeWidth="0.75" />
          {/* Horizontal traces — right side */}
          <line x1="34" y1="18" x2="44" y2="18" stroke="currentColor" strokeWidth="0.75" />
          <line x1="34" y1="24" x2="44" y2="24" stroke="currentColor" strokeWidth="0.75" />
          <line x1="34" y1="30" x2="44" y2="30" stroke="currentColor" strokeWidth="0.75" />
          {/* Vertical traces — top */}
          <line x1="18" y1="4" x2="18" y2="14" stroke="currentColor" strokeWidth="0.75" />
          <line x1="24" y1="4" x2="24" y2="14" stroke="currentColor" strokeWidth="0.75" />
          <line x1="30" y1="4" x2="30" y2="14" stroke="currentColor" strokeWidth="0.75" />
          {/* Vertical traces — bottom */}
          <line x1="18" y1="34" x2="18" y2="44" stroke="currentColor" strokeWidth="0.75" />
          <line x1="24" y1="34" x2="24" y2="44" stroke="currentColor" strokeWidth="0.75" />
          <line x1="30" y1="34" x2="30" y2="44" stroke="currentColor" strokeWidth="0.75" />
          {/* Center cross */}
          <line x1="14" y1="24" x2="34" y2="24" stroke="currentColor" strokeWidth="0.5" />
          <line x1="24" y1="14" x2="24" y2="34" stroke="currentColor" strokeWidth="0.5" />
          {/* Pads */}
          <circle cx="18" cy="18" r="1.5" fill="currentColor" />
          <circle cx="24" cy="18" r="1.5" fill="currentColor" />
          <circle cx="30" cy="18" r="1.5" fill="currentColor" />
          <circle cx="18" cy="24" r="1.5" fill="currentColor" />
          <circle cx="30" cy="24" r="1.5" fill="currentColor" />
          <circle cx="18" cy="30" r="1.5" fill="currentColor" />
          <circle cx="24" cy="30" r="1.5" fill="currentColor" />
          <circle cx="30" cy="30" r="1.5" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#chip-grid)" />
    </svg>
  );
}

export default function MobileFallback() {
  return (
    <div style={{ width: '100%', minHeight: '100vh', background: '#0f172a', color: '#f1f5f9' }}>
      {/* ── Hero banner ── */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          padding: '4rem 2rem 3.5rem',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
          color: '#5eead4',
          overflow: 'hidden',
        }}
      >
        <ChipMotif />

        {/* Text layer — above SVG */}
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '680px', margin: '0 auto' }}>
          <div
            style={{
              display: 'inline-block',
              fontSize: '0.7rem',
              fontWeight: 700,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: '#5eead4',
              background: 'rgba(94,234,212,0.12)',
              border: '1px solid rgba(94,234,212,0.3)',
              borderRadius: '4px',
              padding: '0.25rem 0.7rem',
              marginBottom: '1.25rem',
            }}
          >
            Portfolio
          </div>

          <h1
            style={{
              fontSize: 'clamp(2rem, 6vw, 3.25rem)',
              fontWeight: 900,
              letterSpacing: '-0.03em',
              lineHeight: 1.1,
              color: '#f1f5f9',
              marginBottom: '1rem',
            }}
          >
            {profile.name}
          </h1>

          <p
            style={{
              fontSize: 'clamp(0.875rem, 2.5vw, 1.05rem)',
              color: '#94a3b8',
              lineHeight: 1.6,
              maxWidth: '560px',
            }}
          >
            {profile.headline}
          </p>

          {/* Contact strip */}
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: '0.75rem',
              marginTop: '1.75rem',
              fontSize: '0.8rem',
            }}
          >
            <a
              href={`mailto:${profile.email}`}
              style={{
                color: '#5eead4',
                textDecoration: 'none',
                background: 'rgba(94,234,212,0.1)',
                border: '1px solid rgba(94,234,212,0.25)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
              }}
            >
              {profile.email}
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#818cf8',
                textDecoration: 'none',
                background: 'rgba(129,140,248,0.1)',
                border: '1px solid rgba(129,140,248,0.25)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
              }}
            >
              GitHub / Vick1213
            </a>
            <a
              href={profile.githubAlt}
              target="_blank"
              rel="noreferrer"
              style={{
                color: '#818cf8',
                textDecoration: 'none',
                background: 'rgba(129,140,248,0.1)',
                border: '1px solid rgba(129,140,248,0.25)',
                borderRadius: '6px',
                padding: '0.35rem 0.75rem',
              }}
            >
              GitHub / saatvik1213
            </a>
          </div>
        </div>
      </div>

      {/* ── About ── */}
      <div style={{ background: '#ffffff' }}>
        <About />
      </div>

      {/* ── Resume content ── */}
      <div style={{ background: '#ffffff' }}>
        <ResumeView />
      </div>

      {/* ── Contact ── */}
      <div style={{ background: '#ffffff', borderTop: '2px solid #e2e8f0' }}>
        <Contact />
      </div>

      {/* ── Footer ── */}
      <div style={{ background: '#ffffff' }}>
        <Footer />
      </div>
    </div>
  );
}
