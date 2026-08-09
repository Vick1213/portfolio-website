'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Mount-presence for exit animations. `open` drives the target state; when it
 * flips false the hook holds the component mounted through a `closing` window
 * of `exitMs` so a mirrored exit animation can play before unmount — things
 * should leave the way they came, not vanish. Under prefers-reduced-motion the
 * closing window collapses so dismissal is instant.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [state, setState] = useState<'closed' | 'open' | 'closing'>(open ? 'open' : 'closed');
  const everOpen = useRef(open);

  useEffect(() => {
    if (open) {
      everOpen.current = true;
      setState('open');
      return;
    }
    if (!everOpen.current) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setState('closed');
      return;
    }
    setState('closing');
    const t = window.setTimeout(() => setState('closed'), exitMs);
    return () => window.clearTimeout(t);
  }, [open, exitMs]);

  return { mounted: state !== 'closed', closing: state === 'closing' };
}
