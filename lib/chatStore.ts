import { Chat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';

/**
 * A SINGLE shared chat instance. Both the in-scroll `ChatSection` and the
 * floating `ChatLauncher` bind to it via `useChat({ chat: portfolioChat })`, so
 * the conversation + history are the same across the cinematic→interactive
 * hand-off. Only ever imported by client (`'use client'`) components rendered
 * with `ssr: false`, so constructing it at module scope is safe.
 */
export const portfolioChat = new Chat({
  transport: new DefaultChatTransport({ api: '/api/chat' }),
});
