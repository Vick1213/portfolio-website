import { create } from 'zustand';
import type { Project, Zone } from './types';

interface UIState {
  intro: boolean;
  setIntro: (v: boolean) => void; // intro/power-on overlay visible
  activeZone: Zone | null;
  setZone: (z: Zone | null) => void; // null = overview
  selected: Project | null;
  select: (p: Project | null) => void;
  view: '3d' | 'list';
  setView: (v: '3d' | 'list') => void; // resume fallback toggle
  reduced: boolean;
  setReduced: (v: boolean) => void; // reduced-motion / low-power
}

export const useUI = create<UIState>((set) => ({
  intro: true,
  setIntro: (v) => set({ intro: v }),
  activeZone: null,
  // Selecting a zone also clears any open project so the camera actually flies
  // to the zone (CameraRig prioritises `selected` over `activeZone`).
  setZone: (z) => set({ activeZone: z, selected: null }),
  selected: null,
  select: (p) => set({ selected: p, activeZone: p ? p.zone : null }),
  view: '3d',
  setView: (v) => set({ view: v }),
  reduced: false,
  setReduced: (v) => set({ reduced: v }),
}));
