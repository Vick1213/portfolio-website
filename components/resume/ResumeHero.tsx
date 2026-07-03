'use client';

import { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

import { profile, zones, allProjects } from '@/lib/portfolio';
import { ZONE_INK } from './palette';
import Reveal from './Reveal';

// The live 3D mini-rig is a pure flourish: client-only, deferred until idle,
// desktop-only. Never allowed to block the recruiter-critical hero text.
const HeroRig = dynamic(() => import('./HeroRig'), { ssr: false });

export default function ResumeHero() {
  const textRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);

  // Subtle scroll parallax: text drifts up slightly faster than the page,
  // the rig slightly slower — just enough depth to feel alive.
  useEffect(() => {
    const text = textRef.current;
    if (!text) return;
    const root = text.closest('.rz-root');
    if (!(root instanceof HTMLElement)) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = Math.min(root.scrollTop, 900);
        text.style.transform = `translateY(${y * -0.06}px)`;
        if (rigRef.current) rigRef.current.style.transform = `translateY(${y * 0.08}px)`;
      });
    };
    root.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      root.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const zoneCounts = zones.map((z) => ({
    id: z.id,
    label: z.label,
    count: allProjects.filter((p) => p.zone === z.id).length,
  }));

  return (
    <header className="rz-hero" id="top">
      <div className="rz-col">
        <div className="rz-specbar rz-eyebrow">
          <span>Portfolio — Résumé</span>
          <span className="rz-specbar-mid">Rev 2026.07</span>
          <span className="rz-specbar-status">
            <span className="rz-pulse-dot" aria-hidden="true" />
            Open to work
          </span>
        </div>

        <div className="rz-hero-grid">
          <div className="rz-hero-text" ref={textRef}>
            <Reveal delay={0}>
              <span className="rz-eyebrow">Founder · Chip Architect · Full-Stack Engineer</span>
            </Reveal>

            <Reveal delay={70}>
              <h1 className="rz-hero-h1">
                Saatvik
                <br />
                Choudhary
              </h1>
            </Reveal>

            <Reveal delay={140}>
              <p className="rz-hero-line">
                Founder of Kensridge Partners. I design{' '}
                <em>AI-inference silicon</em> from scratch and ship{' '}
                <em>production web platforms</em> end to end.
              </p>
            </Reveal>

            <Reveal delay={210}>
              <p className="rz-hero-trust">
                currently — Founder @ Kensridge Partners · 2024 — present
              </p>
            </Reveal>

            <Reveal delay={280}>
              <div className="rz-hero-contact">
                <a href={`mailto:${profile.email}`} className="rz-hero-clink">Email</a>
                <span className="rz-hero-sep" aria-hidden="true">/</span>
                <a href={profile.booking} target="_blank" rel="noreferrer" className="rz-hero-clink">
                  Book a 30-min chat
                </a>
                <span className="rz-hero-sep" aria-hidden="true">/</span>
                <a href={profile.linkedin} target="_blank" rel="noreferrer" className="rz-hero-clink">LinkedIn</a>
                <span className="rz-hero-sep" aria-hidden="true">/</span>
                <a href={profile.github} target="_blank" rel="noreferrer" className="rz-hero-clink">GitHub</a>
                <span className="rz-hero-printcta">
                  <span className="rz-hero-sep" aria-hidden="true">/</span>{' '}
                  <button type="button" className="rz-hero-clink" onClick={() => window.print()}>
                    Print résumé
                  </button>
                </span>
              </div>
            </Reveal>
          </div>

          <div className="rz-hero-rig" ref={rigRef} aria-hidden="false">
            <HeroRig />
            <span className="rz-hero-rig-caption rz-eyebrow">Live model — click to explore</span>
          </div>
        </div>

        <Reveal delay={350}>
          <div className="rz-hero-legend">
            {zoneCounts.map((z) => (
              <span className="rz-hero-legend-item" key={z.id}>
                <span className="rz-chip" style={{ background: ZONE_INK[z.id] }} aria-hidden="true" />
                {z.label}
                <span className="rz-hero-legend-count">{String(z.count).padStart(2, '0')}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>

      <style>{`
        .rz-hero {
          position: relative;
          padding-top: 1.25rem;
          padding-bottom: clamp(2.5rem, 5vw, 4rem);
        }
        /* Faint blueprint grid, masked so it fades out toward the bottom. */
        .rz-hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(to right, rgba(23,24,28,0.045) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(23,24,28,0.045) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: radial-gradient(120% 90% at 70% 0%, black 20%, transparent 75%);
          mask-image: radial-gradient(120% 90% at 70% 0%, black 20%, transparent 75%);
          pointer-events: none;
        }
        .rz-hero > .rz-col { position: relative; }

        .rz-specbar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
          padding-block: 12px;
          border-bottom: 1px solid var(--rz-hairline);
          margin-bottom: clamp(2.5rem, 6vw, 5rem);
        }
        .rz-specbar-status {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--rz-ink);
        }
        .rz-pulse-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: var(--rz-accent);
          animation: rz-pulse 2.4s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes rz-pulse {
          0% { box-shadow: 0 0 0 0 rgba(13,148,136,0.45); }
          70% { box-shadow: 0 0 0 6px rgba(13,148,136,0); }
          100% { box-shadow: 0 0 0 0 rgba(13,148,136,0); }
        }

        .rz-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(300px, 420px);
          gap: 2rem;
          align-items: center;
        }
        .rz-hero-text { will-change: transform; }

        .rz-hero-h1 {
          font-family: var(--rz-display);
          font-size: clamp(3.6rem, 9vw, 7.25rem);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 0.94;
          color: var(--rz-ink);
          margin: 1.1rem 0 1.6rem;
          text-wrap: balance;
        }
        .rz-hero-line {
          font-size: clamp(17px, 2vw, 21px);
          color: var(--rz-secondary);
          max-width: 30em;
          line-height: 1.55;
          margin: 0 0 1.5rem;
        }
        .rz-hero-line em {
          font-family: var(--rz-serif);
          font-style: italic;
          font-size: 1.12em;
          color: var(--rz-ink);
          letter-spacing: 0.005em;
        }
        .rz-hero-trust {
          font-family: var(--rz-mono);
          font-size: 12.5px;
          letter-spacing: 0.04em;
          color: var(--rz-muted);
          margin: 0 0 1.9rem;
        }
        .rz-hero-contact {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.7rem;
          font-family: var(--rz-mono);
          font-size: 13px;
        }
        .rz-hero-clink {
          background: none;
          border: none;
          padding: 0;
          font: inherit;
          color: var(--rz-ink);
          cursor: pointer;
          text-decoration: none;
          background-image: linear-gradient(var(--rz-accent), var(--rz-accent));
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 1px;
          padding-bottom: 2px;
          transition: background-size 0.22s ease, color 0.15s ease;
        }
        .rz-hero-clink:hover {
          color: var(--rz-accent);
          background-size: 100% 1px;
        }
        .rz-hero-sep { color: var(--rz-hairline-strong); }
        .rz-hero-printcta { display: inline-flex; align-items: center; gap: 0.7rem; }
        @media print {
          .rz-hero-printcta { display: none !important; }
        }

        .rz-hero-rig {
          position: relative;
          height: clamp(380px, 44vw, 520px);
          will-change: transform;
        }
        .rz-hero-rig-caption {
          position: absolute;
          bottom: 0;
          left: 50%;
          transform: translateX(-50%);
          white-space: nowrap;
          pointer-events: none;
        }

        .rz-hero-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1.6rem;
          margin-top: clamp(2rem, 4vw, 3.5rem);
          padding-top: 16px;
          border-top: 1px solid var(--rz-hairline);
        }
        .rz-hero-legend-item {
          display: inline-flex;
          align-items: center;
          gap: 0.55rem;
          font-family: var(--rz-mono);
          font-size: 11px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rz-secondary);
        }
        .rz-hero-legend-count { color: var(--rz-muted); }

        @media (max-width: 899px) {
          .rz-hero-grid { grid-template-columns: 1fr; }
          .rz-hero-rig { display: none; }
          .rz-specbar-mid { display: none; }
        }
      `}</style>
    </header>
  );
}
