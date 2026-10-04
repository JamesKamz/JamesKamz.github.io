import Link from "next/link";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { getDb } from "@/lib/db";

export const metadata = { title: "Conversations IA" };

export default async function ConversationsPage() {
  const db = getDb();
  if (!db) return <NoDatabase />;
  const conversations = await db.chatConversation.findMany({
    orderBy: { updatedAt: "desc" },
    take: 200,
    include: { _count: { select: { messages: true } }, messages: { where: { role: "user" }, orderBy: { createdAt: "asc" }, take: 1 } },
  });
  return (
    <>
      <PageHeader title="Conversations du chatbot" description="Historique des échanges avec l'assistant IA (IP anonymisée)." />
      <div className="card divide-y divide-line">
        {conversations.map((c) => (
          <Link key={c.id} href={`/admin/conversations/${c.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-2">
            <span className="min-w-0">
              <span className="block truncate">{c.messages[0]?.content ?? "(vide)"}</span>
              <span className="font-mono text-xs text-muted">{c.updatedAt.toLocaleString("fr-FR")} · {c.locale.toUpperCase()}</span>
            </span>
            <span className="shrink-0 rounded-full border border-line px-2 py-0.5 font-mono text-xs">{c._count.messages} msg</span>
          </Link>
        ))}
        {!conversations.length ? <p className="p-8 text-center text-muted">Aucune conversation.</p> : null}
      </div>
    </>
  );
}
