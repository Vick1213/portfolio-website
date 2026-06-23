'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useUI } from '@/lib/store';
import { profile } from '@/lib/portfolio';

const INK = '#e6ebf4';
const ZONE_CORES = ['#5eead4', '#818cf8', '#f0abfc', '#fbbf24'];

/**
 * Shared boot flag. Set true the instant the user powers on, so in-scene
 * Traces/Lights can trigger the zone-by-zone power-on flood + pointLight ramp.
 * Read-only handoff for scene code (module ref — no new store field added).
 */
export const bootRef = { fired: false };

export default function Intro() {
  const intro = useUI((s) => s.intro);
  const setIntro = useUI((s) => s.setIntro);
  const reduced = useUI((s) => s.reduced);

  const cardRef = useRef<HTMLDivElement>(null);
  const coreRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const dismissingRef = useRef(false);

  // Power-on: set boot flag for the scene flood, then fade/scale the card out.
  function powerOn() {
    if (dismissingRef.current) return;
    dismissingRef.current = true;
    bootRef.fired = true;

    if (reduced || !cardRef.current) {
      setIntro(false);
      return;
    }
    gsap.to(cardRef.current, {
      opacity: 0,
      scale: 1.02,
      duration: 0.6,
      ease: 'power2.out',
      onComplete: () => setIntro(false),
    });
  }

  // Keyboard: Enter or Escape powers on (preserved exactly).
  useEffect(() => {
    if (!intro) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === 'Escape') {
        powerOn();
      }
    }
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intro]);

  // Entrance: stagger the four zone cores alight (gated by reduced).
  useEffect(() => {
    if (!intro || reduced) return;
    const cores = coreRefs.current.filter(Boolean) as HTMLSpanElement[];
    const ctx = gsap.context(() => {
      gsap.fromTo(
        cores,
        { opacity: 0.12, scale: 0.85 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.4,
          ease: 'power2.out',
          stagger: 0.09,
          delay: 0.15,
        }
      );
    });
    return () => ctx.revert();
  }, [intro, reduced]);

  if (intro === false) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Portfolio introduction"
      className="fixed inset-0 z-50 flex items-center justify-center pointer-events-auto"
      style={{
        background: 'rgba(6, 9, 16, 0.94)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
      }}
    >
      {/* Accent-gradient bordered glass card */}
      <div
        ref={cardRef}
        className="relative rounded-2xl p-[1px] mx-6"
        style={{
          maxWidth: '40rem',
          background:
            'linear-gradient(135deg, #5eead4, #818cf8, #f0abfc, #fbbf24)',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6)',
        }}
      >
        <div
          className="flex flex-col items-center gap-6 rounded-2xl px-10 py-12 text-center"
          style={{ background: 'rgba(8, 11, 18, 0.94)' }}
        >
          {/* Four zone cores, illuminating one-by-one */}
          <div
            aria-hidden="true"
            className="flex items-center gap-3"
          >
            {ZONE_CORES.map((c, i) => (
              <span
                key={c}
                ref={(el) => {
                  coreRefs.current[i] = el;
                }}
                className="inline-block rounded-sm"
                style={{
                  width: '14px',
                  height: '14px',
                  background: c,
                  boxShadow: `0 0 12px ${c}`,
                  opacity: reduced ? 1 : 0.12,
                }}
              />
            ))}
          </div>

          {/* Name */}
          <h1
            className="font-mono font-bold tracking-tight"
            style={{ color: INK, fontSize: '44px', lineHeight: 1.05 }}
          >
            {profile.name}
          </h1>

          {/* Headline */}
          <p
            className="font-sans leading-relaxed"
            style={{
              color: 'rgba(255,255,255,0.6)',
              fontSize: '16px',
              maxWidth: '32rem',
            }}
          >
            {profile.headline}
          </p>

          {/* Hairline accent divider */}
          <div
            aria-hidden="true"
            className="w-16 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent, #5eead4, transparent)',
            }}
          />

          {/* POWER ON button */}
          <div className="flex flex-col items-center gap-2.5">
            <button
              onClick={powerOn}
              autoFocus
              className="font-mono text-sm px-7 py-2.5 rounded-full transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2"
              style={{
                border: '1px solid #5eead4',
                color: '#5eead4',
                background: 'transparent',
                outlineColor: '#5eead4',
                boxShadow: '0 0 0 0 rgba(94,234,212,0.4)',
                letterSpacing: '0.12em',
              }}
              onMouseEnter={(e) => {
                const t = e.currentTarget as HTMLButtonElement;
                t.style.background = 'rgba(94, 234, 212, 0.08)';
                t.style.boxShadow = '0 0 20px rgba(94,234,212,0.35)';
              }}
              onMouseLeave={(e) => {
                const t = e.currentTarget as HTMLButtonElement;
                t.style.background = 'transparent';
                t.style.boxShadow = '0 0 0 0 rgba(94,234,212,0.4)';
              }}
            >
              POWER ON ▸
            </button>
            <span
              className="font-mono uppercase"
              style={{
                fontSize: '10px',
                letterSpacing: '0.2em',
                color: 'rgba(255,255,255,0.35)',
              }}
            >
              Press{' '}
              <kbd
                style={{
                  color: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  fontSize: '10px',
                }}
              >
                Enter
              </kbd>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
