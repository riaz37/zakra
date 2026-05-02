'use client';

import Image from 'next/image';
import { BarChart2 } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, staggerScaleItem } from '@/lib/motion';

const REPORT_PROMPTS = [
  'Generate a Q1 sales performance report',
  'Create a monthly user growth report',
  'Summarize top revenue drivers this quarter',
  'Build a retention and churn analysis report',
];

export function ReportWelcome({ onPrompt }: { onPrompt: (text: string) => void }) {
  const reduced = useReducedMotion();

  return (
    <motion.div
      className="flex flex-col items-center justify-center px-6 py-16 text-center"
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
    >
      <motion.div
        className="mb-5 flex h-[52px] w-[52px] items-center justify-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image src="/logo/esaplogo.webp" alt="ESAP" width={48} height={48} priority />
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="font-sans text-display font-normal leading-[1.25] tracking-[-0.01em] text-foreground"
      >
        Generate a report with AI
      </motion.h2>
      <motion.p
        variants={staggerItem}
        className="mt-2.5 max-w-[360px] font-sans text-button leading-[1.6] text-muted"
      >
        Describe what you want to know. The AI picks the right template, runs the
        queries, and builds the report — delivered right here.
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2"
        variants={staggerContainer}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        {REPORT_PROMPTS.map((prompt) => (
          <motion.button
            key={prompt}
            variants={staggerScaleItem}
            whileHover={{ y: -1, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPrompt(prompt)}
            className="flex items-center gap-2 rounded-lg border border-border bg-surface-200 px-3.5 py-2 font-sans text-button text-muted transition-colors duration-150 hover:border-border hover:bg-surface-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            <BarChart2 className="h-3.5 w-3.5 shrink-0 text-muted" strokeWidth={1.5} />
            {prompt}
          </motion.button>
        ))}
      </motion.div>
    </motion.div>
  );
}
