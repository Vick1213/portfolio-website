'use client';

import { profile, externalCollections } from '@/lib/portfolio';

export default function About() {
  const mlCollection = externalCollections.find((c) => c.id === 'ml-notebooks-drive');

  return (
    <section
      aria-labelledby="about-heading"
      style={{
        maxWidth: '720px',
        margin: '0 auto',
        padding: '2.5rem 2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f172a',
      }}
    >
      <h2
        id="about-heading"
        style={{
          fontSize: '1.35rem',
          fontWeight: 700,
          marginBottom: '1rem',
          color: '#1e293b',
        }}
      >
        About
      </h2>

      {/* Headline */}
      <p
        style={{
          fontSize: '1rem',
          fontWeight: 600,
          color: '#1e293b',
          marginBottom: '0.75rem',
          lineHeight: 1.5,
        }}
      >
        {profile.headline}
      </p>

      {/* Bio narrative from XML <breadth> */}
      <p
        style={{
          fontSize: '0.9rem',
          color: '#334155',
          lineHeight: 1.7,
          marginBottom: '0.75rem',
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
          fontSize: '0.9rem',
          color: '#334155',
          lineHeight: 1.7,
          marginBottom: '1.25rem',
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
