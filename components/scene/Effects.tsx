'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
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

const BLOOM_BASE = 0.32;
const BLOOM_SURGE = 1.4; // peak extra bloom at the moment of power-on

export default function Effects() {
  const reduced = useUI((s) => s.reduced);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bloomRef = useRef<any>(null);
  const surge = useRef(0); // decays 1→0 after boot for a one-shot "power surge"
  // Track the standby flag WITHOUT subscribing — subscribing would re-render the
  // EffectComposer on boot (which is fragile). We poll getState() per frame.
  const prevIntro = useRef(true);

  useFrame((_, delta) => {
    if (!bloomRef.current) return;
    const introNow = useUI.getState().intro;
    if (prevIntro.current && !introNow) surge.current = 1; // standby → live
    prevIntro.current = introNow;
    if (surge.current > 0) surge.current = Math.max(0, surge.current - delta * 1.2);
    // Ease the surge out (quadratic) so the flash blooms then settles.
    const s = surge.current * surge.current;
    bloomRef.current.intensity = BLOOM_BASE + s * BLOOM_SURGE;
  });

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
      <Bloom ref={bloomRef} intensity={BLOOM_BASE} luminanceThreshold={0.82} luminanceSmoothing={0.2} mipmapBlur />

      {/* Filmic rolloff so the brighter rig never clips to white. */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />

      {/* Gentle grade: a touch more saturation + a subtle contrast curve. */}
      <HueSaturation saturation={0.08} />
      <BrightnessContrast brightness={0.02} contrast={0.1} />

      {/* Very light vignette — just enough to seat the subject on the white set
          without darkening the corners into grey. */}
      <Vignette eskil={false} offset={0.55} darkness={0.16} />
    </EffectComposer>
  );
}
