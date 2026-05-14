'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { StreamingTextBlock } from '@/components/shared/streaming-text-block';
import type { PipelineStep } from '@/hooks/useChatStream';
import type { StreamingMessage } from '@/types/chat';
import { ContentBlockView } from './content-block-view';
import { PipelineSummary, type NormalizedStep } from './pipeline-step-list';
import { fadeUp, fadeIn, slideInBottom } from '@/lib/motion';

function normalizeChatSteps(steps: PipelineStep[]): NormalizedStep[] {
  return steps.map((s) => ({
    key: `${s.stepNumber}-${s.stepName}`,
    name: s.stepName,
    status: s.status,
    durationMs: s.durationMs,
  }));
}

function StreamingStatusPill({ blockCount }: { blockCount: number }) {
  const t = useTranslations('dashboard.chat.session');
  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      className="mb-1.5 flex items-center gap-1.5"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-accent/55 animate-pulse" />
      <span className="font-mono text-mono-sm text-subtle">
        {blockCount === 0 ? t('generating') : t('writing')}
      </span>
    </motion.div>
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
    <motion.div
      variants={slideInBottom}
      initial="hidden"
      animate="visible"
      className="flex gap-3"
    >
      <div className="relative mt-[3px] shrink-0">
        <Image
          src="/marco.svg"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-70"
        />
      </div>

      <div className="min-w-0 flex-1">
        {pipelineSteps.length > 0 && (
          <PipelineSummary steps={normalizeChatSteps(pipelineSteps)} />
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
              <motion.div
                key={idx}
                variants={fadeUp}
                initial="hidden"
                animate="visible"
              >
                <ContentBlockView block={block} />
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
