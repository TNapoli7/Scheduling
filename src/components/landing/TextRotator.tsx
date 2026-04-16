"use client";

/**
 * TextRotator — a single-word carousel that cycles through a list of labels
 * with a blur+slide+fade transition, inspired by alfredo.pt.
 *
 * How it works:
 *   1. All words are stacked `absolute` inside a relatively-positioned
 *      container. Only the active word has opacity=1.
 *   2. On change, the outgoing word slides UP + blurs + fades to 0 while
 *      the incoming word slides UP from below + un-blurs + fades to 1.
 *   3. The container's `width` is animated with a CSS transition so the
 *      surrounding sentence re-flows smoothly if the new word is wider or
 *      narrower (avoids the classic "jump" of naive text-swap carousels).
 *
 * Accepts a `className` so the caller can apply the gradient-text effect
 * (e.g. coral gradient on the rotating word to stand out from the static
 * headline text).
 *
 * Zero external dependencies — just React state + CSS transitions.
 */

import { useEffect, useRef, useState, useCallback } from "react";

interface TextRotatorProps {
  /** Words to cycle through. Must have >= 2 items. */
  words: string[];
  /** Milliseconds each word stays visible. Default 2500. */
  interval?: number;
  /** Transition speed in ms. Default 420. */
  duration?: number;
  /** Extra Tailwind / custom classes on the container. */
  className?: string;
}

export function TextRotator({
  words,
  interval = 2500,
  duration = 420,
  className = "",
}: TextRotatorProps) {
  const [activeIdx, setActiveIdx] = useState(0);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(undefined);
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([]);

  // Measure the active word's intrinsic width so the container can transition.
  const measure = useCallback(
    (idx: number) => {
      const el = wordRefs.current[idx];
      if (el) setContainerWidth(el.scrollWidth);
    },
    []
  );

  useEffect(() => {
    measure(activeIdx);
  }, [activeIdx, measure]);

  // Resize observer to re-measure if font loading changes width.
  useEffect(() => {
    const el = wordRefs.current[activeIdx];
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver(() => measure(activeIdx));
    ro.observe(el);
    return () => ro.disconnect();
  }, [activeIdx, measure]);

  // Timer to advance to the next word.
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIdx((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [interval, words.length]);

  const cubic = `cubic-bezier(0.22, 1, 0.36, 1)`;

  return (
    <span
      className={`relative inline-block whitespace-nowrap align-baseline`}
      style={{
        width: containerWidth ? `${containerWidth}px` : "auto",
        height: "1.2em",
        transition: `width ${duration}ms ${cubic}`,
        overflow: "hidden",
      }}
    >
      {words.map((word, idx) => {
        const isActive = idx === activeIdx;
        // Word that just left goes above (translateY -1.2em), next word comes from below (+1.2em).
        const translateY = isActive ? "0em" : "-1.2em";
        const opacity = isActive ? 1 : 0;
        const blur = isActive ? "0px" : "8px";

        return (
          <span
            key={word}
            ref={(el) => { wordRefs.current[idx] = el; }}
            aria-hidden={!isActive}
            className={`inline-block ${className}`}
            style={{
              position: idx === 0 ? "relative" : "absolute",
              left: 0,
              top: 0,
              opacity,
              filter: `blur(${blur})`,
              transform: `translateY(${translateY})`,
              transition: `opacity ${duration}ms ${cubic}, filter ${duration}ms ${cubic}, transform ${duration}ms ${cubic}`,
              // The first word stays position:relative so the container keeps
              // a fallback intrinsic width even before JS measures anything.
              // All others are absolute-stacked on top.
              visibility: idx === 0 && !isActive ? "hidden" : "visible",
            }}
          >
            {word}
          </span>
        );
      })}
    </span>
  );
}
