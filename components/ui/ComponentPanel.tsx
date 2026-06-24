'use client';

import { useEffect, useRef } from 'react';
import { useUI } from '@/lib/store';
import { pcComponentById, projectsByComponent } from '@/lib/rig';

const INK = '#e6ebf4';

/**
 * Right-side drawer for the ACTIVE component (when no individual project is
 * open). Shows the part's role + blurb + headline skills, then its projects as
 * clickable rows that open the existing ProjectPanel. Mutually exclusive with
 * ProjectPanel: this renders only while a component is active AND nothing is
 * selected, so the two drawers never stack.
 */
export default function ComponentPanel() {
  const activeComponent = useUI((s) => s.activeComponent);
  const selected = useUI((s) => s.selected);
  const closeRef = useRef<HTMLButtonElement>(null);

  const open = activeComponent !== null && selected === null;

  // Focus the close button when the panel opens.
  useEffect(() => {
    if (open) closeRef.current?.focus();
  }, [open, activeComponent]);

  if (!open || !activeComponent) return null;

  const meta = pcComponentById[activeComponent];
  const accent = meta.accent;
  const projects = projectsByComponent(activeComponent);

  return (
    <aside
      role="complementary"
      aria-label={`Component details: ${meta.label}`}
      className="fixed top-0 right-0 bottom-0 z-40 pointer-events-auto overflow-y-auto"
      style={{
        width: 'min(460px, 100vw)',
        background: 'rgba(8, 8, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        borderTop: `2px solid ${accent}`,
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
        {/* Header row: component tag + close */}
        <div className="flex items-start justify-between gap-3">
          <span
            className="font-mono text-xs px-2.5 py-1 rounded-full flex-shrink-0"
            style={{
              background: `${accent}1f`,
              color: accent,
              border: `1px solid ${accent}55`,
              letterSpacing: '0.08em',
            }}
          >
            COMPONENT
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={() => useUI.getState().setComponent(null)}
            aria-label="Close component panel"
            className="font-mono text-base leading-none rounded p-1 flex-shrink-0 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-white"
            style={{ color: 'rgba(255,255,255,0.4)', background: 'transparent' }}
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

        {/* Component name + role */}
        <div>
          <h2 className="font-sans text-xl font-semibold leading-snug" style={{ color: INK }}>
            {meta.label}
          </h2>
          <p
            className="font-mono uppercase mt-1.5"
            style={{ fontSize: '10px', letterSpacing: '0.18em', color: accent }}
          >
            {meta.role}
          </p>
        </div>

        {/* Blurb */}
        <p className="font-sans text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.7)' }}>
          {meta.blurb}
        </p>

        {/* Skills */}
        {meta.skills.length > 0 && (
          <div>
            <div
              className="font-mono uppercase mb-2"
              style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}
            >
              Stack
            </div>
            <ul aria-label="Skills" className="flex flex-wrap gap-1.5 list-none p-0 m-0">
              {meta.skills.map((s) => (
                <li
                  key={s}
                  className="font-mono text-xs px-2 py-0.5 rounded"
                  style={{
                    background: 'rgba(255,255,255,0.05)',
                    color: 'rgba(255,255,255,0.6)',
                    border: '1px solid rgba(255,255,255,0.08)',
                  }}
                >
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Divider */}
        <div aria-hidden="true" className="h-px w-full" style={{ background: 'rgba(255,255,255,0.07)' }} />

        {/* Projects list */}
        <div>
          <div
            className="font-mono uppercase mb-3"
            style={{ fontSize: '10px', letterSpacing: '0.2em', color: 'rgba(255,255,255,0.4)' }}
          >
            {projects.length} Project{projects.length === 1 ? '' : 's'}
          </div>
          <ul className="flex flex-col gap-2 list-none p-0 m-0">
            {projects.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => useUI.getState().select(p)}
                  className="w-full text-left rounded-lg p-3 transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1"
                  style={{
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.02)',
                    outlineColor: accent,
                  }}
                  onMouseEnter={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = `${accent}14`;
                    el.style.borderColor = `${accent}66`;
                  }}
                  onMouseLeave={(e) => {
                    const el = e.currentTarget as HTMLButtonElement;
                    el.style.background = 'rgba(255,255,255,0.02)';
                    el.style.borderColor = 'rgba(255,255,255,0.08)';
                  }}
                >
                  <div className="flex items-center gap-2">
                    {p.featured && (
                      <span aria-label="Featured" title="Featured" style={{ color: accent, fontSize: 11 }}>
                        ★
                      </span>
                    )}
                    <span className="font-sans text-sm font-medium" style={{ color: INK }}>
                      {p.name}
                    </span>
                  </div>
                  <p
                    className="font-sans text-xs leading-relaxed mt-1"
                    style={{ color: 'rgba(255,255,255,0.5)' }}
                  >
                    {p.tagline}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}
