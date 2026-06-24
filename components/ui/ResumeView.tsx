'use client';

import { profile, zones, resumeProjects, skillCategories } from '@/lib/portfolio';
import type { ProjType, Zone } from '@/lib/types';
import About from './About';
import Contact from './Contact';
import Footer from './Footer';

const TYPE_META: Record<ProjType, { label: string; bg: string; text: string; ring: string }> = {
  original:         { label: 'Original',         bg: '#dcfce7', text: '#166534', ring: '#bbf7d0' },
  'template-based': { label: 'Template',         bg: '#fef9c3', text: '#854d0e', ring: '#fde68a' },
  'ai-builder':     { label: 'AI Builder',       bg: '#ede9fe', text: '#5b21b6', ring: '#ddd6fe' },
  fork:             { label: 'Fork / Self-host', bg: '#dbeafe', text: '#1e40af', ring: '#bfdbfe' },
  coursework:       { label: 'Coursework',       bg: '#fee2e2', text: '#991b1b', ring: '#fecaca' },
};

// Bright zone accents (the same hues the 3D HUD/scene use) read too pale as text
// on a light surface, so each gets a darker "ink" variant for headings/borders
// while the bright value still drives the little status dot.
const ZONE_INK: Record<Zone, string> = {
  silicon: '#0d9488',
  web: '#4f46e5',
  client: '#a21caf',
  ml: '#b45309',
};

const ZONE_LEGEND = 'linear-gradient(90deg, #5eead4, #818cf8, #f0abfc, #fbbf24)';

