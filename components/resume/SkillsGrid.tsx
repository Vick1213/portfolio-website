'use client';

import dynamic from 'next/dynamic';

import { skillCategories } from '@/lib/portfolio';
import Reveal from './Reveal';

// Desktop-only flourish; the text columns below stay the scannable/printable truth.
const SkillConstellation = dynamic(() => import('./SkillConstellation'), { ssr: false });

export default function SkillsGrid() {
  return (
    <section id="skills" aria-labelledby="skills-heading" className="rz-section">
      <div className="rz-col">
        <div className="rz-shead">
          <span className="rz-eyebrow" id="skills-heading">
            <span className="rz-shead-idx">03</span> — Skills
          </span>
          <span className="rz-eyebrow rz-shead-right">{skillCategories.length} disciplines</span>
        </div>

        <Reveal delay={0}>
          <SkillConstellation />
        </Reveal>

        <div className="rz-skills-grid">
          {skillCategories.map((cat, i) => (
            <Reveal key={cat.name} delay={(i % 4) * 60} className="rz-skills-cell">
              <div>
                <h3 className="rz-skills-cat">{cat.name}</h3>
                <p className="rz-skills-list">
                  {cat.skills.map((skill, si) => (
                    <span key={skill.label}>
                      <span
                        className={
                          skill.level === 'advanced' ? 'rz-skill rz-skill--adv' : 'rz-skill'
                        }
                      >
                        {skill.label}
                      </span>
                      {si < cat.skills.length - 1 && (
                        <span className="rz-skill-sep" aria-hidden="true">
                          {', '}
                        </span>
                      )}
                    </span>
                  ))}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>

      <style>{`
        .rz-skills-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2.25rem 2rem;
          margin-top: 2.5rem;
        }
        @media (min-width: 900px) {
          .rz-skills-grid { grid-template-columns: repeat(4, 1fr); }
        }
        .rz-skills-cat {
          font-family: var(--rz-mono);
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--rz-muted);
          margin: 0 0 0.7rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--rz-hairline);
        }
        .rz-skills-list {
          font-size: 14px;
          line-height: 1.75;
          color: var(--rz-secondary);
          margin: 0;
        }
        .rz-skill--adv {
          color: var(--rz-ink);
          font-weight: 520;
        }
        .rz-skill-sep { color: var(--rz-muted); }
      `}</style>
    </section>
  );
}
