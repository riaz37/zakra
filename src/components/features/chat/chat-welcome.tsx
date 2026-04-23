'use client';

import Image from 'next/image';

const EXAMPLE_PROMPTS = [
  'Show me sales by region this month',
  'Which users signed up in the last 7 days?',
  'Top 5 products by revenue',
  'Monthly trend for approved operations',
];

interface ChatWelcomeProps {
  onPrompt: (text: string) => void;
}

export function ChatWelcome({ onPrompt }: ChatWelcomeProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center animate-fade-up">
      <div className="mb-5 flex h-[52px] w-[52px] items-center justify-center">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={48}
          height={48}
          priority
        />
      </div>

      <h2 className="font-sans text-[22px] font-normal leading-[1.25] tracking-[-0.44px] text-foreground">
        Ask anything about your data
      </h2>
      <p className="mt-2.5 max-w-[360px] font-sans text-[13px] leading-[1.6] text-muted">
        Query your connected database in plain language — operations, trends,
        users, anything.
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {EXAMPLE_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onPrompt(prompt)}
            className="rounded-lg border border-border bg-surface-200 px-3.5 py-2 font-sans text-[13px] text-muted transition-colors duration-150 hover:border-border hover:bg-surface-300 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
          >
            {prompt}
          </button>
        ))}
      </div>
    </div>
  );
}
