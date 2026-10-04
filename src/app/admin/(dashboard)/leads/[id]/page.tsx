import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { LeadForm } from "@/components/admin/LeadForm";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { deleteLead, saveLead } from "@/lib/admin/actions";
import { SOURCE_LABELS } from "@/lib/admin/leads";
import { getPricing } from "@/lib/content";
import { getDb } from "@/lib/db";

export default async function LeadDetail({ params }: PageProps<"/admin/leads/[id]">) {
  const { id } = await params;
  const db = getDb();
  if (!db) return <NoDatabase />;
  const [lead, pricing] = await Promise.all([db.lead.findUnique({ where: { id } }), getPricing()]);
  if (!lead) notFound();
  const label = (list: { key: string; labelFr: string }[], key: string | null) => (key ? list.find((i) => i.key === key)?.labelFr ?? key : "—");

  return (
    <>
      <Link href="/admin/leads" className="font-mono text-xs text-muted hover:text-accent">← Leads</Link>
      <PageHeader title={lead.name} description={`Source : ${SOURCE_LABELS[lead.source]} · reçu le ${lead.createdAt.toLocaleString("fr-FR")} · langue ${lead.locale.toUpperCase()}`}>
        <a href={`mailto:${lead.email}`} className="text-sm text-accent hover:underline">Répondre par email</a>
        <ConfirmButton action={deleteLead.bind(null, lead.id)} message="Supprimer définitivement ce lead ?">Supprimer</ConfirmButton>
      </PageHeader>

      {lead.projectType || lead.message ? (
        <div className="card mb-8 grid gap-4 p-6 text-sm md:grid-cols-2">
          {lead.projectType ? (
            <dl className="grid grid-cols-[8rem_1fr] gap-y-2">
              <dt className="text-muted">Type</dt><dd>{label(pricing.projectTypes, lead.projectType)}</dd>
              <dt className="text-muted">Fonctionnalités</dt><dd>{lead.features.map((f) => label(pricing.features, f)).join(", ") || "—"}</dd>
              <dt className="text-muted">Délai</dt><dd>{label(pricing.timelines, lead.timeline)}</dd>
              <dt className="text-muted">Design</dt><dd>{label(pricing.designLevels, lead.design)}</dd>
            </dl>
          ) : null}
          {lead.message ? <p className="whitespace-pre-wrap text-fg-soft">{lead.message}</p> : null}
        </div>
      ) : null}

      <LeadForm action={saveLead.bind(null, lead.id)} lead={lead} />
    </>
  );
}
