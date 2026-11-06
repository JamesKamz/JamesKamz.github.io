import { Briefcase, Mail, MessagesSquare, Wallet } from "lucide-react";
import Link from "next/link";
import { MonthlyBarChart } from "@/components/admin/MonthlyBarChart";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { daysAgo, eur, leadAmount, monthlyTotals, STATUS_LABELS, totalsByStatus } from "@/lib/admin/leads";
import { getDb } from "@/lib/db";

export const metadata = { title: "Vue d'ensemble" };

export default async function AdminHome() {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const weekAgo = daysAgo(7);
  const [leads, unread, conversations, newConversations, recentMessages] = await Promise.all([
    db.lead.findMany({ orderBy: { createdAt: "desc" } }),
    db.contactMessage.count({ where: { handled: false } }),
    db.chatConversation.count(),
    db.chatConversation.count({ where: { createdAt: { gte: weekAgo } } }),
    db.contactMessage.findMany({ where: { handled: false }, orderBy: { createdAt: "desc" }, take: 5 }),
  ]);
  const newLeads = leads.filter((l) => l.status === "NEW");
  const active = leads.filter((l) => ["QUOTE_SENT", "IN_PROGRESS"].includes(l.status));
  const pipeline = leads.filter((l) => !["LOST", "DELIVERED"].includes(l.status)).reduce((s, l) => s + leadAmount(l), 0);
  const toCollect = leads
    .filter((l) => l.budgetValidated !== null && l.status !== "LOST")
    .reduce((s, l) => s + Math.max(0, (l.budgetValidated ?? 0) - l.amountPaid), 0);

  const tiles = [
    { label: "Nouveaux leads", value: String(newLeads.length), href: "/admin/leads?status=NEW", icon: Briefcase },
    { label: "Messages non traités", value: String(unread), href: "/admin/messages", icon: Mail },
    { label: "Conversations IA (7 j)", value: `${newConversations} / ${conversations}`, href: "/admin/conversations", icon: MessagesSquare },
    { label: "Reste à encaisser", value: eur(toCollect), href: "/admin/leads", icon: Wallet },
  ];

  return (
    <>
      <PageHeader title="Vue d'ensemble" description={`Pipeline ouvert : ${eur(pipeline)} · ${active.length} projet(s) en devis ou en cours.`} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map(({ label, value, href, icon: Ico }) => (
          <Link key={label} href={href} className="card p-5 transition hover:border-line-strong">
            <Ico className="size-5 text-accent" aria-hidden />
            <p className="mt-4 font-display text-3xl font-semibold tabular-nums">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="card p-6 xl:col-span-2">
          <MonthlyBarChart title="Budgets par mois (12 derniers mois, hors perdus) — EUR" data={monthlyTotals(leads)} />
        </div>
        <div className="card p-6">
          <p className="text-sm font-medium">Totaux par statut</p>
          <ul className="mt-4 divide-y divide-line">
            {totalsByStatus(leads).map((t) => (
              <li key={t.status} className="flex items-center justify-between py-2.5 text-sm">
                <Link href={`/admin/leads?status=${t.status}`} className="hover:text-accent">
                  {t.label} <span className="text-muted">({t.count})</span>
                </Link>
                <span className="font-mono tabular-nums">{eur(t.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Derniers leads</p>
            <Link href="/admin/leads" className="text-xs text-accent hover:underline">Tout voir</Link>
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            {leads.slice(0, 6).map((l) => (
              <li key={l.id}>
                <Link href={`/admin/leads/${l.id}`} className="flex items-center justify-between gap-4 py-2.5 hover:text-accent">
                  <span className="truncate">{l.name} <span className="text-muted">— {l.title ?? l.projectType ?? "—"}</span></span>
                  <span className="shrink-0 font-mono text-xs text-muted">{STATUS_LABELS[l.status]}</span>
                </Link>
              </li>
            ))}
            {!leads.length ? <li className="py-2.5 text-muted">Aucun lead pour l&apos;instant.</li> : null}
          </ul>
        </div>
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Messages à traiter</p>
            <Link href="/admin/messages" className="text-xs text-accent hover:underline">Tout voir</Link>
          </div>
          <ul className="mt-4 divide-y divide-line text-sm">
            {recentMessages.map((m) => (
              <li key={m.id} className="py-2.5">
                <Link href={`/admin/messages#${m.id}`} className="block truncate hover:text-accent">
                  {m.name} <span className="text-muted">— {m.subject}</span>
                </Link>
              </li>
            ))}
            {!recentMessages.length ? <li className="py-2.5 text-muted">Rien à traiter 🎉</li> : null}
          </ul>
        </div>
      </div>
    </>
  );
}
