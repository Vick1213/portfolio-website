import { rigChannel, type PCComponent } from './rig';

export type CamPose = { pos: [number, number, number]; target: [number, number, number] };

// Frames the build from the OPEN (glass) side of the case — an elevated 3/4
// product-shot hero that shows the interior + power button on first paint,
// without going flat dead-on.
export const overviewCamera: CamPose = { pos: [14, 6, 30], target: [0.5, -1, 1] };

/**
 * A 3/4 product-shot pose centered on a component's LIVE world center (which
 * moves as the rig explodes/assembles, so the framing always tracks the part).
 * Derived from `rigChannel.centers` — never hand-tuned coordinates.
 */
export function componentCamera(id: PCComponent | null): CamPose {
  if (!id) return overviewCamera;
  const c = rigChannel.centers[id];
  if (!c) return overviewCamera;
  const side = c.x >= 0 ? 1 : -1; // approach from the same side the part sits on
  return {
    pos: [c.x + side * 5, c.y + 4, c.z + 16],
    target: [c.x, c.y, c.z],
  };
}

// ─── Rig-explorer interaction constants ──────────────────────────────────────
// The exploded rig is a TALL vertical tower; pan is screen-space (slide up/down
// the tower, not just X/Z), so the pan target is clamped on all three axes.
export const PAN_BOUNDS = {
  minX: -16,
  maxX: 16,
  minY: -18,
  maxY: 14,
  minZ: -8,
  maxZ: 14,
} as const;

// Dolly (zoom) distance limits — max is large enough to frame the whole tower.
export const ZOOM_BOUNDS = { min: 5, max: 60 } as const;
