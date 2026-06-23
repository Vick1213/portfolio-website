'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/lib/store';
import type { ProjType } from '@/lib/types';

// Color map for all 5 ProjType values
const TYPE_COLORS: Record<ProjType, { bg: string; text: string; label: string }> = {
  original:       { bg: 'rgba(16,185,129,0.15)', text: '#34d399', label: 'Original'       },
  'ai-builder':   { bg: 'rgba(14,165,233,0.15)', text: '#38bdf8', label: 'AI Builder'     },
  'template-based':{ bg: 'rgba(245,158,11,0.15)', text: '#fbbf24', label: 'Template-Based' },
  fork:           { bg: 'rgba(167,139,250,0.15)', text: '#a78bfa', label: 'Fork'           },
  coursework:     { bg: 'rgba(100,116,139,0.15)', text: '#94a3b8', label: 'Coursework'     },
};

export default function ProjectPanel() {
  const selected = useUI((s) => s.selected);
  const select   = useUI((s) => s.select);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Escape closes the panel; focus the close button when panel opens
  useEffect(() => {
    if (selected === null) return;
    // Move focus to close button when panel opens
    closeRef.current?.focus();

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        select(null);
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [selected, select]);

  if (selected === null) return null;

  const typeStyle = TYPE_COLORS[selected.type] ?? TYPE_COLORS['original'];

  const linkDefs: { key: keyof typeof selected.links; label: string }[] = [
    { key: 'repo',         label: 'Code'   },
    { key: 'live',         label: 'Live'   },
    { key: 'demo',         label: 'Demo'   },
    { key: 'presentation', label: 'Slides' },
  ];

  return (
    <aside
      role="complementary"
      aria-label={`Project details: ${selected.name}`}
      className="fixed top-0 right-0 bottom-0 z-40 pointer-events-auto overflow-y-auto"
      style={{
        width: 'min(480px, 100vw)',
        background: 'rgba(8, 8, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        animation: 'panel-slide-in 0.28s cubic-bezier(0.22,1,0.36,1) both',
      }}
    >
      <style>{`
        @keyframes panel-slide-in {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <div className="flex flex-col gap-5 p-6 pb-10">

        {/* Header row: type badge + close */}
        <div className="flex items-start justify-between gap-3">
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

          {/* Close button */}
          <button
            ref={closeRef}
            type="button"
            onClick={() => select(null)}
            aria-label="Close project panel"
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
          style={{ color: 'rgba(255,255,255,0.92)' }}
        >
          {selected.name}
        </h2>

        {/* Tagline */}
        <p
          className="font-sans text-sm leading-relaxed italic"
          style={{ color: 'rgba(255,255,255,0.5)' }}
        >
          {selected.tagline}
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
          {selected.description}
        </p>

        {/* Tech chips */}
        {selected.tech.length > 0 && (
          <ul aria-label="Technologies" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
            {selected.tech.map((t) => (
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
        {selected.bullets.length > 0 && (
          <ul className="flex flex-col gap-2 list-none p-0 m-0" aria-label="Highlights">
            {selected.bullets.map((b, i) => (
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
        {linkDefs.some(({ key }) => !!selected.links[key]) && (
          <nav aria-label="Project links" className="flex flex-wrap gap-2 pt-1">
            {linkDefs.map(({ key, label }) => {
              const href = selected.links[key];
              if (!href) return null;
              return (
                <a
                  key={key}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="font-mono text-xs px-3 py-1.5 rounded transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    border: `1px solid ${typeStyle.text}60`,
                    color: typeStyle.text,
                    background: 'transparent',
                    textDecoration: 'none',
                    outlineColor: typeStyle.text,
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLAnchorElement).style.background = typeStyle.bg;
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
    </aside>
  );
}
