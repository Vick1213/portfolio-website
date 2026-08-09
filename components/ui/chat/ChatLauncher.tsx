'use client';

import { useState } from 'react';
import { usePresence } from '@/lib/usePresence';
import ChatPanel from './ChatPanel';

const ACCENT = '#5eead4';
const EXIT_MS = 180;

/**
 * Floating bottom-right launcher for the "Ask Saatvik" agent in the INTERACTIVE
 * phase (the in-scroll ChatSection covers the cinematic phase). Toggles a
 * popover holding the shared ChatPanel, history carries over from the scroll
 * section because both bind to the same `portfolioChat` instance.
 */
export default function ChatLauncher() {
  const [open, setOpen] = useState(false);
  const { mounted, closing } = usePresence(open, EXIT_MS);

  return (
    <div className="chat-launcher-root fixed z-50" style={{ right: '1rem', bottom: '5rem' }}>
      {mounted && (
        <div
          className="mb-3"
          style={{
            width: 'min(380px, calc(100vw - 2rem))',
            // The popover materializes from its launcher button, so it scales
            // around the bottom-right corner and leaves back the same way.
            transformOrigin: '100% 100%',
            animation: closing
              ? `chat-pop-out ${EXIT_MS}ms cubic-bezier(0.64, 0, 0.78, 0) both`
              : 'chat-pop 0.22s cubic-bezier(0.22, 1, 0.36, 1) both',
          }}
        >
          <style>{`
            @keyframes chat-pop {
              from { opacity: 0; transform: translateY(10px) scale(0.97); }
            }
            @keyframes chat-pop-out {
              to { opacity: 0; transform: translateY(10px) scale(0.97); }
            }
          `}</style>
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
          transition: 'background 0.18s ease, color 0.18s ease',
        }}
      >
        {open ? '✕ Close' : '💬 Ask about Saatvik'}
      </button>
    </div>
  );
}
