'use client';

import { useState } from 'react';

import { profile } from '@/lib/portfolio';
import { useTheme, type ThemeId } from '@/lib/themeStore';
import Reveal from './Reveal';

/**
 * Themed contact avatars — the real headshot restyled per theme (generated
 * from the same photo, likeness preserved). Themes without one use the real
 * photo; print always falls back to the real photo via CSS.
 */
const THEMED_AVATAR: Partial<Record<ThemeId, { src: string; sticker?: boolean }>> = {
  pixel: { src: '/images/themes/avatar-pixel-cutout.png', sticker: true },
  neo: { src: '/images/themes/avatar-neo.jpg' },
  brutal: { src: '/images/themes/avatar-brutal.jpg' },
};

/**
 * Theme-aware outro plate closing the page above the footer — a quieter,
 * horizon-shaped echo of the mid-page interlude. Spec stays lean (no entry)
 * and print hides it entirely.
 */
const OUTRO_ART: Partial<Record<ThemeId, { src: string; alt: string; caption: string }>> = {
  glass: {
    src: '/images/themes/outro-glass.jpg',
    alt: 'Row of frosted glass panes glowing teal and violet on a dark mirror floor',
    caption: 'Outro — panes at rest',
  },
  neo: {
    src: '/images/themes/outro-neo.jpg',
    alt: 'Engraved neoclassical frieze of laurel swags and acanthus scrolls on ivory paper',
    caption: 'Outro — plate IX, the frieze',
  },
  aurora: {
    src: '/images/themes/outro-aurora.jpg',
    alt: 'Aurora in teal, violet and pink mirrored in a still arctic lake',
    caption: 'Outro — still water, 66°N',
  },
  brutal: {
    src: '/images/themes/outro-brutal.jpg',
    alt: 'Raking shadow across a long raw concrete wall in black and white',
    caption: 'Outro — wall, late sun',
  },
  pixel: {
    src: '/images/themes/outro-pixel.png',
    alt: 'Pixel-art night rooftops with antennas and one glowing window',
    caption: 'Outro — one window still on',
  },
};

