import { useEffect, useState } from 'react';
import { useUI } from './store';

export function useResponsive(): { small: boolean; webgl: boolean } {
  const [small, setSmall] = useState(false);
  const [webgl, setWebgl] = useState(true); // default true → SSR/first paint prefers 3D path

  useEffect(() => {
    // --- WebGL detection ---
    function detectWebGL(): boolean {
      try {
        const canvas = document.createElement('canvas');
        const ctx =
          canvas.getContext('webgl') ??
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext | null);
        return ctx !== null;
      } catch {
        return true; // on any error, assume capable
      }
    }

    // --- Small screen ---
    const smallMq = window.matchMedia('(max-width: 768px)');
    function handleSmallChange(e: MediaQueryListEvent) {
      setSmall(e.matches);
    }

    setSmall(smallMq.matches);
    setWebgl(detectWebGL());

    smallMq.addEventListener('change', handleSmallChange);

    // --- Reduced motion ---
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMq.matches) {
      useUI.getState().setReduced(true);
    }
    function handleReducedChange(e: MediaQueryListEvent) {
      useUI.getState().setReduced(e.matches);
    }
    reducedMq.addEventListener('change', handleReducedChange);

    return () => {
      smallMq.removeEventListener('change', handleSmallChange);
      reducedMq.removeEventListener('change', handleReducedChange);
    };
  }, []);

  return { small, webgl };
}
