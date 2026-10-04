"use client";

import { animate, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

export function CountUp({ value, decimals = 0, locale }: { value: number; decimals?: number; locale: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState(0);
  const fmt = new Intl.NumberFormat(locale === "en" ? "en-US" : "fr-FR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1], onUpdate: setDisplay });
    return () => controls.stop();
  }, [inView, reduce, value]);

  return (
    <span ref={ref} className="tabular-nums">
      {fmt.format(reduce && inView ? value : display)}
    </span>
  );
}
