"use client";

import { Loader2, Save } from "lucide-react";
import { useActionState } from "react";
import { buttonClass } from "@/components/ui/Button";
import type { FormState } from "@/lib/admin/actions";
import { STATUS_LABELS, STATUSES } from "@/lib/admin/leads";

type LeadValues = {
  name?: string;
  email?: string;
  phone?: string | null;
  company?: string | null;
  title?: string | null;
  status?: string;
  estimateMin?: number | null;
  estimateMax?: number | null;
  budgetValidated?: number | null;
  amountPaid?: number;
  notes?: string | null;
  startDate?: Date | string | null;
  dueDate?: Date | string | null;
};

const dateValue = (d: Date | string | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");
const num = (n: number | null | undefined) => (n === null || n === undefined ? "" : String(n));

export function LeadForm({ action, lead }: { action: (p: FormState, fd: FormData) => Promise<FormState>; lead: LeadValues }) {
  const [state, formAction, pending] = useActionState(action, {});
  const err = (k: string) => (state.errors?.[k] ? <p role="alert" className="mt-1 text-xs text-danger">{state.errors[k]}</p> : null);
  const input = (name: keyof LeadValues, label: string, opts: { type?: string; value?: string; required?: boolean; suffix?: string } = {}) => (
    <div>
      <label htmlFor={`l-${name}`} className="label">{label}{opts.suffix ? <span className="text-muted"> ({opts.suffix})</span> : null}</label>
      <input id={`l-${name}`} name={name} type={opts.type ?? "text"} required={opts.required} defaultValue={opts.value ?? ((lead[name] as string | null | undefined) ?? "")} className="input" inputMode={opts.suffix === "€" ? "numeric" : undefined} />
      {err(name)}
    </div>
  );

  return (
    <form action={formAction} className="space-y-8">
      <section className="card grid gap-5 p-6 md:grid-cols-2">
        <h2 className="font-medium md:col-span-2">Client</h2>
        {input("name", "Nom", { required: true })}
        {input("email", "Email", { type: "email", required: true })}
        {input("phone", "Téléphone")}
        {input("company", "Entreprise")}
        <div className="md:col-span-2">{input("title", "Intitulé du projet")}</div>
      </section>

      <section className="card grid gap-5 p-6 md:grid-cols-3">
        <h2 className="font-medium md:col-span-3">Budget & suivi</h2>
        <div>
          <label htmlFor="l-status" className="label">Statut</label>
          <select id="l-status" name="status" defaultValue={lead.status ?? "NEW"} className="input">
            {STATUSES.map((s) => (
              <option key={s} value={s}>{STATUS_LABELS[s]}</option>
            ))}
          </select>
        </div>
        {input("estimateMin", "Estimation min", { value: num(lead.estimateMin), suffix: "€" })}
        {input("estimateMax", "Estimation max", { value: num(lead.estimateMax), suffix: "€" })}
        {input("budgetValidated", "Budget validé", { value: num(lead.budgetValidated), suffix: "€" })}
        {input("amountPaid", "Montant payé", { value: num(lead.amountPaid ?? 0), suffix: "€" })}
        <div>
          <span className="label">Reste à payer</span>
          <p className="input bg-transparent font-mono">
            {lead.budgetValidated !== null && lead.budgetValidated !== undefined
              ? `${Math.max(0, lead.budgetValidated - (lead.amountPaid ?? 0)).toLocaleString("fr-FR")} €`
              : "—"}
          </p>
        </div>
        {input("startDate", "Date de début", { type: "date", value: dateValue(lead.startDate) })}
        {input("dueDate", "Échéance", { type: "date", value: dateValue(lead.dueDate) })}
        <div className="md:col-span-3">
          <label htmlFor="l-notes" className="label">Notes</label>
          <textarea id="l-notes" name="notes" rows={5} defaultValue={lead.notes ?? ""} className="input resize-y" />
        </div>
      </section>

      <div className="flex items-center gap-4">
        <button type="submit" disabled={pending} className={buttonClass("primary")}>
          {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Save className="size-4" aria-hidden />} Enregistrer
        </button>
        {state.error ? <p role="alert" className="text-sm text-danger">{state.error}</p> : null}
        {state.ok ? <p role="status" className="text-sm text-accent-2">{state.message}</p> : null}
      </div>
    </form>
  );
}
