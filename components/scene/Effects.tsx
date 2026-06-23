'use client';

import {
  EffectComposer,
  SMAA,
  Bloom,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { useUI } from '@/lib/store';

export default function Effects() {
  const reduced = useUI((s) => s.reduced);

  // Reduced motion / low-power: no post-processing at all.
  if (reduced) return null;

  return (
    <EffectComposer multisampling={0}>
      {/* Anti-alias first so subsequent passes operate on clean edges. */}
      <SMAA />

      {/* Tight bloom: high threshold so only the HDR packets and bright accent
          emissives glow — NOT the white label text (keeps text crisp, no haze). */}
      <Bloom
        intensity={0.55}
        luminanceThreshold={0.9}
        luminanceSmoothing={0.2}
        mipmapBlur
      />

      {/* Filmic rolloff so the brighter rig never clips to white. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Gentle grade: a touch more saturation + a subtle contrast curve. */}
      <HueSaturation saturation={0.08} />
      <BrightnessContrast brightness={0.02} contrast={0.1} />

      <Vignette eskil={false} offset={0.4} darkness={0.42} />
    </EffectComposer>
  );
}
