"use client";

/**
 * Reveal — wrap any block of JSX and it will fade-up into view when it
 * scrolls into the viewport. Fires exactly once (the observer unobserves
 * after the first intersection), so re-scrolling past it doesn't replay.
 *
 * Matches the "alfredo.pt" pattern: subtle, short, staggered delays between
 * adjacent reveals make a page feel alive without being distracting.
 *
 * Usage:
 *   <Reveal>                 — default 700ms fade-up
 *   <Reveal delay={120}>     — stagger children by N ms
 *   <Reveal y={40}>          — distance to travel (default 24px)
 *   <Reveal as="section">    — render tag (default div)
 */

import { useEffect, useRef, useState, type ElementType, type ReactNode } from "react";

interface RevealProps {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  className?: string;
  as?: ElementType;
  /** Rootmargin for IntersectionObserver — lets things trigger slightly
      before they actually reach the viewport. */
  rootMargin?: string;
}

export function Reveal({
  children,
  delay = 0,
  y = 24,
  duration = 700,
  className = "",
  as: Tag = "div",
  rootMargin = "0px 0px -80px 0px",
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      // SSR / older browsers — just show immediately.
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVisible(true);
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.1, rootMargin }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin]);

  return (
    <Tag
      ref={ref as React.Ref<HTMLElement>}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translate3d(0,0,0)" : `translate3d(0,${y}px,0)`,
        transition: `opacity ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms, transform ${duration}ms cubic-bezier(0.22,1,0.36,1) ${delay}ms`,
        willChange: "opacity, transform",
      }}
    >
      {children}
    </Tag>
  );
}
