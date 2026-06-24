'use client';

import {
  EffectComposer,
  Bloom,
  ToneMapping,
  HueSaturation,
  BrightnessContrast,
  Vignette,
} from '@react-three/postprocessing';
import { ToneMappingMode } from 'postprocessing';
import { UnsignedByteType } from 'three';
import { useUI } from '@/lib/store';

export default function Effects() {
  const reduced = useUI((s) => s.reduced);

  // Reduced motion / low-power: no post-processing at all.
  if (reduced) return null;

  return (
    // Two deliberate choices keep this stable on ANGLE/Metal (Mac), where the
    // composer otherwise dropped random BLACK frames while orbiting:
    //   1. frameBufferType = UnsignedByte (8-bit LDR). Bloom sampling the default
    //      HALF-FLOAT HDR target is what caused the black frames — an 8-bit target
    //      keeps the glow and renders rock-solid.
    //   2. MSAA via `multisampling` instead of an <SMAA/> pass — SMAA's stencil
    //      buffer collided with the composer's depth-stencil during the blit
    //      resolve ("…cannot be the same image"). MSAA avoids that path.
    <EffectComposer multisampling={4} frameBufferType={UnsignedByteType}>
      {/* LDR bloom: lower threshold (8-bit clamps to 1.0) so the RGB fans + accent
          emissives still bloom, but body panels and label text stay crisp. */}
      <Bloom intensity={0.7} luminanceThreshold={0.62} luminanceSmoothing={0.25} mipmapBlur />

      {/* Filmic rolloff so the brighter rig never clips to white. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Gentle grade: a touch more saturation + a subtle contrast curve. */}
      <HueSaturation saturation={0.08} />
      <BrightnessContrast brightness={0.02} contrast={0.1} />

      <Vignette eskil={false} offset={0.4} darkness={0.42} />
    </EffectComposer>
  );
}
