'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { slideInBottom } from '@/lib/motion';

export function ThinkingIndicator() {
  return (
    <motion.div
      variants={slideInBottom}
      initial="hidden"
      animate="visible"
      className="flex items-start gap-3"
    >
      <div className="mt-0.5 shrink-0">
        <Image
          src="/logo/esaplogo.webp"
          alt="ESAP"
          width={22}
          height={22}
          className="opacity-70"
        />
      </div>
      <div className="flex items-center gap-1.5 py-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{
              y: [0, -3, 0],
              opacity: [0.4, 1, 0.4],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
            className="block h-1.5 w-1.5 rounded-full bg-muted"
          />
        ))}
      </div>
    </motion.div>
  );
}
