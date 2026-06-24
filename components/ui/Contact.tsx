'use client';

import { profile } from '@/lib/portfolio';

export default function Contact() {
  return (
    <section
      aria-labelledby="contact-heading"
      style={{
        maxWidth: '940px',
        margin: '0 auto',
        padding: '2.75rem 1.5rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-mono), ui-monospace, monospace',
          fontSize: '0.68rem',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: '#64748b',
        }}
      >
        Contact
      </span>
      <h2
        id="contact-heading"
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0.45rem 0 0.5rem',
          color: '#0f172a',
        }}
      >
        Let&rsquo;s build something
      </h2>

      <p
        style={{
          fontSize: '0.92rem',
          color: '#475569',
          marginBottom: '1.5rem',
          lineHeight: 1.6,
          maxWidth: '560px',
        }}
      >
        Open to full-time roles, internships, and interesting projects. Book a
        quick 30-minute chat, reach out via email, or browse the code on GitHub.
      </p>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.75rem',
        }}
      >
        {/* Book a chat CTA */}
        <a
          href={profile.booking}
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#ffffff',
            background: 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
            textDecoration: 'none',
            boxShadow: '0 6px 18px -6px rgba(79,70,229,0.55)',
          }}
        >
          📅 Have a 30-min chat with me
        </a>

        {/* Email CTA */}
        <a
          href={`mailto:${profile.email}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontSize: '0.875rem',
            fontWeight: 600,
            color: '#1e293b',
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
            textDecoration: 'none',
          }}
        >
          ✦ Email me
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
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
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
            background: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            padding: '0.6rem 1.2rem',
            textDecoration: 'none',
          }}
        >
          GitHub / saatvik1213
        </a>
      </div>
    </section>
  );
}
