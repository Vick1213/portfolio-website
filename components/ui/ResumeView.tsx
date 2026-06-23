'use client';

import { profile, zones, resumeProjects, skillCategories } from '@/lib/portfolio';
import type { ProjType } from '@/lib/types';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

const TYPE_META: Record<ProjType, { label: string; bg: string; text: string }> = {
  original:       { label: 'Original',       bg: '#dcfce7', text: '#166534' },
  'template-based': { label: 'Template',     bg: '#fef9c3', text: '#854d0e' },
  'ai-builder':   { label: 'AI Builder',     bg: '#ede9fe', text: '#5b21b6' },
  fork:           { label: 'Fork / Self-host', bg: '#dbeafe', text: '#1e40af' },
  coursework:     { label: 'Coursework',     bg: '#fee2e2', text: '#991b1b' },
};

export default function ResumeView() {
  return (
    <div
      className="scrollable"
      style={{ height: '100vh', overflowY: 'auto' }}
    >
      <div
        style={{
          maxWidth: '840px',
          margin: '0 auto',
          padding: '3rem 2rem 4rem',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          color: '#0f172a',
        }}
      >
        {/* ── About ── */}
        <About />

        {/* ── Header ── */}
        <header style={{ marginBottom: '2rem', borderBottom: '2px solid #e2e8f0', paddingBottom: '1.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '0.35rem' }}>
            {profile.name}
          </h1>
          <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '0.75rem', lineHeight: 1.5 }}>
            {profile.headline}
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', fontSize: '0.875rem' }}>
            <a href={`mailto:${profile.email}`} style={{ color: '#4338ca', textDecoration: 'none', fontWeight: 600 }}>
              {profile.email}
            </a>
            <a href={profile.github} target="_blank" rel="noreferrer" style={{ color: '#4338ca', textDecoration: 'none', fontWeight: 600 }}>
              GitHub (Vick1213)
            </a>
            <a href={profile.githubAlt} target="_blank" rel="noreferrer" style={{ color: '#4338ca', textDecoration: 'none', fontWeight: 600 }}>
              GitHub (saatvik1213)
            </a>
          </div>
        </header>

        {/* ── Projects by Zone ── */}
        <section style={{ marginBottom: '2.5rem' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>
            Projects
          </h2>

          {zones.map((zone) => {
            const zoneProjects = resumeProjects.filter((p) => p.zone === zone.id);
            if (zoneProjects.length === 0) return null;
            return (
              <div key={zone.id} style={{ marginBottom: '2rem' }}>
                {/* Zone heading */}
                <h3
                  style={{
                    fontSize: '1.05rem',
                    fontWeight: 700,
                    color: zone.accent,
                    borderLeft: `4px solid ${zone.accent}`,
                    paddingLeft: '0.6rem',
                    marginBottom: '1rem',
                    letterSpacing: '0.03em',
                    textTransform: 'uppercase',
                  }}
                >
                  {zone.label}
                </h3>

                {zoneProjects.map((project) => {
                  const typeMeta = TYPE_META[project.type];
                  return (
                    <div
                      key={project.id}
                      style={{
                        marginBottom: '1.25rem',
                        paddingLeft: '1rem',
                        borderLeft: '1px solid #e2e8f0',
                      }}
                    >
                      {/* Project name + type badge */}
                      <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.2rem' }}>
                        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                          {project.name}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.7rem',
                            fontWeight: 600,
                            padding: '0.1rem 0.45rem',
                            borderRadius: '999px',
                            backgroundColor: typeMeta.bg,
                            color: typeMeta.text,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {typeMeta.label}
                        </span>
                        <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                          {project.start}{project.lastActive !== project.start ? ` – ${project.lastActive}` : ''}
                        </span>
                      </div>

                      {/* Tagline */}
                      <p style={{ fontSize: '0.85rem', color: '#475569', margin: '0 0 0.35rem', fontStyle: 'italic' }}>
                        {project.tagline}
                      </p>

                      {/* Tech stack */}
                      <p style={{ fontSize: '0.78rem', color: '#64748b', margin: '0 0 0.4rem' }}>
                        <strong style={{ color: '#334155' }}>Tech:</strong> {project.tech.join(' · ')}
                      </p>

                      {/* Bullets */}
                      <ul style={{ margin: 0, paddingLeft: '1.1rem' }}>
                        {project.bullets.map((bullet, i) => (
                          <li
                            key={i}
                            style={{ fontSize: '0.83rem', color: '#334155', lineHeight: 1.55, marginBottom: '0.2rem' }}
                          >
                            {bullet}
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </section>

        {/* ── Skills ── */}
        <section>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 700, marginBottom: '1.25rem', color: '#1e293b' }}>
            Skills
          </h2>
          {skillCategories.map((cat) => (
            <div key={cat.name} style={{ marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#334155', marginBottom: '0.35rem' }}>
                {cat.name}
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {cat.skills.map((skill) => (
                  <span
                    key={skill.label}
                    style={{
                      fontSize: '0.78rem',
                      padding: '0.2rem 0.55rem',
                      borderRadius: '4px',
                      background: '#f1f5f9',
                      color: '#1e293b',
                      border: '1px solid #e2e8f0',
                    }}
                  >
                    {skill.label}
                    <span style={{ color: '#94a3b8', marginLeft: '0.3rem', fontSize: '0.72rem' }}>
                      ({skill.level})
                    </span>
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>
      </div>

      {/* ── Contact ── */}
      <div style={{ borderTop: '2px solid #e2e8f0' }}>
        <Contact />
      </div>

      {/* ── Footer ── */}
      <Footer />
    </div>
  );
}
