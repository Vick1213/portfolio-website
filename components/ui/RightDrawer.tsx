'use client';

import { useRef } from 'react';

import { useUI } from '@/lib/store';
import { usePresence } from '@/lib/usePresence';
import { pcComponentById, type PCComponent } from '@/lib/rig';
import type { Project } from '@/lib/types';
import ProjectPanel from './ProjectPanel';
import ComponentPanel from './ComponentPanel';

const EXIT_MS = 240;

/**
 * The single right-hand drawer slot for the interactive rig. Hosting both the
 * component and project cards in ONE aside keeps the drawer spatially honest:
 * it slides in when the slot first fills, slides back out the way it came when
 * the slot empties, and swapping component ⇄ project is a light content fade
 * inside the drawer — navigation within it, not a new drawer each time.
 */
export default function RightDrawer() {
  const selected = useUI((s) => s.selected);
  const activeComponent = useUI((s) => s.activeComponent);

  const occupied = selected !== null || activeComponent !== null;
  const { mounted, closing } = usePresence(occupied, EXIT_MS);

  // Snapshot the last real content so the slide-out still has something to
  // show after the store has already emptied.
  const last = useRef<{ project: Project | null; component: PCComponent | null }>({
    project: null,
    component: null,
  });
  if (occupied) last.current = { project: selected, component: activeComponent };

  if (!mounted) return null;

  const { project, component } = last.current;
  const label = project
    ? `Project details: ${project.name}`
    : component
      ? `Component details: ${pcComponentById[component].label}`
      : 'Details';

  return (
    <aside
      role="complementary"
      aria-label={label}
      className="fixed top-0 right-0 bottom-0 z-40 pointer-events-auto overflow-y-auto"
      style={{
        width: 'min(480px, 100vw)',
        background: 'rgba(8, 8, 16, 0.88)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(255,255,255,0.08)',
        overscrollBehavior: 'contain',
        animation: closing
          ? `drawer-slide-out ${EXIT_MS}ms cubic-bezier(0.64, 0, 0.78, 0) both`
          : 'drawer-slide-in 0.28s cubic-bezier(0.22, 1, 0.36, 1) both',
      }}
    >
      <style>{`
        @keyframes drawer-slide-in {
          from { transform: translateX(100%); opacity: 0; }
        }
        /* Mirrored exit: same path out, inverse easing of the entry curve. */
        @keyframes drawer-slide-out {
          to { transform: translateX(100%); opacity: 0; }
        }
        @keyframes drawer-content-in {
          from { opacity: 0; transform: translateX(10px); }
        }
      `}</style>

      <div
        key={project ? `p:${project.id}` : `c:${component ?? 'none'}`}
        style={{ animation: 'drawer-content-in 0.2s ease-out both' }}
      >
        {project ? (
          <ProjectPanel project={project} />
        ) : component ? (
          <ComponentPanel componentId={component} />
        ) : null}
      </div>
    </aside>
  );
}
