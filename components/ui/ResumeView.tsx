'use client';

import { useEffect, useRef, useState } from 'react';
import Lenis from 'lenis';

import { useTheme } from '@/lib/themeStore';
import ResumeNav from '@/components/resume/ResumeNav';
import '@/components/resume/themes.css';
import ResumeHero from '@/components/resume/ResumeHero';
import Ticker from '@/components/resume/Ticker';
import SelectedWork from '@/components/resume/SelectedWork';
import ExperienceSection from '@/components/resume/ExperienceSection';
import SkillsGrid from '@/components/resume/SkillsGrid';
import ProjectArchive from '@/components/resume/ProjectArchive';
import RigCta from '@/components/resume/RigCta';
import ContactSection from '@/components/resume/ContactSection';
import { resumeLenis } from '@/components/resume/lenisRef';

/**
 * "White studio / spec sheet" résumé page — the paper-light counterpart to the
 * white-studio 3D rig. Thin composition shell: owns the shared rz- design
 * tokens, Lenis smooth scrolling on the .rz-root container, the zone-gradient
 * scroll progress bar, and the print stylesheet. Section content lives in
 * components/resume/*.
 */
export default function ResumeView() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const theme = useTheme((s) => s.theme);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let lenis: Lenis | null = null;
    let rafId = 0;
    if (!reduced) {
      lenis = new Lenis({
        wrapper: root,
        duration: 1.05,
        smoothWheel: true,
      });
      resumeLenis.current = lenis;
      const raf = (time: number) => {
        lenis?.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    }

    let ticking = false;
    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const max = root.scrollHeight - root.clientHeight;
        setProgress(max > 0 ? root.scrollTop / max : 0);
        ticking = false;
      });
    };
    root.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      root.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(rafId);
      lenis?.destroy();
      resumeLenis.current = null;
    };
  }, []);

  return (
    <div className="rz-root" data-theme={theme} ref={rootRef}>
      <div
        className="rz-progress"
        style={{ transform: `scaleX(${progress})` }}
        aria-hidden="true"
      />
      <ResumeNav />
      <main>
        <ResumeHero />
        <Ticker />
        <SelectedWork />
        <ExperienceSection />
        <SkillsGrid />
        <ProjectArchive />
        <RigCta />
        <ContactSection />
      </main>

      <style>{`
        .rz-root {
          --rz-bg: #f5f5f2;
          --rz-surface: #fcfcfa;
          --rz-ink: #17181c;
          --rz-secondary: #4e5560;
          --rz-muted: #8a8f98;
          --rz-hairline: rgba(23,24,28,0.13);
          --rz-hairline-strong: rgba(23,24,28,0.30);
          --rz-accent: #0d9488;
          --rz-display: var(--font-display), var(--font-sans), system-ui, sans-serif;
          --rz-serif: var(--font-serif), Georgia, serif;
          --rz-mono: var(--font-mono), ui-monospace, monospace;
          --rz-body-font: var(--font-sans), system-ui, -apple-system, sans-serif;
          --rz-col: 1120px;

          /* Theme-system hooks — 'spec' defaults; themes.css overrides per
             [data-theme]. */
          --rz-nav-bg: rgba(245,245,242,0.82);
          --rz-progress: linear-gradient(90deg, #0d9488, #4f46e5, #a21caf, #b45309);
          --rz-radius: 0px;
          --rz-card-bg: transparent;
          --rz-card-border: 1px solid transparent;
          --rz-card-shadow: none;
          --rz-grid-line: rgba(23,24,28,0.045);

          height: 100vh;
          overflow-y: auto;
          overflow-x: hidden;
          background: var(--rz-bg);
          color: var(--rz-ink);
          font-family: var(--rz-body-font);
          -webkit-font-smoothing: antialiased;
          transition: background-color 0.35s ease, color 0.35s ease;
        }
        /* Content rides above any theme's fixed background layers
           (.rz-root::before/::after in themes.css sit at z-index 0). */
        .rz-root main {
          position: relative;
          z-index: 1;
        }
        .rz-root ::selection {
          background: var(--rz-ink);
          color: var(--rz-bg);
        }

        .rz-progress {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          z-index: 40;
          background: var(--rz-progress);
          transform-origin: 0 50%;
          transform: scaleX(0);
          pointer-events: none;
        }

        .rz-col {
          max-width: var(--rz-col);
          margin: 0 auto;
          padding: 0 32px;
        }
        @media (max-width: 560px) {
          .rz-col { padding: 0 20px; }
        }

        .rz-eyebrow {
          font-family: var(--rz-mono);
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--rz-muted);
        }
        .rz-shead {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          gap: 1rem;
        }
        .rz-shead-idx {
          color: var(--rz-accent);
        }
        .rz-shead-right { white-space: nowrap; }

        .rz-section {
          padding-block: clamp(72px, 10vw, 128px);
          border-top: 1px solid var(--rz-hairline);
          scroll-margin-top: 64px;
        }

        /* Zone chip: small colored square + label, the datasheet legend unit. */
        .rz-chip {
          width: 8px;
          height: 8px;
          flex-shrink: 0;
        }

        .rz-root a:focus-visible,
        .rz-root button:focus-visible,
        .rz-root [tabindex]:focus-visible {
          outline: 2px solid var(--rz-accent);
          outline-offset: 3px;
        }

        @media print {
          @page { margin: 14mm; }
          /* Print is always the paper spec-sheet: undo any active theme's
             tokens and kill its fixed background layers. */
          .rz-root,
          .rz-root[data-theme] {
            --rz-display: var(--font-display), var(--font-sans), system-ui, sans-serif !important;
            --rz-serif: var(--font-serif), Georgia, serif !important;
            --rz-mono: var(--font-mono), ui-monospace, monospace !important;
            --rz-body-font: var(--font-sans), system-ui, -apple-system, sans-serif !important;
            --rz-ink: #17181c !important;
            --rz-secondary: #4e5560 !important;
            --rz-muted: #8a8f98 !important;
            --rz-hairline: rgba(23,24,28,0.13) !important;
            --rz-hairline-strong: rgba(23,24,28,0.30) !important;
            --rz-accent: #0d9488 !important;
            --rz-card-bg: transparent !important;
            --rz-card-border: 1px solid transparent !important;
            --rz-card-shadow: none !important;
            height: auto;
            overflow: visible;
            background: #ffffff !important;
            color: #111111 !important;
          }
          .rz-root::before,
          .rz-root::after {
            display: none !important;
          }
          .rz-root * {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
          .rz-progress,
          .rz-nav,
          .rz-ticker,
          .rz-rig-section,
          .rz-hero-rig,
          .rz-constellation,
          .rz-root button,
          .chat-launcher-root {
            display: none !important;
          }
          .rz-root a {
            color: #111111 !important;
            text-decoration: underline;
          }
          .rz-section {
            padding-block: 22px !important;
            border-color: #dddddd !important;
          }
          /* Compact print typography, the screen scale wastes pages. */
          .rz-hero::before { display: none; }
          .rz-hero-grid { grid-template-columns: 1fr !important; }
          .rz-hero-h1 { font-size: 40px !important; margin-bottom: 0.8rem !important; }
          .rz-hero-line { font-size: 15px !important; }
          .rz-specbar { margin-bottom: 1.5rem !important; }
          .rz-work-title { font-size: 19px !important; }
          .rz-work-row,
          .rz-archive-row,
          .rz-exp-item,
          .rz-skills-cell { break-inside: avoid; }
          .rz-work-row { padding-block: 14px !important; }
          .rz-contact-h2 { font-size: 34px !important; margin: 0.6rem 0 !important; }
          .rz-contact-email { font-size: 18px !important; margin-bottom: 0.8rem !important; }
          .rz-footer { margin-top: 1.5rem !important; }
        }
      `}</style>
    </div>
  );
}
