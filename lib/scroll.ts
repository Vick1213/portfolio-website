import { overviewCamera, type CamPose } from './camera';

/**
 * Module-scope channel for the scroll-cinematic progress (0 → 1). Written by the
 * scroll observer in ScrollStage (Lenis `scroll` event), read by CameraRig +
 * RigModel PER-FRAME. Kept OUT of zustand exactly like `camReport`/`rigChannel`
 * so the hot path never triggers React re-renders.
 */
export const scrollChannel = { progress: 0 };

/**
 * Keyframe = a camera pose anchored at a normalized scroll position `at` (0..1).
 * `explode` (0 assembled → 1 torn down) is optional and defaults to 0, the
 * cinematic is a product-shot orbit of the assembled tower; flip a mid-story
 * keyframe to a partial explode if you want a teardown peek.
 */
export type CinematicKeyframe = { at: number; pose: CamPose; explode?: number };

/**
 * The cinematic camera path. A slow orbit of the rig that ENDS exactly on
 * `overviewCamera` (the interactive explorer's hero pose) so the hand-off to
 * OrbitControls at scroll-end is seamless, no snap. Tune these freely; only the
 * invariant "last keyframe === overviewCamera" must hold.
 */
export const CINEMATIC_KEYFRAMES: CinematicKeyframe[] = [
  // Establishing: high and out front, looking down on the dark tower.
  { at: 0.0, pose: { pos: [0, 18, 36], target: [0, 0, 0] } },
  // Swing to the right flank, dropping to eye level.
  { at: 0.3, pose: { pos: [30, 8, 16], target: [0, -1, 1] } },
  // Low, dramatic pass behind the right shoulder of the case.
  { at: 0.6, pose: { pos: [22, 2, -24], target: [0, 0, 1] } },
  // Rise up and sweep around to the back-left.
  { at: 0.85, pose: { pos: [-26, 11, -14], target: [0, -1, 1] } },
  // Land on the hero overview, identical to the interactive entry pose.
  { at: 1.0, pose: overviewCamera },
];

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

// Smoothstep so each segment eases in/out instead of cornering at keyframes.
function smooth(t: number) {
  return t * t * (3 - 2 * t);
}

/**
 * Resolve the camera pose for a scroll progress in [0,1] by finding the
 * bracketing keyframes and smoothstep-lerping their pos + target.
 */
export function cinematicPose(progress: number): CamPose {
  const p = Math.min(1, Math.max(0, progress));
  const kf = CINEMATIC_KEYFRAMES;
  if (p <= kf[0].at) return kf[0].pose;
  if (p >= kf[kf.length - 1].at) return kf[kf.length - 1].pose;

  let i = 0;
  while (i < kf.length - 1 && p > kf[i + 1].at) i++;
  const a = kf[i];
  const b = kf[i + 1];
  const t = smooth((p - a.at) / (b.at - a.at || 1));

  return {
    pos: [
      lerp(a.pose.pos[0], b.pose.pos[0], t),
      lerp(a.pose.pos[1], b.pose.pos[1], t),
      lerp(a.pose.pos[2], b.pose.pos[2], t),
    ],
    target: [
      lerp(a.pose.target[0], b.pose.target[0], t),
      lerp(a.pose.target[1], b.pose.target[1], t),
      lerp(a.pose.target[2], b.pose.target[2], t),
    ],
  };
}

/** Same bracketing logic for the optional per-keyframe explode amount. */
export function cinematicExplode(progress: number): number {
  const p = Math.min(1, Math.max(0, progress));
  const kf = CINEMATIC_KEYFRAMES;
  if (p <= kf[0].at) return kf[0].explode ?? 0;
  if (p >= kf[kf.length - 1].at) return kf[kf.length - 1].explode ?? 0;
  let i = 0;
  while (i < kf.length - 1 && p > kf[i + 1].at) i++;
  const a = kf[i];
  const b = kf[i + 1];
  const t = smooth((p - a.at) / (b.at - a.at || 1));
  return lerp(a.explode ?? 0, b.explode ?? 0, t);
}
