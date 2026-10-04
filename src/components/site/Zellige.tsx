import { cn } from "@/lib/utils";

/**
 * Subtle zellige-inspired 8-point star tessellation, used as a watermark.
 * Pure SVG pattern — no image request.
 */
export function Zellige({ className, id = "zellige" }: { className?: string; id?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={cn("pointer-events-none absolute inset-0 h-full w-full text-fg", className)}
      style={{ opacity: "var(--zellige-opacity)" }}
    >
      <defs>
        <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1">
            {/* 8-point star made of two rotated squares */}
            <rect x="24" y="24" width="32" height="32" />
            <rect x="24" y="24" width="32" height="32" transform="rotate(45 40 40)" />
            <circle cx="40" cy="40" r="6" />
            {/* connecting lattice */}
            <path d="M0 40h17.4M62.6 40H80M40 0v17.4M40 62.6V80" />
            <path d="M0 0l11 11M80 0L69 11M0 80l11-11M80 80L69 69" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