export default function ResumeView() {
  const projectCount = resumeProjects.length;

  return (
    <div className="resume-root scrollable">
      <style>{`
        .resume-root {
          height: 100vh;
          overflow-y: auto;
          background:
            radial-gradient(1200px 600px at 50% -10%, #ffffff 0%, #f4f6fa 55%, #eef1f6 100%);
          color: #0f172a;
          font-family: system-ui, -apple-system, 'Segoe UI', sans-serif;
          -webkit-font-smoothing: antialiased;
        }
        .resume-wrap {
          max-width: 940px;
          margin: 0 auto;
          padding: 0 1.5rem;
        }
        .resume-eyebrow {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.68rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #64748b;
        }
        .resume-section-title {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #0f172a;
          margin: 0;
        }
        .resume-card {
          position: relative;
          background: #ffffff;
          border: 1px solid #e6eaf1;
          border-radius: 14px;
          padding: 1.1rem 1.25rem 1.15rem;
          box-shadow: 0 1px 2px rgba(15,23,42,0.04);
          transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease;
        }
        .resume-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px -12px rgba(15,23,42,0.18);
          border-color: #d7deea;
        }
        .resume-chip {
          font-size: 0.72rem;
          font-weight: 500;
          color: #475569;
          background: #f1f5f9;
          border: 1px solid #e6eaf1;
          border-radius: 6px;
          padding: 0.15rem 0.5rem;
          white-space: nowrap;
        }
        .resume-link {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 0.74rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          gap: 0.3rem;
          transition: opacity 0.15s ease;
        }
        .resume-link:hover { opacity: 0.65; }
        .resume-hero-link {
          font-size: 0.82rem;
          font-weight: 600;
          color: #334155;
          text-decoration: none;
          border-bottom: 1px solid transparent;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .resume-hero-link:hover { color: #4f46e5; border-color: #c7d2fe; }
        @media (max-width: 560px) {
          .resume-section-title { font-size: 1.3rem; }
        }
      `}</style>

      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <header style={{ paddingTop: '4rem', paddingBottom: '2rem' }}>
        <div className="resume-wrap">
          <span className="resume-eyebrow">Portfolio · Résumé</span>
          <h1
            style={{
              fontSize: 'clamp(2.1rem, 6vw, 3rem)',
              fontWeight: 800,
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
              margin: '0.6rem 0 0.5rem',
            }}
          >
            {profile.name}
          </h1>
          <p
            style={{
              fontSize: '1.02rem',
              color: '#475569',
              lineHeight: 1.55,
              maxWidth: '640px',
              margin: '0 0 1.4rem',
            }}
          >
            {profile.headline}
          </p>

          {/* Status + contact row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1.1rem' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                fontFamily: 'var(--font-mono), ui-monospace, monospace',
                fontSize: '0.72rem',
                letterSpacing: '0.16em',
                color: '#0d9488',
                fontWeight: 600,
              }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '999px',
                  background: '#10b981',
                  boxShadow: '0 0 8px #34d399',
                }}
              />
              OPEN TO WORK
            </span>
            <a href={`mailto:${profile.email}`} className="resume-hero-link">{profile.email}</a>
            <a href={profile.booking} target="_blank" rel="noreferrer" className="resume-hero-link">Book a 30-min chat</a>
            <a href={profile.github} target="_blank" rel="noreferrer" className="resume-hero-link">GitHub · Vick1213</a>
            <a href={profile.githubAlt} target="_blank" rel="noreferrer" className="resume-hero-link">GitHub · saatvik1213</a>
          </div>

          {/* Zone-legend hairline — ties this page to the 3D HUD's accent rule. */}
          <div
            aria-hidden="true"
            style={{
              height: '3px',
              borderRadius: '3px',
              background: ZONE_LEGEND,
              opacity: 0.9,
              marginTop: '1.8rem',
            }}
          />
        </div>
      </header>

      {/* ── About ─────────────────────────────────────────────────────── */}
      <About />

      {/* ── Projects by zone ─────────────────────────────────────────── */}
      <section style={{ padding: '1rem 0 1rem' }}>
        <div className="resume-wrap">
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '1.75rem' }}>
            <h2 className="resume-section-title">Projects</h2>
            <span className="resume-eyebrow" style={{ letterSpacing: '0.16em' }}>{projectCount} shipped</span>
          </div>

          {zones.map((zone) => {
            const zoneProjects = resumeProjects.filter((p) => p.zone === zone.id);
            if (zoneProjects.length === 0) return null;
            const ink = ZONE_INK[zone.id];
            return (
              <div key={zone.id} style={{ marginBottom: '2.5rem' }}>
                {/* Zone heading */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <span
                    aria-hidden="true"
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '999px',
                      background: zone.accent,
                      boxShadow: `0 0 8px ${zone.accent}`,
                      flexShrink: 0,
                    }}
                  />
                  <h3
                    style={{
                      fontSize: '0.95rem',
                      fontWeight: 800,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      color: ink,
                      margin: 0,
                    }}
                  >
                    {zone.label}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{zone.blurb}</span>
                </div>

                {/* Cards */}
                <div style={{ display: 'grid', gap: '0.85rem' }}>
                  {zoneProjects.map((project) => {
                    const typeMeta = TYPE_META[project.type];
                    const repo = project.links?.repo;
                    const live = project.links?.live;
                    return (
                      <article key={project.id} className="resume-card">
                        {/* Accent rail */}
                        <span
                          aria-hidden="true"
                          style={{
                            position: 'absolute',
                            left: 0,
                            top: '14px',
                            bottom: '14px',
                            width: '3px',
                            borderRadius: '3px',
                            background: zone.accent,
                          }}
                        />

                        {/* Header row */}
                        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.35rem' }}>
                          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0f172a', margin: 0, letterSpacing: '-0.01em' }}>
                            {project.name}
                          </h4>
                          <span
                            style={{
                              fontSize: '0.68rem',
                              fontWeight: 600,
                              padding: '0.12rem 0.5rem',
                              borderRadius: '999px',
                              background: typeMeta.bg,
                              color: typeMeta.text,
                              border: `1px solid ${typeMeta.ring}`,
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {typeMeta.label}
                          </span>
                          <span
                            style={{
                              marginLeft: 'auto',
                              fontFamily: 'var(--font-mono), ui-monospace, monospace',
                              fontSize: '0.72rem',
                              color: '#94a3b8',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            {project.start}{project.lastActive !== project.start ? ` – ${project.lastActive}` : ''}
                          </span>
                        </div>

                        {/* Tagline */}
                        <p style={{ fontSize: '0.88rem', color: '#475569', margin: '0 0 0.65rem', lineHeight: 1.5 }}>
                          {project.tagline}
                        </p>

                        {/* Tech chips */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: project.bullets.length ? '0.7rem' : 0 }}>
                          {project.tech.map((t) => (
                            <span key={t} className="resume-chip">{t}</span>
                          ))}
                        </div>

                        {/* Bullets */}
                        {project.bullets.length > 0 && (
                          <ul style={{ margin: 0, paddingLeft: '1.05rem', listStyle: 'none' }}>
                            {project.bullets.map((bullet, i) => (
                              <li
                                key={i}
                                style={{
                                  position: 'relative',
                                  fontSize: '0.84rem',
                                  color: '#334155',
                                  lineHeight: 1.55,
                                  marginBottom: '0.25rem',
                                  paddingLeft: '0.4rem',
                                }}
                              >
                                <span
                                  aria-hidden="true"
                                  style={{
                                    position: 'absolute',
                                    left: '-0.65rem',
                                    top: '0.55em',
                                    width: '4px',
                                    height: '4px',
                                    borderRadius: '999px',
                                    background: zone.accent,
                                  }}
                                />
                                {bullet}
                              </li>
                            ))}
                          </ul>
                        )}

                        {/* Links */}
                        {(repo || live) && (
                          <div style={{ display: 'flex', gap: '1.1rem', marginTop: '0.8rem' }}>
                            {repo && (
                              <a href={repo} target="_blank" rel="noreferrer" className="resume-link" style={{ color: ink }}>
                                ↗ Code
                              </a>
                            )}
                            {live && (
                              <a href={live} target="_blank" rel="noreferrer" className="resume-link" style={{ color: ink }}>
                                ↗ Live
                              </a>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Skills ───────────────────────────────────────────────────── */}
      <section style={{ padding: '1rem 0 3rem' }}>
        <div className="resume-wrap">
          <h2 className="resume-section-title" style={{ marginBottom: '1.5rem' }}>Skills</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '0.85rem',
            }}
          >
            {skillCategories.map((cat) => (
              <div key={cat.name} className="resume-card" style={{ padding: '1rem 1.1rem' }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-mono), ui-monospace, monospace',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    color: '#64748b',
                    margin: '0 0 0.7rem',
                  }}
                >
                  {cat.name}
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {cat.skills.map((skill) => (
                    <span
                      key={skill.label}
                      className="resume-chip"
                      style={{
                        background: skill.level === 'advanced' ? '#eef2ff' : '#f1f5f9',
                        borderColor: skill.level === 'advanced' ? '#dbe2fe' : '#e6eaf1',
                        color: skill.level === 'advanced' ? '#3730a3' : '#475569',
                        // Skill labels are full phrases, not short tokens — let them
                        // wrap inside the chip so they never spill past the card edge.
                        whiteSpace: 'normal',
                        maxWidth: '100%',
                        lineHeight: 1.35,
                      }}
                    >
                      {skill.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────── */}
      <div style={{ borderTop: '1px solid #e6eaf1', background: '#ffffff' }}>
        <Contact />
        <Footer />
      </div>
    </div>
  );
}
