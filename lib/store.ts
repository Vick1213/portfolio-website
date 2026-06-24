import { create } from 'zustand';
import type { Project } from './types';
import { overviewCamera, componentCamera, type CamPose } from './camera';
import { componentOf, type PCComponent } from './rig';

export type CamMode = 'free' | 'flying' | 'tour';

export interface FlyRequest {
  token: number; // strictly increasing; the ONLY thing CameraRig keys its fly effect on
  pose: CamPose; // resolved pos+target to fly to (precomputed in the action)
  durationMs: number; // 1200 component, 0 when reduced
}

/**
 * Module-scope channel for PER-FRAME camera telemetry. Written by CameraRig each
 * frame (epsilon-throttled), kept OUT of zustand so the hot path never triggers
 * React re-renders. Retained for future minimap/telemetry use.
 */
export const camReport = { x: 0, z: 3, dist: 32 };

/**
 * Module-scope channel for the BUILD TOUR's skip action. CameraRig owns the
 * GSAP timeline and assigns `tourBus.skip` on mount; the TourOverlay's SKIP pill
 * (and any other DOM affordance) calls it. Default no-op before CameraRig mounts.
 */
export const tourBus: { skip: () => void } = { skip: () => {} };

interface UIState {
  // ── intro / view / motion ──
  intro: boolean; // power-on overlay visible
  setIntro: (v: boolean) => void;
  tourAfterBoot: boolean; // armed by the welcome card's "Show me the tour": the
  // NEXT physical power-on auto-explodes + starts the tour (after a beat).
  setTourAfterBoot: (v: boolean) => void;
  view: '3d' | 'list';
  setView: (v: '3d' | 'list') => void;
  reduced: boolean;
  setReduced: (v: boolean) => void;

  // ── component nav (replaces the old die-zone nav) ──
  activeComponent: PCComponent | null; // drives ComponentPanel + nav highlight (NOT the camera trigger)
  setComponent: (id: PCComponent | null) => void; // activeComponent + clears project + flies
  setActiveComponentSilently: (id: PCComponent | null) => void; // highlight only, no fly

  // ── project selection ──
  selected: Project | null; // open project (drives ProjectPanel)
  select: (p: Project | null) => void; // opens panel; keeps activeComponent; does NOT fly
  closeProject: () => void; // selected=null, camMode='free' — stays on the component

  // ── camera coordination ──
  camMode: CamMode; // 'free' = OrbitControls owns camera; 'flying'|'tour' = GSAP owns it
  setCamMode: (m: CamMode) => void;
  flyRequest: FlyRequest | null; // last issued declarative fly; CameraRig dedupes by .token
  requestFly: (pose: CamPose, durationMs: number) => void; // bump token, camMode='flying'

  // ── hover callouts ──
  hoveredComponent: PCComponent | null; // component hotspot under the cursor
  setHoveredComponent: (id: PCComponent | null) => void;

  // ── exploded-rig assemble⇄explode ──
  explodeTarget: number; // 0 = assembled (closed case), 1 = fully exploded teardown
  toggleExplode: () => void;
  setExplodeTarget: (v: number) => void;

  // ── BUILD TOUR ──
  tourActive: boolean; // true while the sweep runs; gates skip pill / disables OrbitControls
  tourComponent: PCComponent | null; // current announced stop (drives TourOverlay copy); null when idle
  startTour: () => void; // no-op if reduced; tourActive=true, camMode='tour'
  setTourComponent: (id: PCComponent | null) => void; // CameraRig sets this at each stop's hold
  endTour: () => void; // tourActive=false, tourComponent=null, camMode='free'
}

const DUR_COMPONENT = 1200;

export const useUI = create<UIState>((set, get) => ({
  // intro / view / motion
  intro: true,
  setIntro: (v) => set({ intro: v }),
  tourAfterBoot: false,
  setTourAfterBoot: (v) => set({ tourAfterBoot: v }),
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

  // component nav — a deliberate navigation also ABORTS any running tour.
  activeComponent: null,
  setComponent: (id) => {
    set({ activeComponent: id, selected: null, tourActive: false, tourComponent: null });
    get().requestFly(id ? componentCamera(id) : overviewCamera, DUR_COMPONENT);
  },
  setActiveComponentSilently: (id) => {
    if (get().activeComponent !== id) set({ activeComponent: id });
  },

  // project selection — opens the panel without re-flying (you reached the part
  // by flying to its component or clicking its hotspot, which already framed it).
  selected: null,
  select: (p) =>
    set({
      selected: p,
      activeComponent: p ? (componentOf(p.id) ?? get().activeComponent) : get().activeComponent,
      tourActive: false,
      tourComponent: null,
    }),
  closeProject: () => set({ selected: null, camMode: 'free' }),

  // hover
  hoveredComponent: null,
  setHoveredComponent: (id) => set({ hoveredComponent: id }),

  // exploded-rig assemble⇄explode
  explodeTarget: 0,
  toggleExplode: () => set((s) => ({ explodeTarget: s.explodeTarget > 0.5 ? 0 : 1 })),
  setExplodeTarget: (v) => set({ explodeTarget: v }),

  // BUILD TOUR
  tourActive: false,
  tourComponent: null,
  startTour: () => {
    if (get().reduced) return;
    // Boot the rig if it's still in standby — a tour of a dead, unlit case is
    // pointless — and close any open project panel so the tour takes the screen.
    set({ intro: false, tourActive: true, tourComponent: null, camMode: 'tour', selected: null, activeComponent: null });
  },
  setTourComponent: (id) => set({ tourComponent: id }),
  endTour: () => set({ tourActive: false, tourComponent: null, camMode: 'free' }),
}));
