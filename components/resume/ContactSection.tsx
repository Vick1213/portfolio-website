'use client';

import { profile } from '@/lib/portfolio';
import Reveal from './Reveal';

export default function ContactSection() {
  const year = new Date().getFullYear();

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
          <a href={`mailto:${profile.email}`} className="rz-contact-email">
            {profile.email}
            <span aria-hidden="true"> ↗</span>
          </a>
        </Reveal>

        <Reveal delay={250}>
          <div className="rz-contact-block">
            <img
              src="/images/saatvik-choudhary.jpg"
              alt="Saatvik Choudhary"
              width={60}
              height={60}
              loading="lazy"
              className="rz-contact-avatar"
            />
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
          margin-bottom: 2.75rem;
        }
        .rz-contact-email:hover { color: var(--rz-accent); }

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
