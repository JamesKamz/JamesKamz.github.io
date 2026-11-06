"use client";

import { m, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { useEffect, useState } from "react";

/** Custom cursor: a dot + a lagging ring that grows over interactive elements. Fine pointers only. */
export function Cursor() {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [visible, setVisible] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const ringX = useSpring(x, { stiffness: 350, damping: 30, mass: 0.6 });
  const ringY = useSpring(y, { stiffness: 350, damping: 30, mass: 0.6 });

  useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)");
    if (!media.matches || reduce) return;
    // Enabling is a response to an external capability check, done once on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEnabled(true);
    document.body.classList.add("has-custom-cursor");
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      const target = e.target as HTMLElement | null;
      setHovering(Boolean(target?.closest("a, button, [role='button'], label, summary")));
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.body.classList.remove("has-custom-cursor");
    };
  }, [reduce, x, y]);

  if (!enabled) return null;
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[70]" style={{ opacity: visible ? 1 : 0 }}>
      <m.div
        className="absolute -left-1 -top-1 size-2 rounded-full bg-accent"
        style={{ x, y }}
      />
      <m.div
        className="absolute rounded-full border border-accent/70 mix-blend-difference"
        style={{ x: ringX, y: ringY, translateX: "-50%", translateY: "-50%" }}
        animate={{ width: hovering ? 56 : 32, height: hovering ? 56 : 32, opacity: hovering ? 1 : 0.6 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      />
    </div>
  );
}
