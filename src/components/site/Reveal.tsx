"use client";

import { useEffect, useRef, type CSSProperties, type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type Props = HTMLAttributes<HTMLDivElement> & { delay?: number; eager?: boolean };

let observer: IntersectionObserver | null = null;
function getObserver() {
  if (!observer) {
    observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer?.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -60px 0px" },
    );
  }
  return observer;
}

/**
 * Reveals children when they scroll into view, with one shared IntersectionObserver
 * and CSS transitions (see `.reveal` in globals.css; disabled for reduced motion and
 * without JavaScript). `eager` renders above-the-fold content visible immediately
 * so it never delays Largest Contentful Paint.
 */
export function Reveal({ delay = 0, eager = false, className, style, children, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || eager) return;
    const io = getObserver();
    io.observe(el);
    return () => io.unobserve(el);
  }, [eager]);

  return (
    <div
      ref={ref}
      className={cn(!eager && "reveal", className)}
      style={delay ? ({ ...style, "--reveal-delay": `${delay}s` } as CSSProperties) : style}
      {...rest}
    >
      {children}
    </div>
  );
}
