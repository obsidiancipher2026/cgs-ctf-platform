'use client';

import { useEffect, useRef, useCallback } from 'react';

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
}

export default function GlitchText({ text, className = '', as: Tag = 'h1' }: GlitchTextProps) {
  const ref = useRef<HTMLHeadingElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const glitch = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    if (intervalRef.current) clearInterval(intervalRef.current);

    const chars = '!<>-_\\/[]{}—=+*^?#________';
    let iterations = 0;
    const original = text;

    intervalRef.current = setInterval(() => {
      el!.textContent = original
        .split('')
        .map((char, idx) => {
          if (idx < iterations) return original[idx];
          if (char === ' ') return ' ';
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join('');

      iterations += 1 / 3;
      if (iterations >= original.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }, 30);
  }, [text]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.addEventListener('mouseenter', glitch);
    return () => {
      el.removeEventListener('mouseenter', glitch);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [glitch]);

  return (
    <Tag ref={ref} className={className}>
      {text}
    </Tag>
  );
}
