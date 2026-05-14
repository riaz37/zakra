'use client';

import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { staggerContainer, staggerItem, staggerScaleItem } from '@/lib/motion';

interface ChatWelcomeProps {
  onPrompt: (text: string) => void;
}

export function ChatWelcome({ onPrompt }: ChatWelcomeProps) {
  const t = useTranslations('dashboard.chat.welcome');
  const reduced = useReducedMotion();

  const examplePrompts = t.raw('prompts') as string[];

  return (
    <motion.div
      className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center"
      variants={staggerContainer}
      initial={reduced ? 'visible' : 'hidden'}
      animate="visible"
    >
      <motion.div
        className="mb-5 flex h-[52px] w-[52px] items-center justify-center"
        initial={reduced ? {} : { opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        <Image
          src="/marco.svg"
          alt="ESAP"
          width={48}
          height={48}
          priority
        />
      </motion.div>

      <motion.h2
        variants={staggerItem}
        className="font-sans text-heading font-normal leading-[1.25] tracking-[-0.44px] text-foreground"
      >
        {t('heading')}
      </motion.h2>
      <motion.p
        variants={staggerItem}
        className="mt-2.5 max-w-[360px] font-sans text-body leading-[1.6] text-fg-muted"
      >
        {t('subheading')}
      </motion.p>

      <motion.div
        className="mt-8 flex flex-wrap justify-center gap-2"
        variants={staggerContainer}
        initial={reduced ? 'visible' : 'hidden'}
        animate="visible"
      >
        {examplePrompts.map((prompt) => (
          <motion.button
            key={prompt}
            variants={staggerScaleItem}
            whileHover={{ y: -1, transition: { duration: 0.1 } }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onPrompt(prompt)}
            className="rounded-lg border border-border bg-surface-200 px-3.5 py-2 font-sans text-body text-fg-muted transition-colors duration-150 hover:border-border hover:bg-surface-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {prompt}
          </motion.button>
        ))}
      </motion.div>

    </motion.div>
  );
}
