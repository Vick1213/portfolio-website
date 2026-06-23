'use client';

import { profile } from '@/lib/portfolio';

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer
      style={{
        borderTop: '1px solid #e2e8f0',
        padding: '1.25rem 2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        fontSize: '0.78rem',
        color: '#94a3b8',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}
    >
      {/* Left: name + year */}
      <span>
        {profile.name} &copy; {year}
      </span>

      {/* Center: built with */}
      <span style={{ textAlign: 'center' }}>
        Built with Next.js &amp; React Three Fiber
      </span>

      {/* Right: GitHub links */}
      <nav aria-label="GitHub profiles">
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#64748b', textDecoration: 'none', marginRight: '0.75rem' }}
        >
          GitHub / Vick1213
        </a>
        <a
          href={profile.githubAlt}
          target="_blank"
          rel="noreferrer"
          style={{ color: '#64748b', textDecoration: 'none' }}
        >
          GitHub / saatvik1213
        </a>
      </nav>
    </footer>
  );
}
