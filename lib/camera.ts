import type { Project, Zone } from './types';
import { zones } from './portfolio';
import { TILE_SPACING } from './constants';

export type CamPose = { pos: [number, number, number]; target: [number, number, number] };

const originOf = (zone: Zone): [number, number, number] =>
  zones.find((z) => z.id === zone)!.origin;

export function tilePosition(p: Project): [number, number, number] {
  const o = originOf(p.zone);
  const [col, row] = p.grid ?? [0, 0];
  return [o[0] + col * TILE_SPACING, 0, row * TILE_SPACING];
}

// Frames the whole exploded rig (a tall vertical tower, X∈[-13,13], Y∈[-16,12]).
export const overviewCamera: CamPose = { pos: [0, 1, 42], target: [0, -2, 1] };

export function zoneCamera(zone: Zone | null): CamPose {
  if (!zone) return overviewCamera;
  const o = originOf(zone);
  return { pos: [o[0], 10, 14], target: [o[0], 0, 2.6] };
}

export function projectCamera(p: Project): CamPose {
  const t = tilePosition(p);
  return { pos: [t[0], 5, t[2] + 7], target: t };
}

// ─── Rig-explorer interaction constants ──────────────────────────────────────
// The exploded rig is a TALL vertical tower: X∈[-13,13], Y∈[-16,12], Z∈[-7,10].

// Clamp range for the pan TARGET (world units). Includes Y because the rig is
// tall and panning is screen-space (you slide up/down the tower, not just X/Z).
export const PAN_BOUNDS = {
  minX: -13,
  maxX: 13,
  minY: -16,
  maxY: 12,
  minZ: -6,
  maxZ: 10,
} as const;

// Dolly (zoom) distance limits — max is large enough to frame the whole tower.
export const ZOOM_BOUNDS = { min: 6, max: 58 } as const;

// Full rig X extent — used by the minimap/manifest to map world X → pixel X.
export const DIE_X_RANGE = { min: -13, max: 13 } as const;

// Guided-tour stop order: the career arc, right → left across the board.
// ML Roots (X+18) → Client & Product (X+6) → Web & Full-Stack (X-6) → Silicon (X-18).
export const TOUR_ORDER: Zone[] = ['ml', 'client', 'web', 'silicon'];
