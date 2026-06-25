'use client';

import { useState } from 'react';
import ChatPanel from './ChatPanel';

const ACCENT = '#5eead4';

/**
 * Floating bottom-right launcher for the "Ask Saatvik" agent in the INTERACTIVE
 * phase (the in-scroll ChatSection covers the cinematic phase). Toggles a
 * popover holding the shared ChatPanel, history carries over from the scroll
 * section because both bind to the same `portfolioChat` instance.
 */
export default function ChatLauncher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed z-50" style={{ right: '1rem', bottom: '5rem' }}>
      {open && (
        <div
          className="mb-3"
          style={{ width: 'min(380px, calc(100vw - 2rem))', animation: 'chat-pop 0.2s ease-out' }}
        >
          <style>{`@keyframes chat-pop { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }`}</style>
          <ChatPanel compact onNavigate={() => setOpen(false)} />
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Ask about Saatvik'}
        aria-expanded={open}
        className="font-mono flex items-center gap-2 ml-auto"
        style={{
          marginLeft: 'auto',
          padding: '0.7rem 1.1rem',
          borderRadius: '999px',
          border: `1px solid ${ACCENT}`,
          background: open ? 'rgba(10,13,20,0.92)' : ACCENT,
          color: open ? ACCENT : '#04221d',
          fontWeight: 700,
          fontSize: '0.8rem',
          letterSpacing: '0.04em',
          boxShadow: '0 12px 34px -12px rgba(94,234,212,0.6)',
          cursor: 'pointer',
          float: 'right',
        }}
      >
        {open ? '✕ Close' : '💬 Ask about Saatvik'}
      </button>
    </div>
  );
}
