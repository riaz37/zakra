'use client';

import Image from 'next/image';
import { StreamingTextBlock } from '@/components/shared/streaming-text-block';
import type { PipelineStep } from '@/hooks/useChatStream';
import type { StreamingMessage } from '@/types/chat';
import { ContentBlockView } from './content-block-view';
import { PipelineSummary } from './pipeline-step-list';

interface StreamingResponseProps {
  streamingMessage: StreamingMessage;
  pipelineSteps: PipelineStep[];
}

export function StreamingResponse({
  streamingMessage,
  pipelineSteps,
}: StreamingResponseProps) {
  return (
    <div className="flex gap-3 animate-fade-up">
      <div className="mt-0.5 shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-75"
        />
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        {pipelineSteps.length > 0 && <PipelineSummary steps={pipelineSteps} />}
        {streamingMessage.contentBlocks.map((block, idx) => {
          if (block.type === 'text') {
            const isLastBlock =
              idx === streamingMessage.contentBlocks.length - 1;
            return (
              <StreamingTextBlock
                key={idx}
                text={block.text ?? ''}
                isStreaming={streamingMessage.isStreaming && isLastBlock}
              />
            );
          }
          return <ContentBlockView key={idx} block={block} />;
        })}
      </div>
    </div>
  );
}
