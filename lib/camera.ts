import { rigChannel, type PCComponent } from './rig';

export type CamPose = { pos: [number, number, number]; target: [number, number, number] };

// Frames the build from the OPEN (glass) side of the case — an elevated 3/4
// product-shot hero that shows the interior + power button on first paint,
// without going flat dead-on.
export const overviewCamera: CamPose = { pos: [14, 6, 30], target: [0.5, -1, 1] };

// Unit viewing direction of the hero overview (target → camera). Every component
// is framed from THIS same open/glass-side angle so focus + the build tour never
// swing around to the closed/back side of the case. The old code derived the
// approach side from `sign(c.x)`, which was meaningful only for the original
// hand-authored layout (parts spread along ±X); the real GLB puts every part at
// x≈0, so that sign flipped on noise and sent half the parts behind the panel.
const HERO_DIR: readonly [number, number, number] = (() => {
  const dx = overviewCamera.pos[0] - overviewCamera.target[0];
  const dy = overviewCamera.pos[1] - overviewCamera.target[1];
  const dz = overviewCamera.pos[2] - overviewCamera.target[2];
  const len = Math.hypot(dx, dy, dz) || 1;
  return [dx / len, dy / len, dz / len];
})();

// Dolly distance for a single-part product shot (the overview sits ~33 away and
// frames the whole tower; this pulls in to fill the frame with one component).
const FOCUS_DIST = 17;

/**
 * A 3/4 product-shot pose centered on a component's LIVE world center (which
 * moves as the rig explodes/assembles, so the framing always tracks the part),
 * viewed from the same hero angle as the overview. Derived from
 * `rigChannel.centers` + `HERO_DIR` — never hand-tuned per-part coordinates.
 */
export function componentCamera(id: PCComponent | null): CamPose {
  if (!id) return overviewCamera;
  const c = rigChannel.centers[id];
  if (!c) return overviewCamera;
  return {
    pos: [c.x + HERO_DIR[0] * FOCUS_DIST, c.y + HERO_DIR[1] * FOCUS_DIST, c.z + HERO_DIR[2] * FOCUS_DIST],
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
