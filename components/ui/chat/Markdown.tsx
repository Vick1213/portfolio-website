'use client';

import { type ReactNode } from 'react';
import { useUI } from '@/lib/store';

const ACCENT = '#5eead4';

/**
 * Tiny, dependency-free markdown renderer for the "Ask Saatvik" replies.
 * Handles just what the model emits: paragraphs, bullet lists, **bold**,
 * *italic*, `code`, and links. Links are rendered as aesthetic chips; a link
 * with the custom `project:<id>` scheme becomes a clickable pill that deep-links
 * into the 3D rig and opens that project's card (same as clicking it on the PC).
 *
 * `onNavigate` lets the floating launcher close its popover once a project chip
 * fires, so the rig isn't hidden behind the chat.
 */
export default function Markdown({ text, onNavigate }: { text: string; onNavigate?: () => void }) {
  const blocks = toBlocks(text);
  return (
    <div className="chat-md">
      <style>{`
        .chat-md { display: flex; flex-direction: column; gap: 0.55rem; }
        .chat-md p { margin: 0; }
        .chat-md ul { margin: 0; padding: 0; list-style: none; display: flex; flex-direction: column; gap: 0.3rem; }
        .chat-md li { position: relative; padding-left: 1.05rem; }
        .chat-md li::before { content: ''; position: absolute; left: 0.15rem; top: 0.62em; width: 5px; height: 5px; border-radius: 999px; background: ${ACCENT}; box-shadow: 0 0 6px ${ACCENT}aa; }
        .chat-md strong { font-weight: 700; color: #fff; }
        .chat-md em { font-style: italic; color: rgba(230,235,244,0.92); }
        .chat-md code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 0.82em; padding: 0.08em 0.36em; border-radius: 5px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.1); color: ${ACCENT}; }
        .chat-md a.md-link, .chat-md button.md-proj {
          display: inline-flex; align-items: center; gap: 0.32em;
          padding: 0.12em 0.55em; margin: 0.05em 0;
          border-radius: 8px; font-size: 0.86em; font-weight: 600;
          line-height: 1.35; text-decoration: none; vertical-align: baseline;
          transition: background 0.16s ease, border-color 0.16s ease, transform 0.1s ease;
        }
        .chat-md a.md-link {
          color: ${ACCENT};
          background: ${ACCENT}14; border: 1px solid ${ACCENT}3d;
        }
        .chat-md a.md-link:hover { background: ${ACCENT}26; border-color: ${ACCENT}80; }
        .chat-md button.md-proj {
          cursor: pointer; color: #04221d;
          background: ${ACCENT}; border: 1px solid ${ACCENT};
          box-shadow: 0 4px 14px -6px ${ACCENT}cc;
        }
        .chat-md button.md-proj:hover { transform: translateY(-1px); background: #7ff1de; }
        .chat-md button.md-proj:active { transform: translateY(0); }
      `}</style>
      {blocks.map((b, i) =>
        b.type === 'ul' ? (
          <ul key={i}>
            {b.items.map((item, j) => (
              <li key={j}>{renderInline(item, onNavigate)}</li>
            ))}
          </ul>
        ) : (
          <p key={i}>{renderInline(b.text, onNavigate)}</p>
        ),
      )}
    </div>
  );
}

type Block = { type: 'p'; text: string } | { type: 'ul'; items: string[] };

function toBlocks(src: string): Block[] {
  const lines = src.replace(/\r\n/g, '\n').split('\n');
  const blocks: Block[] = [];
  let para: string[] = [];
  let list: string[] | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ type: 'p', text: para.join(' ').trim() });
      para = [];
    }
  };
  const flushList = () => {
    if (list && list.length) blocks.push({ type: 'ul', items: list });
    list = null;
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    const bullet = line.match(/^\s*[-*•]\s+(.*)$/);
    if (bullet) {
      flushPara();
      (list ??= []).push(bullet[1]);
      continue;
    }
    if (line.trim() === '') {
      flushPara();
      flushList();
      continue;
    }
    flushList();
    para.push(line.trim());
  }
  flushPara();
  flushList();
  return blocks;
}

// Inline scanner: links first (so their inner text isn't double-parsed), then
// bold / italic / code. Each match becomes a React node; everything else stays
// plain text.
function renderInline(text: string, onNavigate?: () => void): ReactNode[] {
  const out: ReactNode[] = [];
  let rest = text;
  let key = 0;

  // [label](url)  |  **bold**  |  *italic* or _italic_  |  `code`
  const pattern = /\[([^\]]+)\]\(([^)]+)\)|\*\*([^*]+)\*\*|(?<![\w*])[*_]([^*_\n]+)[*_](?![\w*])|`([^`]+)`/;

  while (rest.length) {
    const m = rest.match(pattern);
    if (!m || m.index === undefined) {
      out.push(rest);
      break;
    }
    if (m.index > 0) out.push(rest.slice(0, m.index));

    if (m[1] !== undefined) {
      out.push(renderLink(m[1], m[2], key++, onNavigate));
    } else if (m[3] !== undefined) {
      out.push(<strong key={key++}>{m[3]}</strong>);
    } else if (m[4] !== undefined) {
      out.push(<em key={key++}>{m[4]}</em>);
    } else if (m[5] !== undefined) {
      out.push(<code key={key++}>{m[5]}</code>);
    }
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

function renderLink(label: string, url: string, key: number, onNavigate?: () => void): ReactNode {
  const proj = url.match(/^project:(.+)$/);
  if (proj) {
    const id = proj[1].trim();
    return (
      <button
        key={key}
        type="button"
        className="md-proj"
        onClick={() => {
          const ok = useUI.getState().openProjectById(id);
          if (ok) onNavigate?.();
        }}
      >
        {label} <span aria-hidden>↗</span>
      </button>
    );
  }
  return (
    <a key={key} href={url} target="_blank" rel="noopener noreferrer" className="md-link">
      {label} <span aria-hidden style={{ opacity: 0.7 }}>↗</span>
    </a>
  );
}
