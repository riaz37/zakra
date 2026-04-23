'use client';

import Image from 'next/image';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-up">
      <div className="mt-0.5 shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-75"
        />
      </div>
      <div className="flex items-center gap-1.5 py-1">
        {[0, 150, 300].map((delay) => (
          <span
            key={delay}
            className="block h-[5px] w-[5px] rounded-full bg-muted"
            style={{
              animation: 'pulse 1.2s ease-in-out infinite',
              animationDelay: `${delay}ms`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
