import Link from "next/link";
import { notFound } from "next/navigation";
import { ConfirmButton } from "@/components/admin/ConfirmButton";
import { NoDatabase, PageHeader } from "@/components/admin/PageHeader";
import { deleteConversation } from "@/lib/admin/actions";
import { getDb } from "@/lib/db";
import { cn } from "@/lib/utils";

export default async function ConversationDetail({ params }: PageProps<"/admin/conversations/[id]">) {
  const { id } = await params;
  const db = getDb();
  if (!db) return <NoDatabase />;
  const conv = await db.chatConversation.findUnique({ where: { id }, include: { messages: { orderBy: { createdAt: "asc" } } } });
  if (!conv) notFound();
  return (
    <>
      <Link href="/admin/conversations" className="font-mono text-xs text-muted hover:text-accent">← Conversations</Link>
      <PageHeader title="Conversation" description={`${conv.createdAt.toLocaleString("fr-FR")} · ${conv.locale.toUpperCase()} · visiteur ${conv.ipHash?.slice(0, 8) ?? "?"}`}>
        <ConfirmButton action={deleteConversation.bind(null, conv.id)}>Supprimer</ConfirmButton>
      </PageHeader>
      <ol className="max-w-3xl space-y-3">
        {conv.messages.map((m) => (
          <li key={m.id} className={cn("rounded-2xl px-4 py-3 text-sm whitespace-pre-wrap", m.role === "user" ? "ml-auto max-w-[80%] bg-accent text-accent-fg" : "card max-w-[90%]")}>
            {m.content}
            <span className="mt-1 block font-mono text-[10px] opacity-60">{m.createdAt.toLocaleTimeString("fr-FR")}</span>
          </li>
        ))}
      </ol>
    </>
  );
}
