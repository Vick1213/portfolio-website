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

export const overviewCamera: CamPose = { pos: [0, 22, 26], target: [0, 0, 3] };

export function zoneCamera(zone: Zone | null): CamPose {
  if (!zone) return overviewCamera;
  const o = originOf(zone);
  return { pos: [o[0], 10, 14], target: [o[0], 0, 2.6] };
}

export function projectCamera(p: Project): CamPose {
  const t = tilePosition(p);
  return { pos: [t[0], 5, t[2] + 7], target: t };
}
