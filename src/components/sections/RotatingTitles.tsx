"use client";

import { AnimatePresence, m, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";

export function RotatingTitles({ titles }: { titles: string[] }) {
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduce || titles.length < 2) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % titles.length), 2600);
    return () => clearInterval(id);
  }, [reduce, titles.length]);

  return (
    <span className="relative inline-grid align-bottom" aria-live="polite">
      {/* Reserve the width of the longest title to avoid layout shift */}
      <span className="invisible col-start-1 row-start-1 font-serif italic" aria-hidden>
        {titles.reduce((a, b) => (b.length > a.length ? b : a), "")}
      </span>
      <AnimatePresence mode="wait" initial={false}>
        <m.span
          key={titles[index]}
          className="col-start-1 row-start-1 font-serif italic text-accent"
          initial={{ y: "60%", opacity: 0, filter: "blur(6px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: "-60%", opacity: 0, filter: "blur(6px)" }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        >
          {titles[index]}
        </m.span>
      </AnimatePresence>
    </span>
  );
}
