'use client';

import Image from 'next/image';
import type { ChatMessage } from '@/types/chat';
import { MarkdownContent } from './markdown-content';

export function UserMessage({ content }: { content: string }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[75%] rounded-2xl border border-border bg-surface-300 px-4 py-2.5">
        <p className="font-sans text-button leading-[1.65] text-foreground">
          {content}
        </p>
      </div>
    </div>
  );
}

export function AssistantMessage({ content }: { content: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-0.5 shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-75"
        />
      </div>
      <div className="min-w-0 flex-1">
        <MarkdownContent>{content}</MarkdownContent>
      </div>
    </div>
  );
}

export function ChatMessageView({ message }: { message: ChatMessage }) {
  if (message.role === 'user') return <UserMessage content={message.content} />;
  return <AssistantMessage content={message.content} />;
}
