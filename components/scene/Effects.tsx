'use client';

import { Vector2 } from 'three';
import { EffectComposer, Bloom, ChromaticAberration, Vignette } from '@react-three/postprocessing';
import { useUI } from '@/lib/store';

export default function Effects() {
  const reduced = useUI((s) => s.reduced);
  if (reduced) return null;

  return (
    <EffectComposer>
      <Bloom intensity={0.8} luminanceThreshold={0.2} mipmapBlur />
      <ChromaticAberration offset={new Vector2(0.0005, 0.0005)} />
      <Vignette eskil={false} offset={0.3} darkness={0.6} />
    </EffectComposer>
  );
}
