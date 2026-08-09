'use client';

import { useEffect, useRef, useState } from 'react';

import { profile } from '@/lib/portfolio';
import { useUI } from '@/lib/store';
import { useResponsive } from '@/lib/useResponsive';
import { resumeLenis } from './lenisRef';
import ThemeSlider from './ThemeSlider';

const ANCHORS = [
  { href: '#work', label: 'Work' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
  { href: '#archive', label: 'Archive' },
  { href: '#contact', label: 'Contact' },
];

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.1.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.68-1.28-1.68-1.04-.72.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.03 1.75 2.7 1.25 3.36.96.1-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.7 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.9 10.9 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.7 5.41-5.27 5.69.42.36.78 1.07.78 2.17 0 1.56-.01 2.82-.01 3.2 0 .32.21.68.8.56A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5Z" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.45 20.45h-3.55v-5.57c0-1.33-.02-3.03-1.85-3.03-1.85 0-2.14 1.44-2.14 2.94v5.66H9.36V9h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.59 0 4.25 2.36 4.25 5.44v6.3ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM7.12 20.45H3.56V9h3.56v11.45Z" />
    </svg>
  );
}

function scrollToSelector(selector: string) {
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!el) return;
  if (resumeLenis.current) {
    resumeLenis.current.scrollTo(el, { offset: -64 });
  } else {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

export default function ResumeNav() {
  const setView = useUI((s) => s.setView);
  const { webgl } = useResponsive();
  const navRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState('');

  // Wayfinding: highlight the nav link whose section currently sits under the
  // reading band. Root is the .rz-root scroll container (not the viewport).
  useEffect(() => {
    const root = (navRef.current?.closest('.rz-root') as HTMLElement | null) ?? null;
    const targets = ANCHORS.map((a) => document.querySelector<HTMLElement>(a.href)).filter(
      (el): el is HTMLElement => el !== null
    );
    if (targets.length === 0) return;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(`#${e.target.id}`);
        }
      },
      { root, rootMargin: '-15% 0px -75% 0px' }
    );
    targets.forEach((t) => obs.observe(t));
    return () => obs.disconnect();
  }, []);

  return (
    <nav className="rz-nav" aria-label="Résumé navigation" ref={navRef}>
      <div className="rz-nav-inner">
        <a
          href="#top"
          className="rz-nav-name"
          onClick={(e) => {
            e.preventDefault();
            if (resumeLenis.current) {
              resumeLenis.current.scrollTo(0);
            } else {
              document.querySelector('.rz-root')?.scrollTo({ top: 0, behavior: 'smooth' });
            }
          }}
        >
          Saatvik Choudhary
        </a>

        <div className="rz-nav-right">
          <ThemeSlider />
          <div className="rz-nav-links">
            {ANCHORS.map((a) => (
              <a
                key={a.href}
                href={a.href}
                className={a.href === active ? 'rz-nav-link rz-nav-link--on' : 'rz-nav-link'}
                aria-current={a.href === active ? 'true' : undefined}
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSelector(a.href);
                }}
              >
                {a.label}
              </a>
            ))}
          </div>

          <div className="rz-nav-icons">
            <a href={profile.github} target="_blank" rel="noreferrer" className="rz-nav-icon" aria-label="GitHub">
              <GitHubIcon />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" className="rz-nav-icon" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
          </div>

          {webgl && (
            <button
              type="button"
              className="rz-nav-3d"
              onClick={() => setView('3d')}
              aria-label="Explore the 3D build"
            >
              <span className="rz-nav-3d-full">Explore the 3D build&nbsp;↗</span>
              <span className="rz-nav-3d-short">3D build&nbsp;↗</span>
            </button>
          )}
        </div>
      </div>

      <style>{`
        .rz-nav {
          position: sticky;
          top: 0;
          z-index: 30;
          height: 60px;
          display: flex;
          align-items: center;
          background: var(--rz-nav-bg);
          backdrop-filter: var(--rz-nav-blur, blur(12px) saturate(1.4));
          -webkit-backdrop-filter: var(--rz-nav-blur, blur(12px) saturate(1.4));
          border-bottom: var(--rz-nav-border, 1px solid var(--rz-hairline));
          transition: background 0.25s ease, border-bottom-color 0.25s ease;
        }
        /* Scroll edge effect: the nav sits flush with the hero at rest; its
           material (tint + hairline) only appears once content actually
           scrolls beneath it (.rz-scrolled is toggled by ResumeView). */
        .rz-root:not(.rz-scrolled) .rz-nav {
          background: transparent;
          backdrop-filter: none;
          -webkit-backdrop-filter: none;
          border-bottom-color: transparent;
        }
        .rz-nav-inner {
          width: 100%;
          max-width: var(--rz-col);
          margin: 0 auto;
          padding: 0 32px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
        }
        .rz-nav-name {
          font-family: var(--rz-mono);
          font-size: 12.5px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--rz-ink);
          text-decoration: none;
          white-space: nowrap;
        }
        .rz-nav-right {
          display: flex;
          align-items: center;
          gap: 1.6rem;
        }
        .rz-nav-links {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 1.4rem;
          /* Reserve the widest (default-font) width so the Pixel Art theme's
             narrower VT323 labels don't shrink this block and shove the whole
             right cluster — theme slider included — sideways. */
          min-width: 363px;
        }
        .rz-nav-link {
          font-family: var(--rz-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rz-muted);
          text-decoration: none;
          padding-bottom: 3px;
          background-image: linear-gradient(var(--rz-accent), var(--rz-accent));
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 2px;
          transition: color 0.15s ease, background-size 0.2s ease;
        }
        .rz-nav-link:hover { color: var(--rz-ink); }
        .rz-nav-link--on {
          color: var(--rz-ink);
          background-size: 100% 2px;
        }
        .rz-nav-icons {
          display: flex;
          align-items: center;
          gap: 0.9rem;
        }
        .rz-nav-icon {
          display: inline-flex;
          color: var(--rz-secondary);
          transition: color 0.15s ease, transform 0.15s ease;
        }
        .rz-nav-icon:hover {
          color: var(--rz-ink);
          transform: translateY(-1px);
        }
        .rz-nav-icon:active {
          transform: translateY(0) scale(0.92);
        }
        .rz-nav-3d {
          font-family: var(--rz-mono);
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: var(--rz-bg);
          background: var(--rz-ink);
          border: 1px solid var(--rz-ink);
          border-radius: 999px;
          padding: 8px 16px;
          /* Same reasoning as .rz-nav-links: hold a stable width across themes
             so the pixel font doesn't shrink the button and shift the cluster. */
          min-width: 204px;
          cursor: pointer;
          white-space: nowrap;
          transition: background 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
        }
        .rz-nav-3d:hover {
          background: var(--rz-accent);
          border-color: var(--rz-accent);
          transform: translateY(-1px);
        }
        .rz-nav-3d:active {
          transform: translateY(0) scale(0.98);
        }
        .rz-nav-3d-short { display: none; }
        @media (max-width: 900px) {
          .rz-nav-links { display: none; }
        }
        @media (max-width: 720px) {
          .rz-nav-inner { padding: 0 20px; gap: 0.5rem; }
          .rz-nav-right { gap: 0.8rem; }
          .rz-nav-icons { gap: 0.6rem; }
          .rz-nav-3d { padding: 7px 12px; min-width: 0; }
          .rz-nav-3d-full { display: none; }
          .rz-nav-3d-short { display: inline; }
        }
      `}</style>
    </nav>
  );
}
