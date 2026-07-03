import { create } from 'zustand';

/**
 * Résumé-page theme system. Each theme swaps the entire `--rz-*` token set
 * (colors, fonts, radii, shadows, background layers) via a `data-theme`
 * attribute on `.rz-root`; the overrides live in components/resume/themes.css.
 * 'spec' is the shipped "white studio spec sheet" look and stays the default.
 */
export type ThemeId = 'spec' | 'glass' | 'neo' | 'aurora' | 'brutal' | 'pixel';

/** Slider order — index in this array IS the range input's value. */
export const THEMES: { id: ThemeId; label: string }[] = [
  { id: 'spec', label: 'Spec Sheet' },
  { id: 'glass', label: 'Glass' },
  { id: 'neo', label: 'Neoclassical' },
  { id: 'aurora', label: 'Aurora' },
  { id: 'brutal', label: 'Brutalism' },
  { id: 'pixel', label: 'Pixel Art' },
];

const STORAGE_KEY = 'sc-theme';

interface ThemeState {
  theme: ThemeId;
  setTheme: (t: ThemeId) => void;
  /** Read the saved theme after mount (never during render — SSR renders 'spec'). */
  hydrate: () => void;
}

export const useTheme = create<ThemeState>((set) => ({
  theme: 'spec',
  setTheme: (t) => {
    set({ theme: t });
    try {
      localStorage.setItem(STORAGE_KEY, t);
    } catch {
      /* private mode / storage denied — theme still applies for the session */
    }
  },
  hydrate: () => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved && THEMES.some((t) => t.id === saved)) {
        set({ theme: saved as ThemeId });
      }
    } catch {
      /* ignore */
    }
  },
}));
