"use client";

import { Loader2, Plus, Save, Trash2 } from "lucide-react";
import { useActionState, useMemo, useState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { FormState } from "@/lib/admin/actions";
import { computeEstimate, formatMoney, type PricingConfig } from "@/lib/budget";

type ListKey = "projectTypes" | "features" | "timelines" | "designLevels";
const lists: { key: ListKey; title: string; valueKey: "base" | "cost" | "multiplier"; valueLabel: string; step: string }[] = [
  { key: "projectTypes", title: "Types de projet (prix de base)", valueKey: "base", valueLabel: "Base (€)", step: "50" },
  { key: "features", title: "Fonctionnalités (coût ajouté)", valueKey: "cost", valueLabel: "Coût (€)", step: "50" },
  { key: "timelines", title: "Délais (multiplicateur)", valueKey: "multiplier", valueLabel: "×", step: "0.05" },
  { key: "designLevels", title: "Niveaux de design (multiplicateur)", valueKey: "multiplier", valueLabel: "×", step: "0.05" },
];

type Row = { key: string; labelFr: string; labelEn: string } & Record<string, string | number>;

export function PricingEditor({ action, initial }: { action: (p: FormState, fd: FormData) => Promise<FormState>; initial: PricingConfig }) {
  const [state, formAction, pending] = useActionState(action, {});
  const [pricing, setPricing] = useState<PricingConfig>(initial);

  const preview = useMemo(() => {
    try {
      return computeEstimate(pricing, {
        projectType: pricing.projectTypes[0]?.key ?? "",
        features: pricing.features.slice(0, 2).map((f) => f.key),
        timeline: pricing.timelines.find((t) => t.multiplier === 1)?.key ?? pricing.timelines[0]?.key ?? "",
        design: pricing.designLevels.find((t) => t.multiplier === 1)?.key ?? pricing.designLevels[0]?.key ?? "",
      });
    } catch {
      return null;
    }
  }, [pricing]);

  const updateRow = (list: ListKey, i: number, field: string, value: string | number) =>
    setPricing((p) => ({ ...p, [list]: (p[list] as Row[]).map((r, idx) => (idx === i ? { ...r, [field]: value } : r)) }));
  const addRow = (list: ListKey, valueKey: string) =>
    setPricing((p) => ({ ...p, [list]: [...(p[list] as Row[]), { key: `option-${(p[list] as Row[]).length + 1}`, labelFr: "", labelEn: "", [valueKey]: valueKey === "multiplier" ? 1 : 0 }] }));
  const removeRow = (list: ListKey, i: number) => setPricing((p) => ({ ...p, [list]: (p[list] as Row[]).filter((_, idx) => idx !== i) }));

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="pricing" value={JSON.stringify(pricing)} />
      <section className="card grid gap-5 p-6 md:grid-cols-4">
        <h2 className="font-medium md:col-span-4">Taux de change & fourchette</h2>
        <div>
          <span className="label">1 EUR =</span>
          <p className="input bg-transparent font-mono">1 EUR</p>
        </div>
        <div>
          <label htmlFor="rate-mad" className="label">MAD pour 1 EUR</label>
          <input id="rate-mad" type="number" step="0.01" min="0" className="input" value={pricing.rates.MAD} onChange={(e) => setPricing((p) => ({ ...p, rates: { ...p.rates, MAD: Number(e.target.value) } }))} />
        </div>
        <div>
          <label htmlFor="rate-usd" className="label">USD pour 1 EUR</label>
          <input id="rate-usd" type="number" step="0.01" min="0" className="input" value={pricing.rates.USD} onChange={(e) => setPricing((p) => ({ ...p, rates: { ...p.rates, USD: Number(e.target.value) } }))} />
        </div>
        <div>
          <label htmlFor="spread" className="label">Largeur de fourchette (±%)</label>
          <input id="spread" type="number" step="1" min="0" max="90" className="input" value={Math.round(pricing.spread * 100)} onChange={(e) => setPricing((p) => ({ ...p, spread: Number(e.target.value) / 100 }))} />
        </div>
        {preview ? (
          <p className="text-sm text-muted md:col-span-4">
            Aperçu ({pricing.projectTypes[0]?.labelFr} + 2 fonctionnalités) :{" "}
            <span className="font-mono text-fg">{formatMoney(preview.ranges.EUR.min, "EUR", "fr")} – {formatMoney(preview.ranges.EUR.max, "EUR", "fr")}</span>
            {" · "}
            <span className="font-mono text-fg">{formatMoney(preview.ranges.MAD.min, "MAD", "fr")} – {formatMoney(preview.ranges.MAD.max, "MAD", "fr")}</span>
          </p>
        ) : null}
      </section>

      {lists.map(({ key, title, valueKey, valueLabel, step }) => (
        <section key={key} className="card overflow-x-auto p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-medium">{title}</h2>
            <button type="button" onClick={() => addRow(key, valueKey)} className="inline-flex items-center gap-1 text-sm text-accent hover:underline">
              <Plus className="size-4" aria-hidden /> Ajouter
            </button>
          </div>
          <table className="mt-4 w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-left font-mono text-xs text-muted">
                <th className="pb-2 font-normal">Clé</th>
                <th className="pb-2 font-normal">Libellé FR</th>
                <th className="pb-2 font-normal">Libellé EN</th>
                <th className="w-28 pb-2 font-normal">{valueLabel}</th>
                <th className="w-10" />
              </tr>
            </thead>
            <tbody>
              {(pricing[key] as Row[]).map((row, i) => (
                <tr key={i}>
                  <td className="py-1 pr-2"><input aria-label="Clé" className="input py-2 font-mono text-xs" value={row.key} onChange={(e) => updateRow(key, i, "key", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))} /></td>
                  <td className="py-1 pr-2"><input aria-label="Libellé FR" className="input py-2" value={row.labelFr} onChange={(e) => updateRow(key, i, "labelFr", e.target.value)} /></td>
                  <td className="py-1 pr-2"><input aria-label="Libellé EN" className="input py-2" value={row.labelEn} onChange={(e) => updateRow(key, i, "labelEn", e.target.value)} /></td>
                  <td className="py-1 pr-2"><input aria-label={valueLabel} type="number" step={step} min="0" className="input py-2 font-mono" value={row[valueKey]} onChange={(e) => updateRow(key, i, valueKey, Number(e.target.value))} /></td>
                  <td className="py-1"><button type="button" onClick={() => removeRow(key, i)} aria-label="Supprimer" className="grid size-9 place-items-center text-muted hover:text-danger"><Trash2 className="size-4" /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}

      <div className="sticky bottom-0 -mx-6 flex items-center gap-4 border-t border-line bg-bg/90 px-6 py-4 backdrop-blur">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Enregistrer les tarifs
        </button>
        {state.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
        {state.ok ? <p role="status" className="text-sm text-accent-2">{state.message}</p> : null}
      </div>
    </form>
  );
}
