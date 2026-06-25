'use client';

import dynamic from 'next/dynamic';

import { useUI } from '@/lib/store';
import { useResponsive } from '@/lib/useResponsive';

import Loader from '@/components/scene/Loader';
import Hud from '@/components/ui/Hud';
import ProjectPanel from '@/components/ui/ProjectPanel';
import ComponentPanel from '@/components/ui/ComponentPanel';
import Minimap from '@/components/ui/Minimap';
import TourOverlay from '@/components/ui/TourOverlay';
import ResumeView from '@/components/ui/ResumeView';
import MobileFallback from '@/components/ui/MobileFallback';
import Footer from '@/components/ui/Footer';
import ChatLauncher from '@/components/ui/chat/ChatLauncher';

// The scroll-cinematic stage (which hosts the WebGL <Experience/>) is client-only
//, never SSR it (WebGL / window / Lenis access).
const ScrollStage = dynamic(() => import('@/components/scroll/ScrollStage'), {
  ssr: false,
});

export default function Page() {
  const { webgl } = useResponsive();
  const view = useUI((s) => s.view);
  const phase = useUI((s) => s.phase);

  // Only fall back to the static hero + resume when the device genuinely can't
  // render WebGL. Phones DO get the full experience (touch-driven scroll +
  // orbit / pinch-zoom); the HUD is responsive for small screens.
  if (!webgl) {
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

  // Default: scroll-cinematic intro → interactive exploded-rig experience. The
  // interactive DOM overlays only mount once the scroll story hands off
  // (`phase === 'interactive'`); during the cinematic only the scroll narrative
  // (rendered inside ScrollStage) is visible over the pinned rig.
  return (
    <>
      <Loader />
      <ScrollStage />
      {phase === 'interactive' && (
        <>
          <Hud />
          <ComponentPanel />
          <ProjectPanel />
          <Minimap />
          <TourOverlay />
          <ChatLauncher />
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
        </>
      )}
    </>
  );
}
