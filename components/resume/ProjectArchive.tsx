'use client';

import { resumeProjects, zoneById } from '@/lib/portfolio';
import { ZONE_INK } from './palette';
import Reveal from './Reveal';

export default function ProjectArchive() {
  const sorted = [...resumeProjects].sort((a, b) => (a.lastActive < b.lastActive ? 1 : -1));
  const earliestYear = resumeProjects.reduce(
    (min, p) => Math.min(min, Number(p.start.slice(0, 4))),
    Number(sorted[0]?.start.slice(0, 4) ?? 2022)
  );

  return (
    <section id="archive" aria-labelledby="archive-heading" className="rz-section">
      <div className="rz-col">
        <div className="rz-shead">
          <span className="rz-eyebrow" id="archive-heading">
            <span className="rz-shead-idx">04</span> — All projects
          </span>
          <span className="rz-eyebrow rz-shead-right">
            {resumeProjects.length} shipped since {earliestYear}
          </span>
        </div>

        <Reveal delay={0}>
          <div className="rz-archive-list">
            {sorted.map((project) => {
              const accent = ZONE_INK[project.zone];
              const zone = zoneById[project.zone];
              const href = project.links.live ?? project.links.repo;
              const tech = project.tech.slice(0, 3).join(' · ');
              return (
                <div key={project.id} className="rz-archive-row" style={{ ['--rz-row-accent' as string]: accent }}>
                  <span className="rz-archive-year">{project.lastActive.slice(0, 4)}</span>
                  <span
                    className="rz-chip"
                    style={{ background: accent }}
                    aria-hidden="true"
                    title={zone.label}
                  />
                  <span className="rz-archive-name">
                    {href ? (
                      <a href={href} target="_blank" rel="noreferrer">{project.name}</a>
                    ) : (
                      project.name
                    )}
                  </span>
                  <span className="rz-archive-tech">{tech}</span>
                  <span className="rz-archive-linkicons">
                    {project.links.repo && (
                      <a href={project.links.repo} target="_blank" rel="noreferrer" aria-label={`${project.name} repository`}>↗</a>
                    )}
                    {project.links.live && (
                      <a href={project.links.live} target="_blank" rel="noreferrer" aria-label={`${project.name} live site`}>↗</a>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>

      <style>{`
        .rz-archive-list {
          margin-top: 2rem;
          border-bottom: 1px solid var(--rz-hairline);
        }
        .rz-archive-row {
          display: grid;
          grid-template-columns: 52px 10px minmax(0, 1fr) auto auto;
          align-items: center;
          gap: 1rem;
          min-height: 48px;
          border-top: 1px solid var(--rz-hairline);
        }
        .rz-archive-year {
          font-family: var(--rz-mono);
          font-size: 12px;
          color: var(--rz-muted);
        }
        .rz-archive-name {
          font-size: 15.5px;
          color: var(--rz-ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .rz-archive-name a {
          color: inherit;
          text-decoration: none;
          transition: color 0.15s ease;
        }
        .rz-archive-row:hover .rz-archive-name a {
          color: var(--rz-row-accent);
        }
        .rz-archive-tech {
          font-family: var(--rz-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--rz-muted);
          white-space: nowrap;
        }
        .rz-archive-linkicons {
          display: flex;
          gap: 0.6rem;
          font-size: 13px;
        }
        .rz-archive-linkicons a {
          color: var(--rz-secondary);
          text-decoration: none;
          transition: color 0.15s ease, transform 0.15s ease;
          display: inline-block;
        }
        .rz-archive-linkicons a:hover {
          color: var(--rz-row-accent);
          transform: translate(1px, -1px);
        }

        @media (max-width: 760px) {
          .rz-archive-row {
            grid-template-columns: 44px 8px minmax(0, 1fr) auto;
          }
          .rz-archive-tech { display: none; }
        }
      `}</style>
    </section>
  );
}
