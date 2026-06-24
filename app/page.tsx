'use client';

import dynamic from 'next/dynamic';

import { useUI } from '@/lib/store';
import { useResponsive } from '@/lib/useResponsive';

import Loader from '@/components/scene/Loader';
import Intro from '@/components/ui/Intro';
import Hud from '@/components/ui/Hud';
import ProjectPanel from '@/components/ui/ProjectPanel';
import Minimap from '@/components/ui/Minimap';
import TourOverlay from '@/components/ui/TourOverlay';
import ResumeView from '@/components/ui/ResumeView';
import MobileFallback from '@/components/ui/MobileFallback';
import Footer from '@/components/ui/Footer';

// The 3D experience is client-only (WebGL / window access) — never SSR it.
const Experience = dynamic(() => import('@/components/Experience'), {
  ssr: false,
});

export default function Page() {
  const { small, webgl } = useResponsive();
  const view = useUI((s) => s.view);

  // Small screens or no WebGL → static hero + full resume (no canvas at all).
  if (small || !webgl) {
    return <MobileFallback />;
  }

  // Desktop user explicitly chose the list/resume view.
  if (view === 'list') {
    return (
      <>
        <Hud />
        <ResumeView />
      </>
    );
  }

  // Default: the 3D silicon-die experience with DOM overlays on top.
  return (
    <main>
      <Loader />
      <Experience />
      <Intro />
      <Hud />
      <ProjectPanel />
      <Minimap />
      <TourOverlay />
      <div
        style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 20,
          background: 'rgba(4, 5, 13, 0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
        }}
      >
        <Footer />
      </div>
    </main>
  );
}
