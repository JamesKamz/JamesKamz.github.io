import { Plus } from "lucide-react";
import Link from "next/link";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { buttonClass } from "@/components/ui/Button";
import type { LeadStatus } from "@/generated/prisma/client";
import { eur, remaining, SOURCE_LABELS, STATUS_LABELS, STATUSES, totalsByStatus } from "@/lib/admin/leads";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export const metadata = { title: "Leads & budgets" };

export default async function LeadsPage({ searchParams }: PageProps<"/admin/leads">) {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const sp = await searchParams;
  const status = typeof sp.status === "string" && STATUSES.includes(sp.status as LeadStatus) ? (sp.status as LeadStatus) : null;
  const all = await db.lead.findMany({ orderBy: { createdAt: "desc" } });
  const leads = status ? all.filter((l) => l.status === status) : all;
  const totals = totalsByStatus(all);

  return (
    <>
      <PageHeader title="Leads & budgets" description="Demandes de l'estimateur, du formulaire et projets clients. Montants en EUR.">
        <Link href="/admin/leads/new" className={buttonClass("primary", "px-4 py-2.5")}>
          <Plus className="size-4" aria-hidden /> Nouveau projet
        </Link>
      </PageHeader>

      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {totals.map((t) => (
          <Link key={t.status} href={status === t.status ? "/admin/leads" : `/admin/leads?status=${t.status}`} className={cn("card p-4 transition hover:border-line-strong", status === t.status && "border-accent")}>
            <p className="font-mono text-[11px] uppercase tracking-wider text-muted">{t.label}</p>
            <p className="mt-2 font-display text-xl font-semibold tabular-nums">{eur(t.amount)}</p>
            <p className="text-xs text-muted">{t.count} projet(s) · payé {eur(t.paid)}</p>
          </Link>
        ))}
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px] text-sm">
          <thead>
            <tr className="border-b border-line text-left font-mono text-xs text-muted">
              <th className="px-4 py-3 font-normal">Client</th>
              <th className="px-4 py-3 font-normal">Projet</th>
              <th className="px-4 py-3 font-normal">Source</th>
              <th className="px-4 py-3 font-normal">Statut</th>
              <th className="px-4 py-3 text-right font-normal">Estimé</th>
              <th className="px-4 py-3 text-right font-normal">Validé</th>
              <th className="px-4 py-3 text-right font-normal">Payé</th>
              <th className="px-4 py-3 text-right font-normal">Reste</th>
              <th className="px-4 py-3 font-normal">Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-surface-2">
                <td className="px-4 py-3">
                  <Link href={`/admin/leads/${l.id}`} className="font-medium hover:text-accent">{l.name}</Link>
                  <p className="text-xs text-muted">{l.email}</p>
                </td>
                <td className="max-w-[16rem] truncate px-4 py-3 text-fg-soft">{l.title ?? l.projectType ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted">{SOURCE_LABELS[l.source]}</td>
                <td className="px-4 py-3"><span className="rounded-full border border-line px-2 py-0.5 text-xs">{STATUS_LABELS[l.status]}</span></td>
                <td className="px-4 py-3 text-right font-mono text-xs tabular-nums">{l.estimateMin !== null ? `${eur(l.estimateMin)} – ${eur(l.estimateMax)}` : "—"}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{eur(l.budgetValidated)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{eur(l.amountPaid)}</td>
                <td className="px-4 py-3 text-right font-mono tabular-nums">{eur(remaining(l))}</td>
                <td className="px-4 py-3 text-xs text-muted">{l.createdAt.toLocaleDateString("fr-FR")}</td>
              </tr>
            ))}
            {!leads.length ? (
              <tr><td colSpan={9} className="px-4 py-8 text-center text-muted">Aucun lead.</td></tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </>
  );
}
