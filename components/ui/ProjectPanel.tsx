'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/lib/store';
import { componentOf, pcComponentById } from '@/lib/rig';
import type { Project, ProjType } from '@/lib/types';

const INK = '#e6ebf4';

// Color map for all 5 ProjType values
const TYPE_COLORS: Record<ProjType, { bg: string; text: string; label: string }> = {
  original:       { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Original'       },
  'ai-builder':   { bg: 'rgba(14,165,233,0.15)', text: '#38bdf8', label: 'AI Builder'     },
  'template-based':{ bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Template-Based' },
  fork:           { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', label: 'Fork'           },
  coursework:     { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', label: 'Coursework'     },
};

/** Project card content — hosted inside <RightDrawer/>, which owns the aside. */
export default function ProjectPanel({ project }: { project: Project }) {
  const closeProject = useUI((s) => s.closeProject);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel; focus the close button when the card shows
  useEffect(() => {
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        closeProject();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [project, closeProject]);

  const typeStyle = TYPE_COLORS[project.type] ?? TYPE_COLORS['original'];
  // Component accent for this project's PC part, header/border/link-hover coherence.
  const componentId = componentOf(project.id);
  const component = componentId ? pcComponentById[componentId] : null;
  const zoneAccent = component?.accent ?? typeStyle.text;

  const linkDefs: { key: keyof typeof project.links; label: string }[] = [
    { key: 'repo',         label: 'Code'   },
    { key: 'live',         label: 'Live'   },
    { key: 'demo',         label: 'Demo'   },
    { key: 'presentation', label: 'Slides' },
  ];

  return (
    <div>
      <div aria-hidden="true" style={{ height: '2px', background: zoneAccent }} />
      <div className="flex flex-col gap-5 p-6 pb-10">

        {/* Header row: back-to-component + type badge + close */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            {/* Back to the component panel (keeps the active component). */}
            {component && (
              <button
                type="button"
                onClick={() => closeProject()}
                aria-label={`Back to ${component.label}`}
                className="font-mono text-xs px-2.5 py-1 rounded-full flex-shrink-0 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                style={{
                  background: `${zoneAccent}14`,
                  color: zoneAccent,
                  border: `1px solid ${zoneAccent}55`,
                  outlineColor: zoneAccent,
                }}
              >
                ‹ {component.label}
              </button>
            )}

            {/* Type badge */}
            <span
              className="font-mono text-xs px-2.5 py-1 rounded-full flex-shrink-0"
              style={{
                background: typeStyle.bg,
                color: typeStyle.text,
                border: `1px solid ${typeStyle.text}40`,
              }}
            >
              {typeStyle.label}
            </span>
          </div>

          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={() => useUI.getState().setComponent(null)}
            aria-label="Close to overview"
            className="font-mono text-base leading-none rounded p-1 flex-shrink-0 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
            style={{
              color: 'rgba(255,255,255,0.4)',
              background: 'transparent',
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.85)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.4)';
            }}
          >
            ✕
          </button>
        </div>

        {/* Project name */}
        <h2
          className="font-sans text-xl font-semibold leading-snug"
          style={{ color: INK }}
        >
          {project.name}
        </h2>

        {/* Tagline */}
        <p
          className="font-sans text-sm leading-relaxed italic"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {project.tagline}
        </p>

        {/* Divider */}
        <div
          aria-hidden="true"
          className="h-px w-full"
          style={{ background: 'rgba(255,255,255,0.07)' }}
        />

        {/* Description */}
        <p
          className="font-sans text-sm leading-relaxed"
          style={{ color: 'rgba(255,255,255,0.7)' }}
        >
          {project.description}
        </p>

        {/* Tech chips */}
        {project.tech.length > 0 && (
          <ul aria-label="Technologies" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
            {project.tech.map((t) => (
              <li
                key={t}
                className="font-mono text-xs px-2 py-0.5 rounded"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  color: 'rgba(255,255,255,0.55)',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {t}
              </li>
            ))}
          </ul>
        )}

        {/* Bullets */}
        {project.bullets.length > 0 && (
          <ul className="flex flex-col gap-2 list-none p-0 m-0" aria-label="Highlights">
            {project.bullets.map((b, i) => (
              <li
                key={i}
                className="flex gap-2.5 font-sans text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                <span
                  aria-hidden="true"
                  className="flex-shrink-0 mt-1.5 w-1 h-1 rounded-full"
                  style={{ background: typeStyle.text }}
                />
                {b}
              </li>
            ))}
          </ul>
        )}

        {/* Link buttons */}
        {linkDefs.some(({ key }) => !!project.links[key]) && (
          <nav aria-label="Project links" className="flex flex-wrap gap-2 pt-1">
            {linkDefs.map(({ key, label }) => {
              const href = project.links[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs px-3 py-1.5 rounded transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    border: `1px solid ${zoneAccent}60`,
                    color: zoneAccent,
                    background: 'transparent',
                    textDecoration: 'none',
                    outlineColor: zoneAccent,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = `${zoneAccent}1f`;
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                  }}
                >
                  {label} ↗
                </a>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
