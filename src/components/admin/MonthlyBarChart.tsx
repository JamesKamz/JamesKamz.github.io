"use client";

import { useState } from "react";

type Datum = { label: string; value: number; count: number };

const eur = (v: number) => new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(v);

/** Single-series monthly bar chart (accent hue), hover tooltip + table fallback. */
export function MonthlyBarChart({ data, title }: { data: Datum[]; title: string }) {
  const [hover, setHover] = useState<number | null>(null);
  const width = 640;
  const height = 220;
  const pad = { top: 16, right: 8, bottom: 28, left: 56 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;
  const max = Math.max(1, ...data.map((d) => d.value));
  const niceMax = (() => {
    const p = 10 ** Math.floor(Math.log10(max));
    return Math.ceil(max / p) * p;
  })();
  const ticks = [0, 0.5, 1].map((t) => t * niceMax);
  const slot = innerW / data.length;
  const barW = Math.max(6, Math.min(36, slot - 2 * 2 - 8));
  const y = (v: number) => pad.top + innerH - (v / niceMax) * innerH;

  return (
    <figure className="relative">
      <figcaption className="mb-3 text-sm font-medium">{title}</figcaption>
      <svg viewBox={`0 0 ${width} ${height}`} className="h-auto w-full" role="img" aria-label={title} onMouseLeave={() => setHover(null)}>
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.left} x2={width - pad.right} y1={y(t)} y2={y(t)} stroke="var(--line)" strokeWidth={1} />
            <text x={pad.left - 8} y={y(t)} dy="0.32em" textAnchor="end" fontSize={11} fill="var(--muted)" className="font-mono">
              {t >= 1000 ? `${(t / 1000).toLocaleString("fr-FR", { maximumFractionDigits: 1 })}k` : Math.round(t)}
            </text>
          </g>
        ))}
        {data.map((d, i) => {
          const x = pad.left + i * slot + (slot - barW) / 2;
          const h = Math.max(0, pad.top + innerH - y(d.value));
          const r = Math.min(4, h / 2);
          const top = y(d.value);
          // Rounded data-end (top), square at the baseline.
          const path = h > 0
            ? `M${x},${top + h} V${top + r} Q${x},${top} ${x + r},${top} H${x + barW - r} Q${x + barW},${top} ${x + barW},${top + r} V${top + h} Z`
            : "";
          return (
            <g key={d.label}>
              {/* Hit target larger than the mark */}
              <rect x={pad.left + i * slot} y={pad.top} width={slot} height={innerH} fill="transparent" onMouseEnter={() => setHover(i)} onFocus={() => setHover(i)} tabIndex={0} aria-label={`${d.label} : ${eur(d.value)}`} />
              {path ? <path d={path} fill="var(--accent)" opacity={hover === null || hover === i ? 1 : 0.45} pointerEvents="none" /> : null}
              <text x={x + barW / 2} y={height - 8} textAnchor="middle" fontSize={11} fill="var(--muted)" className="font-mono">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
      {hover !== null && data[hover] ? (
        <div
          className="pointer-events-none absolute z-10 -translate-x-1/2 rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-xl"
          style={{ left: `${((pad.left + hover * slot + slot / 2) / width) * 100}%`, top: 24 }}
        >
          <p className="font-mono text-muted">{data[hover].label}</p>
          <p className="font-semibold text-fg">{eur(data[hover].value)}</p>
          <p className="text-muted">{data[hover].count} projet(s)</p>
        </div>
      ) : null}
      <details className="mt-2 text-xs text-muted">
        <summary className="cursor-pointer">Voir les données</summary>
        <table className="mt-2 w-full">
          <thead>
            <tr className="text-left">
              <th className="py-1 font-medium">Mois</th>
              <th className="py-1 font-medium">Total</th>
              <th className="py-1 font-medium">Projets</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.label} className="border-t border-line">
                <td className="py-1">{d.label}</td>
                <td className="py-1 tabular-nums">{eur(d.value)}</td>
                <td className="py-1 tabular-nums">{d.count}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>
    </figure>
  );
}
