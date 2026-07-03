import type Lenis from 'lenis';

/**
 * The résumé page's Lenis instance (smooth scrolling on the .rz-root
 * container). Set by ResumeView, consumed by ResumeNav for anchor scrolls so
 * programmatic scrolling goes through Lenis instead of fighting it.
 */
export const resumeLenis: { current: Lenis | null } = { current: null };
