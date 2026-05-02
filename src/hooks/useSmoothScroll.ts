'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface UseSmoothScrollOptions {
  threshold?: number; // Distance from bottom to trigger auto-scroll
  smooth?: boolean;   // Use smooth scrolling
}

export function useSmoothScroll(
  dependency: any,
  isStreaming: boolean,
  options: UseSmoothScrollOptions = {}
) {
  const { threshold = 150, smooth = true } = options;
  const containerRef = useRef<HTMLDivElement>(null);
  const [isAtBottom, setIsAtBottom] = useState(true);

  const checkAtBottom = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const distanceToBottom = scrollHeight - scrollTop - clientHeight;
    setIsAtBottom(distanceToBottom <= threshold);
  }, [threshold]);

  const scrollToBottom = useCallback((force = false) => {
    const container = containerRef.current;
    if (!container) return;

    if (force || isAtBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: smooth ? 'smooth' : 'auto',
      });
    }
  }, [isAtBottom, smooth]);

  // Handle auto-scroll on dependency change
  useEffect(() => {
    if (isStreaming) {
      scrollToBottom();
    }
  }, [dependency, isStreaming, scrollToBottom]);

  // Initial scroll
  useEffect(() => {
    scrollToBottom(true);
  }, []);

  return {
    containerRef,
    isAtBottom,
    checkAtBottom,
    scrollToBottom: () => scrollToBottom(true),
  };
}
