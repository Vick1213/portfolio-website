'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';

import Experience from '@/components/Experience';
import ScrollSections from './sections';
import { useUI } from '@/lib/store';
import { scrollChannel } from '@/lib/scroll';

/**
 * Owns the scroll-cinematic stage: the persistent 3D <Experience/> pinned in the
 * background + a tall scroll container of section panels layered on top. Lenis
 * smooth-scroll publishes normalized progress (0→1) to `scrollChannel`, which
 * CameraRig + RigModel read per-frame to choreograph the camera and ramp the
 * rig's LEDs. Reaching the end (the "Enter the rig" CTA) hands off to the
 * interactive explorer; the canvas itself never unmounts across that transition.
 */
export default function ScrollStage() {
  const phase = useUI((s) => s.phase);
  const reduced = useUI((s) => s.reduced);

  // A11y: honor reduced motion, skip the scroll-jacked cinematic entirely and
  // drop straight into the (fully usable) interactive rig.
  useEffect(() => {
    if (reduced && useUI.getState().phase === 'cinematic') {
      useUI.getState().enterInteractive();
    }
  }, [reduced]);

  // Re-enable document scrolling only while the cinematic is running (the app is
  // `overflow: hidden; height: 100%` by default on BOTH html + body, which locks
  // the document, this frees both so the page can actually scroll).
  useEffect(() => {
    if (phase !== 'cinematic') return;
    document.documentElement.classList.add('cinematic-scroll');
    return () => document.documentElement.classList.remove('cinematic-scroll');
  }, [phase]);

  // Lenis smooth-scroll → scrollChannel.progress.
  useEffect(() => {
    if (phase !== 'cinematic' || reduced) return;

    window.scrollTo(0, 0);
    scrollChannel.progress = 0;

    const lenis = new Lenis();
    let raf = 0;
    const loop = (t: number) => {
      lenis.raf(t);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    const onScroll = (l: Lenis) => {
      scrollChannel.progress = Number.isFinite(l.progress) ? l.progress : 0;
    };
    lenis.on('scroll', onScroll);

    return () => {
      cancelAnimationFrame(raf);
      lenis.off('scroll', onScroll);
      lenis.destroy();
    };
  }, [phase, reduced]);

  return (
    <>
      {/* Persistent background canvas (position: fixed, inset: 0). */}
      <Experience />

      {/* Scroll narrative, only mounted during the cinematic. `pointer-events:
          auto` on the container also shields the canvas from stray clicks (e.g.
          the on-case power button) while the camera is scroll-driven. */}
      {phase === 'cinematic' && (
        <div style={{ position: 'relative', zIndex: 10, pointerEvents: 'auto' }}>
          <ScrollSections />
        </div>
      )}
    </>
  );
}
