'use client';

import { profile, resumeProjects } from '@/lib/portfolio';
import Reveal from './Reveal';

export default function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-heading" className="rz-section">
      <div className="rz-col">
        <div className="rz-shead">
          <span className="rz-eyebrow" id="experience-heading">
            <span className="rz-shead-idx">02</span> — Experience &amp; about
          </span>
        </div>

        <div className="rz-exp-grid">
          <Reveal delay={0} className="rz-exp-left">
            <div>
              {profile.ventures.map((v) => (
                <div key={v.name} className="rz-exp-item">
                  <p className="rz-exp-role">
                    {v.role} —{' '}
                    {v.url ? (
                      <a href={v.url} target="_blank" rel="noreferrer" className="rz-exp-org">
                        {v.name}
                      </a>
                    ) : (
                      v.name
                    )}
                  </p>
                  <p className="rz-exp-dates">{v.period}</p>
                  <p className="rz-exp-desc">{v.blurb}</p>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={80} className="rz-exp-right">
            <div>
              <p className="rz-about-p">
                I design AI-inference silicon from scratch, most recently a two-tapeout accelerator
                program (AiToChip) spanning a 720&nbsp;mm² datacenter chip and a compact edge chip,
                full RTL through synthesis, with a Python codegen layer that compiles a chip spec into
                configurable Verilog. Alongside the hardware, I ship production web platforms end to
                end: multi-tenant marketplaces, AI productivity SaaS, and the internal tools that run
                my own advisory firm.
              </p>
              <p className="rz-about-p">
                My work spans two GitHub accounts active since 2022, {resumeProjects.length} shipped
                projects across chip design, full-stack web, mobile, and applied ML, plus a hackathon
                grading tool that earned an external fork. I move comfortably across languages and
                stacks rather than staying in one lane.
              </p>
              <p className="rz-about-meta">
                {profile.languages.length} programming languages · {resumeProjects.length} shipped projects
                · 2 GitHub accounts
              </p>
            </div>
          </Reveal>
        </div>
      </div>

      <style>{`
        .rz-exp-grid {
          display: grid;
          grid-template-columns: 5fr 7fr;
          gap: clamp(2rem, 5vw, 4rem);
          margin-top: 2.5rem;
        }
        .rz-exp-item + .rz-exp-item {
          margin-top: 1.75rem;
        }
        .rz-exp-role {
          font-family: var(--rz-display);
          font-size: 20px;
          font-weight: 500;
          letter-spacing: -0.01em;
          color: var(--rz-ink);
          margin: 0 0 0.3rem;
        }
        .rz-exp-org {
          color: var(--rz-ink);
          text-decoration: none;
          background-image: linear-gradient(var(--rz-accent), var(--rz-accent));
          background-repeat: no-repeat;
          background-position: 0 100%;
          background-size: 100% 1px;
          padding-bottom: 2px;
          transition: color 0.15s ease;
        }
        .rz-exp-org:hover { color: var(--rz-accent); }
        .rz-exp-dates {
          font-family: var(--rz-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rz-muted);
          margin: 0 0 0.7rem;
        }
        .rz-exp-desc {
          font-size: 15px;
          color: var(--rz-secondary);
          line-height: 1.65;
          margin: 0;
          max-width: 44ch;
        }
        .rz-about-p {
          font-size: 16.5px;
          color: var(--rz-secondary);
          line-height: 1.7;
          margin: 0 0 1.1rem;
        }
        .rz-about-meta {
          font-family: var(--rz-mono);
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--rz-muted);
          margin: 1.4rem 0 0;
        }
        @media (max-width: 760px) {
          .rz-exp-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
        }
      `}</style>
    </section>
  );
}
