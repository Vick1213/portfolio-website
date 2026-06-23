'use client';

import { profile } from '@/lib/portfolio';

export default function Contact() {
  return (
    <section
      aria-labelledby="contact-heading"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '2.5rem 2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
      }}
    >
      <h2
        id="contact-heading"
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          marginBottom: '0.5rem',
          color: '#1e293b',
        }}
      >
        Get in Touch
      </h2>

      <p
        style={{
          fontSize: '0.9rem',
          color: '#475569',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
        }}
      >
        Open to full-time roles, internships, and interesting projects. Reach out
        directly via email or browse the code on GitHub.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Email CTA */}
        <a
          href={`mailto:${profile.email}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ffffff',
            background: '#4f46e5',
            borderRadius: '6px',
            padding: '0.55rem 1.1rem',
            textDecoration: 'none',
          }}
        >
          Email {profile.email}
        </a>

        {/* Primary GitHub */}
        <a
          href={profile.github}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1e293b',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.55rem 1.1rem',
            textDecoration: 'none',
          }}
        >
          GitHub / Vick1213
        </a>

        {/* Alt GitHub */}
        <a
          href={profile.githubAlt}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1e293b',
            background: '#f1f5f9',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.55rem 1.1rem',
            textDecoration: 'none',
          }}
        >
          GitHub / saatvik1213
        </a>
      </div>
    </section>
  );
}
