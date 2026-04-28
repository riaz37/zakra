'use client';

import Image from 'next/image';

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-slide-in-bottom">
      <div className="mt-0.5 shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-70"
        />
      </div>
      <div className="flex items-center gap-[5px] py-[7px]">
        {[0, 160, 320].map((delay, i) => (
          <span
            key={i}
            className="block h-[5px] w-[5px] rounded-full bg-muted/45 animate-dot-wave"
            style={{ animationDelay: `${delay}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
