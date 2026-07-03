'use client';

import { allProjects, zoneById } from '@/lib/portfolio';
import { ZONE_INK } from './palette';
import Reveal from './Reveal';

// Display order set by the design lead — strongest, most recruiter-legible first.
const FEATURED_IDS: string[] = [
  'aitochip',
  'productivityai',
  'platforms-starter-kit',
  'powergrader',
  'inference1',
  'kensridge-partners',
];

function yearRange(start: string, lastActive: string): string {
  const a = start.slice(0, 4);
  const b = lastActive.slice(0, 4);
  return a === b ? a : `${a} — ${b}`;
}

/** Split "Title: Subtitle" so the subtitle can be set lighter. */
function splitName(name: string): { title: string; suffix: string | null } {
  const idx = name.indexOf(': ');
  if (idx === -1) return { title: name, suffix: null };
  return { title: name.slice(0, idx), suffix: name.slice(idx + 2) };
}

export default function SelectedWork() {
  const featured = FEATURED_IDS.map((id) => allProjects.find((p) => p.id === id)).filter(
    (p): p is NonNullable<typeof p> => Boolean(p)
  );

  return (
    <section id="work" aria-labelledby="work-heading" className="rz-section">
      <div className="rz-col">
        <div className="rz-shead">
          <span className="rz-eyebrow" id="work-heading">
            <span className="rz-shead-idx">01</span> — Selected work
          </span>
          <span className="rz-eyebrow rz-shead-right">
            {String(featured.length).padStart(2, '0')} / {allProjects.length} projects
          </span>
        </div>

        <div className="rz-work-list">
          {featured.map((project, i) => {
            const zone = zoneById[project.zone];
            const accent = ZONE_INK[project.zone];
            const { title, suffix } = splitName(project.name);
            const href = project.links.live ?? project.links.repo;
            const bullets = project.bullets.slice(0, 2);
            const tech = project.tech.slice(0, 6);

            return (
              <Reveal key={project.id} delay={i === 0 ? 0 : 60}>
                <article className="rz-work-row" style={{ ['--rz-row-accent' as string]: accent }}>
                  <span className="rz-work-idx" aria-hidden="true">
                    {String(i + 1).padStart(3, '0')}
                  </span>

                  <div className="rz-work-main">
                    <h3 className="rz-work-title">
                      {href ? (
                        <a href={href} target="_blank" rel="noreferrer" className="rz-work-title-link">
                          {title}
                          <span className="rz-work-arrow" aria-hidden="true"> ↗</span>
                        </a>
                      ) : (
                        title
                      )}
                    </h3>
                    {suffix && <p className="rz-work-suffix">{suffix}</p>}

                    <p className="rz-work-tagline">{project.tagline}</p>

                    {bullets.length > 0 && (
                      <ul className="rz-work-bullets">
                        {bullets.map((b, bi) => (
                          <li key={bi}>
                            <span aria-hidden="true">—</span> {b}
                          </li>
                        ))}
                      </ul>
                    )}

                    <p className="rz-work-tech">{tech.join(' / ')}</p>

                    <div className="rz-work-links">
                      {project.links.repo && (
                        <a href={project.links.repo} target="_blank" rel="noreferrer" className="rz-work-link">
                          GitHub ↗
                        </a>
                      )}
                      {project.links.live && (
                        <a href={project.links.live} target="_blank" rel="noreferrer" className="rz-work-link">
                          Live ↗
                        </a>
                      )}
                      {project.links.demo && (
                        <a href={project.links.demo} target="_blank" rel="noreferrer" className="rz-work-link">
                          Demo ↗
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="rz-work-meta">
                    <span>{yearRange(project.start, project.lastActive)}</span>
                    <span className="rz-work-zone">
                      <span className="rz-chip" style={{ background: accent }} aria-hidden="true" />
                      {zone.label}
                    </span>
                    <span>{project.primaryLanguage}</span>
                    <span>{project.commits} commits</span>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>

      <style>{`
        .rz-work-list {
          margin-top: 2.5rem;
        }
        .rz-work-row {
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr) 200px;
          gap: 1.5rem;
          padding-block: clamp(28px, 4vw, 44px);
          border-top: 1px solid var(--rz-hairline);
        }
        .rz-work-row:first-child { border-top: none; }

        .rz-work-idx {
          font-family: var(--rz-mono);
          font-size: 13px;
          color: var(--rz-muted);
          padding-top: 0.7rem;
          transition: color 0.2s ease;
        }
        .rz-work-row:hover .rz-work-idx { color: var(--rz-row-accent); }

        .rz-work-title {
          font-family: var(--rz-display);
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 500;
          letter-spacing: -0.015em;
          line-height: 1.1;
          color: var(--rz-ink);
          margin: 0 0 0.3rem;
        }
        .rz-work-title-link {
          color: inherit;
          text-decoration: none;
          transition: color 0.2s ease;
        }
        .rz-work-arrow {
          opacity: 0;
          transition: opacity 0.2s ease, transform 0.2s ease;
          display: inline-block;
          transform: translate(-4px, 4px);
          font-size: 0.7em;
        }
        .rz-work-row:hover .rz-work-title-link {
          color: var(--rz-row-accent);
        }
        .rz-work-row:hover .rz-work-arrow {
          opacity: 1;
          transform: translate(0, 0);
        }
        .rz-work-suffix {
          font-family: var(--rz-mono);
          font-size: 12px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--rz-muted);
          margin: 0 0 0.9rem;
        }
        .rz-work-tagline {
          font-size: 16px;
          color: var(--rz-secondary);
          margin: 0.4rem 0 0.9rem;
          line-height: 1.55;
          max-width: 58ch;
        }
        .rz-work-bullets {
          list-style: none;
          margin: 0 0 1rem;
          padding: 0;
          max-width: 62ch;
        }
        .rz-work-bullets li {
          font-size: 14.5px;
          color: var(--rz-secondary);
          line-height: 1.6;
          margin-bottom: 0.4rem;
          display: flex;
          gap: 0.55rem;
        }
        .rz-work-bullets li span {
          color: var(--rz-muted);
          flex-shrink: 0;
        }
        .rz-work-tech {
          font-family: var(--rz-mono);
          font-size: 11px;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--rz-muted);
          margin: 0 0 1rem;
        }
        .rz-work-links {
          display: flex;
          gap: 1.25rem;
        }
        .rz-work-link {
          font-family: var(--rz-mono);
          font-size: 12.5px;
          color: var(--rz-ink);
          text-decoration: none;
          background-image: linear-gradient(currentColor, currentColor);
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 1px;
          padding-bottom: 2px;
          transition: background-size 0.2s ease, color 0.15s ease;
        }
        .rz-work-link:hover {
          color: var(--rz-row-accent);
          background-size: 100% 1px;
        }

        .rz-work-meta {
          font-family: var(--rz-mono);
          font-size: 12px;
          color: var(--rz-muted);
          line-height: 2;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          text-align: right;
          padding-top: 0.7rem;
        }
        .rz-work-zone {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: var(--rz-secondary);
        }

        @media (max-width: 860px) {
          .rz-work-row {
            grid-template-columns: 1fr;
            gap: 0.4rem;
          }
          .rz-work-idx { padding-top: 0; }
          .rz-work-meta {
            order: -1;
            flex-direction: row;
            flex-wrap: wrap;
            align-items: center;
            justify-content: flex-start;
            text-align: left;
            gap: 1rem;
            line-height: 1.5;
            padding-top: 0;
          }
        }
      `}</style>
    </section>
  );
}
