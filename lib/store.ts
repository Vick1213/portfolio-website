import { create } from 'zustand';
import type { Project, Zone } from './types';
import { overviewCamera, zoneCamera, projectCamera, type CamPose } from './camera';

export type CamMode = 'free' | 'flying' | 'tour';

export interface FlyRequest {
  token: number; // strictly increasing; the ONLY thing CameraRig keys its fly effect on
  pose: CamPose; // resolved pos+target to fly to (precomputed in the action)
  durationMs: number; // 1200 zone, 1100 project, 0 when reduced
}

/**
 * Module-scope channel for PER-FRAME camera telemetry. Written by CameraRig each
 * frame (epsilon-throttled), polled by the Minimap via its own rAF — keeps the
 * hot path OUT of zustand so it never triggers React re-renders.
 *   x/z   — world-space pan target (where you're looking on the die)
 *   dist  — camera→target distance (drives the minimap viewport-rect width)
 */
export const camReport = { x: 0, z: 3, dist: 32 };

/**
 * Module-scope channel for the guided tour's skip action. CameraRig owns the
 * GSAP timeline and assigns `tourBus.skip` on mount; the TourOverlay's SKIP pill
 * (and any other DOM affordance) calls it. Default no-op before CameraRig mounts.
 */
export const tourBus: { skip: () => void } = { skip: () => {} };

interface UIState {
  // ── existing (UNCHANGED signatures) ──
  intro: boolean; // power-on overlay visible
  setIntro: (v: boolean) => void;
  activeZone: Zone | null; // panel/HUD/minimap highlight — NOT the camera trigger
  setZone: (z: Zone | null) => void; // REWIRED body: activeZone + clears selected + requestFly
  selected: Project | null; // open project (drives ProjectPanel)
  select: (p: Project | null) => void; // REWIRED body: selected + activeZone + requestFly
  view: '3d' | 'list';
  setView: (v: '3d' | 'list') => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;

  // ── camera coordination (NEW) ──
  camMode: CamMode; // 'free' = MapControls owns camera; 'flying'|'tour' = GSAP owns it
  setCamMode: (m: CamMode) => void;
  flyRequest: FlyRequest | null; // last issued declarative fly; CameraRig dedupes by .token
  requestFly: (pose: CamPose, durationMs: number) => void; // bump token, camMode='flying'
  closeProject: () => void; // selected=null, camMode='free' — does NOT requestFly (stay put)
  setActiveZoneSilently: (z: Zone | null) => void; // writes activeZone ONLY (no fly)

  // ── hover callout (NEW) ──
  hoveredId: string | null; // project.id of the hovered tile, or null
  setHovered: (id: string | null) => void;

  // ── exploded-rig assemble⇄explode (NEW) ──
  // Only the TARGET (0 or 1) lives in state — it changes on a toggle, not per
  // frame. RigModel lerps a local ref toward this, keeping the hot path out of
  // React. Reduced motion snaps (no tween) and starts exploded.
  explodeTarget: number; // 0 = assembled (closed case), 1 = fully exploded teardown
  toggleExplode: () => void;
  setExplodeTarget: (v: number) => void;

  // ── tour (NEW) ──
  tourActive: boolean; // true while the sweep runs; gates skip pill / disables MapControls
  tourZone: Zone | null; // current announced stop (drives TourOverlay copy); null when idle
  startTour: () => void; // no-op if reduced; tourActive=true, camMode='tour', tourZone=null
  setTourZone: (z: Zone | null) => void; // CameraRig sets this at each stop's hold
  endTour: () => void; // tourActive=false, tourZone=null, camMode='free'
}

const DUR_ZONE = 1200;
const DUR_PROJECT = 1100;

export const useUI = create<UIState>((set, get) => ({
  // existing
  intro: true,
  setIntro: (v) => set({ intro: v }),
  activeZone: null,
  selected: null,
  view: '3d',
  setView: (v) => set({ view: v }),
  reduced: false,
  setReduced: (v) => set({ reduced: v }),

  // camera coordination
  camMode: 'free',
  setCamMode: (m) => set({ camMode: m }),
  flyRequest: null,
  requestFly: (pose, durationMs) =>
    set((s) => ({
      flyRequest: {
        token: (s.flyRequest?.token ?? 0) + 1,
        pose,
        durationMs: get().reduced ? 0 : durationMs,
      },
      camMode: 'flying',
    })),

  // REWIRED: keep signatures, route through requestFly so existing call sites are
  // untouched. A deliberate navigation also ABORTS any running tour (the CameraRig
  // tour effect tears down when tourActive flips false), so clicking a zone chip,
  // minimap cell, or tile mid-tour cleanly hands off to that fly.
  setZone: (z) => {
    set({ activeZone: z, selected: null, tourActive: false, tourZone: null });
    get().requestFly(z ? zoneCamera(z) : overviewCamera, DUR_ZONE);
  },
  select: (p) => {
    set({ selected: p, activeZone: p ? p.zone : null, tourActive: false, tourZone: null });
    get().requestFly(p ? projectCamera(p) : overviewCamera, p ? DUR_PROJECT : DUR_ZONE);
  },

  closeProject: () => set({ selected: null, camMode: 'free' }),
  setActiveZoneSilently: (z) => {
    if (get().activeZone !== z) set({ activeZone: z });
  },

  // hover
  hoveredId: null,
  setHovered: (id) => set({ hoveredId: id }),

  // exploded-rig assemble⇄explode
  explodeTarget: 0,
  toggleExplode: () => set((s) => ({ explodeTarget: s.explodeTarget > 0.5 ? 0 : 1 })),
  setExplodeTarget: (v) => set({ explodeTarget: v }),

  // tour
  tourActive: false,
  tourZone: null,
  startTour: () => {
    if (get().reduced) return;
    // Close any open project panel so the tour takes the full screen.
    set({ tourActive: true, tourZone: null, camMode: 'tour', selected: null });
  },
  setTourZone: (z) => set({ tourZone: z }),
  endTour: () => set({ tourActive: false, tourZone: null, camMode: 'free' }),
}));
