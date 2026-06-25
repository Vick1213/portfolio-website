'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { useUI } from '@/lib/store';
import { profile, zones, allProjects } from '@/lib/portfolio';
import ChatPanel from '@/components/ui/chat/ChatPanel';

const ZONE_LEGEND = 'linear-gradient(90deg, #5eead4, #818cf8, #f0abfc, #fbbf24)';

// ── Reveal-on-scroll wrapper ──────────────────────────────────────────────────
// A frosted-glass card that lifts the text off the (light) studio scene and
// fades/rises in when it scrolls into view. `align` keeps the card to one side
// so the orbiting rig stays visible behind it.
function Panel({
  children,
  align = 'left',
}: {
  children: ReactNode;
  align?: 'left' | 'right' | 'center';
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setShown(true);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const justify = align === 'center' ? 'center' : align === 'right' ? 'flex-end' : 'flex-start';

  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: justify,
        padding: 'clamp(1.5rem, 6vw, 7rem)',
      }}
    >
      <div
        ref={ref}
        style={{
          maxWidth: align === 'center' ? '720px' : '520px',
          textAlign: align === 'center' ? 'center' : 'left',
          padding: 'clamp(1.4rem, 3vw, 2.4rem)',
          borderRadius: '20px',
          background: 'rgba(247,249,252,0.74)',
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          border: '1px solid rgba(10,14,22,0.08)',
          boxShadow: '0 30px 70px -30px rgba(10,14,22,0.35)',
          color: '#0a0e16',
          opacity: shown ? 1 : 0,
          transform: shown ? 'none' : 'translateY(24px)',
          transition: 'opacity 0.7s cubic-bezier(0.22,1,0.36,1), transform 0.7s cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {children}
      </div>
    </section>
  );
}

function Eyebrow({ children, color = '#0d9488' }: { children: ReactNode; color?: string }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: '0.7rem',
        fontWeight: 600,
        letterSpacing: '0.22em',
        textTransform: 'uppercase',
        color,
      }}
    >
      {children}
    </span>
  );
}

// ── Sections ──────────────────────────────────────────────────────────────────

function HeroSection() {
  return (
    <Panel align="left">
      {/* Reserved slot: drop a <PhotoSlideshow /> of Saatvik here later. */}
      <div aria-hidden style={{ height: '4px', width: '64px', borderRadius: '999px', background: ZONE_LEGEND, marginBottom: '1.2rem' }} />
      <Eyebrow>Interactive Portfolio</Eyebrow>
      <h1 style={{ fontSize: 'clamp(2.4rem, 6vw, 4rem)', fontWeight: 800, letterSpacing: '-0.03em', lineHeight: 1.02, margin: '0.6rem 0 0.8rem' }}>
        {profile.name}
      </h1>
      <p style={{ fontSize: 'clamp(1rem, 2.2vw, 1.25rem)', lineHeight: 1.55, color: 'rgba(10,14,22,0.72)', margin: 0 }}>
        {profile.headline}
      </p>
      {profile.ventures.map((v) => (
        <p key={v.name} className="font-mono" style={{ marginTop: '1rem', fontSize: '0.82rem', letterSpacing: '0.03em', color: '#0d9488', fontWeight: 600 }}>
          {v.role} · {v.name} ({v.period})
        </p>
      ))}
      <p className="font-mono" style={{ marginTop: '1.8rem', fontSize: '0.72rem', letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(10,14,22,0.5)' }}>
        Scroll to begin ↓
      </p>
    </Panel>
  );
}

function IntentSection() {
  return (
    <Panel align="right">
      <Eyebrow color="#6366f1">The concept</Eyebrow>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0.6rem 0 0.8rem' }}>
        My career, built as a PC.
      </h2>
      <p style={{ fontSize: 'clamp(0.98rem, 2vw, 1.15rem)', lineHeight: 1.6, color: 'rgba(10,14,22,0.72)', margin: 0 }}>
        Each part of the rig, the CPU, GPU, motherboard, memory, maps to an area
        of my work, from custom AI-accelerator silicon to production web, mobile,
        and data systems. Keep scrolling to power it on; at the end you can take
        the controls and explore every part yourself.
      </p>
    </Panel>
  );
}

function ZoneSection({ zoneId, align }: { zoneId: string; align: 'left' | 'right' }) {
  const zone = zones.find((z) => z.id === zoneId);
  if (!zone) return null;
  const picks = allProjects.filter((p) => p.zone === zoneId && p.featured);
  const names = (picks.length ? picks : allProjects.filter((p) => p.zone === zoneId && p.tile)).slice(0, 3);

  return (
    <Panel align={align}>
      <Eyebrow color={zone.accent}>{zone.label}</Eyebrow>
      <p style={{ fontSize: 'clamp(1.1rem, 2.4vw, 1.5rem)', lineHeight: 1.45, color: '#0a0e16', fontWeight: 600, margin: '0.6rem 0 1rem' }}>
        {zone.blurb}
      </p>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {names.map((p) => (
          <li key={p.id} style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', fontSize: '0.95rem', color: 'rgba(10,14,22,0.78)' }}>
            <span aria-hidden style={{ width: '6px', height: '6px', borderRadius: '999px', background: zone.accent, flexShrink: 0, transform: 'translateY(-2px)' }} />
            {p.name}
          </li>
        ))}
      </ul>
    </Panel>
  );
}

function ChatSection() {
  return (
    <section
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
        padding: 'clamp(1.5rem, 6vw, 5rem)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '560px' }}>
        <Eyebrow>Ask me anything</Eyebrow>
        <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0.6rem 0 0.6rem', color: '#0a0e16' }}>
          Curious about Saatvik?
        </h2>
        <p style={{ fontSize: '1rem', lineHeight: 1.55, color: 'rgba(10,14,22,0.68)', margin: 0 }}>
          A DeepSeek-powered assistant that answers questions about his projects,
          skills, and how to work with him.
        </p>
      </div>
      <div style={{ width: 'min(560px, 100%)' }}>
        <ChatPanel />
      </div>
    </section>
  );
}

function EnterSection() {
  return (
    <Panel align="center">
      <Eyebrow>The rig is live</Eyebrow>
      <h2 style={{ fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.1, margin: '0.6rem 0 0.9rem', color: '#0a0e16' }}>
        Take the controls.
      </h2>
      <p style={{ fontSize: '1.05rem', lineHeight: 1.55, color: 'rgba(10,14,22,0.7)', margin: '0 auto 1.8rem', maxWidth: '440px' }}>
        Orbit the build, click any part to dive into the projects inside, or run
        the guided tour.
      </p>
      <button
        type="button"
        onClick={() => useUI.getState().enterInteractive()}
        className="font-mono"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: 700,
          letterSpacing: '0.04em',
          color: '#04221d',
          background: 'linear-gradient(135deg, #5eead4 0%, #34d399 100%)',
          border: 'none',
          borderRadius: '12px',
          padding: '0.95rem 1.6rem',
          cursor: 'pointer',
          boxShadow: '0 14px 34px -12px rgba(94,234,212,0.6)',
        }}
      >
        ▸ ENTER THE RIG
      </button>
    </Panel>
  );
}

/** The full ordered scroll narrative. */
export default function ScrollSections() {
  return (
    <>
      <HeroSection />
      <IntentSection />
      <ZoneSection zoneId="silicon" align="left" />
      <ZoneSection zoneId="web" align="right" />
      <ZoneSection zoneId="client" align="left" />
      <ZoneSection zoneId="ml" align="right" />
      <ChatSection />
      <EnterSection />
    </>
  );
}
