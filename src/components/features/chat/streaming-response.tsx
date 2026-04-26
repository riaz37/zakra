'use client';

import Image from 'next/image';
import { StreamingTextBlock } from '@/components/shared/streaming-text-block';
import type { PipelineStep } from '@/hooks/useChatStream';
import type { StreamingMessage } from '@/types/chat';
import { ContentBlockView } from './content-block-view';
import { PipelineSummary } from './pipeline-step-list';

function StreamingStatusPill({ blockCount }: { blockCount: number }) {
  return (
    <div className="mb-1.5 flex items-center gap-1.5 animate-fade-in">
      <span className="h-1.5 w-1.5 rounded-full bg-accent/55 animate-pulse" />
      <span className="font-mono text-mono-sm text-subtle">
        {blockCount === 0 ? 'Generating…' : 'Writing…'}
      </span>
    </div>
  );
}

interface StreamingResponseProps {
  streamingMessage: StreamingMessage;
  pipelineSteps: PipelineStep[];
}

export function StreamingResponse({
  streamingMessage,
  pipelineSteps,
}: StreamingResponseProps) {
  return (
    <div className="flex gap-3 animate-slide-in-bottom">
      <div className="relative mt-[3px] shrink-0">
        {streamingMessage.isStreaming && (
          <span className="absolute inset-[-4px] rounded-full bg-accent/8 blur-[8px]" aria-hidden />
        )}
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="relative opacity-70"
        />
      </div>

      <div className="min-w-0 flex-1">
        {pipelineSteps.length > 0 && (
          <PipelineSummary steps={pipelineSteps} />
        )}

        {streamingMessage.isStreaming && streamingMessage.contentBlocks.length === 0 && (
          <StreamingStatusPill blockCount={0} />
        )}

        <div className="space-y-3">
          {streamingMessage.contentBlocks.map((block, idx) => {
            if (block.type === 'text') {
              const isLastBlock = idx === streamingMessage.contentBlocks.length - 1;
              return (
                <StreamingTextBlock
                  key={idx}
                  text={block.text ?? ''}
                  isStreaming={streamingMessage.isStreaming && isLastBlock}
                />
              );
            }
            return (
              <div key={idx} className="animate-fade-in animation-delay-100">
                <ContentBlockView block={block} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
