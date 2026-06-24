'use client';

import { profile, externalCollections } from '@/lib/portfolio';

export default function About() {
  const mlCollection = externalCollections.find((c) => c.id === 'ml-notebooks-drive');

  return (
    <section
      aria-labelledby="about-heading"
      style={{
        maxWidth: '940px',
        margin: '0 auto',
        padding: '1.5rem 1.5rem 2.5rem',
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
        About
      </span>
      <h2
        id="about-heading"
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          letterSpacing: '-0.02em',
          margin: '0.45rem 0 1.1rem',
          color: '#0f172a',
        }}
      >
        Silicon to full-stack
      </h2>

      {/* Bio narrative from XML <breadth> */}
      <p
        style={{
          fontSize: '0.95rem',
          color: '#334155',
          lineHeight: 1.75,
          marginBottom: '0.9rem',
          maxWidth: '760px',
        }}
      >
        My work spans two GitHub accounts active from 2022 to 2026. The primary account
        (Vick1213) concentrates on production web and chip-design work: a from-scratch
        AI-inference accelerator ASIC program (AiToChip — Neural MAX and Neural 1),
        an eight-month AI productivity platform (ProductivityAI), a multi-tenant
        e-commerce marketplace, and a local-first market-intelligence terminal pairing
        Next.js with FastAPI and local NLP models. The earlier account (saatvik1213)
        covers machine-learning foundations: NLP sentiment analysis, sign-language
        detection, CNN image classification, an Unreal Engine co-op game, and a
        hackathon AI-grading tool (PowerGrader) that earned an external fork.
      </p>

      <p
        style={{
          fontSize: '0.95rem',
          color: '#334155',
          lineHeight: 1.75,
          marginBottom: '1.4rem',
          maxWidth: '760px',
        }}
      >
        Strongest and most original work: a 720 mm&#178; datacenter AI-inference
        chip (RTL through synthesis), an AI productivity SaaS maintained over 93
        commits, a wildcard-subdomain multi-tenant marketplace, and a React Native
        cross-platform storytelling app. Earlier ML portfolio includes NLP sentiment
        analysis, sign-language video-to-text, and CNN image classification —
        predating the recent web and chip work.
      </p>

      {/* External ML collection note */}
      {mlCollection && (
        <aside
          style={{
            fontSize: '0.82rem',
            color: '#475569',
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            padding: '0.75rem 1rem',
          }}
        >
          <strong style={{ color: '#334155' }}>Also: </strong>
          <a
            href={mlCollection.url}
            target="_blank"
            rel="noreferrer"
            style={{ color: '#4f46e5', textDecoration: 'underline' }}
          >
            {mlCollection.name} (Google Drive)
          </a>
          {' — '}
          {mlCollection.tagline} Available on request.
        </aside>
      )}
    </section>
  );
}
