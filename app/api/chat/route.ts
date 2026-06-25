import { streamText, convertToModelMessages, type UIMessage } from 'ai';
import { deepseek } from '@ai-sdk/deepseek';

import { SYSTEM_PROMPT } from '@/lib/assistant-context';

// The DeepSeek-backed "Ask Saatvik" agent. Scope is locked to Saatvik + his work
// by SYSTEM_PROMPT; this handler adds input caps + a best-effort per-IP rate
// limit so a public endpoint can't be cheaply abused. `deepseek` reads
// DEEPSEEK_API_KEY from the environment automatically.

export const runtime = 'nodejs';

const MAX_MESSAGES = 24; // cap conversation length sent upstream
const MAX_CHARS_PER_MESSAGE = 4000; // cap a single user turn

// Best-effort fixed-window rate limit. Per-instance only on serverless (state
// isn't shared across Fluid Compute instances), fine for a portfolio. Swap for
// Upstash Redis if stronger guarantees are ever needed.
const RATE_LIMIT = 20; // requests
const RATE_WINDOW_MS = 60_000; // per minute
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now > rec.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + RATE_WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > RATE_LIMIT;
}

function messageText(m: UIMessage): string {
  return (m.parts ?? [])
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text')
    .map((p) => p.text)
    .join('');
}

export async function POST(req: Request) {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';
  if (rateLimited(ip)) {
    return Response.json({ error: 'Too many requests. Please slow down.' }, { status: 429 });
  }

  let messages: UIMessage[];
  try {
    const body = await req.json();
    messages = body?.messages;
  } catch {
    return Response.json({ error: 'Invalid JSON body.' }, { status: 400 });
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return Response.json({ error: 'Expected a non-empty "messages" array.' }, { status: 400 });
  }
  if (messages.length > MAX_MESSAGES) {
    return Response.json({ error: 'Conversation too long.' }, { status: 400 });
  }
  if (messages.some((m) => messageText(m).length > MAX_CHARS_PER_MESSAGE)) {
    return Response.json({ error: 'Message too long.' }, { status: 400 });
  }

  const result = streamText({
    model: deepseek('deepseek-chat'),
    system: SYSTEM_PROMPT,
    messages: await convertToModelMessages(messages),
    temperature: 0.3,
    maxOutputTokens: 700,
  });

  return result.toUIMessageStreamResponse();
}
