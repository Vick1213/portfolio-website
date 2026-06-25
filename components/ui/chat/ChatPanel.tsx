'use client';

import { useEffect, useRef, useState } from 'react';
import { useChat } from '@ai-sdk/react';
import { portfolioChat } from '@/lib/chatStore';

const ACCENT = '#5eead4';

const SUGGESTIONS = [
  'Tell me about AiToChip',
  'What are his strongest projects?',
  "What's his hardware experience?",
  'How do I contact him?',
];

function textOf(message: { parts: { type: string; text?: string }[] }): string {
  return message.parts
    .filter((p) => p.type === 'text')
    .map((p) => p.text ?? '')
    .join('');
}

/**
 * The shared "Ask Saatvik" chat UI. Bound to the single `portfolioChat`
 * instance, so the in-scroll section and the floating launcher share history.
 * `compact` tightens it for the floating popover.
 */
export default function ChatPanel({ compact = false }: { compact?: boolean }) {
  const { messages, sendMessage, status, error } = useChat({ chat: portfolioChat });
  const [input, setInput] = useState('');
  const busy = status === 'submitted' || status === 'streaming';

  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, status]);

  const submit = (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    sendMessage({ text: t });
    setInput('');
  };

  return (
    <div
      className="flex flex-col w-full overflow-hidden font-sans"
      style={{
        height: compact ? '60vh' : 'min(560px, 70vh)',
        maxHeight: compact ? '520px' : '620px',
        borderRadius: '16px',
        background: 'linear-gradient(180deg, rgba(13,17,26,0.96) 0%, rgba(10,13,20,0.97) 100%)',
        border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 30px 80px -24px rgba(0,0,0,0.7)',
        color: '#e6ebf4',
      }}
    >
      <div aria-hidden style={{ height: '3px', background: 'linear-gradient(90deg, #5eead4, #818cf8, #f0abfc, #fbbf24)' }} />

      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <span className="inline-block rounded-full" style={{ width: 7, height: 7, background: ACCENT, boxShadow: `0 0 8px ${ACCENT}` }} />
        <span className="font-mono" style={{ fontSize: '0.72rem', letterSpacing: '0.18em', textTransform: 'uppercase', color: ACCENT }}>
          Ask Saatvik
        </span>
        <span className="ml-auto font-mono" style={{ fontSize: '0.6rem', letterSpacing: '0.1em', color: 'rgba(230,235,244,0.4)' }}>
          DeepSeek · about Saatvik only
        </span>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <div className="m-auto text-center" style={{ maxWidth: 320 }}>
            <p style={{ fontSize: '0.95rem', lineHeight: 1.5, color: 'rgba(230,235,244,0.85)' }}>
              Ask me anything about Saatvik, his projects, skills, or how to work with him.
            </p>
            <div className="flex flex-wrap justify-center gap-2 mt-4">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => submit(s)}
                  className="font-mono transition-colors"
                  style={{
                    fontSize: '0.68rem',
                    padding: '0.4rem 0.7rem',
                    borderRadius: '999px',
                    border: `1px solid ${ACCENT}40`,
                    color: ACCENT,
                    background: `${ACCENT}12`,
                    cursor: 'pointer',
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => {
          const isUser = m.role === 'user';
          return (
            <div key={m.id} className="flex" style={{ justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
              <div
                style={{
                  maxWidth: '85%',
                  padding: '0.6rem 0.85rem',
                  borderRadius: isUser ? '14px 14px 4px 14px' : '14px 14px 14px 4px',
                  fontSize: '0.9rem',
                  lineHeight: 1.55,
                  whiteSpace: 'pre-wrap',
                  background: isUser ? `${ACCENT}1f` : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isUser ? `${ACCENT}33` : 'rgba(255,255,255,0.08)'}`,
                  color: '#e6ebf4',
                }}
              >
                {textOf(m) || (busy ? '…' : '')}
              </div>
            </div>
          );
        })}

        {status === 'submitted' && (
          <div className="flex" style={{ justifyContent: 'flex-start' }}>
            <div style={{ padding: '0.6rem 0.85rem', borderRadius: '14px', background: 'rgba(255,255,255,0.05)', fontSize: '0.9rem', color: 'rgba(230,235,244,0.6)' }}>
              thinking…
            </div>
          </div>
        )}

        {error && (
          <p className="font-mono" style={{ fontSize: '0.72rem', color: '#fca5a5' }}>
            Something went wrong. Please try again.
          </p>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit(input);
        }}
        className="flex items-center gap-2 px-3 py-3"
        style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.currentTarget.value)}
          placeholder="Ask about Saatvik…"
          maxLength={2000}
          className="flex-1 font-sans"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '10px',
            padding: '0.6rem 0.8rem',
            fontSize: '0.9rem',
            color: '#e6ebf4',
            outline: 'none',
          }}
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          aria-label="Send"
          className="font-mono transition-opacity"
          style={{
            flexShrink: 0,
            padding: '0.6rem 0.9rem',
            borderRadius: '10px',
            border: 'none',
            background: ACCENT,
            color: '#04221d',
            fontWeight: 700,
            fontSize: '0.8rem',
            cursor: busy || !input.trim() ? 'default' : 'pointer',
            opacity: busy || !input.trim() ? 0.5 : 1,
          }}
        >
          ↑
        </button>
      </form>
    </div>
  );
}
