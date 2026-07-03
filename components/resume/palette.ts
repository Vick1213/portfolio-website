import type { Zone } from '@/lib/types';

/**
 * Zone accents tuned for the light "white studio" résumé page. The 3D scene's
 * zone colors (lib/portfolio.ts) are pastels picked for a dark HUD; on paper
 * they wash out, so the résumé uses these ink-strength equivalents.
 */
export const ZONE_INK: Record<Zone, string> = {
  silicon: '#0d9488',
  web: '#4f46e5',
  client: '#a21caf',
  ml: '#b45309',
};
