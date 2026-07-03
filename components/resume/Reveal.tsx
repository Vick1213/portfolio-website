'use client';

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';

interface RevealProps {
  children: ReactNode;
  delay?: number; // ms, for staggering siblings
  className?: string;
  style?: CSSProperties;
}

/**
 * Fades + lifts children into view the first time they cross the viewport
 * (IntersectionObserver, threshold 0.15, fires once). Honors
 * prefers-reduced-motion by skipping the hidden state entirely so content is
 * never invisible (global CSS in app/globals.css already zeroes animation/
 * transition durations, this just avoids the initial opacity:0 flash).
 */
export default function Reveal({ children, delay = 0, className, style }: RevealProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reducedMq.matches) {
      setReduced(true);
      setVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            observer.disconnect();
            break;
          }
        }
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        ...style,
        opacity: reduced ? (style?.opacity ?? 1) : visible ? 1 : 0,
        transform: reduced ? style?.transform : visible ? 'translateY(0)' : 'translateY(16px)',
        transition: reduced
          ? style?.transition
          : `opacity 550ms cubic-bezier(0.16,1,0.3,1) ${delay}ms, transform 550ms cubic-bezier(0.16,1,0.3,1) ${delay}ms`,
        willChange: reduced ? undefined : 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
}