export default function ContactSection() {
  const year = new Date().getFullYear();
  const theme = useTheme((s) => s.theme);
  const themedAvatar = THEMED_AVATAR[theme];
  const [copied, setCopied] = useState(false);
  const outroArt = OUTRO_ART[theme];

  return (
    <section id="contact" aria-labelledby="contact-heading" className="rz-section rz-contact-section">
      <div className="rz-col">
        <div className="rz-shead">
          <span className="rz-eyebrow" id="contact-heading">
            <span className="rz-shead-idx">05</span> — Contact
          </span>
        </div>

        <Reveal delay={40}>
          <h2 className="rz-contact-h2">
            Let&rsquo;s <em>talk</em>.
          </h2>
        </Reveal>

        <Reveal delay={110}>
          <p className="rz-contact-line">
            Open to founding-engineer, chip-design, and full-stack roles — or just a conversation.
          </p>
        </Reveal>

        <Reveal delay={180}>
          <div className="rz-contact-mailrow">
            <a href={`mailto:${profile.email}`} className="rz-contact-email">
              {profile.email}
              <span aria-hidden="true"> ↗</span>
            </a>
            <button
              type="button"
              className={copied ? 'rz-contact-copy rz-contact-copy--ok' : 'rz-contact-copy'}
              aria-live="polite"
              onClick={() => {
                navigator.clipboard?.writeText(profile.email).then(() => {
                  setCopied(true);
                  window.setTimeout(() => setCopied(false), 1600);
                });
              }}
            >
              {copied ? '✓ Copied' : 'Copy'}
            </button>
          </div>
        </Reveal>

        <Reveal delay={250}>
          <div className="rz-contact-block">
            <img
              src="/images/saatvik-choudhary.jpg"
              alt="Saatvik Choudhary"
              width={60}
              height={60}
              loading="lazy"
              className={themedAvatar ? 'rz-contact-avatar rz-avatar-real--hidden' : 'rz-contact-avatar'}
            />
            {themedAvatar && (
              <img
                src={themedAvatar.src}
                alt="Saatvik Choudhary, stylized for the current theme"
                width={60}
                height={60}
                loading="lazy"
                className={
                  themedAvatar.sticker
                    ? 'rz-contact-avatar rz-avatar-themed rz-avatar-sticker'
                    : 'rz-contact-avatar rz-avatar-themed'
                }
              />
            )}
            <div className="rz-contact-links">
              <a href={profile.booking} target="_blank" rel="noreferrer" className="rz-contact-link">
                Book a 30-min chat
              </a>
              <span className="rz-contact-sep" aria-hidden="true">/</span>
              <a href={profile.linkedin} target="_blank" rel="noreferrer" className="rz-contact-link">
                LinkedIn
              </a>
              <span className="rz-contact-sep" aria-hidden="true">/</span>
              <a href={profile.github} target="_blank" rel="noreferrer" className="rz-contact-link">
                GitHub
              </a>
              <span className="rz-contact-sep" aria-hidden="true">/</span>
              <a href={profile.githubAlt} target="_blank" rel="noreferrer" className="rz-contact-link">
                GitHub (alt)
              </a>
            </div>
          </div>
        </Reveal>

        {outroArt && (
          <Reveal delay={300}>
            <figure className="rz-outro">
              <div className="rz-outro-frame">
                <img
                  src={outroArt.src}
                  alt={outroArt.alt}
                  width={1600}
                  height={689}
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <figcaption className="rz-eyebrow rz-outro-caption">{outroArt.caption}</figcaption>
            </figure>
          </Reveal>
        )}
      </div>

      <footer className="rz-footer">
        <div className="rz-col rz-footer-inner">
          <span>© {year} Saatvik Choudhary</span>
          <span>Built with Next.js, React Three Fiber &amp; a real PC</span>
        </div>
      </footer>

      <style>{`
        .rz-contact-section {
          padding-bottom: 0;
        }
        .rz-contact-h2 {
          font-family: var(--rz-display);
          font-size: clamp(3.5rem, 10vw, 7.5rem);
          font-weight: 500;
          letter-spacing: -0.03em;
          line-height: 0.95;
          color: var(--rz-ink);
          margin: 1.5rem 0 1.25rem;
        }
        .rz-contact-h2 em {
          font-family: var(--rz-serif);
          font-style: italic;
          font-size: 1.05em;
          color: var(--rz-accent);
        }
        .rz-contact-line {
          font-size: 17px;
          color: var(--rz-secondary);
          margin: 0 0 2.5rem;
          max-width: 58ch;
          line-height: 1.6;
        }
        .rz-contact-mailrow {
          display: flex;
          align-items: baseline;
          flex-wrap: wrap;
          gap: 16px;
          margin-bottom: 2.75rem;
        }
        .rz-contact-email {
          display: inline-block;
          font-family: var(--rz-display);
          font-size: clamp(20px, 3.4vw, 32px);
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--rz-ink);
          text-decoration: none;
          background-image: linear-gradient(var(--rz-accent), var(--rz-accent));
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 100% 2px;
          padding-bottom: 4px;
          transition: color 0.2s ease;
        }
        .rz-contact-email:hover { color: var(--rz-accent); }
        .rz-contact-copy {
          font-family: var(--rz-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rz-muted);
          background: transparent;
          border: 1px solid var(--rz-hairline-strong);
          border-radius: var(--rz-thumb-radius, 999px);
          padding: 6px 14px;
          cursor: pointer;
          transition: color 0.15s ease, border-color 0.15s ease;
        }
        .rz-contact-copy:hover {
          color: var(--rz-ink);
          border-color: var(--rz-ink);
        }
        .rz-contact-copy--ok {
          color: var(--rz-accent);
          border-color: var(--rz-accent);
        }

        .rz-contact-block {
          display: flex;
          align-items: center;
          gap: 1.1rem;
        }
        .rz-contact-avatar {
          width: 60px;
          height: 60px;
          border-radius: 50%;
          object-fit: cover;
          border: 1px solid var(--rz-hairline-strong);
          flex-shrink: 0;
        }
        .rz-contact-links {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          gap: 0.7rem;
          font-family: var(--rz-mono);
          font-size: 13px;
        }
        .rz-contact-link {
          color: var(--rz-ink);
          text-decoration: none;
          background-image: linear-gradient(var(--rz-accent), var(--rz-accent));
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 0% 1px;
          padding-bottom: 2px;
          transition: background-size 0.22s ease, color 0.15s ease;
        }
        .rz-contact-link:hover {
          color: var(--rz-accent);
          background-size: 100% 1px;
        }
        .rz-contact-sep { color: var(--rz-hairline-strong); }

        /* Themed avatar swap: on screen the stylized portrait replaces the
           photo; print always shows the real headshot. */
        .rz-avatar-real--hidden { display: none; }
        @media print {
          .rz-avatar-real--hidden { display: block; }
          .rz-avatar-themed { display: none !important; }
        }
        /* Sticker variant — transparent cutout floats free of the circular
           frame with a hard offset shadow. */
        .rz-avatar-sticker {
          border: none;
          border-radius: 0;
          object-fit: contain;
          transform: rotate(-5deg);
          filter: drop-shadow(2px 3px 0 rgba(0, 0, 0, 0.35));
        }

        .rz-outro {
          margin: clamp(3rem, 6vw, 5rem) 0 0;
        }
        .rz-outro-frame {
          border: var(--rz-card-border);
          border-radius: var(--rz-radius);
          box-shadow: var(--rz-card-shadow);
          overflow: hidden;
          line-height: 0;
        }
        .rz-outro-frame img {
          width: 100%;
          height: clamp(160px, 24vw, 300px);
          object-fit: cover;
          display: block;
        }
        .rz-outro-caption {
          margin-top: 10px;
          text-align: right;
        }
        @media print {
          .rz-outro { display: none !important; }
        }

        .rz-footer {
          margin-top: clamp(4rem, 8vw, 7rem);
          border-top: 1px solid var(--rz-hairline);
          padding-block: 22px 34px;
        }
        .rz-footer-inner {
          display: flex;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 0.5rem;
          font-family: var(--rz-mono);
          font-size: 11px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--rz-muted);
        }
      `}</style>
    </section>
  );
}
